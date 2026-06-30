import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Course from "@/models/Course";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!uri) throw new Error("Database URI එක .env ෆයිල් එකේ නැත!");
  await mongoose.connect(uri);
};

// 1. එක පාඨමාලාවක විස්තර පමණක් ලබා ගැනීම (GET) - Edit පෝරමයට පිරවීමට
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const course = await Course.findById(resolvedParams.id);
    
    if (!course) return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: course }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 2. පාඨමාලාව Update කිරීම (Hide/Show කිරීම සහ Zoom/Video වෙනස් කිරීම) (PUT)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const body = await request.json();
    
    // Database එකේ අදාළ ID එක තියෙන පාඨමාලාව හොයාගෙන ඒක අප්ඩේට් කරනවා
    const updatedCourse = await Course.findByIdAndUpdate(resolvedParams.id, body, {
      new: true, // අප්ඩේට් වුණු අලුත් දත්ත ටික Return කරන්න
      runValidators: true,
    });

    if (!updatedCourse) return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: updatedCourse }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 3. අවශ්‍ය නම් පාඨමාලාව සම්පූර්ණයෙන්ම Delete කිරීම (DELETE)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const deletedCourse = await Course.findByIdAndDelete(resolvedParams.id);
    
    if (!deletedCourse) return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Course deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}