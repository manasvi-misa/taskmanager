'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  totalPages: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [form, setForm] = useState({ title: '', description: '', status: 'todo' });
  const [submitting, setSubmitting] = useState(false);

  // Check auth
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (!d.success) router.push('/login');
        else setUser(d.user);
      });
  }, []);

  // Fetch tasks
  const fetchTasks = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: '6',
      ...(search && { search }),
      ...(statusFilter && { status: statusFilter }),
    });
    const res = await fetch(`/api/tasks?${params}`);
    const data = await res.json();
    if (data.success) {
      setTasks(data.data);
      setPagination(data.pagination);
    }
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { fetchTasks(1); }, [fetchTasks]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const openCreate = () => {
    setEditTask(null);
    setForm({ title: '', description: '', status: 'todo' });
    setShowModal(true);
  };

  const openEdit = (task: Task) => {
  setEditTask(task);
  setForm({
    title: task.title,
    description: task.description || '',
    status: task.status,
  });
  setShowModal(true);
};

  const handleSubmit = async () => {
  if (!form.title.trim()) return;
  setSubmitting(true);

  const url    = editTask ? `/api/tasks/${editTask._id}` : '/api/tasks';
  const method = editTask ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: form.title,
      description: form.description,
      status: form.status,
    }),
  });

  const data = await res.json();
  console.log('SUBMIT RESPONSE:', data);

  setSubmitting(false);
  setShowModal(false);
  fetchTasks(1);
};

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    fetchTasks(pagination.page);
  };

  const statusColor = (s: string) => {
    if (s === 'done') return 'bg-green-500/10 text-green-400 border-green-500/20';
    if (s === 'in-progress') return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">TaskManager</h1>
          {user && <p className="text-xs text-gray-400">Welcome, {user.name}</p>}
        </div>
        <div className="flex gap-3">
          <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-sm px-4 py-2 rounded-lg transition">
            + New Task
          </button>
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white transition">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {['todo', 'in-progress', 'done'].map(s => (
            <div key={s} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <p className="text-xs text-gray-400 capitalize">{s.replace('-', ' ')}</p>
              <p className="text-2xl font-bold mt-1">
                {tasks.filter(t => t.status === s).length}
              </p>
            </div>
          ))}
        </div>

        {/* Tasks Grid */}
        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <p className="text-lg">No tasks found</p>
            <p className="text-sm mt-1">Create your first task to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map(task => (
              <div key={task._id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-sm leading-snug">{task.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${statusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
                {task.description && (
                  <p className="text-xs text-gray-400 line-clamp-2">{task.description}</p>
                )}
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-gray-500">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(task)} className="text-xs text-blue-400 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(task._id)} className="text-xs text-red-400 hover:underline">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => fetchTasks(p)}
                className={`w-8 h-8 rounded-lg text-sm ${p === pagination.page ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-lg font-bold mb-4">{editTask ? 'Edit Task' : 'New Task'}</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Task title"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-sm py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-sm py-2 rounded-lg transition"
              >
                {submitting ? 'Saving...' : editTask ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}