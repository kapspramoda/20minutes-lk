import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Course from "@/models/Course"; // ඔයාගේ Course model එක තියෙන තැනට path එක හරිද බලන්න

// Database එකට සම්බන්ධ වීමේ ෆන්ක්ෂන් එක (දැනටමත් කනෙක්ට් වෙලා නැත්නම් විතරක් කනෙක්ට් වෙන්න)
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!uri) throw new Error("Database URI එක .env ෆයිල් එකේ නැත!");
  
  await mongoose.connect(uri);
};

// 1. පවතින සියලුම පාඨමාලා ලබා ගැනීම (GET)
export async function GET() {
  try {
    await connectDB();
    
    // අලුතින්ම හදපු පාඨමාලා උඩින්ම එන්න (createdAt: -1) ඔක්කොම පාඨමාලා ගන්නවා
    const courses = await Course.find({}).sort({ createdAt: -1 });
    
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