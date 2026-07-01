import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Enrollment from "@/models/Enrollment";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
};

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    if (!body.userPhone || !body.courseId || !body.slipImage) {
      return NextResponse.json({ success: false, message: "දත්ත සම්පූර්ණ නැත!" }, { status: 400 });
    }

    const newEnrollment = await Enrollment.create({
      userPhone: body.userPhone,
      courseId: body.courseId,
      courseTitle: body.courseTitle,
      amount: body.amount || 0, // 🔴 ආදායම ගණනය කිරීමට ගාස්තුව සේව් කිරීම
      slipImage: body.slipImage,
      status: "pending"
    });

    return NextResponse.json({ success: true, message: "රිසිට් පත යොමු කරන ලදී!" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}