import { NextResponse } from "next/server";
import mongoose from "mongoose";
import QuizResult from "@/models/QuizResult";

export async function POST(req: Request) {
  try {
    if (mongoose.connection.readyState < 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }
    
    const { quizId, userPhone } = await req.json();

    if (!quizId || !userPhone) {
      return NextResponse.json({ error: "Missing details" }, { status: 400 });
    }

    // මේ ළමයා මේ විභාගය කලින් කරලද කියලා Database එකෙන් හොයනවා
    const existingResult = await QuizResult.findOne({ quizId, userPhone }).lean();

    if (existingResult) {
      // කලින් කරලා නම් ලකුණු කීයද කියලත් යවනවා
      return NextResponse.json({ hasAttempted: true, score: existingResult.score });
    }

    return NextResponse.json({ hasAttempted: false });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}