import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }
  
  console.log("=> [API] MongoDB Native Client හරහා සම්බන්ධ වෙමින්...");
  const client = new MongoClient(process.env.MONGODB_URI as string, {
    serverSelectionTimeoutMS: 4000, // තත්පර 4කට වඩා ඉන්නේ නෑ
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
    
    // URI එකෙන් Database නම තෝරාගැනීම (හෝ ඩිෆෝල්ට් නම)
    const db = client.db(); 
    
    console.log("=> [API] Database එකෙන් ළමයිව හොයමින් පවතී (Native)...");
    
    // 🔴 වෙනස: දත්ත වල බර අඩු කිරීමට .project() එකතු කර ඇත
    // enrollments කලෙක්ෂන් එකෙන් දත්ත ගැනීම (Timeout එකක් සමඟ)
    const students = await db.collection("enrollments")
                             .find({ status: "approved" })
                             .project({ 
                                // Admin Panel එකේ පෙන්වන්න අත්‍යවශ්‍ය දේවල් විතරක් 1 කියලා දෙන්න
                                name: 1, 
                                email: 1, 
                                phone: 1, 
                                courseId: 1,
                                createdAt: 1 
                             })
                             .sort({ _id: -1 })
                             .maxTimeMS(4000)
                             .toArray();

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