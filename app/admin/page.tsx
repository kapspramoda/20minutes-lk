"use client";

import React, { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"approvals" | "courses" | "students">("approvals");

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

  // Mock Data for Admin
  const pendingApprovals = [
    { id: 1, studentName: "Kasun Perera", phone: "0712345678", course: "LLB ප්‍රවේශ විභාගය", date: "2026-06-21", slipImage: "https://via.placeholder.com/300x400.png?text=Bank+Slip+1" },
    { id: 2, studentName: "Nimali Silva", phone: "0771122334", course: "රාජ්‍ය කළමනාකරණ", date: "2026-06-20", slipImage: "https://via.placeholder.com/300x400.png?text=Bank+Slip+2" },
  ];

  // Theme Classes
  const themeBg = isDarkMode ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-800";
  const headerBg = isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200";
  const cardBg = isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100";
  const textPrimary = isDarkMode ? "text-white" : "text-slate-900";
  const textSecondary = isDarkMode ? "text-slate-400" : "text-slate-500";
  const tabActive = isDarkMode ? "bg-blue-600 text-white" : "bg-blue-600 text-white";
  const tabInactive = isDarkMode ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-white text-slate-600 hover:bg-slate-100";

  return (
    <div className={`modern-font flex min-h-screen flex-col transition-colors duration-300 ${themeBg}`}>
      
      {/* --- Admin Header --- */}
      <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-md transition-all duration-300 ${headerBg}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm">ADMIN</div>
            <span className={`logo-font text-lg md:text-2xl font-semibold truncate ${textPrimary}`}>20minutes.lk</span>
          </div>

          <div className="flex items-center space-x-3 md:space-x-5 flex-shrink-0">
            <button onClick={toggleTheme} className={`rounded-full p-2 transition-colors focus:outline-none ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-slate-100 text-slate-600'}`}>
              {isDarkMode ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}
            </button>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-full bg-red-500/10 border border-red-500/50 px-4 py-1.5 text-xs md:text-sm font-semibold text-red-500 transition hover:bg-red-500 hover:text-white"
            >
              ඉවත් වන්න
            </button>
          </div>
        </div>
      </header>

      {/* --- Admin Main Content --- */}
      <main className="flex-grow mx-auto w-full max-w-7xl p-4 md:p-6 mt-4">
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className={`p-5 rounded-2xl border shadow-sm ${cardBg}`}>
            <h4 className={textSecondary}>අලුත් Slips</h4>
            <p className={`text-3xl font-extrabold text-amber-500 mt-2`}>12</p>
          </div>
          <div className={`p-5 rounded-2xl border shadow-sm ${cardBg}`}>
            <h4 className={textSecondary}>මුළු සිසුන්</h4>
            <p className={`text-3xl font-extrabold text-blue-500 mt-2`}>1,245</p>
          </div>
          <div className={`p-5 rounded-2xl border shadow-sm ${cardBg}`}>
            <h4 className={textSecondary}>සක්‍රීය පාඨමාලා</h4>
            <p className={`text-3xl font-extrabold text-emerald-500 mt-2`}>08</p>
          </div>
          <div className={`p-5 rounded-2xl border shadow-sm ${cardBg}`}>
            <h4 className={textSecondary}>අද ආදායම</h4>
            <p className={`text-3xl font-extrabold text-purple-500 mt-2`}>Rs. 15k</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
          <button onClick={() => setActiveTab("approvals")} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === "approvals" ? tabActive : tabInactive}`}>
            රිසිට්පත් අනුමත කිරීම (Approvals)
          </button>
          <button onClick={() => setActiveTab("courses")} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === "courses" ? tabActive : tabInactive}`}>
            පාඨමාලා කළමනාකරණය
          </button>
          <button onClick={() => setActiveTab("students")} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === "students" ? tabActive : tabInactive}`}>
            සිසුන්ගේ විස්තර
          </button>
        </div>

        {/* Tab Content: Approvals */}
        {activeTab === "approvals" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingApprovals.map((req) => (
              <div key={req.id} className={`flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-all ${cardBg}`}>
                <div className="h-48 overflow-hidden bg-slate-200">
                  <img src={req.slipImage} alt="Bank Slip" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer" />
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <div className="mb-4">
                    <span className="text-xs font-bold text-slate-400">{req.date}</span>
                    <h3 className={`text-lg font-bold mt-1 ${textPrimary}`}>{req.studentName}</h3>
                    <p className={`text-sm mt-1 ${textSecondary}`}>📞 {req.phone}</p>
                    <p className={`text-sm font-bold text-blue-500 mt-2`}>{req.course}</p>
                  </div>
                  <div className="mt-auto grid grid-cols-2 gap-3">
                    <button className="rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 py-2.5 text-sm font-bold transition-all">
                      අනුමත කරන්න
                    </button>
                    <button className="rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white border border-red-500/20 py-2.5 text-sm font-bold transition-all">
                      ප්‍රතික්ෂේප කරන්න
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content: Courses & Students (Placeholder for now) */}
        {activeTab === "courses" && (
          <div className={`p-10 rounded-3xl border text-center ${cardBg}`}>
            <h3 className={`text-xl font-bold ${textPrimary}`}>පාඨමාලා කළමනාකරණය</h3>
            <p className={`mt-2 ${textSecondary}`}>නව පාඨමාලා එකතු කිරීම සහ වෙනස් කිරීම මෙතැනින් සිදු කළ හැක. (ඉදිරියේදී එකතු වේ)</p>
          </div>
        )}

        {activeTab === "students" && (
          <div className={`p-10 rounded-3xl border text-center ${cardBg}`}>
            <h3 className={`text-xl font-bold ${textPrimary}`}>සිසුන්ගේ විස්තර</h3>
            <p className={`mt-2 ${textSecondary}`}>ලියාපදිංචි වූ සියලුම සිසුන්ගේ විස්තර සහ මුරපද වෙනස් කිරීම්. (ඉදිරියේදී එකතු වේ)</p>
          </div>
        )}

      </main>
    </div>
  );
}