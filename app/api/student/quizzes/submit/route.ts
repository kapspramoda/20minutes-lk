import { NextResponse } from "next/server";
import mongoose from "mongoose";
import QuizResult from "@/models/QuizResult";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (mongoose.connection.readyState < 1) await mongoose.connect(process.env.MONGODB_URI as string);
    await QuizResult.create(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}