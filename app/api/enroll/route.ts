import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb"; 
import Enrollment from "@/models/Enrollment";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary සැකසුම්
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userPhone, courseTitle, slipImage } = body;

    // දත්ත ඇවිත්ද කියලා පරීක්ෂා කිරීම
    if (!userPhone || !slipImage || !courseTitle) {
      return NextResponse.json({ message: "කරුණාකර රිසිට්පතක් ලබා දෙන්න." }, { status: 400 });
    }

    // 1. පින්තූරය Cloudinary එකට Upload කිරීම
    // මෙහිදී 'bank_slips' කියලා අලුත් ෆෝල්ඩරයක් Cloudinary එකේ හැදෙනවා
    const uploadResponse = await cloudinary.uploader.upload(slipImage, {
      folder: "bank_slips", 
    });

    // Cloudinary එකෙන් දෙන ආරක්ෂිත ලින්ක් එක (URL එක)
    const imageUrl = uploadResponse.secure_url; 

    // 2. MongoDB එකට සම්බන්ධ වීම
    await connectToDatabase();

    // අලුත් Slip එක Database එකට Save කිරීම (මෙවර Save වෙන්නේ URL එකයි)
    await Enrollment.create({
      userPhone,
      courseTitle,
      slipImage: imageUrl, 
      status: "pending", 
    });

    console.log("අලුත් Slip එකක් සාර්ථකව Save වුණා! ලින්ක් එක:", imageUrl);

    return NextResponse.json({ message: "ඔබගේ රිසිට්පත සාර්ථකව යවන ලදී!", success: true }, { status: 201 });

  } catch (error) {
    console.error("Slip Upload Error:", error);
    return NextResponse.json({ message: "තාක්ෂණික දෝෂයක් මතු විය. නැවත උත්සාහ කරන්න." }, { status: 500 });
  }
}