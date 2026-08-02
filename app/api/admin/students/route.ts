import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Enrollment from "@/models/Enrollment"; // මේක දැන් අත්‍යවශ්‍ය නෑ, ඒත් තියෙන්න අරින්න

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("=> [API] පවතින Database Connection එක භාවිතා කරයි...");
    return;
  }

  console.log("=> [API] Database එකට අලුතින් සම්බන්ධ වීමට උත්සාහ කරයි...");
  try {
    await mongoose.connect(process.env.MONGODB_URI as string, {
      serverSelectionTimeoutMS: 5000, 
    });
    isConnected = true;
    console.log("=> [API] Database එක සාර්ථකව සම්බන්ධ විය!");
  } catch (error) {
    console.error("=> [API] Database Connection Error:", error);
    throw error;
  }
};

export async function GET() {
  console.log("=> [API] ළමයිගේ දත්ත ඉල්ලීම ආරම්භ විය...");
  try {
    await connectDB();
    
    console.log("=> [API] Database එකෙන් ළමයිව හොයමින් පවතී...");
    
    // 🔴 වෙනස: Mongoose Model එක මඟහැර කෙලින්ම Database එකෙන් දත්ත ගැනීම (කිසිම හිරවීමක් නොවේ)
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection හඳුනාගත නොහැක!");

    const students = await db.collection('enrollments')
                             .find({ status: "approved" })
                             .sort({ _id: -1 })
                             .toArray();
    
    console.log(`=> [API] සාර්ථකයි! ළමයි ${students.length} කගේ දත්ත ලබා ගත්තා.`);
    return NextResponse.json({ success: true, data: students }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/admin/students Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}