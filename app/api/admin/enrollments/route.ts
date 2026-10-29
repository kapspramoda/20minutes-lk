import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";
import { getCachedData } from "@/lib/cache"; 

// 1. Pending රිසිට්පත් සියල්ල ලබා ගැනීම (GET)
export async function GET() {
  try {
    await connectToDatabase();
    
    // 🔴 Database එක වෙනුවට Cache එකෙන් ගැනීම 
    const pendingEnrollments = await getCachedData(
      "admin_pending_enrollments_optimized",
      async () => {
        return await Enrollment.find({ status: "pending" })
                               // පින්තූරය අතහැර අත්‍යවශ්‍ය දත්ත පමණක් ගෙන ඒම
                               .select("-slipImage") 
                               .sort({ createdAt: -1 })
                               .lean();
      },
      60 // තත්පර 60ක් RAM එකේ තියාගනී 
    );
    
    return NextResponse.json({ enrollments: pendingEnrollments }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "දත්ත ලබාගැනීමේදී දෝෂයක් මතු විය." }, { status: 500 });
  }
}

// 2. අනුමත කිරීම හෝ ප්‍රතික්ෂේප කිරීම සහ SMS යැවීම (PATCH Request)
export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ message: "දත්ත සම්පූර්ණ නැත." }, { status: 400 });
    }

    // Database එකේ දත්ත යාවත්කාලීන කර අලුත් රෙකෝඩ් එක (new: true) ලබා ගැනීම
    const updatedEnrollment = await Enrollment.findByIdAndUpdate(
      id, 
      { status },
      { new: true } 
    );

    if (!updatedEnrollment) {
      return NextResponse.json({ message: "Enrollment එක සොයාගත නොහැක." }, { status: 404 });
    }

    // --- SMS යැවීමේ කොටස ---
    if (updatedEnrollment.userPhone) {
      let phone = updatedEnrollment.userPhone;
      
      // දුරකථන අංකය 947XXXXXXXX ෆෝමැට් එකට හැරවීම
      if (phone.startsWith('0')) {
        phone = '94' + phone.substring(1);
      } else if (!phone.startsWith('94')) {
        phone = '94' + phone;
      }

      let message = "";
      const courseName = updatedEnrollment.courseTitle || "පාඨමාලාව";
      
      // Approve කරන විට යවන SMS එක
      if (status === "approved") {
        message = `ආයුබෝවන්! ඔබගේ 20minutes.lk ගිණුමේ ${courseName} සාර්ථකව සක්‍රීය කරන ලදී. දැන්ම ලොග් වී ඉගෙනීම් කටයුතු ආරම්භ කරන්න. Link: https://www.20minutes.lk/dashboard`;
      } 
      // Reject කරන විට යවන SMS එක
      else if (status === "rejected") {
        message = `ආයුබෝවන්! ඔබගේ 20minutes.lk ගිණුමේ ${courseName} සඳහා දැමූ රිසිට්පත ප්‍රතික්ෂේප වී ඇත. කරුණාකර නැවත නිවැරදි රිසිට්පතක් ඇතුළත් කරන්න. Link: https://www.20minutes.lk/dashboard`;
      }

      // පණිවිඩයක් සැකසී ඇත්නම් Text.lk API[cite: 4] හරහා එය යැවීම
      if (message !== "") {
        try {
          await fetch("https://app.text.lk/api/v3/sms/send", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${process.env.TEXTLK_API_TOKEN}`,
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify({
              recipient: phone,
              sender_id: process.env.TEXTLK_SENDER_ID || "Text.lk",
              message: message
            })
          });
          console.log(`SMS Sent to ${phone} for status: ${status}`);
        } catch (smsError) {
          console.error("SMS යැවීමේ දෝෂයක්:", smsError);
          // SMS නොගියත් Database එක යාවත්කාලීන වූ නිසා Error පෙන්වන්නේ නැහැ
        }
      }
    }

    return NextResponse.json({ message: "සාර්ථකව යාවත්කාලීන කරන ලදී!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "යාවත්කාලීන කිරීමේදී දෝෂයක් මතු විය." }, { status: 500 });
  }
}

// 3. මකා දැමීම (DELETE Request)
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