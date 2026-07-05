import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Quiz from "@/models/Quiz";

type Context = { params: Promise<{ courseId: string }> | { courseId: string } };

export async function GET(_req: Request, context: Context) {
  try {
    const resolvedParams = await context.params;
    
    if (mongoose.connection.readyState < 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }
    
    // 🔴 වෙනස් කළ කොටස: "Hide කරලා නැති (false නොවන) සියල්ල ගෙන එන්න"
    const quizzes = await Quiz.find({ 
      courseId: resolvedParams.courseId, 
      isVisible: { $ne: false } 
    }).select("_id title questions createdAt"); 

    return NextResponse.json({ success: true, data: quizzes });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" });
  }
}