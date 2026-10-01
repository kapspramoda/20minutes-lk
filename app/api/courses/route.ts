import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Course from "@/models/Course"; 
import { getCachedData } from "@/lib/cache";

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

// 1. පවතින සියලුම පාඨමාලා ලබා ගැනීම (GET - ළමයින්ට "අලුත් පාඨමාලා" සහ Admin ට පෙන්වීමට)
export async function GET() {
  try {
    await connectDB();
    
    // 🔴 Cache භාවිතා කරලා බර දත්ත (image, lessons ආදිය) අතහැර දත්ත වේගයෙන් ලබාගැනීම
    const courses = await getCachedData(
      "all_available_courses_optimized",
      async () => {
        return await Course.find({})
                           // 🔴 බර දත්ත ඉවත් කිරීම (පින්තූර, පාඩම්, වීඩියෝ ලින්ක්)
                           .select("-image -coverImage -thumbnail -lessons -videoLinks -students") 
                           .sort({ createdAt: -1 })
                           .lean();
      },
      120 // තත්පර 120ක් RAM එකේ තබාගනී
    );
    
    // Active Courses ගණන Admin Dashboard එකට යැවීමට (අවශ්‍ය නම්)
    const activeCoursesCount = courses.filter((course: any) => course.isVisible !== false).length;
    
    return NextResponse.json({ 
      success: true, 
      data: courses,
      activeCount: activeCoursesCount
    }, { status: 200 });

  } catch (error: any) {
    console.error("Courses GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 2. අලුත් පාඨමාලාවක් Database එකට ඇතුළත් කිරීම (POST - Admin සඳහා පමණි)
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json(); 
    const newCourse = await Course.create(body);
    return NextResponse.json({ success: true, data: newCourse }, { status: 201 });
  } catch (error: any) {
    console.error("Courses POST Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}