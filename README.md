# TaskManager — Full Stack Task Management App

A production-ready task management application built with Next.js, MongoDB, and JWT authentication.

## Live Demo
🔗 https://taskmanager-one-olive.vercel.app

## GitHub Repository
🔗 https://github.com/manasvi-misa/taskmanager

## Tech Stack
- **Frontend**: Next.js 14 (App Router), Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Authentication**: JWT stored in HTTP-only cookies
- **Security**: AES-256-CBC encryption, bcrypt password hashing
- **Deployment**: Vercel

## Architecture
```
src/
├── app/
│   ├── api/
│   │   ├── auth/        # register, login, logout, me
│   │   └── tasks/       # CRUD + pagination + filter + search
│   ├── (auth)/          # login & register pages
│   └── dashboard/       # protected task dashboard
├── lib/
│   ├── db.ts            # MongoDB connection
│   ├── jwt.ts           # JWT sign & verify
│   └── encryption.ts    # AES-256-CBC encrypt/decrypt
├── models/
│   ├── User.ts          # User schema with bcrypt
│   └── Task.ts          # Task schema with indexes
└── middleware/
    └── auth.ts          # JWT auth middleware
```

## Features
- User registration and login
- JWT authentication via HTTP-only cookies
- Full CRUD for tasks (Create, Read, Update, Delete)
- Task fields: Title, Description, Status, Created Date
- Filter tasks by status (todo, in-progress, done)
- Search tasks by title
- Pagination (6 tasks per page)
- AES-256-CBC encryption on task descriptions
- Protected frontend routes
- Proper HTTP status codes and error handling

## Security
- Passwords hashed with bcrypt (12 rounds)
- JWT stored in HTTP-only cookies (not accessible via JS)
- Secure cookie flag enabled in production
- AES-256-CBC encryption on sensitive fields
- Input validation on all API routes
- Users can only access their own tasks

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)

### Steps

1. Clone the repository:
\`\`\`bash
git clone https://github.com/manasvi-misa/taskmanager.git
cd taskmanager
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create `.env.local`:
\`\`\`env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_min_32_chars
ENCRYPTION_KEY=your_32_character_encryption_key
NODE_ENV=development
\`\`\`

4. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open http://localhost:3000

## API Documentation

### Auth Routes

#### POST /api/auth/register
**Request:**
\`\`\`json
{ "name": "John", "email": "john@example.com", "password": "123456" }
\`\`\`
**Response:**
\`\`\`json
{ "success": true, "message": "Registered successfully.", "user": { "id": "...", "name": "John", "email": "john@example.com" } }
\`\`\`

#### POST /api/auth/login
**Request:**
\`\`\`json
{ "email": "john@example.com", "password": "123456" }
\`\`\`
**Response:**
\`\`\`json
{ "success": true, "message": "Login successful.", "user": { "id": "...", "name": "John", "email": "john@example.com" } }
\`\`\`

#### POST /api/auth/logout
**Response:**
\`\`\`json
{ "success": true, "message": "Logged out successfully." }
\`\`\`

#### GET /api/auth/me
**Response:**
\`\`\`json
{ "success": true, "user": { "_id": "...", "name": "John", "email": "john@example.com" } }
\`\`\`

### Task Routes (all require authentication)

#### GET /api/tasks
**Query params:** `page`, `limit`, `status`, `search`

**Example:** `/api/tasks?page=1&limit=6&status=todo&search=fix`

**Response:**
\`\`\`json
{
  "success": true,
  "data": [...],
  "pagination": { "total": 10, "page": 1, "limit": 6, "totalPages": 2 }
}
\`\`\`

#### POST /api/tasks
**Request:**
\`\`\`json
{ "title": "Fix bug", "description": "Fix login bug", "status": "todo" }
\`\`\`
**Response:**
\`\`\`json
{ "success": true, "message": "Task created.", "data": { "_id": "...", "title": "Fix bug", ... } }
\`\`\`

#### PUT /api/tasks/:id
**Request:**
\`\`\`json
{ "title": "Fix bug", "description": "Updated desc", "status": "done" }
\`\`\`
**Response:**
\`\`\`json
{ "success": true, "message": "Task updated.", "data": { ... } }
\`\`\`

#### DELETE /api/tasks/:id
**Response:**
\`\`\`json
{ "success": true, "message": "Task deleted." }
\`\`\`