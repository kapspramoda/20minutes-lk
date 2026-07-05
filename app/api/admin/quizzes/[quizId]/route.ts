import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Quiz from "@/models/Quiz";

// Next.js 15+ සඳහා Params ලබාගැනීමේ නිවැරදි ව්‍යුහය
type Context = { params: Promise<{ quizId: string }> | { quizId: string } };

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
};

// 1. තෝරාගත් Quiz එකේ දත්ත ලබා ගැනීම (Edit පිටුව සඳහා)
export async function GET(req: Request, context: Context) {
  try {
    const resolvedParams = await context.params;
    await connectDB();
    
    const quiz = await Quiz.findById(resolvedParams.quizId);
    if (!quiz) {
      return NextResponse.json({ error: "මෙම ප්‍රශ්න පත්‍රය සොයාගත නොහැක." }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: quiz }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. Quiz එක වෙනස් කිරීම (Hide/Show කිරීම සහ ප්‍රශ්න Update කිරීම)
export async function PUT(req: Request, context: Context) {
  try {
    const resolvedParams = await context.params;
    await connectDB();
    
    const body = await req.json();
    
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      resolvedParams.quizId,
      { $set: body },
      { new: true } // අලුත් දත්ත නැවත ලබා ගැනීමට
    );

    if (!updatedQuiz) {
      return NextResponse.json({ error: "වෙනස් කිරීමට ප්‍රශ්න පත්‍රයක් සොයාගත නොහැක." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedQuiz }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. Quiz එකක් සම්පූර්ණයෙන්ම මකා දැමීම
export async function DELETE(req: Request, context: Context) {
  try {
    const resolvedParams = await context.params;
    await connectDB();
    
    const deletedQuiz = await Quiz.findByIdAndDelete(resolvedParams.quizId);
    
    if (!deletedQuiz) {
      return NextResponse.json({ error: "මකා දැමීමට ප්‍රශ්න පත්‍රයක් සොයාගත නොහැක." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "සාර්ථකව මකා දමන ලදී." }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}