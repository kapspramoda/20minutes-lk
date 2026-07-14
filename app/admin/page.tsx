// "use client";

// import React, { useState, useEffect, useMemo } from "react";
// import { signOut, useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// export default function AdminDashboard() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [isDarkMode, setIsDarkMode] = useState(false);
  
//   const [activeTab, setActiveTab] = useState<"approvals" | "courses" | "quizzes" | "students">("approvals");
  
//   const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
//   const [isLoadingApprovals, setIsLoadingApprovals] = useState(true);

//   const [courses, setCourses] = useState<any[]>([]);
//   const [isLoadingCourses, setIsLoadingCourses] = useState(true);

//   const [approvedStudents, setApprovedStudents] = useState<any[]>([]);
//   const [isLoadingStudents, setIsLoadingStudents] = useState(true);
//   const [selectedFilterCourse, setSelectedFilterCourse] = useState<string>("ALL");

//   const [quizzes, setQuizzes] = useState<any[]>([]);
//   const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true);

//   const [enlargedSlip, setEnlargedSlip] = useState<string | null>(null);

//   useEffect(() => {
//     if (document.documentElement.classList.contains("dark")) setIsDarkMode(true);
//     fetchPendingEnrollments();
//     fetchCourses();
//     fetchApprovedStudents();
//     fetchQuizzes(); 
//   }, []);

//   const toggleTheme = () => {
//     setIsDarkMode(!isDarkMode);
//     if (!isDarkMode) document.documentElement.classList.add("dark");
//     else document.documentElement.classList.remove("dark");
//   };

//   // --- API Functions ---
//   const fetchPendingEnrollments = async () => {
//     try {
//       const res = await fetch("/api/admin/enrollments");
//       const data = await res.json();
//       if (res.ok) setPendingApprovals(data.enrollments);
//     } catch (error) { console.error(error); } 
//     finally { setIsLoadingApprovals(false); }
//   };

//   const fetchCourses = async () => {
//     try {
//       const res = await fetch("/api/courses");
//       const data = await res.json();
//       if (res.ok) setCourses(data.data);
//     } catch (error) { console.error(error); }
//     finally { setIsLoadingCourses(false); }
//   };

//   const fetchApprovedStudents = async () => {
//     try {
//       const res = await fetch("/api/admin/students");
//       const data = await res.json();
//       if (res.ok) setApprovedStudents(data.data);
//     } catch (error) { console.error(error); }
//     finally { setIsLoadingStudents(false); }
//   };

//   const fetchQuizzes = async () => {
//     try {
//       const res = await fetch("/api/admin/quizzes");
//       const data = await res.json();
//       if (res.ok) setQuizzes(data.data);
//     } catch (error) { console.error(error); }
//     finally { setIsLoadingQuizzes(false); }
//   };

//   const todaysIncome = useMemo(() => {
//     const today = new Date().toDateString();
//     let total = 0;
//     approvedStudents.forEach(student => {
//       if (new Date(student.updatedAt).toDateString() === today) {
//         const course = courses.find(c => c._id === student.courseId || c.title === student.courseTitle);
//         if (course && course.price) {
//           const numericPrice = Number(course.price.replace(/[^0-9]/g, ''));
//           total += numericPrice;
//         }
//       }
//     });
//     return total;
//   }, [approvedStudents, courses]);

//   const handleUpdateStatus = async (id: string, newStatus: "approved" | "rejected") => {
//     const originalApprovals = [...pendingApprovals];
//     setPendingApprovals((prev) => prev.filter((req) => req._id !== id));
//     try {
//       const res = await fetch("/api/admin/enrollments", {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ id, status: newStatus }),
//       });
//       if (!res.ok) throw new Error("Update failed");
//       alert(newStatus === "approved" ? "පාඨමාලාව සාර්ථකව අනුමත කරන ලදී!" : "රිසිට්පත ප්‍රතික්ෂේප කරන ලදී.");
//       if(newStatus === "approved") fetchApprovedStudents(); 
//     } catch (error) {
//       setPendingApprovals(originalApprovals);
//       alert("තාක්ෂණික දෝෂයක්. නැවත උත්සාහ කරන්න.");
//     }
//   };

//   const toggleCourseVisibility = async (courseId: string, currentVisibility: boolean) => {
//     try {
//       const res = await fetch(`/api/courses/${courseId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ isVisible: !currentVisibility }),
//       });
//       if (res.ok) setCourses(courses.map(c => c._id === courseId ? { ...c, isVisible: !currentVisibility } : c));
//     } catch (error) { alert("තාක්ෂණික දෝෂයක්."); }
//   };

//   const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
//     const confirmDelete = window.confirm(`"${courseTitle}" පාඨමාලාව සම්පූර්ණයෙන්ම මකා දැමීමට අවශ්‍ය බව ඔබට විශ්වාසද? \n\nමෙම ක්‍රියාව ආපසු හැරවිය නොහැක!`);
//     if (!confirmDelete) return;

//     try {
//       const res = await fetch(`/api/courses/${courseId}`, {
//         method: "DELETE",
//       });
//       if (res.ok) {
//         setCourses(courses.filter(c => c._id !== courseId));
//         alert("පාඨමාලාව සාර්ථකව මකා දමන ලදී.");
//       } else {
//         alert("මකා දැමීම අසාර්ථකයි.");
//       }
//     } catch (error) {
//       alert("තාක්ෂණික දෝෂයක් මතු විය.");
//     }
//   };

