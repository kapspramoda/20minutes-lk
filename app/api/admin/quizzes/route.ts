import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Quiz from "@/models/Quiz";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
};

// අලුත් Quiz එකක් Database එකට ඇතුළත් කිරීම (POST)
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    if (!body.courseId || !body.title || !body.questions || body.questions.length === 0) {
      return NextResponse.json({ error: "කරුණාකර සියලුම දත්ත සම්පූර්ණ කරන්න." }, { status: 400 });
    }

    const newQuiz = await Quiz.create(body);
    
    return NextResponse.json({ success: true, data: newQuiz }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// පවතින Quizzes සියල්ල ලබා ගැනීම (GET)
export async function GET() {
  try {
    await connectDB();
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: quizzes }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}