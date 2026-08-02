import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Enrollment from "@/models/Enrollment"; 

let isConnected = false;

const connectDB = async () => {
  // readyState 1 කියන්නේ හරියටම Connect වෙලා කියන එකයි
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log("=> [API] පවතින Database Connection එක භාවිතා කරයි...");
    return;
  }

  console.log("=> [API] Database එකට අලුතින් සම්බන්ධ වීමට උත්සාහ කරයි...");
  try {
    await mongoose.connect(process.env.MONGODB_URI as string, {
      serverSelectionTimeoutMS: 5000, 
      socketTimeoutMS: 10000, // තත්පර 10කට වඩා බලන් ඉන්නේ නෑ
      bufferCommands: false, // 🔴 හිරවෙලා (Hang වෙලා) ඉන්න එක සම්පූර්ණයෙන්ම නවත්වනවා
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
    
    // Mongoose හරහා දත්ත ඇදීම (උපරිම තත්පර 5යි දෙන්නේ)
    const students = await Enrollment.find({ status: "approved" })
                                     .sort({ _id: -1 })
                                     .lean()
                                     .maxTimeMS(5000); 
    
    console.log(`=> [API] සාර්ථකයි! ළමයි ${students.length} කගේ දත්ත ලබා ගත්තා.`);
    return NextResponse.json({ success: true, data: students }, { status: 200 });
  } catch (error: any) {
    // දැන් හිරවෙන්නේ නෑ, මෙතනින් කෙලින්ම රතු පාටින් Error එක ලොග් එකට වැටෙනවා
    console.error("=> [API] GET Error 🔴:", error.message || error);
    return NextResponse.json({ success: false, error: error.message || "Database Timeout" }, { status: 500 });
  }
}