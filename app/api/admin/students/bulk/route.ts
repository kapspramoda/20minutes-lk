import { NextResponse } from "next/server";
import mongoose from "mongoose";
// 🔴 අලුත් Student එක වෙනුවට, ඔයාගේ පරණ ළමයි ඉන්න Enrollment එකටම දත්ත යවනවා
import Enrollment from "../../../../../models/Enrollment"; 

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

    // අදාළ ළමයින්ගේ ගෙවීම් "approved" ලෙස කෙලින්ම යාවත්කාලීන කිරීම
    const operations = phones.map((phone: string) => ({
      updateOne: {
        filter: { userPhone: phone, courseId: courseId },
        update: { 
          $set: { 
            userPhone: phone, 
            courseId: courseId, 
            courseTitle: courseTitle, 
            status: "approved", 
            slipImage: "Bulk Added" // Bulk Add කළ බව හඳුනා ගැනීමට
          } 
        },
        upsert: true
      }
    }));

    const result = await Enrollment.bulkWrite(operations);

    return NextResponse.json({ 
      success: true, 
      message: `සිසුන් ${result.upsertedCount + result.modifiedCount} දෙනෙකු සාර්ථකව ඇතුළත් කරන ලදී.` 
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}