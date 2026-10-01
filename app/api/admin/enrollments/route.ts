import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";
import { getCachedData } from "@/lib/cache"; // 🔴 අලුතින් එකතු කළා

// 1. Pending රිසිට්පත් සියල්ල ලබා ගැනීම (GET Request)
export async function GET() {
  try {
    await connectToDatabase();
    
    // 🔴 ඩේටාබේස් එක වෙනුවට Cache එකෙන් ලබා ගැනීම (තත්පර 60කට)
    const pendingEnrollments = await getCachedData(
      "admin_pending_enrollments",
      async () => {
        return await Enrollment.find({ status: "pending" }).sort({ createdAt: -1 }).lean();
      },
      60 
    );
    
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

    await Enrollment.findByIdAndUpdate(id, { status });

    return NextResponse.json({ message: "සාර්ථකව යාවත්කාලීන කරන ලදී!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "යාවත්කාලීන කිරීමේදී දෝෂයක් මතු විය." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "මකා දැමීමට අදාළ ID එකක් ලබා දී නොමැත." }, { status: 400 });
    }

    const deletedRecord = await Enrollment.findByIdAndDelete(id);

    if (!deletedRecord) {
      return NextResponse.json({ message: "මකා දැමීමට අදාළ දත්ත සොයාගත නොහැක." }, { status: 404 });
    }

    return NextResponse.json({ message: "සාර්ථකව මකා දමන ලදී!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "මකා දැමීමේදී දෝෂයක් මතු විය." }, { status: 500 });
  }
}