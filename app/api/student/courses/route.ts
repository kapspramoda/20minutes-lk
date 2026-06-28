import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";

export async function GET(req: Request) {
  try {
    // 1. URL එකෙන් ළමයාගේ ෆෝන් නම්බර් එක ලබා ගැනීම
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json({ message: "දුරකථන අංකය නොමැත." }, { status: 400 });
    }

    // 2. Database එකට සම්බන්ධ වීම
    await connectToDatabase();

    // 3. මේ ළමයාගේ දුරකථන අංකයට අදාළ සියලුම රිසිට්පත්/පාඨමාලා ලබාගැනීම (අලුත්ම ඒවා උඩින් එන ලෙස)
    const userCourses = await Enrollment.find({ userPhone: phone }).sort({ createdAt: -1 });

    // 4. ඒවා 'approved' (මගේ පාඨමාලා) සහ 'pending' (අනුමැතිය පවතින) ලෙස කොටස් 2කට වෙන් කිරීම
    const approvedCourses = userCourses.filter(course => course.status === "approved");
    const pendingCourses = userCourses.filter(course => course.status === "pending");

    // 5. ඒ වෙන් කරපු දත්ත ටික Frontend එකට යැවීම
    return NextResponse.json({ approvedCourses, pendingCourses }, { status: 200 });

  } catch (error) {
    console.error("Error fetching student courses:", error);
    return NextResponse.json({ message: "දත්ත ලබාගැනීමේදී දෝෂයක් මතු විය." }, { status: 500 });
  }
}