import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";
import { getCachedData } from "@/lib/cache"; // 🔴 අලුතින් එකතු කළා

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json({ message: "දුරකථන අංකය නොමැත." }, { status: 400 });
    }

    await connectToDatabase();

    // 🔴 ඩේටාබේස් එක වෙනුවට Cache එකෙන් ලබා ගැනීම
    const userCourses = await getCachedData(
      `student_enrollments_${phone}`, // දුරකථන අංකයට අනුව Cache වේ
      async () => {
        return await Enrollment.find({ userPhone: phone }).sort({ createdAt: -1 }).lean();
      },
      60 
    );

    const approvedCourses = userCourses.filter((course: any) => course.status === "approved");
    const pendingCourses = userCourses.filter((course: any) => course.status === "pending");

    return NextResponse.json({ approvedCourses, pendingCourses }, { status: 200 });
  } catch (error) {
    console.error("Error fetching student courses:", error);
    return NextResponse.json({ message: "දත්ත ලබාගැනීමේදී දෝෂයක් මතු විය." }, { status: 500 });
  }
}