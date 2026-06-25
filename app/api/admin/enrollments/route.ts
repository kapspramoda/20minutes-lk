import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";

// 1. Pending රිසිට්පත් සියල්ල ලබා ගැනීම (GET Request)
export async function GET() {
  try {
    await connectToDatabase();
    // status එක 'pending' වන ඒවා පමණක් අලුත්ම එක උඩින් එන විදිහට ගෙන ඒම
    const pendingEnrollments = await Enrollment.find({ status: "pending" }).sort({ createdAt: -1 });
    return NextResponse.json({ enrollments: pendingEnrollments }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "දත්ත ලබාගැනීමේදී දෝෂයක් මතු විය." }, { status: 500 });
  }
}

// 2. අනුමත කිරීම හෝ ප්‍රතික්ෂේප කිරීම (PATCH Request)
export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const { id, status } = await req.json();

    // Database එකේ අදාළ ළමයාගේ status එක වෙනස් කිරීම ('approved' හෝ 'rejected' ලෙස)
    await Enrollment.findByIdAndUpdate(id, { status });

    return NextResponse.json({ message: "සාර්ථකව යාවත්කාලීන කරන ලදී!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "යාවත්කාලීන කිරීමේදී දෝෂයක් මතු විය." }, { status: 500 });
  }
}