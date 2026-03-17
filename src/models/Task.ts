import mongoose, { Schema, Document } from 'mongoose';

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface ITask extends Document {
  title: string;
  description: string;
  status: TaskStatus;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title:       { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: '', maxlength: 500 },
    status:      { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
    userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

TaskSchema.index({ userId: 1, createdAt: -1 });
TaskSchema.index({ userId: 1, status: 1 });

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);