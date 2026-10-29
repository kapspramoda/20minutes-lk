import { NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";
import PasswordReset from "@/models/PasswordReset";
import bcrypt from "bcryptjs"; 
import { getCachedData } from "@/lib/cache";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
};

export async function GET() {
  try {
    await connectDB();
    
    // 🔴 ඩේටාබේස් එක වෙනුවට Cache එකෙන් ලබා ගැනීම (තත්පර 60කට)
    const requests = await getCachedData(
      "admin_password_resets",
      async () => {
        return await PasswordReset.find({ status: "pending" }).sort({ createdAt: -1 }).lean();
      },
      60
    );
    
    return NextResponse.json({ data: requests }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { id, phone, newPasswordPlain } = await req.json();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPasswordPlain, salt);

    // Database යාවත්කාලීන කිරීම
    await User.updateOne({ phone }, { $set: { password: hashedPassword } });
    await PasswordReset.findByIdAndUpdate(id, { status: "approved" });

    // --- SMS යැවීමේ කොටස ආරම්භය ---
    if (phone && newPasswordPlain) {
      let formattedPhone = phone;
      
      // දුරකථන අංකය 947XXXXXXXX ෆෝමැට් එකට හැරවීම
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '94' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('94')) {
        formattedPhone = '94' + formattedPhone;
      }

      const message = `ආයුබෝවන්, ඔබගේ 20minutes.lk ගිණුමේ මුරපදය සාර්ථකව වෙනස් කර ඇත.\n\nදුරකථන අංකය: ${phone}\nනව මුරපදය: ${newPasswordPlain}\n\nලොග් වීමට: https://www.20minutes.lk/`;

      try {
        await fetch("https://app.text.lk/api/v3/sms/send", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.TEXTLK_API_TOKEN}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            recipient: formattedPhone,
            sender_id: process.env.TEXTLK_SENDER_ID || "Text.lk",
            message: message
          })
        });
        console.log("Password Reset SMS Sent to", formattedPhone);
      } catch (smsError) {
        console.error("SMS යැවීමේ දෝෂයක්:", smsError);
      }
    }
    // --- SMS යැවීමේ කොටස අවසානය ---

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await PasswordReset.findByIdAndDelete(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}