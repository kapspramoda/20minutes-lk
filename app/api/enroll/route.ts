import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Enrollment from "@/models/Enrollment";

// Database එකට සම්බන්ධ වීම
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!uri) throw new Error("Database URI එක .env ෆයිල් එකේ නැත!");
  await mongoose.connect(uri);
};

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    // දත්ත සියල්ල ලැබී ඇත්දැයි පරීක්ෂා කිරීම
    if (!body.userPhone || !body.courseId || !body.slipImage) {
      return NextResponse.json(
        { success: false, message: "අවශ්‍ය සියලුම දත්ත (Course ID ඇතුළුව) ලැබී නොමැත!" }, 
        { status: 400 }
      );
    }

    // 🔴 අලුතින් Enrollment එකක් සෑදීම
    const newEnrollment = await Enrollment.create({
      userPhone: body.userPhone,
      courseId: body.courseId, 
      courseTitle: body.courseTitle,
      slipImage: body.slipImage,
      status: "pending"
    });

    return NextResponse.json(
      { success: true, message: "ඔබගේ රිසිට් පත සාර්ථකව යොමු කරන ලදී! Admin අනුමත කළ පසු පාඨමාලාව විවෘත වනු ඇත." }, 
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Enrollment Error:", error);
    return NextResponse.json(
      { success: false, message: error.message }, 
      { status: 500 }
    );
  }
}