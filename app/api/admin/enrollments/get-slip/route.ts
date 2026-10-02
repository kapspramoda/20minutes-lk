import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ message: "ID is required" }, { status: 400 });

    await connectToDatabase();
    // අදාළ ID එකට අදාළ පින්තූරය පමණක් ඩේටාබේස් එකෙන් ගැනීම
    const enrollment = await Enrollment.findById(id).select("slipImage").lean();

    if (!enrollment || !enrollment.slipImage) {
      return NextResponse.json({ message: "පින්තූරයක් නොමැත", slipImage: null }, { status: 404 });
    }

    return NextResponse.json({ slipImage: enrollment.slipImage }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error loading image" }, { status: 500 });
  }
}