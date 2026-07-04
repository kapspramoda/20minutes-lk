import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Quiz from "@/models/Quiz";

export async function GET() {
  try {
    if (mongoose.connection.readyState < 1) await mongoose.connect(process.env.MONGODB_URI as string);
    
    // කෘතිම ප්‍රශ්න පත්‍රයක් නිර්මාණය කිරීම
    const newQuiz = await Quiz.create({
      courseId: "test_course_123",
      title: "ආදර්ශ MCQ ප්‍රශ්න පත්‍රය (Test Run)",
      questions: [
        {
          questionText: "ශ්‍රී ලංකාවේ වාණිජ අගනුවර කුමක්ද?",
          options: ["මහනුවර", "කොළඹ", "ගාල්ල", "යාපනය"],
          correctOptionIndex: 1 // කොළඹ (දෙවැනි උත්තරය - Index 1)
        },
        {
          questionText: "10 + 15 කීයද?",
          options: ["20", "25", "30", "35"],
          correctOptionIndex: 1 // 25 (දෙවැනි උත්තරය - Index 1)
        },
        {
          questionText: "පෘථිවියට ආසන්නතම ග්‍රහලෝකය කුමක්ද?",
          options: ["අඟහරු", "බ්‍රහස්පතින්", "සිකුරු", "බුධ"],
          correctOptionIndex: 2 // සිකුරු
        }
      ]
    });

    return NextResponse.json({
      message: "✅ Test Quiz එක සාර්ථකව හැදුවා!",
      testLink: `/course/test_course_123/quiz/${newQuiz._id}`
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}