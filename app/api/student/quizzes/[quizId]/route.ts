import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Quiz from "@/models/Quiz";
import { getCachedData } from "@/lib/cache";

type Context = { params: Promise<{ quizId: string }> | { quizId: string } };

export async function GET(req: Request, context: Context) {
  try {
    const resolvedParams = await context.params;
    
    if (mongoose.connection.readyState < 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }
    
    // 🔴 වෙනස 1: ටෙස්ට් කිරීම පහසු වීමට Cache කාලය තත්පර 10කට අඩු කළා. 
    // (පසුව ඔයාට අවශ්‍ය නම් මෙය නැවත 120 කළ හැක)
    const quiz: any = await getCachedData(
      `quiz_details_${resolvedParams.quizId}`, 
      async () => {
        return await Quiz.findById(resolvedParams.quizId).lean();
      },
      10 
    );
    
    if (!quiz) {
      return NextResponse.json({ success: false, message: "Quiz not found" });
    }

    // 🔴 වෙනස 2: Database එකේ කාලය සේව් වී ඇති නම කුමක් වුවත් (timeLimit, time, duration) 
    // එය අනිවාර්යයෙන්ම 'duration' ලෙස Student පේජ් එකට ලබා දීම.
    const examTime = quiz.duration || quiz.timeLimit || quiz.time || null;

    return NextResponse.json({ 
      success: true, 
      data: {
        ...quiz,
        duration: examTime // නිවැරදි කාලය මෙතැනින් යවයි
      } 
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" });
  }
}