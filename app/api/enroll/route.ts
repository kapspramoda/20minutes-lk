import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";

export async function POST(req: Request) {
  try {
    // 1. Frontend එකෙන් එවන දත්ත ලබා ගැනීම
    const { userPhone, courseTitle, slipImage } = await req.json();

    if (!userPhone || !courseTitle || !slipImage) {
      return NextResponse.json({ message: "අවශ්‍ය සියලුම දත්ත ලබා දෙන්න." }, { status: 400 });
    }

    // 2. Database එකට සම්බන්ධ වීම
    await connectToDatabase();

    // 3. මේ ළමයා මේ පන්තියට කලින් ඉල්ලුම් කරලා තියෙනවද කියලා බලමු (Pending හෝ Approved)
    const existingEnrollment = await Enrollment.findOne({ 
      userPhone: userPhone, 
      courseTitle: courseTitle 
    });

    if (existingEnrollment) {
      return NextResponse.json({ message: "ඔබ දැනටමත් මෙම පාඨමාලාව සඳහා ඉල්ලුම් කර ඇත." }, { status: 400 });
    }

    // 4. අලුත් ඉල්ලීම Database එකේ Save කිරීම
    const newEnrollment = new Enrollment({
      userPhone,
      courseTitle,
      slipImage,
      status: "pending",
    });

    await newEnrollment.save();

    return NextResponse.json({ message: "ඔබේ රිසිට් පත සාර්ථකව යොමු කරන ලදී!" }, { status: 201 });
    
  } catch (error) {
    console.error("Enrollment Error:", error);
    return NextResponse.json({ message: "තාක්ෂණික දෝෂයකි. කරුණාකර නැවත උත්සාහ කරන්න." }, { status: 500 });
  }
}