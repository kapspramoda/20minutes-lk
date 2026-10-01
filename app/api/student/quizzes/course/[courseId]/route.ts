import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Quiz from "@/models/Quiz";
import { getCachedData } from "@/lib/cache"; // 🔴 Caching සඳහා

type Context = { params: Promise<{ courseId: string }> | { courseId: string } };

export async function GET(_req: Request, context: Context) {
  try {
    const resolvedParams = await context.params;
    
    if (mongoose.connection.readyState < 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }
    
    // 🔴 ඩේටාබේස් එක වෙනුවට Cache එකෙන් ලබා ගැනීම (වේගය වැඩි කිරීමට)
    const quizzes = await getCachedData(
      `course_quizzes_optimized_${resolvedParams.courseId}`,
      async () => {
        return await Quiz.find({ 
          $or: [
            { courseId: resolvedParams.courseId }, 
            { courseIds: { $in: [resolvedParams.courseId] } } 
          ],
          // 🔴 වෙනස්කම: Admin විසින් hide කර ඇති හෝ active නොකළ ක්විස් සම්පූර්ණයෙන්ම පෙළගැස්වීම (Filter out)
          isVisible: { $ne: false }, 
          isActive: { $ne: false } 
        }).select("_id title questions createdAt").lean(); 
      },
      120 // තත්පර 120ක් RAM එකේ රඳවා ගනී
    );

    return NextResponse.json({ success: true, data: quizzes });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}