//   const toggleQuizVisibility = async (quizId: string, currentVisibility: boolean) => {
//     try {
//       const res = await fetch(`/api/admin/quizzes/${quizId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ isVisible: !currentVisibility }),
//       });
//       if (res.ok) setQuizzes(quizzes.map(q => q._id === quizId ? { ...q, isVisible: !currentVisibility } : q));
//     } catch (error) { alert("තාක්ෂණික දෝෂයක්."); }
//   };

//   // 🔴 අලුත්: Quiz එකක් මකා දැමීම (Delete Quiz)
//   const handleDeleteQuiz = async (quizId: string, quizTitle: string) => {
//     const confirmDelete = window.confirm(`"${quizTitle}" ප්‍රශ්න පත්‍රය සම්පූර්ණයෙන්ම මකා දැමීමට අවශ්‍ය බව ඔබට විශ්වාසද? \n\nමෙම ක්‍රියාව ආපසු හැරවිය නොහැක!`);
//     if (!confirmDelete) return;

//     try {
//       const res = await fetch(`/api/admin/quizzes/${quizId}`, {
//         method: "DELETE",
//       });
//       if (res.ok) {
//         setQuizzes(quizzes.filter(q => q._id !== quizId));
//         alert("ප්‍රශ්න පත්‍රය සාර්ථකව මකා දමන ලදී.");
//       } else {
//         alert("මකා දැමීම අසාර්ථකයි.");
//       }
//     } catch (error) {
//       alert("තාක්ෂණික දෝෂයක් මතු විය.");
//     }
//   };

//   const handleRemoveStudent = async (enrollmentId: string, studentPhone: string) => {
//     const confirmDelete = window.confirm(`${studentPhone} දුරකථන අංකය හිමි සිසුවාව මෙම පාඨමාලාවෙන් ඉවත් කිරීමට අවශ්‍ය බව ඔබට විශ්වාසද?`);
//     if (!confirmDelete) return;
//     try {
//       const res = await fetch(`/api/admin/students?id=${enrollmentId}`, { method: "DELETE" });
//       if (res.ok) {
//         setApprovedStudents(approvedStudents.filter(s => s._id !== enrollmentId));
//         alert("සිසුවා සාර්ථකව ඉවත් කරන ලදී.");
//       } else {
//         alert("ඉවත් කිරීම අසාර්ථකයි.");
//       }
//     } catch (error) { alert("තාක්ෂණික දෝෂයක් මතු විය."); }
//   };

//   const filteredStudents = selectedFilterCourse === "ALL" ? approvedStudents : approvedStudents.filter(s => s.courseTitle === selectedFilterCourse);

//   const themeBg = isDarkMode ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-800";
//   const headerBg = isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200";
//   const cardBg = isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100";
//   const textPrimary = isDarkMode ? "text-white" : "text-slate-900";
//   const textSecondary = isDarkMode ? "text-slate-400" : "text-slate-500";
//   const tabActive = "bg-blue-600 text-white shadow-md";
//   const tabInactive = isDarkMode ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-white text-slate-600 hover:bg-slate-100 border";
//   const inputBg = isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900";

//   return (
//     <div className={`modern-font flex min-h-screen flex-col transition-colors duration-300 ${themeBg}`}>
//       <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-md transition-all duration-300 ${headerBg}`}>
//         <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
//           <div className="flex items-center gap-2 md:gap-3">
//             <div className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm">ADMIN</div>
//             <span className={`logo-font text-lg md:text-2xl font-semibold truncate ${textPrimary}`}>20minutes.lk</span>
//           </div>
//           <div className="flex items-center space-x-3 md:space-x-5 flex-shrink-0">
//             <button onClick={toggleTheme} className={`rounded-full p-2 transition-colors focus:outline-none ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-slate-100 text-slate-600'}`}>
//               {isDarkMode ? <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg> : <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
//             </button>
//             <button onClick={() => signOut({ callbackUrl: "/" })} className="rounded-full bg-red-500/10 border border-red-500/50 px-4 py-1.5 text-xs md:text-sm font-semibold text-red-500 transition hover:bg-red-500 hover:text-white">
//               ඉවත් වන්න
//             </button>
//           </div>
//         </div>
//       </header>

//       <main className="flex-grow mx-auto w-full max-w-7xl p-4 md:p-6 mt-4">
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//           <div className={`p-5 rounded-2xl border shadow-sm ${cardBg}`}>
//             <h4 className={textSecondary}>අලුත් Slips</h4>
//             <p className="text-3xl font-extrabold text-amber-500 mt-2">{pendingApprovals.length}</p>
//           </div>
//           <div className={`p-5 rounded-2xl border shadow-sm ${cardBg}`}>
//             <h4 className={textSecondary}>මුළු සිසුන්</h4>
//             <p className="text-3xl font-extrabold text-blue-500 mt-2">{approvedStudents.length}</p>
//           </div>
//           <div className={`p-5 rounded-2xl border shadow-sm ${cardBg}`}>
//             <h4 className={textSecondary}>සක්‍රීය පාඨමාලා</h4>
//             <p className="text-3xl font-extrabold text-emerald-500 mt-2">{courses.filter(c => c.isVisible).length || '0'}</p>
//           </div>
//           <div className={`p-5 rounded-2xl border shadow-sm ${cardBg}`}>
//             <h4 className={textSecondary}>අද ආදායම</h4>
//             <p className="text-2xl md:text-3xl font-extrabold text-purple-500 mt-2 truncate">Rs. {todaysIncome.toLocaleString()}</p>
//           </div>
//         </div>

