import mongoose, { Schema, Types, type HydratedDocument } from "mongoose";

export type TaskPriority = "Low" | "Medium" | "High";
export type TaskStatus = "pending" | "completed" | "archived";

export interface ITask {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  tags: string[];
  dueDate?: Date;
  category: string;
  reminder?: Date;
  notes: string;
  order: number;
  timeSpent: number;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskDocument = HydratedDocument<ITask>;

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    description: {
      type: String,
      default: "",
      maxlength: 3000
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
      index: true
    },
    status: {
      type: String,
      enum: ["pending", "completed", "archived"],
      default: "pending",
      index: true
    },
    tags: {
      type: [String],
      default: []
    },
    dueDate: Date,
    category: {
      type: String,
      default: "General",
      trim: true
    },
    reminder: Date,
    notes: {
      type: String,
      default: ""
    },
    order: {
      type: Number,
      default: 0
    },
    timeSpent: {
      type: Number,
      default: 0,
      min: 0
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

taskSchema.index({ title: "text", description: "text", tags: "text", category: "text" });

export const Task = mongoose.model<ITask>("Task", taskSchema);
