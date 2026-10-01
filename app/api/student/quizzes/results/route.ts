import { NextResponse } from "next/server";
import mongoose from "mongoose";
import QuizResult from "@/models/QuizResult";
import { getCachedData } from "@/lib/cache"; // 🔴 අලුතින් එකතු කළා

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    if (!phone) return NextResponse.json({ success: false });

    if (mongoose.connection.readyState < 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }

    // 🔴 ඩේටාබේස් එක වෙනුවට Cache එකෙන් ලබා ගැනීම
    const results = await getCachedData(
      `quiz_results_${phone}`,
      async () => {
        return await QuizResult.find({ userPhone: phone }).sort({ createdAt: -1 }).lean();
      },
      60
    );

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}