//         {/* 🔴 Tabs */}
//         <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
//           <button onClick={() => setActiveTab("approvals")} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === "approvals" ? tabActive : tabInactive}`}>රිසිට්පත් අනුමත කිරීම</button>
//           <button onClick={() => setActiveTab("courses")} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === "courses" ? tabActive : tabInactive}`}>පාඨමාලා කළමනාකරණය</button>
//           <button onClick={() => setActiveTab("quizzes")} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === "quizzes" ? tabActive : tabInactive}`}>විභාග කළමනාකරණය</button>
//           <button onClick={() => setActiveTab("students")} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === "students" ? tabActive : tabInactive}`}>සිසුන්ගේ විස්තර</button>
//         </div>

//         {/* --- 1. Approvals Tab --- */}
//         {activeTab === "approvals" && (
//           <div className="animate-in fade-in duration-300">
//             {isLoadingApprovals ? (
//               <div className="text-center py-10 text-slate-500 font-bold animate-pulse">දත්ත ලබාගනිමින් පවතී...</div>
//             ) : pendingApprovals.length === 0 ? (
//               <div className={`p-10 rounded-3xl border text-center ${cardBg}`}>
//                 <h3 className={`text-xl font-bold ${textPrimary}`}>අලුත් රිසිට්පත් නොමැත! 🎉</h3>
//                 <p className={`mt-2 ${textSecondary}`}>සියලුම ශිෂ්‍යයන්ගේ ගෙවීම් පරීක්ෂා කර අවසන්.</p>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {pendingApprovals.map((req) => (
//                   <div key={req._id} className={`flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-all ${cardBg}`}>
//                     <div className="h-48 overflow-hidden bg-slate-200 relative group cursor-pointer" onClick={() => setEnlargedSlip(req.slipImage)}>
//                       <img src={req.slipImage} alt="Bank Slip" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
//                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
//                          <span className="text-white text-sm font-bold flex items-center gap-2">විශාල කර බලන්න</span>
//                       </div>
//                     </div>
//                     <div className="p-5 flex flex-col flex-grow">
//                       <div className="mb-4">
//                         <h3 className={`text-lg font-bold mt-1 ${textPrimary}`}>දුරකථන: {req.userPhone}</h3>
//                         <p className={`text-sm font-bold text-blue-500 mt-2`}>{req.courseTitle}</p>
//                       </div>
//                       <div className="mt-auto grid grid-cols-2 gap-3">
//                         <button onClick={() => handleUpdateStatus(req._id, "approved")} className="rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 py-2.5 text-sm font-bold transition-all">අනුමත කරන්න</button>
//                         <button onClick={() => handleUpdateStatus(req._id, "rejected")} className="rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white border border-red-500/20 py-2.5 text-sm font-bold transition-all">ප්‍රතික්ෂේප කරන්න</button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}

//         {/* --- 2. Courses Tab --- */}
//         {activeTab === "courses" && (
//           <div className="animate-in fade-in duration-300">
//             <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
//               <div>
//                 <h2 className={`text-xl font-bold ${textPrimary}`}>පවතින පාඨමාලා</h2>
//                 <p className={`text-sm ${textSecondary}`}>ඔබගේ සියලුම පාඨමාලා මෙතැනින් කළමනාකරණය කරන්න.</p>
//               </div>
//               <Link href="/admin/add-course" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md">
//                 + අලුත් Course එකක් හදන්න
//               </Link>
//             </div>
//             {isLoadingCourses ? (
//               <div className="text-center py-10 text-slate-500 font-bold animate-pulse">පාඨමාලා ලබාගනිමින් පවතී...</div>
//             ) : courses.length === 0 ? (
//               <div className={`p-10 rounded-3xl border text-center ${cardBg}`}>
//                 <h3 className={`text-lg font-bold ${textPrimary}`}>තවමත් පාඨමාලා කිසිවක් නැත!</h3>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 {courses.map((course) => (
//                   <div key={course._id} className={`p-5 rounded-2xl border shadow-sm flex flex-col ${cardBg}`}>
//                     <div className="flex justify-between items-start mb-4">
//                       <div>
//                         <h3 className={`text-lg font-bold ${textPrimary} pr-4`}>{course.title}</h3>
//                         <p className="text-sm font-bold text-blue-500 mt-1">{course.price}</p>
//                       </div>
//                       <span className={`px-3 py-1 rounded-full text-[10px] font-bold border flex-shrink-0 ${course.isVisible ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
//                         {course.isVisible ? 'ACTIVE' : 'HIDDEN'}
//                       </span>
//                     </div>
                    
