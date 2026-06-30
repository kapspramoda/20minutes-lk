"use client";

import React, { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // අලුත් පිටු වලට යාම සඳහා

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"approvals" | "courses" | "students">("approvals");
  
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(true);

  // --- අලුතින් එකතු කළ States (පාඨමාලා සඳහා) ---
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setIsDarkMode(true);
    }
    fetchPendingEnrollments();
  }, []);

  // ටැබ් එක මාරු කරද්දී අදාළ දත්ත ගෙන ඒම
  useEffect(() => {
    if (activeTab === "courses" && courses.length === 0) {
      fetchCourses();
    }
  }, [activeTab]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const fetchPendingEnrollments = async () => {
    try {
      const res = await fetch("/api/admin/enrollments");
      const data = await res.json();
      if (res.ok) setPendingApprovals(data.enrollments);
    } catch (error) {
      console.error("Failed to fetch enrollments", error);
    } finally {
      setIsLoadingApprovals(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: "approved" | "rejected") => {
    const originalApprovals = [...pendingApprovals];
    setPendingApprovals((prev) => prev.filter((req) => req._id !== id));

    try {
      const res = await fetch("/api/admin/enrollments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) throw new Error("Update failed");
      alert(newStatus === "approved" ? "පාඨමාලාව සාර්ථකව අනුමත කරන ලදී!" : "රිසිට්පත ප්‍රතික්ෂේප කරන ලදී.");
    } catch (error) {
      setPendingApprovals(originalApprovals);
      alert("තාක්ෂණික දෝෂයක්. නැවත උත්සාහ කරන්න.");
    }
  };

  // --- 📚 පාඨමාලා කළමනාකරණය සඳහා Functions ---

  const fetchCourses = async () => {
    setIsLoadingCourses(true);
    try {
      const res = await fetch("/api/courses");
      const data = await res.json();
      if (res.ok) setCourses(data.data);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const toggleCourseVisibility = async (courseId: string, currentVisibility: boolean) => {
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !currentVisibility }),
      });
      if (res.ok) {
        // UI එක ක්ෂණිකව අප්ඩේට් කිරීම
        setCourses(courses.map(c => c._id === courseId ? { ...c, isVisible: !currentVisibility } : c));
      } else {
        alert("වෙනස් කිරීම අසාර්ථකයි!");
      }
    } catch (error) {
      alert("තාක්ෂණික දෝෂයක්. නැවත උත්සාහ කරන්න.");
    }
  };

  const deleteCourse = async (courseId: string, courseTitle: string) => {
    const confirmDelete = window.confirm(`ඔබට විශ්වාසද "${courseTitle}" පාඨමාලාව සම්පූර්ණයෙන්ම මකා දැමීමට අවශ්‍ය බව? මෙම ක්‍රියාව ආපසු හැරවිය නොහැක!`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
      if (res.ok) {
        setCourses(courses.filter(c => c._id !== courseId));
        alert("පාඨමාලාව සාර්ථකව මකා දමන ලදී.");
      } else {
        alert("මකා දැමීම අසාර්ථකයි!");
      }
    } catch (error) {
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

      <main className="flex-grow mx-auto w-full max-w-7xl p-4 md:p-6 mt-4">
        
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
            <p className={`text-3xl font-extrabold text-emerald-500 mt-2`}>{courses.filter(c => c.isVisible).length || '0'}</p>
          </div>
          <div className={`p-5 rounded-2xl border shadow-sm ${cardBg}`}>
            <h4 className={textSecondary}>අද ආදායම</h4>
            <p className={`text-3xl font-extrabold text-purple-500 mt-2`}>Rs. 15k</p>
          </div>
        </div>

        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
          <button onClick={() => setActiveTab("approvals")} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === "approvals" ? tabActive : tabInactive}`}>
            රිසිට්පත් අනුමත කිරීම
          </button>
          <button onClick={() => setActiveTab("courses")} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === "courses" ? tabActive : tabInactive}`}>
            පාඨමාලා කළමනාකරණය
          </button>
          <button onClick={() => setActiveTab("students")} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === "students" ? tabActive : tabInactive}`}>
            සිසුන්ගේ විස්තර
          </button>
        </div>

        {/* --- Approvals Tab --- */}
        {activeTab === "approvals" && (
          <div>
            {isLoadingApprovals ? (
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
                      <a href={req.slipImage} target="_blank" rel="noopener noreferrer">
                        <img src={req.slipImage} alt="Bank Slip" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                           <span className="text-white text-sm font-bold">විශාල කර බලන්න</span>
                        </div>
                      </a>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="mb-4">
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

        {/* --- 📚 Courses Tab --- */}
        {activeTab === "courses" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className={`text-xl font-bold ${textPrimary}`}>පවතින පාඨමාලා</h2>
                <p className={`text-sm ${textSecondary}`}>සතියේ Zoom ලින්ක්, Tutes සහ අලුත් වීඩියෝ මෙතැනින් කළමනාකරණය කරන්න.</p>
              </div>
              <Link 
                href="/admin/add-course" 
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                අලුත් Course එකක් හදන්න
              </Link>
            </div>

            {isLoadingCourses ? (
              <div className="text-center py-10 text-slate-500 font-bold animate-pulse">පාඨමාලා ලබාගනිමින් පවතී...</div>
            ) : courses.length === 0 ? (
              <div className={`p-10 rounded-3xl border text-center ${cardBg}`}>
                <h3 className={`text-lg font-bold ${textPrimary}`}>තවමත් පාඨමාලා කිසිවක් නැත!</h3>
                <p className={`mt-2 ${textSecondary}`}>ඉහත "අලුත් Course එකක් හදන්න" බොත්තම ඔබා ආරම්භ කරන්න.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <div key={course._id} className={`p-5 rounded-2xl border shadow-sm ${cardBg}`}>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className={`text-lg font-bold ${textPrimary} pr-4`}>{course.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${course.isVisible ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {course.isVisible ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      {/* Edit Button (යාවත්කාලීන කිරීමට) */}
                      <Link 
                        href={`/admin/edit-course/${course._id}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all border border-blue-200"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Edit (Update)
                      </Link>

                      {/* Hide/Show Button */}
                      <button 
                        onClick={() => toggleCourseVisibility(course._id, course.isVisible)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${course.isVisible ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200'}`}
                      >
                        {course.isVisible ? (
                          <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg> Hide</>
                        ) : (
                          <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> Show</>
                        )}
                      </button>

                      {/* Delete Button */}
                      <button 
                        onClick={() => deleteCourse(course._id, course.title)}
                        className="flex-none flex items-center justify-center p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 transition-all"
                        title="Delete Course"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- Students Tab --- */}
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