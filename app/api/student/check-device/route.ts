import { NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";
import SecurityAlert from "@/models/SecurityAlert";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
};

export async function POST(req: Request) {
  try {
    await connectDB();
    const { phone, currentSessionId } = await req.json();

    if (!phone || !currentSessionId) {
      return NextResponse.json({ logout: false });
    }

    const user = await User.findOne({ phone });
    
    if (!user) return NextResponse.json({ logout: true });

    // Database එකේ තියෙන Session ID එකයි, ළමයාගේ ෆෝන් එකේ තියෙන එකයි අසමාන නම්...
    if (user.activeSessionId && user.activeSessionId !== currentSessionId) {
      
      // Admin ට Alert එකක් යැවීම
      await SecurityAlert.create({
        userPhone: phone,
        message: "එකම ගිණුමට උපාංග දෙකකින් (Multiple Devices) ඇතුළත් වීමට උත්සාහ කර ඇත."
      });

      // ළමයාව Log out කිරීමට සංඥාවක් යැවීම
      return NextResponse.json({ logout: true });
    }

    return NextResponse.json({ logout: false });
  } catch (error) {
    return NextResponse.json({ logout: false });
  }
}