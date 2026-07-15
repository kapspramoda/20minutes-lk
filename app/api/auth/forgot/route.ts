import { NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";
import PasswordReset from "@/models/PasswordReset";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
};

export async function POST(req: Request) {
  try {
    await connectDB();
    const { phone, newPassword } = await req.json();

    const user = await User.findOne({ phone });
    if (!user) {
      return NextResponse.json({ message: "මෙම දුරකථන අංකයෙන් ලියාපදිංචි වූ ගිණුමක් නොමැත." }, { status: 400 });
    }

    // කලින් තියෙන ඉල්ලීම් මකා දමා අලුත් ඉල්ලීමක් සේව් කිරීම
    await PasswordReset.deleteMany({ phone });
    await PasswordReset.create({ phone, newPasswordPlain: newPassword });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}