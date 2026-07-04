import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Quiz from "@/models/Quiz";

type Context = { params: Promise<{ quizId: string }> | { quizId: string } };

export async function GET(req: Request, context: Context) {
  try {
    const resolvedParams = await context.params;
    
    if (mongoose.connection.readyState < 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }
    
    // Quiz එක Database එකෙන් සොයා ගැනීම
    const quiz = await Quiz.findById(resolvedParams.quizId);
    
    if (!quiz) {
      return NextResponse.json({ success: false, message: "Quiz not found" });
    }

    return NextResponse.json({ success: true, data: quiz });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" });
  }
}