import mongoose, { Schema, Document, models } from "mongoose";

export interface IStudent extends Document {
  userPhone: string;
  courseId: string;
  courseTitle: string;
  status: string;
}

const studentSchema = new Schema<IStudent>(
  {
    userPhone: { type: String, required: true },
    courseId: { type: String, required: true },
    courseTitle: { type: String, required: true },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

const Student = models.Student || mongoose.model<IStudent>("Student", studentSchema);

export default Student;