// app/api/admin/enrollments/image/route.ts

import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";
import { getCachedData } from "@/lib/cache";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id"); // Enrollment ID එක

    if (!id) {
      return NextResponse.json({ message: "Enrollment ID එක ලබා දී නැත." }, { status: 400 });
    }

    await connectToDatabase();

    // 🔴 අදාළ ID එකට අදාළ පින්තූරය පමණක් Cache එක හරහා ලබා ගැනීම
    const enrollment = await getCachedData(
      `enrollment_slip_${id}`,
      async () => {
        return await Enrollment.findById(id).select("slipImage").lean();
      },
      300 // විනාඩි 5ක් RAM එකේ රඳවා ගනී
    );

    if (!enrollment || !enrollment.slipImage) {
      return NextResponse.json({ message: "රිසිට් පත සොයාගත නොහැක." }, { status: 404 });
    }

    return NextResponse.json({ slipImage: enrollment.slipImage }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "පින්තූරය ලබාගැනීමේදී දෝෂයක් මතු විය." }, { status: 500 });
  }
}