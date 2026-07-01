import mongoose, { Schema, Document } from "mongoose";

export interface IEnrollment extends Document {
  userPhone: string;
  courseId: string;
  courseTitle: string;
  amount: number;        // 🔴 අලුතින් එකතු කළ කොටස: ගෙවූ මුදල (ආදායම් ගණනය කිරීමට)
  slipImage: string;
  status: string;
}

const EnrollmentSchema = new Schema(
  {
    userPhone: { type: String, required: true },
    courseId: { type: String, required: true },
    courseTitle: { type: String, required: true },
    amount: { type: Number, default: 0 }, // 🔴 අලුතින් එකතු කළ කොටස
    slipImage: { type: String, required: true },
    status: { type: String, default: "pending" }, 
  },
  { timestamps: true }
);

export default mongoose.models.Enrollment || mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);