import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Course from "@/models/Course"; // ඔයාගේ Course model එක තියෙන තැනට path එක හරිද බලන්න

// 🔴 වෙනස 1: Database එකට සම්බන්ධ වෙලාද කියලා හරියටම මතක තියාගන්න ක්‍රමය
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!uri) throw new Error("Database URI එක .env ෆයිල් එකේ නැත!");
  
  try {
    await mongoose.connect(uri);
    isConnected = true;
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
};

// 1. පවතින සියලුම පාඨමාලා ලබා ගැනීම (GET)
export async function GET() {
  try {
    await connectDB();
    
    // 🔴 වෙනස 2: අගට .lean() එකතු කර ඇත (දත්ත වල බර 90% කින් අඩු කිරීමට)
    const courses = await Course.find({}).sort({ createdAt: -1 }).lean();
    
    return NextResponse.json({ success: true, data: courses }, { status: 200 });
  } catch (error: any) {
    console.error("Courses GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 2. අලුත් පාඨමාලාවක් Database එකට ඇතුළත් කිරීම (POST)
export async function POST(request: Request) {
  try {
    await connectDB();
    
    const body = await request.json(); // එවන දත්ත ටික ලබාගන්නවා
    
    // අලුත් Course එකක් හදලා Save කරනවා
    const newCourse = await Course.create(body);
    
    return NextResponse.json({ success: true, data: newCourse }, { status: 201 });
  } catch (error: any) {
    console.error("Courses POST Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}