import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Task from '@/models/Task';
import { withAuth } from '@/middleware/auth';
import { encrypt, decrypt } from '@/lib/encryption';

export const GET = withAuth(async (req: NextRequest, context: any, userId: string) => {
  try {
    await connectDB();
    const { id } = await context.params;
    const task = await Task.findOne({ _id: id, userId });

    if (!task) {
      return NextResponse.json(
        { success: false, message: 'Task not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { ...task.toObject(), description: task.description ? decrypt(task.description) : '' },
    }, { status: 200 });
  } catch (error: any) {
    console.error('GET TASK ERROR:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error.' },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(async (req: NextRequest, context: any, userId: string) => {
  try {
    await connectDB();
    const { id } = await context.params;
    const { title, description, status } = await req.json();

    const task = await Task.findOne({ _id: id, userId });
    if (!task) {
      return NextResponse.json(
        { success: false, message: 'Task not found.' },
        { status: 404 }
      );
    }

    if (title !== undefined) task.title = title;
    if (status !== undefined) task.status = status;
    if (description !== undefined) {
      task.description = description ? encrypt(description) : '';
    }

    await task.save();

    const decryptedDesc = task.description ? decrypt(task.description) : '';

    return NextResponse.json({
      success: true,
      message: 'Task updated.',
      data: { ...task.toObject(), description: decryptedDesc },
    }, { status: 200 });
  } catch (error: any) {
    console.error('PUT TASK ERROR:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error.' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (req: NextRequest, context: any, userId: string) => {
  try {
    await connectDB();
    const { id } = await context.params;
    const task = await Task.findOneAndDelete({ _id: id, userId });

    if (!task) {
      return NextResponse.json(
        { success: false, message: 'Task not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Task deleted.' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE TASK ERROR:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error.' },
      { status: 500 }
    );
  }
});