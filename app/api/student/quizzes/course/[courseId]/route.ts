import { NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User"; // User මොඩල් එක
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

export async function GET() {
  try {
    await connectDB();
    
    // 🔴 Cache හරහා සිසුන්ගේ දත්ත ලබා ගැනීම
    const students = await getCachedData(
      "admin_all_students",
      async () => {
        // "STUDENT" role එක තියෙන අය විතරක් තෝරා ගැනීම (Admin ලාව අයින් කරලා)
        return await User.find({ role: { $ne: "admin" } }) // හෝ role: "STUDENT" ලෙස දිය හැක
                         // 🔴 පින්තූර, මුරපද (passwords) සියල්ල අතහැර අත්‍යවශ්‍ය දත්ත පමණක් ගැනීම
                         .select("name phone role createdAt") 
                         .sort({ createdAt: -1 })
                         .lean(); // දත්තවල බර 90%කින් අඩු කරයි
      },
      60 // තත්පර 60ක් RAM එකේ තබාගනී (අවශ්‍ය නම් 120ක් කරන්න පුළුවන්)
    );

    return NextResponse.json({ success: true, data: students }, { status: 200 });

  } catch (error: any) {
    console.error("Students GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}