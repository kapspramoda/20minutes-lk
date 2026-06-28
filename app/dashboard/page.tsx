"use client";

import React, { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import imageCompression from "browser-image-compression";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // --- අලුතින් එකතු කළ States (Database දත්ත සඳහා) ---
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [pendingCourses, setPendingCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  // --- Modal States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Slider States & Refs ---
  const [myCourseIndex, setMyCourseIndex] = useState(0);
  const [pendingIndex, setPendingIndex] = useState(0);
  const [availableIndex, setAvailableIndex] = useState(0);

  const myCourseRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef<HTMLDivElement>(null);
  const availableRef = useRef<HTMLDivElement>(null);

  // Theme check on load
  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // --- Database එකෙන් ළමයාගේ පාඨමාලා ගෙන්වා ගැනීම ---
  useEffect(() => {
    const fetchCourses = async () => {
      const userPhone = (session?.user as any)?.phone || session?.user?.name || session?.user?.email;
      if (!userPhone) return;

      try {
        const res = await fetch(`/api/student/courses?phone=${userPhone}`);
        const data = await res.json();
        if (res.ok) {
          setMyCourses(data.approvedCourses);
          setPendingCourses(data.pendingCourses);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    // User ලොග් වෙලා ඉන්නවා නම් විතරක් දත්ත ගේන්න
    if (status === "authenticated") {
      fetchCourses();
    }
  }, [status, session]);

  // Mobile Slider Functions
  const handleScroll = (ref: React.RefObject<HTMLDivElement | null>, setIndex: (idx: number) => void, totalItems: number) => {
    if (!ref.current) return;
    const { scrollLeft, scrollWidth } = ref.current;
    const itemWidth = scrollWidth / totalItems;
    const newIndex = Math.round(scrollLeft / itemWidth);
    setIndex(newIndex);
  };

  const scrollToIndex = (ref: React.RefObject<HTMLDivElement | null>, index: number, totalItems: number) => {
    if (!ref.current) return;
    const itemWidth = ref.current.scrollWidth / totalItems;
    ref.current.scrollTo({ left: index * itemWidth, behavior: 'smooth' });
  };

  // ලබාගත හැකි අලුත් පාඨමාලා (මෙය ඉදිරියේදී Database එකෙන් ගෙනෙමු. දැනට Mock Data)
  const availableCourses = [
    { id: 3, title: "රාජ්‍ය කළමනාකරණ සහකාර විභාගය - පෙරහුරු", price: "රු. 2500" },
    { id: 4, title: "ශ්‍රී ලංකා රේගු දෙපාර්තමේන්තු විභාගය", price: "රු. 3000" },
  ];

  const handleEnrollClick = (course: any) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
    setSlipFile(null);
  };

  const convertToBase64 = (file: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => resolve(fileReader.result as string);
      fileReader.onerror = (error) => reject(error);
    });
  };

  const handleSubmitSlip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slipFile) {
      alert("කරුණාකර ඔබගේ බැංකු රිසිට් පත (Bank Slip) ඇතුළත් කරන්න.");
      return;
    }

    const userPhone = (session?.user as any)?.phone || session?.user?.name || session?.user?.email;
    if (!userPhone) {
      alert("ඔබේ ගිණුමේ තොරතුරු ලබාගැනීමට නොහැක. කරුණාකර නැවත ලොග් වන්න.");
      return;
    }

    setIsSubmitting(true);
    try {
      let fileToUpload: File | Blob = slipFile;

      if (slipFile.type.startsWith("image/")) {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
        fileToUpload = await imageCompression(slipFile, options);
      }

      const base64Image = await convertToBase64(fileToUpload);
      
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPhone,
          courseTitle: selectedCourse.title,
          slipImage: base64Image,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || "ඔබේ රිසිට් පත සාර්ථකව යොමු කරන ලදී!");
        handleCloseModal();
        // Slip එක දැම්මාට පස්සේ අලුත් දත්ත ටික ආයෙත් පෙන්වන්න පිටුව රීලෝඩ් කිරීම
        window.location.reload(); 
      } else {
        alert(data.message || "දෝෂයක් මතු විය.");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      alert("තාක්ෂණික දෝෂයකි. කරුණාකර නැවත උත්සාහ කරන්න.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Theme Classes ---
  const themeBg = isDarkMode ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-800";
  const headerBg = isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200";
  const logoTextColor = isDarkMode ? "text-white" : "text-slate-900";
  const sectionTitleColor = isDarkMode ? "text-white" : "text-slate-900";
  const cardBg = isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100";
  const cardTitle = isDarkMode ? "text-white" : "text-slate-800";
  const inputBg = isDarkMode ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400" : "bg-slate-50 border-slate-200 text-slate-900";
  const modalOverlayBg = isDarkMode ? "bg-slate-950/80" : "bg-slate-900/60";
  const modalBodyBg = isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-transparent";
  const modalBoxBg = isDarkMode ? "bg-slate-700/50 border-slate-600" : "bg-slate-50 border-slate-200";

  return (
    <div className={`modern-font flex min-h-screen flex-col transition-colors duration-300 ${themeBg}`}>
      
      {/* Header */}
      <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-md transition-all duration-300 ${headerBg}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-2 md:gap-3">
            <img src="/logo.png" alt="20minutes.lk Logo" className="h-7 w-auto sm:h-8 md:h-10 rounded-xl shadow-sm opacity-95" />
            <span className={`logo-font text-lg md:text-2xl font-semibold truncate ${logoTextColor}`}>20minutes.lk</span>
          </div>

          <div className="flex items-center space-x-3 md:space-x-5 flex-shrink-0">
            <button 
              onClick={toggleTheme}
              className={`rounded-full p-2 transition-colors focus:outline-none ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {isDarkMode ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}
            </button>

            <div className="hidden md:block font-medium text-sm">
              ආයුබෝවන්, <span className="text-blue-500 font-bold">{session?.user?.name || "ශිෂ්‍යයා"}</span>
            </div>
            
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-full bg-red-500/10 border border-red-500/50 px-4 py-1.5 text-xs md:text-sm font-semibold text-red-500 transition hover:bg-red-500 hover:text-white"
            >
              ඉවත් වන්න
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow mx-auto w-full max-w-7xl p-4 md:p-6 mt-4">
        
        {/* Loading State එකක් පෙන්වීම */}
        {isLoadingCourses ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-lg font-bold text-slate-400 animate-pulse">පාඨමාලා විස්තර ගෙනෙමින් පවතී...</p>
          </div>
        ) : (
          <>
            {/* 1. මගේ පාඨමාලා */}
            {myCourses.length > 0 && (
              <section className="mb-12 md:mb-16">
                <h2 className={`mb-6 text-xl md:text-2xl font-bold border-l-4 border-emerald-500 pl-3 ${sectionTitleColor}`}>මගේ පාඨමාලා (My Courses)</h2>
                
                <div 
                  ref={myCourseRef}
                  onScroll={() => handleScroll(myCourseRef as any, setMyCourseIndex, myCourses.length)}
                  className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 md:flex-wrap md:justify-start md:gap-8 md:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
                >
                  {myCourses.map((course) => (
                    <div key={course._id} className={`flex-none w-[75%] sm:w-[45%] md:w-[30%] snap-center overflow-hidden rounded-2xl shadow-sm transition hover:shadow-md border ${cardBg}`}>
                      <div className="bg-emerald-500/10 h-28 md:h-32 flex items-center justify-center">
                         <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div className="p-5 flex flex-col justify-between h-[150px]">
                        <h3 className={`mb-3 text-sm md:text-base font-bold line-clamp-2 ${cardTitle}`}>{course.courseTitle}</h3>
                        <button className="w-full rounded-full bg-emerald-500 py-2.5 text-xs md:text-sm font-bold text-white hover:bg-emerald-600 transition shadow-sm mt-auto">
                          පාඩම් නරඹන්න (Watch)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 2. අනුමැතිය පවතින */}
            {pendingCourses.length > 0 && (
              <section className="mb-12 md:mb-16">
                <h2 className={`mb-6 text-xl md:text-2xl font-bold border-l-4 border-amber-500 pl-3 ${sectionTitleColor}`}>අනුමැතිය පවතින (Pending Approvals)</h2>
                
                <div 
                  ref={pendingRef}
                  onScroll={() => handleScroll(pendingRef as any, setPendingIndex, pendingCourses.length)}
                  className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 md:flex-wrap md:justify-start md:gap-8 md:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
                >
                  {pendingCourses.map((course) => (
                    <div key={course._id} className={`flex-none w-[75%] sm:w-[45%] md:w-[30%] snap-center overflow-hidden rounded-2xl shadow-sm border relative opacity-80 ${cardBg}`}>
                      <div className="absolute top-3 right-3 bg-amber-500/20 text-amber-500 text-xs font-bold px-2.5 py-1 rounded-full">Pending</div>
                      <div className="bg-slate-500/10 h-28 md:h-32 flex items-center justify-center">
                         <svg className={`w-10 h-10 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div className="p-5 flex flex-col justify-between h-[150px]">
                        <h3 className={`mb-2 text-sm md:text-base font-bold line-clamp-2 ${cardTitle}`}>{course.courseTitle}</h3>
                        <p className={`text-xs mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Admin විසින් රිසිට් පත පරීක්ෂා කරමින් පවතී.</p>
                        <button disabled className={`w-full rounded-full py-2.5 text-xs md:text-sm font-bold cursor-not-allowed mt-auto ${isDarkMode ? 'bg-slate-700 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                          අනුමත වනතුරු රැඳෙන්න
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ළමයාට කිසිම පාඨමාලාවක් නැත්නම් පෙන්වන පණිවිඩය */}
            {myCourses.length === 0 && pendingCourses.length === 0 && (
              <div className={`mb-12 p-8 text-center rounded-2xl border ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                <h3 className={`text-lg font-bold mb-2 ${textPrimary}`}>ඔබ තවමත් කිසිදු පාඨමාලාවකට ඇතුළත් වී නොමැත! 📚</h3>
                <p className={`text-sm ${textSecondary}`}>පහතින් ඇති පාඨමාලා වලින් ඔබට අවශ්‍ය පාඨමාලාව තෝරාගෙන ඇතුළත් වන්න.</p>
              </div>
            )}
          </>
        )}

        {/* 3. ලබාගත හැකි අලුත් පාඨමාලා */}
        <section>
          <h2 className={`mb-6 text-xl md:text-2xl font-bold border-l-4 border-blue-500 pl-3 ${sectionTitleColor}`}>අලුත් පාඨමාලා (Available Courses)</h2>
          
          <div 
            ref={availableRef}
            onScroll={() => handleScroll(availableRef as any, setAvailableIndex, availableCourses.length)}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 md:flex-wrap md:justify-start md:gap-8 md:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
          >
            {availableCourses.map((course) => (
              <div key={course.id} className={`flex-none w-[75%] sm:w-[45%] md:w-[30%] snap-center flex flex-col overflow-hidden rounded-2xl shadow-sm transition hover:shadow-md border hover:-translate-y-1 duration-300 ${cardBg}`}>
                <div className="bg-blue-500/10 h-28 md:h-32 flex items-center justify-center">
                   <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </div>
                <div className="p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className={`mb-2 text-sm md:text-base font-bold line-clamp-2 ${cardTitle}`}>{course.title}</h3>
                    <p className="text-lg font-extrabold text-blue-500 mb-4">{course.price}</p>
                  </div>
                  <button 
                    onClick={() => handleEnrollClick(course)}
                    className="w-full rounded-full bg-blue-600 py-2.5 text-xs md:text-sm font-bold text-white hover:bg-blue-700 transition shadow-sm mt-auto"
                  >
                    ඇතුළත් වන්න (Enroll)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`px-4 py-10 transition-colors duration-300 md:px-6 md:py-16 mt-12 ${isDarkMode ? 'bg-black text-slate-400 border-t border-slate-900' : 'bg-slate-900 text-slate-300'}`}>
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3 md:gap-12">
          <div>
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <img src="/logo.png" alt="20minutes.lk Logo" className="h-8 w-auto md:h-10 opacity-90 rounded-xl" />
              <h3 className="logo-font text-xl font-extrabold text-white md:text-2xl tracking-tight">20minutes.lk</h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              තරග විභාග ජයගැනීමට අවශ්‍ය නිවැරදිම මඟපෙන්වීම ලබාදෙන ශ්‍රී ලංකාවේ ප්‍රමුඛතම මාර්ගගත වේදිකාව.
            </p>
          </div>
          
          <div>
            <h4 className="mb-4 text-base font-bold text-white md:mb-6 md:text-lg">අපව සම්බන්ධ කරගන්න</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start"><span className="mr-3 text-lg mt-0.5">📍</span><span>Sewana Mawatha, Gagabada Road,<br/>Suwarapola, Piliyandala</span></li>
              <li className="flex items-center"><span className="mr-3 text-lg">💬</span><span>071 968 9513 (WhatsApp)</span></li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Payment Modal */}
      {isModalOpen && selectedCourse && (
        <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm ${modalOverlayBg}`}>
          <div className={`w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in border ${modalBodyBg}`}>
            <div className={`mb-5 flex items-center justify-between border-b pb-4 ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
              <h3 className={`text-lg md:text-xl font-extrabold ${sectionTitleColor}`}>පාඨමාලාවට ඇතුළත් වීම</h3>
              <button onClick={handleCloseModal} className={`rounded-full p-1.5 transition-colors ${isDarkMode ? 'bg-slate-700 text-slate-400 hover:text-red-400' : 'bg-slate-100 text-slate-400 hover:text-red-500'}`}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className={`mb-6 rounded-2xl p-4 border ${isDarkMode ? 'bg-blue-900/20 border-blue-800/30' : 'bg-blue-50/50 border-blue-100/50'}`}>
              <p className={`font-bold text-sm ${cardTitle}`}>{selectedCourse.title}</p>
              <p className="mt-2 font-extrabold text-blue-500 text-lg">ගෙවිය යුතු මුදල: {selectedCourse.price}</p>
            </div>

            <div className="mb-6">
              <h4 className={`mb-2 text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>පහත බැංකු ගිණුමට මුදල් තැන්පත් කරන්න:</h4>
              <div className={`rounded-xl p-4 text-xs md:text-sm space-y-1.5 border ${modalBoxBg} ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                <p><strong className="font-bold">බැංකුව:</strong> BOC (Bank of Ceylon)</p>
                <p><strong className="font-bold">ශාඛාව:</strong> Colombo 01</p>
                <p><strong className="font-bold">ගිණුම් අංකය:</strong> 1234567890</p>
                <p><strong className="font-bold">නම:</strong> 20minutes.lk (Pvt) Ltd</p>
              </div>
            </div>

            <form onSubmit={handleSubmitSlip}>
              <div className="mb-6">
                <label className={`mb-2 block text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>බැංකු රිසිට් පත (Bank Slip) උඩුගත කරන්න</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setSlipFile(e.target.files ? e.target.files[0] : null)}
                  className={`block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:px-4 file:py-2 file:text-xs file:font-bold transition-all ${inputBg} ${isDarkMode ? 'file:bg-blue-900/40 file:text-blue-400 hover:file:bg-blue-800/50' : 'file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100'}`}
                />
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button type="button" onClick={handleCloseModal} className={`rounded-full px-5 py-2.5 text-sm font-bold ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>අවලංගු කරන්න</button>
                <button type="submit" disabled={isSubmitting} className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md disabled:opacity-70 hover:bg-blue-700">{isSubmitting ? "යොමු කරමින් පවතී..." : "Slip එක යොමු කරන්න"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}