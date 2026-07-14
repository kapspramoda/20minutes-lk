import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Student from "../../../../../models/Student";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
};

export async function POST(req: Request) {
  try {
    await connectDB();
    const { phones, courseId, courseTitle } = await req.json();

    if (!phones || !Array.isArray(phones) || phones.length === 0 || !courseId || !courseTitle) {
      return NextResponse.json({ error: "අවශ්‍ය දත්ත නිවැරදිව ලැබී නැත." }, { status: 400 });
    }

    // දුරකථන අංක ලැයිස්තුවෙන් හිස් තැන් ඉවත් කර එකින් එක Database එකට Update/Insert කිරීම (Upsert)
    // මෙයින් සිදුවන්නේ එකම ළමයා දෙපාරක් ඇඩ් වීම වැළැක්වීමයි
    const operations = phones.map((phone: string) => ({
      updateOne: {
        filter: { userPhone: phone, courseId: courseId },
        update: { $set: { userPhone: phone, courseId: courseId, courseTitle: courseTitle, status: "active" } },
        upsert: true
      }
    }));

    const result = await Student.bulkWrite(operations);

    return NextResponse.json({ 
      success: true, 
      message: `සිසුන් ${result.upsertedCount + result.modifiedCount} දෙනෙකු සාර්ථකව ඇතුළත් කරන ලදී.` 
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}