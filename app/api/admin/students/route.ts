import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Enrollment from "@/models/Enrollment";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
};

// 1. අනුමත වූ (Approved) සියලුම සිසුන්ගේ විස්තර ලබා ගැනීම
export async function GET() {
  try {
    await connectDB();
    
    // 🔴 මෙතන .lean() සහ .limit() දෙකම පාවිච්චි කළා
    // .lean() මගින් Database එකෙන් දත්ත වේගයෙන් ගෙනෙන අතර Memory Crash වීම සම්පූර්ණයෙන්ම නවත්වයි.
    // අලුත්ම සිසුන් 300 ක් පමණක් පෙන්වීමට සීමා කර ඇත (අවශ්‍ය නම් 300 වෙනස් කළ හැක).
    const students = await Enrollment.find({ status: "approved" })
                                     .sort({ updatedAt: -1 })
                                     .limit(300)
                                     .lean(); 
    
    return NextResponse.json({ success: true, data: students }, { status: 200 });
  } catch (error: any) {
    // 🔴 මොකක් හරි අවුලක් ගියොත් Vercel Logs වල පැහැදිලිව Error එක පෙන්වීමට
    console.error("GET /api/admin/students Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 2. සිසුවෙක්ව පාඨමාලාවෙන් ඉවත් කිරීම (Delete)
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ success: false, error: "ID එක ලබා දී නොමැත" }, { status: 400 });

    await Enrollment.findByIdAndDelete(id);
    
    return NextResponse.json({ success: true, message: "සිසුවා පාඨමාලාවෙන් සාර්ථකව ඉවත් කරන ලදී." }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE /api/admin/students Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}