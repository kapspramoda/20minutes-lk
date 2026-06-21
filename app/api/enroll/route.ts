import { NextResponse } from "next/server";
// මෙතන ඔයාගේ mongodb සම්බන්ධ කරන ෆයිල් එකේ නම හරියට දෙන්න
import { connectMongoDB } from "@/lib/mongodb"; 
import Enrollment from "@/models/Enrollment";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userPhone, courseTitle, slipImage } = body;

    // දත්ත ඇවිත්ද කියලා පරීක්ෂා කිරීම
    if (!userPhone || !slipImage || !courseTitle) {
      return NextResponse.json({ message: "කරුණාකර රිසිට්පතක් ලබා දෙන්න." }, { status: 400 });
    }

    // MongoDB එකට සම්බන්ධ වීම
    await connectMongoDB();

    // අලුත් Slip එක Database එකට Save කිරීම
    await Enrollment.create({
      userPhone,
      courseTitle,
      slipImage,
      status: "pending", 
    });

    console.log("අලුත් Slip එකක් Database එකට Save වුණා! දුරකථන අංකය:", userPhone);

    return NextResponse.json({ message: "ඔබගේ රිසිට්පත සාර්ථකව යවන ලදී!", success: true }, { status: 201 });

  } catch (error) {
    console.error("Slip Upload Error:", error);
    return NextResponse.json({ message: "තාක්ෂණික දෝෂයක් මතු විය. නැවත උත්සාහ කරන්න." }, { status: 500 });
  }
}