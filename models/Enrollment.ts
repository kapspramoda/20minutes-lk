import mongoose, { Schema, Document } from "mongoose";

export interface IEnrollment extends Document {
  userPhone: string;     // ළමයාගේ දුරකථන අංකය
  courseTitle: string;   // පාඨමාලාවේ නම
  slipImage: string;     // Bank Slip එකේ පින්තූරය (Base64)
  status: string;        // "pending", "approved", හෝ "rejected"
}

const EnrollmentSchema = new Schema(
  {
    userPhone: { type: String, required: true },
    courseTitle: { type: String, required: true },
    slipImage: { type: String, required: true },
    status: { type: String, default: "pending" }, 
  },
  { timestamps: true }
);

export default mongoose.models.Enrollment || mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);