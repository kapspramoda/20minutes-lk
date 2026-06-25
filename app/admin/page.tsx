"use client";

import React, { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"approvals" | "courses" | "students">("approvals");
  
  // --- අලුතින් එකතු කළ States ---
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Theme check on load & Fetch Data
  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setIsDarkMode(true);
    }
    // පිටුව ලෝඩ් වෙද්දීම Pending දත්ත ටික ගෙන ඒම
    fetchPendingEnrollments();
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // --- දත්ත ලබා ගැනීමේ Function එක ---
  const fetchPendingEnrollments = async () => {
    try {
      const res = await fetch("/api/admin/enrollments");
      const data = await res.json();
      if (res.ok) {
        setPendingApprovals(data.enrollments);
      }
    } catch (error) {
      console.error("Failed to fetch enrollments", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- අනුමත කිරීම/ප්‍රතික්ෂේප කිරීමේ Function එක ---
  const handleUpdateStatus = async (id: string, newStatus: "approved" | "rejected") => {
    // ඩබල් ක්ලික් වීම වැළැක්වීමට ලැයිස්තුවෙන් එය තාවකාලිකව ඉවත් කිරීම
    const originalApprovals = [...pendingApprovals];
    setPendingApprovals((prev) => prev.filter((req) => req._id !== id));

    try {
      const res = await fetch("/api/admin/enrollments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Update failed");
      }
      
      alert(newStatus === "approved" ? "පාඨමාලාව සාර්ථකව අනුමත කරන ලදී!" : "රිසිට්පත ප්‍රතික්ෂේප කරන ලදී.");
    } catch (error) {
      // දෝෂයක් ආවොත් අයින් කරපු එක ආයෙත් දානවා
      setPendingApprovals(originalApprovals);
      alert("තාක්ෂණික දෝෂයක්. නැවත උත්සාහ කරන්න.");
    }
  };

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
            <p className={`text-3xl font-extrabold text-amber-500 mt-2`}>{pendingApprovals.length}</p>
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
          <div>
            {isLoading ? (
              <div className="text-center py-10 text-slate-500 font-bold animate-pulse">දත්ත ලබාගනිමින් පවතී...</div>
            ) : pendingApprovals.length === 0 ? (
              <div className={`p-10 rounded-3xl border text-center ${cardBg}`}>
                <h3 className={`text-xl font-bold ${textPrimary}`}>අලුත් රිසිට්පත් නොමැත! 🎉</h3>
                <p className={`mt-2 ${textSecondary}`}>සියලුම ශිෂ්‍යයන්ගේ ගෙවීම් පරීක්ෂා කර අවසන්.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingApprovals.map((req) => (
                  <div key={req._id} className={`flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-all ${cardBg}`}>
                    <div className="h-48 overflow-hidden bg-slate-200 relative group">
                      {/* පින්තූරය උඩ ක්ලික් කළාම ලොකුවට බලාගන්න අලුත් Tab එකකින් විවෘත වෙනවා */}
                      <a href={req.slipImage} target="_blank" rel="noopener noreferrer">
                        <img src={req.slipImage} alt="Bank Slip" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                           <span className="text-white text-sm font-bold">විශාල කර බලන්න</span>
                        </div>
                      </a>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="mb-4">
                        {/* දත්ත ගබඩාවේ ඇති පරිදි userPhone සහ courseTitle පෙන්වීම */}
                        <h3 className={`text-lg font-bold mt-1 ${textPrimary}`}>දුරකථන: {req.userPhone}</h3>
                        <p className={`text-sm font-bold text-blue-500 mt-2`}>{req.courseTitle}</p>
                      </div>
                      <div className="mt-auto grid grid-cols-2 gap-3">
                        <button onClick={() => handleUpdateStatus(req._id, "approved")} className="rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 py-2.5 text-sm font-bold transition-all">
                          අනුමත කරන්න
                        </button>
                        <button onClick={() => handleUpdateStatus(req._id, "rejected")} className="rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white border border-red-500/20 py-2.5 text-sm font-bold transition-all">
                          ප්‍රතික්ෂේප කරන්න
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Courses & Students */}
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