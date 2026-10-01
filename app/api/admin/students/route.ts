import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { getCachedData } from "@/lib/cache"; // 🔴 අලුතින් එකතු කළා

let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }
  
  console.log("=> [API] MongoDB Native Client හරහා සම්බන්ධ වෙමින්...");
  const client = new MongoClient(process.env.MONGODB_URI as string, {
    serverSelectionTimeoutMS: 4000, 
    connectTimeoutMS: 4000,
  });

  await client.connect();
  cachedClient = client;
  console.log("=> [API] MongoDB Native Client සාර්ථකව සම්බන්ධ විය!");
  return client;
}

export async function GET() {
  console.log("=> [API] ළමයිගේ දත්ත ඉල්ලීම ආරම්භ විය...");
  
  try {
    const client = await connectToDatabase();
    const db = client.db(); 
    
    // 🔴 ඩේටාබේස් එක වෙනුවට Cache එකෙන් ලබා ගැනීම (තත්පර 60කට)
    const students = await getCachedData(
      "admin_approved_students",
      async () => {
        console.log("=> [API] Database එකෙන් ළමයිව හොයමින් පවතී (Native)...");
        return await db.collection("enrollments")
                       .find({ status: "approved" }) 
                       .project({ 
                          userPhone: 1, 
                          courseTitle: 1, 
                          status: 1, 
                          createdAt: 1 
                       }) 
                       .sort({ _id: -1 })
                       .maxTimeMS(4000)
                       .toArray();
      },
      60
    );

    console.log(`=> [API] සාර්ථකයි! ළමයි ${students.length} කගේ දත්ත ලබා ගත්තා.`);
    return NextResponse.json({ success: true, data: students }, { status: 200 });

  } catch (error: any) {
    console.error("=> [API] 🔴 Error:", error.message || error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Database connection timeout" 
    }, { status: 500 });
  }
}