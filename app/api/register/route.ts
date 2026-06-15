import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { name, phone, password } = await req.json();

    if (!name || !phone || !password) {
      return NextResponse.json({ message: "අවශ්‍ය සියලුම දත්ත ලබා දෙන්න." }, { status: 400 });
    }

    await connectToDatabase();

    // මේ අංකයෙන් කලින් ගිණුමක් හදලා තියෙනවද බැලීම
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return NextResponse.json({ message: "මෙම දුරකථන අංකය දැනටමත් ලියාපදිංචි කර ඇත." }, { status: 400 });
    }

    // මුරපදය කේතනය (Hash) කිරීම
    const hashedPassword = await bcrypt.hash(password, 10);

    // අලුත් පරිශීලකයාව Database එකට ඇතුළත් කිරීම
    const newUser = new User({
      name,
      phone,
      password: hashedPassword,
      role: "STUDENT",
    });

    await newUser.save();

    return NextResponse.json({ message: "ලියාපදිංචි වීම සාර්ථකයි!" }, { status: 201 });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ message: "තාක්ෂණික දෝෂයකි. කරුණාකර නැවත උත්සාහ කරන්න." }, { status: 500 });
  }
}