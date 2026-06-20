"use client";

import React, { useState } from "react";
import { signOut, useSession } from "next-auth/react";

export default function DashboardPage() {
  // ළමයාගේ තොරතුරු ලබා ගැනීම (Session)
  const { data: session } = useSession();

  // --- Modal එක සඳහා අවශ්‍ය States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock Data (තාවකාලික දත්ත)
  const myCourses = [
    { id: 1, title: "තරග විභාග - සාමාන්‍ය දැනීම (General Knowledge)", progress: 45 },
  ];

  const pendingCourses = [
    { id: 2, title: "තරග විභාග - බුද්ධි පරීක්ෂණය (IQ) සම්පූර්ණ පාඨමාලාව" },
  ];

  const availableCourses = [
    { id: 3, title: "රාජ්‍ය කළමනාකරණ සහකාර විභාගය - පෙරහුරු", price: "රු. 2500" },
    { id: 4, title: "ශ්‍රී ලංකා රේගු දෙපාර්තමේන්තු විභාගය", price: "රු. 3000" },
  ];

  // බොත්තම එබූ විට Modal එක විවෘත කිරීම
  const handleEnrollClick = (course: any) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  // Modal එක වැසීම
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
    setSlipFile(null);
  };

  // --- පින්තූරය Base64 බවට පත් කිරීමේ Function එක ---
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result as string);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  // --- Slip එක Database එකට යැවීම (API Call) ---
  const handleSubmitSlip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slipFile) {
      alert("කරුණාකර ඔබගේ බැංකු රිසිට් පත (Bank Slip) ඇතුළත් කරන්න.");
      return;
    }

    // ළමයාගේ දුරකථන අංකය Session එකෙන් ගැනීම (නැතිනම් නම හෝ ඊමේල් එක භාවිත කිරීම)
    const userPhone = (session?.user as any)?.phone || session?.user?.name || session?.user?.email;

    if (!userPhone) {
      alert("ඔබේ ගිණුමේ තොරතුරු ලබාගැනීමට නොහැක. කරුණාකර නැවත ලොග් වන්න.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. පින්තූරය කේතයක් (Base64) බවට පත් කිරීම
      const base64Image = await convertToBase64(slipFile);

      // 2. අපි හදපු අලුත් API එකට දත්ත යැවීම
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userPhone: userPhone,
          courseTitle: selectedCourse.title,
          slipImage: base64Image,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "ඔබේ රිසිට් පත සාර්ථකව යොමු කරන ලදී! Admin අනුමත කළ පසු ඔබට පාඩම් නැරඹිය හැක.");
        handleCloseModal();
      } else {
        alert(data.message || "දෝෂයක් මතු විය. කරුණාකර නැවත උත්සාහ කරන්න.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("තාක්ෂණික දෝෂයකි. කරුණාකර පසුව නැවත උත්සාහ කරන්න.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative modern-font">
      
      {/* --- Main Page Header --- */}
      <header className="sticky top-0 z-50 flex justify-between items-center p-4 md:px-8 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">
            20
          </div>
          <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 logo-font">
            minutes.lk
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block font-medium text-slate-600">
            ආයුබෝවන්, <span className="text-blue-600 font-bold">{session?.user?.name || "ශිෂ්‍යයා"}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-4 py-2 bg-red-50 hover:bg-red-5