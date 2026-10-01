import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";
import { getCachedData } from "@/lib/cache"; 

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
      `student_enrollments_${phone}`, 
      async () => {
        return await Enrollment.find({ userPhone: phone })
                               .select("-slipImage") // 🔴 වෙනස: බර වැඩි රිසිට් පින්තූරය සම්පූර්ණයෙන්ම අතහැරීම
                               .sort({ createdAt: -1 })
                               .lean();
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