//                     <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
//                       <Link href={`/admin/edit-course/${course._id}`} className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all border border-blue-200">
//                         Edit
//                       </Link>
//                       <button onClick={() => toggleCourseVisibility(course._id, course.isVisible)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${course.isVisible ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200'}`}>
//                         {course.isVisible ? 'Hide' : 'Show'}
//                       </button>
//                       <button onClick={() => handleDeleteCourse(course._id, course.title)} className={`flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-red-200`}>
//                         🗑️ Delete
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}

//         {/* --- 3. Quizzes (විභාග) Tab --- */}
//         {activeTab === "quizzes" && (
//           <div className="animate-in fade-in duration-300">
//             <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
//               <div>
//                 <h2 className={`text-xl font-bold ${textPrimary}`}>MCQ ප්‍රශ්න පත්‍ර කළමනාකරණය</h2>
//                 <p className={`text-sm ${textSecondary}`}>විභාග සැකසීම, වෙනස් කිරීම සහ සඟවා තැබීම.</p>
//               </div>
//               <Link href="/admin/add-quiz" className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md">
//                 + අලුත් Quiz එකක් හදන්න
//               </Link>
//             </div>
            
//             {isLoadingQuizzes ? (
//               <div className="text-center py-10 text-slate-500 font-bold animate-pulse">විභාග ලබාගනිමින් පවතී...</div>
//             ) : quizzes.length === 0 ? (
//               <div className={`p-10 rounded-3xl border text-center ${cardBg}`}>
//                 <h3 className={`text-lg font-bold ${textPrimary}`}>තවමත් විභාග කිසිවක් සාදා නැත!</h3>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 {quizzes.map((quiz) => {
//                   const linkedCourse = courses.find(c => c._id === quiz.courseId);
//                   return (
//                     <div key={quiz._id} className={`p-5 rounded-2xl border shadow-sm flex flex-col ${cardBg}`}>
//                       <div className="flex justify-between items-start mb-4">
//                         <div>
//                           <h3 className={`text-lg font-bold ${textPrimary} pr-4`}>{quiz.title}</h3>
//                           <p className="text-sm font-bold text-purple-500 mt-1">{linkedCourse ? linkedCourse.title : "Course Not Found"}</p>
//                           <p className={`text-xs mt-2 font-bold ${textSecondary}`}>ප්‍රශ්න ගණන: {quiz.questions?.length || 0}</p>
//                         </div>
//                         <span className={`px-3 py-1 rounded-full text-[10px] font-bold border flex-shrink-0 ${quiz.isVisible ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
//                           {quiz.isVisible ? 'ACTIVE' : 'HIDDEN'}
//                         </span>
//                       </div>
                      
//                       {/* 🔴 වෙනස් කළ කොටස: මෙහි Quiz Delete බොත්තම එකතු කර ඇත */}
//                       <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
//                         <Link href={`/admin/edit-quiz/${quiz._id}`} className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all border border-blue-200">
//                           Edit
//                         </Link>
//                         <button onClick={() => toggleQuizVisibility(quiz._id, quiz.isVisible)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${quiz.isVisible ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200'}`}>
//                           {quiz.isVisible ? 'Hide' : 'Show'}
//                         </button>
//                         <button onClick={() => handleDeleteQuiz(quiz._id, quiz.title)} className={`flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-red-200`}>
//                           🗑️ Delete
//                         </button>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         )}

//         {/* --- 4. Students Tab --- */}
//         {activeTab === "students" && (
//           <div className="animate-in fade-in duration-300">
//             <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
//               <div>
//                 <h2 className={`text-xl font-bold ${textPrimary}`}>සිසුන් කළමනාකරණය</h2>
//                 <p className={`text-sm ${textSecondary}`}>අනුමත වූ සිසුන්ගේ විස්තර සහ ඔවුන්ව පාඨමාලා වලින් ඉවත් කිරීම.</p>
//               </div>
//               <select value={selectedFilterCourse} onChange={(e) => setSelectedFilterCourse(e.target.value)} className={`p-3 rounded-xl border font-bold text-sm outline-none shadow-sm md:w-64 ${inputBg}`}>
//                 <option value="ALL">සියලුම පාඨමාලා ({approvedStudents.length})</option>
//                 {courses.map(c => (
//                   <option key={c._id} value={c.title}>{c.title}</option>
//                 ))}
//               </select>
//             </div>
//             {isLoadingStudents ? (
//               <div className="text-center py-10 text-slate-500 font-bold animate-pulse">සිසුන්ගේ දත්ත ගෙනෙමින් පවතී...</div>
//             ) : filteredStudents.length === 0 ? (
//               <div className={`p-10 rounded-3xl border text-center ${cardBg}`}>
//                 <h3 className={`text-lg font-bold ${textPrimary}`}>මෙම පාඨමාලාව සඳහා තවමත් සිසුන් නොමැත.</h3>
//               </div>
//             ) : (
//               <div className={`rounded-2xl border overflow-hidden shadow-sm ${cardBg}`}>
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-left text-sm">
//                     <thead className={`text-xs uppercase font-bold border-b ${isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
//                       <tr>
//                         <th className="px-6 py-4">දුරකථන අංකය</th>
//                         <th className="px-6 py-4">පාඨමාලාව</th>
//                         <th className="px-6 py-4">අනුමත කළ දිනය</th>
//                         <th className="px-6 py-4 text-right">Action</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
//                       {filteredStudents.map((student) => (
//                         <tr key={student._id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}>
//                           <td className={`px-6 py-4 font-bold ${textPrimary}`}>{student.userPhone}</td>
//                           <td className={`px-6 py-4 font-bold text-blue-500`}>{student.courseTitle}</td>
//                           <td className={`px-6 py-4 ${textSecondary}`}>{new Date(student.updatedAt).toLocaleDateString('si-LK')}</td>
//                           <td className="px-6 py-4 text-right">
//                             <button onClick={() => handleRemoveStudent(student._id, student.userPhone)} className="text-xs font-bold text-red-500 hover:text-white border border-red-500 hover:bg-red-500 px-4 py-2 rounded-lg transition-all">Remove</button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </main>

