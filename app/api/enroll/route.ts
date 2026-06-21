import { NextResponse } from "next/server";
// මෙතන නම connectToDatabase ලෙස වෙනස් කළා සහ සඟල වරහන් අයින් කළා
import connectToDatabase from "@/lib/mongodb"; 
import Enrollment from "@/models/Enrollment";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userPhone, courseTitle, slipImage } = body;

    // දත්ත ඇවිත්ද කියලා පරීක්ෂා කිරීම
    if (!userPhone || !slipImage || !courseTitle) {
      return NextResponse.json({ message: "කරුණාකර රිසිට්පතක් ලබා දෙන්න." }, { status: 400 });
    }

    // නිවැරදි function නම පාවිච්චි කර MongoDB එකට සම්බන්ධ වීම
    await connectToDatabase();

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