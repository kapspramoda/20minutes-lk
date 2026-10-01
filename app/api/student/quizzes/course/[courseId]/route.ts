import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Quiz from "@/models/Quiz";
import { getCachedData } from "@/lib/cache"; // 🔴 අලුතින් එකතු කළා

type Context = { params: Promise<{ courseId: string }> | { courseId: string } };

export async function GET(_req: Request, context: Context) {
  try {
    const resolvedParams = await context.params;
    
    if (mongoose.connection.readyState < 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }
    
    // 🔴 ඩේටාබේස් එක වෙනුවට Cache එකෙන් ලබා ගැනීම
    const quizzes = await getCachedData(
      `course_quizzes_${resolvedParams.courseId}`,
      async () => {
        return await Quiz.find({ 
          $or: [
            { courseId: resolvedParams.courseId }, 
            { courseIds: { $in: [resolvedParams.courseId] } } 
          ],
          isVisible: { $ne: false } 
        }).select("_id title questions createdAt").lean(); 
      },
      120
    );

    return NextResponse.json({ success: true, data: quizzes });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" });
  }
}