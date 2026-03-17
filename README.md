# Full Stack Task Management App

A production-ready task management application built with Next.js, MongoDB and JWT authentication.

## Live Demo
 https://taskmanager-one-olive.vercel.app

## GitHub Repository
 https://github.com/manasvi-misa/taskmanager

## Tech Stack
- **Frontend**: Next.js 14 (App Router), Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Authentication**: JWT stored in HTTP-only cookies
- **Security**: AES-256-CBC encryption, bcrypt password hashing
- **Deployment**: Vercel

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
