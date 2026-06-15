"use client";

import { useState } from "react";
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
    <div className="min-h-screen bg-gray-50 relative modern-font">
      
      {/* Navigation Bar */}
      <nav className="bg-slate-900 px-6 py-4 shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight logo-font">20minutes.lk</h1>
          <div className="flex items-center space-x-4">
            <span className="text-slate-300 text-sm md:text-base hidden sm:block">
              ආයුබෝවන්, {session?.user?.name || "ශිෂ්‍යයා"}!
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-full bg-red-500/10 border border-red-500/50 px-4 py-1.5 text-xs md:text-sm font-semibold text-red-500 transition hover:bg-red-500 hover:text-white focus:outline-none"
            >
              ලොග් අවුට්
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl p-4 md:p-6">
        
        {/* මගේ පාඨමාලා */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg md:text-xl font-bold text-slate-800 border-l-4 border-emerald-500 pl-3">මගේ පාඨමාලා (My Courses)</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myCourses.map((course) => (
              <div key={course.id} className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md border border-slate-100">
                <div className="bg-emerald-50 h-28 md:h-32 flex items-center justify-center">
                   <svg className="w-10 h-10 md:w-12 md:h-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="p-4 md:p-5">
                  <h3 className="mb-2 text-sm md:text-base font-bold text-slate-800 line-clamp-2">{course.title}</h3>
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                  </div>
                  <button className="w-full rounded-full bg-emerald-500 py-2 text-xs md:text-sm font-bold text-white hover:bg-emerald-600 transition shadow-sm">
                    පාඩම් නරඹන්න (Watch)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* අනුමැතිය පවතින */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg md:text-xl font-bold text-slate-800 border-l-4 border-amber-500 pl-3">අනුමැතිය පවතින (Pending Approvals)</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pendingCourses.map((course) => (
              <div key={course.id} className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 relative opacity-80">
                <div className="absolute top-3 right-3 bg-amber-100 text-amber-700 text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">Pending</div>
                <div className="bg-slate-50 h-28 md:h-32 flex items-center justify-center">
                   <svg className="w-10 h-10 md:w-12 md:h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="p-4 md:p-5">
                  <h3 className="mb-2 text-sm md:text-base font-bold text-slate-800 line-clamp-2">{course.title}</h3>
                  <p className="text-[11px] md:text-xs text-slate-500 mb-4 font-medium">Admin විසින් ඔබේ රිසිට් පත පරීක්ෂා කරමින් පවතී.</p>
                  <button disabled className="w-full rounded-full bg-slate-100 py-2 text-xs md:text-sm font-bold text-slate-400 cursor-not-allowed border border-slate-200">
                    අනුමත වනතුරු රැඳෙන්න
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ලබාගත හැකි අලුත් පාඨමාලා */}
        <section>
          <h2 className="mb-4 text-lg md:text-xl font-bold text-slate-800 border-l-4 border-blue-500 pl-3">අලුත් පාඨමාලා (Available Courses)</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableCourses.map((course) => (
              <div key={course.id} className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md border border-slate-100">
                <div className="bg-blue-50 h-28 md:h-32 flex items-center justify-center">
                   <svg className="w-10 h-10 md:w-12 md:h-12 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </div>
                <div className="p-4 md:p-5 flex flex-col justify-between h-[calc(100%-7rem)] md:h-[calc(100%-8rem)]">
                  <div>
                    <h3 className="mb-2 text-sm md:text-base font-bold text-slate-800 line-clamp-2">{course.title}</h3>
                    <p className="text-base md:text-lg font-extrabold text-blue-600 mb-4">{course.price}</p>
                  </div>
                  
                  <button 
                    onClick={() => handleEnrollClick(course)}
                    className="w-full mt-auto rounded-full bg-blue-600 py-2 text-xs md:text-sm font-bold text-white hover:bg-blue-700 transition shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                  >
                    ඇතුළත් වන්න (Enroll)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* --- Payment Modal (Slip Upload Popup) --- */}
      {isModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg md:text-xl font-extrabold text-slate-800">පාඨමාලාවට ඇතුළත් වීම</h3>
              <button onClick={handleCloseModal} className="rounded-full bg-slate-100 p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors focus:outline-none">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="mb-6 rounded-2xl bg-blue-50/50 p-4 border border-blue-100/50">
              <p className="font-bold text-slate-700 text-sm md:text-base line-clamp-2">{selectedCourse.title}</p>
              <p className="mt-2 font-extrabold text-blue-600 text-lg md:text-xl">ගෙවිය යුතු මුදල: {selectedCourse.price}</p>
            </div>

            <div className="mb-6">
              <h4 className="mb-2 text-sm font-bold text-slate-600">පහත බැංකු ගිණුමට මුදල් තැන්පත් කරන්න:</h4>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs md:text-sm text-slate-700 space-y-1.5">
                <p><strong className="font-bold">බැංකුව:</strong> BOC (Bank of Ceylon)</p>
                <p><strong className="font-bold">ශාඛාව:</strong> Colombo 01</p>
                <p><strong className="font-bold">ගිණුම් අංකය:</strong> 1234567890</p>
                <p><strong className="font-bold">නම:</strong> 20minutes.lk (Pvt) Ltd</p>
              </div>
            </div>

            <form onSubmit={handleSubmitSlip}>
              <div className="mb-6">
                <label className="mb-2 block text-sm font-bold text-slate-600">බැංකු රිසිට් පත (Bank Slip) උඩුගත කරන්න</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setSlipFile(e.target.files ? e.target.files[0] : null)}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-xs file:font-bold file:text-blue-600 hover:file:bg-blue-100 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-full bg-slate-100 px-5 py-2.5 text-xs md:text-sm font-bold text-slate-600 hover:bg-slate-200 focus:outline-none transition-colors"
                >
                  අවලංගු කරන්න
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-blue-600 px-5 py-2.5 text-xs md:text-sm font-bold text-white shadow-md hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? "යොමු කරමින් පවතී..." : "Slip එක යොමු කරන්න"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}