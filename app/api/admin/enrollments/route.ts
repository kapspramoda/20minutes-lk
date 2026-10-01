import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";
import { getCachedData } from "@/lib/cache"; 

// 1. Pending රිසිට්පත් සියල්ල ලබා ගැනීම (GET Request) - වේගවත් කිරීම සඳහා ප්‍රශස්ත කර ඇත
export async function GET() {
  try {
    await connectToDatabase();
    
    // 🔴 ඩේටාබේස් එක වෙනුවට Cache එකෙන් ලබා ගැනීම සහ බර වැඩි slipImage එක සම්පූර්ණයෙන්ම අතහැරීම
    const pendingEnrollments = await getCachedData(
      "admin_pending_enrollments_optimized",
      async () => {
        return await Enrollment.find({ status: "pending" })
                               // 🔴 වෙනස: slipImage එක ඉවත් කර අත්‍යවශ්‍ය දත්ත පමණක් ලබා ගැනීම
                               .select("-slipImage") 
                               .sort({ createdAt: -1 })
                               .lean();
      },
      60 // තත්පර 60ක් RAM එකේ තබාගනී
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