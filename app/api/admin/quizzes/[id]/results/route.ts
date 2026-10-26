import { NextResponse } from "next/server";
import mongoose from "mongoose";
import QuizResult from "@/models/QuizResult";
import User from "@/models/User";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
};

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const quizId = resolvedParams.id;

    const results = await QuizResult.find({ quizId })
      .sort({ score: -1 })
      .lean();

    const userPhones = results.map(r => r.userPhone);
    const users = await User.find({ phone: { $in: userPhones } }).select("phone name").lean();
    
    const phoneToNameMap: Record<string, string> = {};
    users.forEach((u: any) => {
      phoneToNameMap[u.phone] = u.name;
    });

    const rankedResults = results.map((result: any, index: number) => {
      const percentageScore = Math.round((result.score / result.totalQuestions) * 100);

      return {
        _id: result._id,
        rank: index + 1,
        score: percentageScore || 0,
        userId: {
          name: phoneToNameMap[result.userPhone] || "Unknown",
          phone: result.userPhone
        },
        timeTaken: null 
      };
    });

    return NextResponse.json({ success: true, data: rankedResults }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}