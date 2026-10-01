import { NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";
import PasswordReset from "@/models/PasswordReset";
import bcrypt from "bcryptjs"; 
import { getCachedData } from "@/lib/cache"; // 🔴 අලුතින් එකතු කළා

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
};

export async function GET() {
  try {
    await connectDB();
    
    // 🔴 ඩේටාබේස් එක වෙනුවට Cache එකෙන් ලබා ගැනීම (තත්පර 60කට)
    const requests = await getCachedData(
      "admin_password_resets",
      async () => {
        return await PasswordReset.find({ status: "pending" }).sort({ createdAt: -1 }).lean();
      },
      60
    );
    
    return NextResponse.json({ data: requests }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { id, phone, newPasswordPlain } = await req.json();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPasswordPlain, salt);

    await User.updateOne({ phone }, { $set: { password: hashedPassword } });
    await PasswordReset.findByIdAndUpdate(id, { status: "approved" });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await PasswordReset.findByIdAndDelete(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}