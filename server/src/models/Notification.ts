import mongoose, { Schema, Types, type HydratedDocument } from "mongoose";

export interface INotification {
  userId: Types.ObjectId;
  message: string;
  type: "info" | "success" | "warning" | "deadline";
  read: boolean;
  taskId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationDocument = HydratedDocument<INotification>;

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    message: {
      type: String,
      required: true,
      maxlength: 240
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "deadline"],
      default: "info"
    },
    read: {
      type: Boolean,
      default: false,
      index: true
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task"
    }
  },
  {
    timestamps: true
  }
);

export const Notification = mongoose.model<INotification>("Notification", notificationSchema);
