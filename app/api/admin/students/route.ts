import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Enrollment from "@/models/Enrollment";

// 🔴 වෙනස: Database එකට සම්බන්ධ වෙලාද කියලා හරියටම මතක තියාගන්න ක්‍රමය
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    isConnected = true;
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
};

// 1. අනුමත වූ (Approved) සියලුම සිසුන්ගේ විස්තර ලබා ගැනීම
export async function GET() {
  try {
    await connectDB();
    
    const students = await Enrollment.find({ status: "approved" })
                                     .sort({ _id: -1 }) 
                                     .lean(); 
    
    return NextResponse.json({ success: true, data: students }, { status: 200 });
  } catch (error: any) {
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