//       {/* Slip විශාල කර පෙන්වන Modal */}
//       {enlargedSlip && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setEnlargedSlip(null)}>
//           <div className="relative w-full max-w-4xl h-[85vh] flex items-center justify-center">
//             <button onClick={(e) => { e.stopPropagation(); setEnlargedSlip(null); }} className="absolute -top-12 right-0 md:-right-12 text-white/70 hover:text-red-500 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all">
//               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
//             </button>
//             <img src={enlargedSlip} alt="Enlarged Bank Slip" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


"use client";

import React, { useState, useEffect, useMemo } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [activeTab, setActiveTab] = useState<"approvals" | "courses" | "quizzes" | "students">("approvals");
  
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(true);

  const [courses, setCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  const [approvedStudents, setApprovedStudents] = useState<any[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [selectedFilterCourse, setSelectedFilterCourse] = useState<string>("ALL");

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true);

  const [enlargedSlip, setEnlargedSlip] = useState<string | null>(null);

  const [bulkPhones, setBulkPhones] = useState("");
  const [bulkCourseId, setBulkCourseId] = useState("");
  const [isBulkAdding, setIsBulkAdding] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) setIsDarkMode(true);
    fetchPendingEnrollments();
    fetchCourses();
    fetchApprovedStudents();
    fetchQuizzes(); 
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const fetchPendingEnrollments = async () => {
    try {
      const res = await fetch("/api/admin/enrollments");
      const data = await res.json();
      if (res.ok) setPendingApprovals(data.enrollments);
    } catch (error) { console.error(error); } 
    finally { setIsLoadingApprovals(false); }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/courses");
      const data = await res.json();
      if (res.ok) setCourses(data.data);
    } catch (error) { console.error(error); }
    finally { setIsLoadingCourses(false); }
  };

  const fetchApprovedStudents = async () => {
    try {
      const res = await fetch("/api/admin/students");
      const data = await res.json();
      if (res.ok) setApprovedStudents(data.data);
    } catch (error) { console.error(error); }
    finally { setIsLoadingStudents(false); }
  };

  const fetchQuizzes = async () => {
    try {
      const res = await fetch("/api/admin/quizzes");
      const data = await res.json();
      if (res.ok) setQuizzes(data.data);
    } catch (error) { console.error(error); }
    finally { setIsLoadingQuizzes(false); }
  };

  const todaysIncome = useMemo(() => {
    const today = new Date().toDateString();
    let total = 0;
    approvedStudents.forEach(student => {
      // 🔴 අලුත්: දිනයක් ඇත්දැයි බැලීම
      if (student.updatedAt && new Date(student.updatedAt).toDateString() === today) {
        const course = courses.find(c => c._id === student.courseId || c.title === student.courseTitle);
        if (course && course.price) {
          const numericPrice = Number(course.price.replace(/[^0-9]/g, ''));
          total += numericPrice;
        }
      }
    });
    return total;
  }, [approvedStudents, courses]);

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
      if(newStatus === "approved") fetchApprovedStudents(); 
    } catch (error) {
      setPendingApprovals(originalApprovals);
      alert("තාක්ෂණික දෝෂයක්. නැවත උත්සාහ කරන්න.");
    }
  };

  const toggleCourseVisibility = async (courseId: string, currentVisibility: boolean) => {
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !currentVisibility }),
      });
      if (res.ok) setCourses(courses.map(c => c._id === courseId ? { ...c, isVisible: !currentVisibility } : c));
    } catch (error) { alert("තාක්ෂණික දෝෂයක්."); }
  };

  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    const confirmDelete = window.confirm(`"${courseTitle}" පාඨමාලාව සම්පූර්ණයෙන්ම මකා දැමීමට අවශ්‍ය බව ඔබට විශ්වාසද? \n\nමෙම ක්‍රියාව ආපසු හැරවිය නොහැක!`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCourses(courses.filter(c => c._id !== courseId));
        alert("පාඨමාලාව සාර්ථකව මකා දමන ලදී.");
      } else {
        alert("මකා දැමීම අසාර්ථකයි.");
      }
    } catch (error) {
      alert("තාක්ෂණික දෝෂයක් මතු විය.");
    }
  };

  const toggleQuizVisibility = async (quizId: string, currentVisibility: boolean) => {
    try {
      const res = await fetch(`/api/admin/quizzes/${quizId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !currentVisibility }),
      });
      if (res.ok) setQuizzes(quizzes.map(q => q._id === quizId ? { ...q, isVisible: !currentVisibility } : q));
    } catch (error) { alert("තාක්ෂණික දෝෂයක්."); }
  };

  const handleDeleteQuiz = async (quizId: string, quizTitle: string) => {
    const confirmDelete = window.confirm(`"${quizTitle}" ප්‍රශ්න පත්‍රය සම්පූර්ණයෙන්ම මකා දැමීමට අවශ්‍ය බව ඔබට විශ්වාසද? \n\nමෙම ක්‍රියාව ආපසු හැරවිය නොහැක!`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/quizzes/${quizId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setQuizzes(quizzes.filter(q => q._id !== quizId));
        alert("ප්‍රශ්න පත්‍රය සාර්ථකව මකා දමන ලදී.");
      } else {
        alert("මකා දැමීම අසාර්ථකයි.");
      }
    } catch (error) {
      alert("තාක්ෂණික දෝෂයක් මතු විය.");
    }
  };

  const handleRemoveStudent = async (enrollmentId: string, studentPhone: string) => {
    const confirmDelete = window.confirm(`${studentPhone} දුරකථන අංකය හිමි සිසුවාව මෙම පාඨමාලාවෙන් ඉවත් කිරීමට අවශ්‍ය බව ඔබට විශ්වාසද?`);
    if (!confirmDelete) return;
    try {
      const res = await fetch(`/api/admin/students?id=${enrollmentId}`, { method: "DELETE" });
      if (res.ok) {
        setApprovedStudents(approvedStudents.filter(s => s._id !== enrollmentId));
        alert("සිසුවා සාර්ථකව ඉවත් කරන ලදී.");
      } else {
        alert("ඉවත් කිරීම අසාර්ථකයි.");
      }
    } catch (error) { alert("තාක්ෂණික දෝෂයක් මතු විය."); }
  };

  const handleBulkAddStudents = async () => {
    if (!bulkCourseId) return alert("කරුණාකර සිසුන් ඇතුළත් කළ යුතු පාඨමාලාව තෝරන්න.");
    if (!bulkPhones.trim()) return alert("කරුණාකර දුරකථන අංක ඇතුළත් කරන්න.");

    const phoneArray = bulkPhones.split('\n').map(p => p.trim()).filter(p => p !== "");
    if (phoneArray.length === 0) return alert("නිවැරදි දුරකථන අංක සොයාගත නොහැක.");

    const selectedCourse = courses.find(c => c._id === bulkCourseId);
    if (!selectedCourse) return alert("පාඨමාලාව සොයාගැනීමේ දෝෂයක්.");

    setIsBulkAdding(true);
    try {
      const res = await fetch("/api/admin/students/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phones: phoneArray,
          courseId: selectedCourse._id,
          courseTitle: selectedCourse.title
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert(`සාර්ථකයි! ${phoneArray.length} දෙනෙකු අදාළ පාඨමාලාවට ඇතුළත් කරන ලදී.`);
        setBulkPhones(""); 
        fetchApprovedStudents(); 
      } else {
        alert(data.error || "ඇතුළත් කිරීමේ දෝෂයක් මතු විය.");
      }
    } catch (error) {
      alert("තාක්ෂණික දෝෂයක් මතු විය.");
    } finally {
      setIsBulkAdding(false);
    }
  };

  const filteredStudents = selectedFilterCourse === "ALL" ? approvedStudents : approvedStudents.filter(s => s.courseTitle === selectedFilterCourse);

  const themeBg = isDarkMode ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-800";
  const headerBg = isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200";
  const cardBg = isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100";
  const textPrimary = isDarkMode ? "text-white" : "text-slate-900";
  const textSecondary = isDarkMode ? "text-slate-400" : "text-slate-500";
  const tabActive = "bg-blue-600 text-white shadow-md";
  const tabInactive = isDarkMode ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-white text-slate-600 hover:bg-slate-100 border";
  const inputBg = isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900";

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
              {isDarkMode ? <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg> : <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
            </button>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="rounded-full bg-red-500/10 border border-red-500/50 px-4 py-1.5 text-xs md:text-sm font-semibold text-red-500 transition hover:bg-red-500 hover:text-white">
              ඉවත් වන්න
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow mx-auto w-full max-w-7xl p-4 md:p-6 mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className={`p-5 rounded-2xl border shadow-sm ${cardBg}`}>
            <h4 className={textSecondary}>අලුත් Slips</h4>
            <p className="text-3xl font-extrabold text-amber-500 mt-2">{pendingApprovals.length}</p>
          </div>
          <div className={`p-5 rounded-2xl border shadow-sm ${cardBg}`}>
            <h4 className={textSecondary}>මුළු සිසුන්</h4>
            <p className="text-3xl font-extrabold text-blue-500 mt-2">{approvedStudents.length}</p>
          </div>
          <div className={`p-5 rounded-2xl border shadow-sm ${cardBg}`}>
            <h4 className={textSecondary}>සක්‍රීය පාඨමාලා</h4>
            <p className="text-3xl font-extrabold text-emerald-500 mt-2">{courses.filter(c => c.isVisible).length || '0'}</p>
          </div>
          <div className={`p-5 rounded-2xl border shadow-sm ${cardBg}`}>
            <h4 className={textSecondary}>අද ආදායම</h4>
            <p className="text-2xl md:text-3xl font-extrabold text-purple-500 mt-2 truncate">Rs. {todaysIncome.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
          <button onClick={() => setActiveTab("approvals")} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === "approvals" ? tabActive : tabInactive}`}>රිසිට්පත් අනුමත කිරීම</button>
          <button onClick={() => setActiveTab("courses")} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === "courses" ? tabActive : tabInactive}`}>පාඨමාලා කළමනාකරණය</button>
          <button onClick={() => setActiveTab("quizzes")} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === "quizzes" ? tabActive : tabInactive}`}>විභාග කළමනාකරණය</button>
          <button onClick={() => setActiveTab("students")} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === "students" ? tabActive : tabInactive}`}>සිසුන්ගේ විස්තර</button>
        </div>

        {activeTab === "approvals" && (
          <div className="animate-in fade-in duration-300">
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
                    <div className="h-48 overflow-hidden bg-slate-200 relative group cursor-pointer" onClick={() => setEnlargedSlip(req.slipImage)}>
                      <img src={req.slipImage} alt="Bank Slip" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <span className="text-white text-sm font-bold flex items-center gap-2">විශාල කර බලන්න</span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="mb-4">
                        <h3 className={`text-lg font-bold mt-1 ${textPrimary}`}>දුරකථන: {req.userPhone}</h3>
                        <p className={`text-sm font-bold text-blue-500 mt-2`}>{req.courseTitle}</p>
                      </div>
                      <div className="mt-auto grid grid-cols-2 gap-3">
                        <button onClick={() => handleUpdateStatus(req._id, "approved")} className="rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 py-2.5 text-sm font-bold transition-all">අනුමත කරන්න</button>
                        <button onClick={() => handleUpdateStatus(req._id, "rejected")} className="rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white border border-red-500/20 py-2.5 text-sm font-bold transition-all">ප්‍රතික්ෂේප කරන්න</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "courses" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className={`text-xl font-bold ${textPrimary}`}>පවතින පාඨමාලා</h2>
                <p className={`text-sm ${textSecondary}`}>ඔබගේ සියලුම පාඨමාලා මෙතැනින් කළමනාකරණය කරන්න.</p>
              </div>
              <Link href="/admin/add-course" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md">
                + අලුත් Course එකක් හදන්න
              </Link>
            </div>
            {isLoadingCourses ? (
              <div className="text-center py-10 text-slate-500 font-bold animate-pulse">පාඨමාලා ලබාගනිමින් පවතී...</div>
            ) : courses.length === 0 ? (
              <div className={`p-10 rounded-3xl border text-center ${cardBg}`}>
                <h3 className={`text-lg font-bold ${textPrimary}`}>තවමත් පාඨමාලා කිසිවක් නැත!</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <div key={course._id} className={`p-5 rounded-2xl border shadow-sm flex flex-col ${cardBg}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className={`text-lg font-bold ${textPrimary} pr-4`}>{course.title}</h3>
                        <p className="text-sm font-bold text-blue-500 mt-1">{course.price}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border flex-shrink-0 ${course.isVisible ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {course.isVisible ? 'ACTIVE' : 'HIDDEN'}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
                      <Link href={`/admin/edit-course/${course._id}`} className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all border border-blue-200">
                        Edit
                      </Link>
                      <button onClick={() => toggleCourseVisibility(course._id, course.isVisible)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${course.isVisible ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200'}`}>
                        {course.isVisible ? 'Hide' : 'Show'}
                      </button>
                      <button onClick={() => handleDeleteCourse(course._id, course.title)} className={`flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-red-200`}>
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "quizzes" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className={`text-xl font-bold ${textPrimary}`}>MCQ ප්‍රශ්න පත්‍ර කළමනාකරණය</h2>
                <p className={`text-sm ${textSecondary}`}>විභාග සැකසීම, වෙනස් කිරීම සහ සඟවා තැබීම.</p>
              </div>
              <Link href="/admin/add-quiz" className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md">
                + අලුත් Quiz එකක් හදන්න
              </Link>
            </div>
            
            {isLoadingQuizzes ? (
              <div className="text-center py-10 text-slate-500 font-bold animate-pulse">විභාග ලබාගනිමින් පවතී...</div>
            ) : quizzes.length === 0 ? (
              <div className={`p-10 rounded-3xl border text-center ${cardBg}`}>
                <h3 className={`text-lg font-bold ${textPrimary}`}>තවමත් විභාග කිසිවක් සාදා නැත!</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {quizzes.map((quiz) => {
                  const linkedCourse = courses.find(c => c._id === quiz.courseId);
                  return (
                    <div key={quiz._id} className={`p-5 rounded-2xl border shadow-sm flex flex-col ${cardBg}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className={`text-lg font-bold ${textPrimary} pr-4`}>{quiz.title}</h3>
                          <p className="text-sm font-bold text-purple-500 mt-1">{linkedCourse ? linkedCourse.title : "Course Not Found"}</p>
                          <p className={`text-xs mt-2 font-bold ${textSecondary}`}>ප්‍රශ්න ගණන: {quiz.questions?.length || 0}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border flex-shrink-0 ${quiz.isVisible ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          {quiz.isVisible ? 'ACTIVE' : 'HIDDEN'}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Link href={`/admin/edit-quiz/${quiz._id}`} className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all border border-blue-200">
                          Edit
                        </Link>
                        <button onClick={() => toggleQuizVisibility(quiz._id, quiz.isVisible)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${quiz.isVisible ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200'}`}>
                          {quiz.isVisible ? 'Hide' : 'Show'}
                        </button>
                        <button onClick={() => handleDeleteQuiz(quiz._id, quiz.title)} className={`flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-red-200`}>
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- 4. Students Tab --- */}
        {activeTab === "students" && (
          <div className="animate-in fade-in duration-300">
            
            <div className={`p-6 mb-8 rounded-2xl border shadow-sm bg-blue-50/50 dark:bg-blue-900/10 ${isDarkMode ? 'border-blue-800' : 'border-blue-100'}`}>
              <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                එකවර සිසුන් කිහිපදෙනෙකු ඇතුළත් කිරීම (Bulk Add)
              </h3>
              <p className={`text-xs md:text-sm mb-4 ${textSecondary}`}>
                පහත කොටුවේ දුරකථන අංක ඇතුළත් කර අදාළ පාඨමාලාව තෝරන්න. (එක් පේළියකට එක් අංකයක් පමණක් සිටින සේ ඇතුළත් කරන්න).
              </p>
              <div className="flex flex-col md:flex-row gap-4">
                <textarea 
                  className={`w-full md:w-2/3 h-32 p-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none ${inputBg}`} 
                  placeholder="0771577711&#10;0701567679&#10;0705956020"
                  value={bulkPhones}
                  onChange={(e) => setBulkPhones(e.target.value)}
                />
                <div className="w-full md:w-1/3 flex flex-col gap-3">
                  <select 
                    value={bulkCourseId} 
                    onChange={(e) => setBulkCourseId(e.target.value)} 
                    className={`p-3 rounded-xl border font-bold text-sm outline-none w-full ${inputBg}`}
                  >
                    <option value="">-- පාඨමාලාව තෝරන්න --</option>
                    {courses.map(c => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                  <button 
                    onClick={handleBulkAddStudents}
                    disabled={isBulkAdding}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isBulkAdding ? "ඇතුළත් කරමින් පවතී..." : "ඇතුළත් කරන්න (Add Students)"}
                  </button>
                </div>
              </div>
            </div>

            <div className={`flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-t pt-8 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div>
                <h2 className={`text-xl font-bold ${textPrimary}`}>දැනට සිටින සිසුන්ගේ විස්තර</h2>
                <p className={`text-sm ${textSecondary}`}>අනුමත වූ සිසුන්ගේ විස්තර සහ ඔවුන්ව පාඨමාලා වලින් ඉවත් කිරීම.</p>
              </div>
              <select value={selectedFilterCourse} onChange={(e) => setSelectedFilterCourse(e.target.value)} className={`p-3 rounded-xl border font-bold text-sm outline-none shadow-sm md:w-64 ${inputBg}`}>
                <option value="ALL">සියලුම පාඨමාලා ({approvedStudents.length})</option>
                {courses.map(c => (
                  <option key={c._id} value={c.title}>{c.title}</option>
                ))}
              </select>
            </div>

            {isLoadingStudents ? (
              <div className="text-center py-10 text-slate-500 font-bold animate-pulse">සිසුන්ගේ දත්ත ගෙනෙමින් පවතී...</div>
            ) : filteredStudents.length === 0 ? (
              <div className={`p-10 rounded-3xl border text-center ${cardBg}`}>
                <h3 className={`text-lg font-bold ${textPrimary}`}>මෙම පාඨමාලාව සඳහා තවමත් සිසුන් නොමැත.</h3>
              </div>
            ) : (
              <div className={`rounded-2xl border overflow-hidden shadow-sm ${cardBg}`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className={`text-xs uppercase font-bold border-b ${isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                      <tr>
                        <th className="px-6 py-4">දුරකථන අංකය</th>
                        <th className="px-6 py-4">පාඨමාලාව</th>
                        <th className="px-6 py-4">අනුමත කළ දිනය</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {filteredStudents.map((student) => (
                        <tr key={student._id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}>
                          <td className={`px-6 py-4 font-bold ${textPrimary}`}>{student.userPhone}</td>
                          <td className={`px-6 py-4 font-bold text-blue-500`}>{student.courseTitle}</td>
                          
                          {/* 🔴 අලුත්: දිනයක් නැත්නම් "N/A" පෙන්වීම (Crash වීම වළක්වයි) */}
                          <td className={`px-6 py-4 ${textSecondary}`}>
                            {student.updatedAt ? new Date(student.updatedAt).toLocaleDateString('si-LK') : "දිනයක් නැත"}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <button onClick={() => handleRemoveStudent(student._id, student.userPhone)} className="text-xs font-bold text-red-500 hover:text-white border border-red-500 hover:bg-red-500 px-4 py-2 rounded-lg transition-all">Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {enlargedSlip && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setEnlargedSlip(null)}>
          <div className="relative w-full max-w-4xl h-[85vh] flex items-center justify-center">
            <button onClick={(e) => { e.stopPropagation(); setEnlargedSlip(null); }} className="absolute -top-12 right-0 md:-right-12 text-white/70 hover:text-red-500 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <img src={enlargedSlip} alt="Enlarged Bank Slip" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}
    </div>
  );
}
