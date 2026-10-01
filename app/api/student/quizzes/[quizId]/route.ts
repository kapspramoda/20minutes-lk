import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Quiz from "@/models/Quiz";
import { getCachedData } from "@/lib/cache"; // 🔴 අලුතින් එකතු කළා

type Context = { params: Promise<{ quizId: string }> | { quizId: string } };

export async function GET(req: Request, context: Context) {
  try {
    const resolvedParams = await context.params;
    
    if (mongoose.connection.readyState < 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }
    
    // 🔴 ඩේටාබේස් එක වෙනුවට Cache එකෙන් ලබා ගැනීම (විනාඩි 2කට)
    const quiz = await getCachedData(
      `quiz_details_${resolvedParams.quizId}`, 
      async () => {
        return await Quiz.findById(resolvedParams.quizId).lean();
      },
      120
    );
    
    if (!quiz) {
      return NextResponse.json({ success: false, message: "Quiz not found" });
    }

    return NextResponse.json({ success: true, data: quiz });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" });
  }
}