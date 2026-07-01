"use client";

import React, { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import imageCompression from "browser-image-compression";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [pendingCourses, setPendingCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) setIsDarkMode(true);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  useEffect(() => {
    const fetchMyCourses = async () => {
      const userPhone = (session?.user as any)?.phone || session?.user?.name || session?.user?.email;
      if (!userPhone) return;
      try {
        const res = await fetch(`/api/student/courses?phone=${userPhone}`);
        const data = await res.json();
        if (res.ok) {
          setMyCourses(data.approvedCourses);
          setPendingCourses(data.pendingCourses);
        }
      } catch (error) { console.error(error); } 
      finally { setIsLoadingCourses(false); }
    };
    if (status === "authenticated") fetchMyCourses();
  }, [status, session]);

  useEffect(() => {
    const fetchAvailableCourses = async () => {
      try {
        const res = await fetch("/api/courses");
        const data = await res.json();
        if (res.ok) setAvailableCourses(data.data.filter((c: any) => c.isVisible === true));
      } catch (error) { console.error(error); } 
      finally { setIsLoadingAvailable(false); }
    };
    fetchAvailableCourses();
  }, []);

  const handleEnrollClick = (course: any) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
    setSlipFile(null);
  };

  const handleSubmitSlip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slipFile) return alert("කරුණාකර Bank Slip එක ඇතුළත් කරන්න.");

    const userPhone = (session?.user as any)?.phone || session?.user?.name || session?.user?.email;
    if (!userPhone) return alert("කරුණාකර නැවත ලොග් වන්න.");

    setIsSubmitting(true);
    try {
      let fileToUpload: File | Blob = slipFile;
      if (slipFile.type.startsWith("image/")) {
        fileToUpload = await imageCompression(slipFile, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true });
      }

      const reader = new FileReader();
      reader.readAsDataURL(fileToUpload);
      reader.onload = async () => {
        
        // 🔴 පාඨමාලාවේ ගාස්තුවෙන් ඉලක්කම් පමණක් වෙන් කර ගැනීම (උදා: "රු. 2500" -> 2500)
        const numericPrice = Number(selectedCourse.price?.replace(/[^0-9]/g, '')) || 0;

        const res = await fetch("/api/enroll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userPhone,
            courseId: selectedCourse._id,
            courseTitle: selectedCourse.title,
            amount: numericPrice, // 🔴 ආදායම යැවීම
            slipImage: reader.result,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          alert("ඔබේ රිසිට් පත සාර්ථකව යොමු කරන ලදී!");
          window.location.reload(); 
        } else {
          alert(data.message || "දෝෂයක් මතු විය.");
        }
        setIsSubmitting(false);
      };
    } catch (error) {
      alert("තාක්ෂණික දෝෂයකි.");
      setIsSubmitting(false);
    }
  };

  // Styles
  const themeBg = isDarkMode ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-800";
  const headerBg = isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200";
  const cardBg = isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100";
  const inputBg = isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-slate-50 border-slate-200 text-slate-900";

  return (
    <div className={`modern-font flex min-h-screen flex-col transition-colors duration-300 ${themeBg}`}>
      <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-md transition-all ${headerBg}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <h1 className="logo-font text-xl font-bold">20minutes.lk</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="text-xl">{isDarkMode ? '🌞' : '🌙'}</button>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="text-red-500 font-bold text-sm">ඉවත් වන්න</button>
          </div>
        </div>
      </header>

      <main className="flex-grow mx-auto w-full max-w-7xl p-4 md:p-6 mt-4">
        {isLoadingCourses ? (
          <div className="text-center py-10 text-slate-400 font-bold animate-pulse">දත්ත ගෙනෙමින් පවතී...</div>
        ) : (
          <>
            {myCourses.length > 0 && (
              <section className="mb-12">
                <h2 className="mb-6 text-xl font-bold border-l-4 border-emerald-500 pl-3">මගේ පාඨමාලා</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {myCourses.map(course => {
                    // Course Details හොයාගැනීම (Cover image පෙන්වීමට)
                    const fullCourse = availableCourses.find(c => c._id === course.courseId);
                    return (
                      <div key={course._id} className={`rounded-2xl overflow-hidden shadow-sm border ${cardBg}`}>
                        {fullCourse?.coverImage ? (
                          <img src={fullCourse.coverImage} className="w-full h-32 object-cover" alt="Cover" />
                        ) : (
                          <div className="bg-emerald-500/10 h-32 flex items-center justify-center">🎓</div>
                        )}
                        <div className="p-5">
                          <h3 className="font-bold mb-4">{course.courseTitle}</h3>
                          <Link href={`/course/${course.courseId}`} className="block text-center rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-white">පාඨමාලාවට පිවිසෙන්න</Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* අනුමැතිය පවතින (Pending) කොටස මෙහි ඇත (කලින් කේතයම භාවිතා කරන්න පුළුවන්) */}
          </>
        )}

        <section className="mb-12">
          <h2 className="mb-6 text-xl font-bold border-l-4 border-blue-500 pl-3">ලබාගත හැකි අලුත් පාඨමාලා</h2>
          {isLoadingAvailable ? (
            <div className="text-center py-10 text-slate-400 font-bold animate-pulse">පාඨමාලා ලබාගනිමින් පවතී...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {availableCourses.map(course => (
                <div key={course._id} className={`flex flex-col rounded-2xl overflow-hidden shadow-sm border ${cardBg}`}>
                  {course.coverImage ? (
                    <img src={course.coverImage} className="w-full h-40 object-cover" alt="Cover" />
                  ) : (
                    <div className="bg-blue-500/10 h-40 flex items-center justify-center text-3xl">📚</div>
                  )}
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-bold mb-2">{course.title}</h3>
                    <p className="font-extrabold text-blue-500 mb-4">{course.price}</p>
                    <button onClick={() => handleEnrollClick(course)} className="mt-auto w-full rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white">ඇතුළත් වන්න (Enroll)</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Payment Modal */}
      {isModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <h3 className="text-xl font-bold border-b pb-3 mb-4">පාඨමාලාවට ඇතුළත් වීම</h3>
            
            <div className={`mb-4 p-4 rounded-xl ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
              <p className="font-bold text-sm">{selectedCourse.title}</p>
              <p className="mt-2 font-extrabold text-blue-500 text-lg">ගෙවිය යුතු මුදල: {selectedCourse.price}</p>
            </div>

            <div className="mb-6 h-40 overflow-y-auto pr-2">
              <h4 className="mb-2 text-sm font-bold">පහත බැංකු ගිණුමකට මුදල් තැන්පත් කරන්න:</h4>
              
              {/* 🔴 Database එකෙන් එන බැංකු ගිණුම් පෙන්වීම */}
              {selectedCourse.bankAccounts?.length > 0 ? (
                selectedCourse.bankAccounts.map((bank: any, idx: number) => (
                  <div key={idx} className={`mb-3 rounded-xl p-3 text-sm border ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                    <p><strong>බැංකුව:</strong> {bank.bankName} - {bank.branch}</p>
                    <p><strong>ගිණුම් අංකය:</strong> <span className="font-bold text-blue-500">{bank.accNumber}</span></p>
                    <p><strong>නම:</strong> {bank.accName}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-red-500">ගිණුම් විස්තර ඇතුළත් කර නොමැත.</p>
              )}
            </div>

            <form onSubmit={handleSubmitSlip}>
              <div className="mb-6">
                <label className="block text-sm font-bold mb-2">බැංකු රිසිට් පත උඩුගත කරන්න *</label>
                <input type="file" required accept="image/*,application/pdf" onChange={(e) => setSlipFile(e.target.files ? e.target.files[0] : null)} className={`w-full file:mr-4 file:rounded-full file:border-0 file:px-4 file:py-2 file:text-xs file:font-bold ${inputBg} file:bg-blue-50 file:text-blue-600`} />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={handleCloseModal} className="rounded-full px-5 py-2.5 text-sm font-bold bg-slate-200 text-slate-700 hover:bg-slate-300">අවලංගු කරන්න</button>
                <button type="submit" disabled={isSubmitting} className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-70">{isSubmitting ? "යොමු කරමින් පවතී..." : "Slip එක යොමු කරන්න"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}