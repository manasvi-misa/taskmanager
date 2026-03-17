import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Task from '@/models/Task';
import { withAuth } from '@/middleware/auth';
import { encrypt, decrypt } from '@/lib/encryption';

// GET all tasks (with pagination, filter, search)
export const GET = withAuth(async (req: NextRequest, context: any, userId: string) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page     = parseInt(searchParams.get('page')  || '1');
    const limit    = parseInt(searchParams.get('limit') || '10');
    const status   = searchParams.get('status') || '';
    const search   = searchParams.get('search') || '';
    const skip     = (page - 1) * limit;

    const query: any = { userId };
    if (status && ['todo', 'in-progress', 'done'].includes(status)) {
      query.status = status;
    }
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const [tasks, total] = await Promise.all([
      Task.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Task.countDocuments(query),
    ]);

    // Decrypt descriptions before sending
    const decryptedTasks = tasks.map(task => ({
      ...task.toObject(),
      description: task.description ? decrypt(task.description) : '',
    }));

    return NextResponse.json({
      success: true,
      data: decryptedTasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Server error.', error: error.message },
      { status: 500 }
    );
  }
});

// POST create task
export const POST = withAuth(async (req: NextRequest, context: any, userId: string) => {
  try {
    await connectDB();
    const { title, description, status } = await req.json();

    if (!title) {
      return NextResponse.json(
        { success: false, message: 'Title is required.' },
        { status: 400 }
      );
    }

    const encryptedDescription = description ? encrypt(description) : '';

    const task = await Task.create({
      title,
      description: encryptedDescription,
      status: status || 'todo',
      userId,
    });

    return NextResponse.json({
      success: true,
      message: 'Task created.',
      data: { ...task.toObject(), description: description || '' },
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Server error.', error: error.message },
      { status: 500 }
    );
  }
});