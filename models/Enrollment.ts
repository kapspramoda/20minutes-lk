import mongoose, { Schema, Document, models } from "mongoose";

// 1. අනිවාර්යයෙන්ම තිබිය යුතු IEnrollment Interface එක
export interface IEnrollment extends Document {
  userPhone: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  slipImage?: string; // ? ලකුණ දැම්මේ මේක අනිවාර්ය නැති නිසා
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// 2. Database Schema එක
const EnrollmentSchema = new Schema<IEnrollment>(
  {
    userPhone: { type: String, required: true },
    courseId: { type: String, required: true },
    courseTitle: { type: String, required: true },
    amount: { type: Number, default: 0 },
    slipImage: { type: String, required: false }, // 🔴 500 Error එක එන්නේ නැති වෙන්න මේක false කළා
    status: { type: String, default: "pending" }, 
  },
  { timestamps: true }
);

// 3. ආරක්ෂිතව Model එක Export කිරීම
const Enrollment = models.Enrollment || mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);

export default Enrollment;