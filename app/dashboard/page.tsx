"use client";

import React, { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // --- Modal States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Theme check on load
  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setIsDarkMode(true);
    }
  }, []);

  // Theme Toggle Function
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Mock Data
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

  const handleEnrollClick = (course: any) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
    setSlipFile(null);
  };

  const convertToBase64 = (file: File): Promise<string> => {
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
      const base64Image = await convertToBase64(slipFile);
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <div className={`min-h-screen flex flex-col relative modern-font transition-colors duration-300 ${isDarkMode ? "dark bg-[#0f172a]" : "bg-gray-50"}`}>
      
      {/* --- Home Page Style Header --- */}
      <header className="sticky top-0 z-50 flex justify-between items-center px-4 py-3 md:px-8 bg-white dark:bg-[#1e293b] shadow-sm border-b border-gray-100 dark:border-gray-800 transition-colors">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-sm border border-gray-100">
            <img 
              src="/logo.png" 
              alt="20minutes.lk Logo" 
              className="w-full h-full object-contain p-1" 
              onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=20&background=2563eb&color=fff'; }} 
            />
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight logo-font">
            20minutes.lk
          </h1>
        </div>

        {/* Right side options */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>

          <div className="hidden md:block font-medium text-slate-600 dark:text-slate-300">
            ආයුබෝවන්, <span className="text-blue-600 dark:text-blue-400 font-bold">{session?.user?.name || "ශිෂ්‍යයා"}</span>
          </div>
          
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition-all shadow-md"
          >
            ලොග් අවුට්
          </button>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="flex-grow mx-auto w-full max-w-6xl p-4 md:p-6 mt-4">
        
        {/* My Courses */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg md:text-xl font-bold text-slate-800 dark:text-white border-l-4 border-emerald-500 pl-3">මගේ පාඨමාලා (My Courses)</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myCourses.map((course) => (
              <div key={course.id} className="overflow-hidden rounded-2xl bg-white dark:bg-[#1e293b] shadow-sm border border-slate-100 dark:border-slate-800 hover:-translate-y-1 duration-300">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 h-28 md:h-32 flex items-center justify-center">
                   <svg className="w-12 h-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="p-5">
                  <h3 className="mb-2 text-base font-bold text-slate-800 dark:text-slate-100 line-clamp-2">{course.title}</h3>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-4">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                  </div>
                  <button className="w-full rounded-full bg-emerald-500 py-2 text-sm font-bold text-white hover:bg-emerald-600 transition shadow-sm">
                    පාඩම් නරඹන්න (Watch)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pending Approvals */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg md:text-xl font-bold text-slate-800 dark:text-white border-l-4 border-amber-500 pl-3">අනුමැතිය පවතින (Pending Approvals)</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pendingCourses.map((course) => (
              <div key={course.id} className="overflow-hidden rounded-2xl bg-white dark:bg-[#1e293b] shadow-sm border border-slate-100 dark:border-slate-800 relative opacity-80">
                <div className="absolute top-3 right-3 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full">Pending</div>
                <div className="bg-slate-50 dark:bg-slate-800/50 h-28 md:h-32 flex items-center justify-center">
                   <svg className="w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="p-5">
                  <h3 className="mb-2 text-base font-bold text-slate-800 dark:text-slate-100 line-clamp-2">{course.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Admin විසින් ඔබේ රිසිට් පත පරීක්ෂා කරමින් පවතී.</p>
                  <button disabled className="w-full rounded-full bg-slate-100 dark:bg-slate-800 py-2 text-sm font-bold text-slate-400 dark:text-slate-500 cursor-not-allowed">
                    අනුමත වනතුරු රැඳෙන්න
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Available Courses */}
        <section>
          <h2 className="mb-4 text-lg md:text-xl font-bold text-slate-800 dark:text-white border-l-4 border-blue-500 pl-3">අලුත් පාඨමාලා (Available Courses)</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableCourses.map((course) => (
              <div key={course.id} className="overflow-hidden rounded-2xl bg-white dark:bg-[#1e293b] shadow-sm border border-slate-100 dark:border-slate-800 hover:-translate-y-1 duration-300 flex flex-col">
                <div className="bg-blue-50 dark:bg-blue-900/20 h-28 md:h-32 flex items-center justify-center">
                   <svg className="w-12 h-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </div>
                <div className="p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="mb-2 text-base font-bold text-slate-800 dark:text-slate-100 line-clamp-2">{course.title}</h3>
                    <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400 mb-4">{course.price}</p>
                  </div>
                  <button 
                    onClick={() => handleEnrollClick(course)}
                    className="w-full rounded-full bg-blue-600 py-2 text-sm font-bold text-white hover:bg-blue-700 transition shadow-sm"
                  >
                    ඇතුළත් වන්න (Enroll)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* --- Home Page Style Footer --- */}
      <footer className="bg-[#0f172a] text-slate-300 py-10 mt-12">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Brand & Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="20minutes.lk Logo" className="w-full h-full object-contain p-1" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=20&background=2563eb&color=fff'; }} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight logo-font">20minutes.lk</h2>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              තරග විභාග ජයගැනීමට අවශ්‍ය නිවැරදිම මගපෙන්වීම ලබාදෙන ශ්‍රී ලංකාවේ ප්‍රමුඛතම මාර්ගගත වේදිකාව.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition"><svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-600 transition"><svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-black transition"><svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.34 2.88 2.88 0 0 1 2.9-3.22c.16 0 .32.02.48.05v-3.32a6.3 6.3 0 0 0-.64-.03 6.34 6.34 0 0 0-6.15 7.6 6.34 6.34 0 0 0 8.7 4.54 6.34 6.34 0 0 0 3.34-5.58V8.66a8.2 8.2 0 0 0 3.79 1.15V6.43a4.8 4.8 0 0 1-.05.26z"/></svg></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-5 text-lg">ඉක්මන් සබැඳි</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition">ලොග් වන්න</a></li>
              <li><a href="#" className="hover:text-white transition">ලියාපදිංචි වන්න</a></li>
              <li><a href="#" className="hover:text-white transition">පාඨමාලා</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-bold mb-5 text-lg">අපව සම්බන්ධ කරගන්න</h3>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <span className="text-pink-500 mt-1">📍</span>
                <span>Sewana Mawatha, Gagabada Road,<br/>Suwarapola, Piliyandala</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">💬</span>
                <span>071 968 9513 (WhatsApp)</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-pink-500">📞</span>
                <span>077 531 5799 (Call)</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-purple-400">✉️</span>
                <a href="mailto:20minuteslkinstituteclass@gmail.com" className="hover:text-white transition break-all">20minuteslkinstituteclass@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-6 mt-10 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} 20minutes.lk. All rights reserved.
        </div>
      </footer>

      {/* --- Payment Modal --- */}
      {isModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in border border-slate-200 dark:border-slate-700">
            
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg md:text-xl font-extrabold text-slate-800 dark:text-white">පාඨමාලාවට ඇතුළත් වීම</h3>
              <button onClick={handleCloseModal} className="rounded-full bg-slate-100 dark:bg-slate-800 p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="mb-6 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 p-4 border border-blue-100/50 dark:border-blue-800/30">
              <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">{selectedCourse.title}</p>
              <p className="mt-2 font-extrabold text-blue-600 dark:text-blue-400 text-lg">ගෙවිය යුතු මුදල: {selectedCourse.price}</p>
            </div>

            <div className="mb-6">
              <h4 className="mb-2 text-sm font-bold text-slate-600 dark:text-slate-400">පහත බැංකු ගිණුමට මුදල් තැන්පත් කරන්න:</h4>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 text-xs md:text-sm text-slate-700 dark:text-slate-300 space-y-1.5">
                <p><strong className="font-bold">බැංකුව:</strong> BOC (Bank of Ceylon)</p>
                <p><strong className="font-bold">ශාඛාව:</strong> Colombo 01</p>
                <p><strong className="font-bold">ගිණුම් අංකය:</strong> 1234567890</p>
                <p><strong className="font-bold">නම:</strong> 20minutes.lk (Pvt) Ltd</p>
              </div>
            </div>

            <form onSubmit={handleSubmitSlip}>
              <div className="mb-6">
                <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-400">බැංකු රිසිට් පත (Bank Slip) උඩුගත කරන්න</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setSlipFile(e.target.files ? e.target.files[0] : null)}
                  className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 dark:file:bg-blue-900/30 file:px-4 file:py-2 file:text-xs file:font-bold file:text-blue-600 dark:file:text-blue-400 hover:file:bg-blue-100"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button type="button" onClick={handleCloseModal} className="rounded-full bg-slate-100 dark:bg-slate-800 px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300">අවලංගු කරන්න</button>
                <button type="submit" disabled={isSubmitting} className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md disabled:opacity-70">{isSubmitting ? "යොමු කරමින් පවතී..." : "Slip එක යොමු කරන්න"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}