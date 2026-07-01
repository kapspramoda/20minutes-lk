"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import imageCompression from "browser-image-compression";

// --- 🛠️ TypeScript Types ---
type Lesson = {
  _id?: string;
  lessonId: string;
  title: string;
  videoEmbed: string;
  pdfUrl: string;
};

type Subject = {
  _id?: string;
  subjectId: string;
  name: string;
  liveClass: { time: string; zoomLink: string; };
  lessons: Lesson[];
};

type BankAccount = {
  _id?: string;
  bankName: string;
  branch: string;
  accNumber: string;
  accName: string;
};

type CourseDataType = {
  _id?: string;
  title: string;
  coverImage: string;
  price: string;
  whatsappLink: string;
  bankAccounts: BankAccount[];
  subjects: Subject[];
};

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export default function EditCoursePage({ params }: PageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [courseId, setCourseId] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) setIsDarkMode(true);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  // පෝරමයේ මූලික දත්ත ව්‍යුහය
  const [courseData, setCourseData] = useState<CourseDataType>({
    title: "",
    coverImage: "",
    price: "",
    whatsappLink: "",
    bankAccounts: [],
    subjects: []
  });

  // 1. පේජ් එක ලෝඩ් වෙද්දී Database එකෙන් පරණ දත්ත ගෙන ඒම
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const resolvedParams = await params;
        setCourseId(resolvedParams.id);

        const res = await fetch(`/api/courses/${resolvedParams.id}`);
        const data = await res.json();

        if (res.ok) {
          const fetchedCourse = data.data;
          // පරණ පන්ති වලට Bank Accounts නැත්නම් හිස් Array එකක් දමන්න
          setCourseData({
            ...fetchedCourse,
            price: fetchedCourse.price || "",
            coverImage: fetchedCourse.coverImage || "",
            bankAccounts: fetchedCourse.bankAccounts && fetchedCourse.bankAccounts.length > 0 
              ? fetchedCourse.bankAccounts 
              : [{ bankName: "BOC", branch: "", accNumber: "", accName: "20minutes.lk" }]
          });
        } else {
          setMessage({ type: "error", text: "Course එක සොයාගැනීමට නොහැක!" });
        }
      } catch (error) {
        setMessage({ type: "error", text: "දත්ත ලබා ගැනීමේ දෝෂයක්!" });
      } finally {
        setIsFetching(false);
      }
    };

    fetchCourseData();
  }, [params]);

  // --- Image Upload & Convert ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1280, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onload = () => {
        setCourseData({ ...courseData, coverImage: reader.result as string });
      };
    } catch (error) {
      alert("පින්තූරය උඩුගත කිරීමේදී දෝෂයක් මතු විය.");
    }
  };

  // --- Bank Account Functions ---
  const addBankAccount = () => {
    setCourseData({
      ...courseData,
      bankAccounts: [...courseData.bankAccounts, { bankName: "", branch: "", accNumber: "", accName: "" }]
    });
  };

  const removeBankAccount = (index: number) => {
    const updated = courseData.bankAccounts.filter((_, i) => i !== index);
    setCourseData({ ...courseData, bankAccounts: updated });
  };

  // --- Subject & Lesson Functions ---
  const addSubject = () => {
    setCourseData({
      ...courseData,
      subjects: [...courseData.subjects, { subjectId: "sub_" + Date.now(), name: "", liveClass: { time: "", zoomLink: "" }, lessons: [] }]
    });
  };

  const removeSubject = (indexToRemove: number) => {
    const confirmDelete = window.confirm("මෙම විෂය සහ එහි ඇති සියලුම පාඩම් මකා දැමීමට අවශ්‍ය බව විශ්වාසද?");
    if (!confirmDelete) return;
    const updated = courseData.subjects.filter((_, index) => index !== indexToRemove);
    setCourseData({ ...courseData, subjects: updated });
  };

  const addLesson = (subjectIndex: number) => {
    const updatedSubjects = [...courseData.subjects];
    updatedSubjects[subjectIndex].lessons.push({ lessonId: "les_" + Date.now(), title: "", videoEmbed: "", pdfUrl: "" });
    setCourseData({ ...courseData, subjects: updatedSubjects });
  };

  const removeLesson = (subjectIndex: number, lessonIndexToRemove: number) => {
    const updatedSubjects = [...courseData.subjects];
    updatedSubjects[subjectIndex].lessons = updatedSubjects[subjectIndex].lessons.filter((_, index) => index !== lessonIndexToRemove);
    setCourseData({ ...courseData, subjects: updatedSubjects });
  };

  // --- Submit Update (PUT) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "✅ පාඨමාලාව සාර්ථකව යාවත්කාලීන (Update) කරන ලදී!" });
        setTimeout(() => router.push("/admin"), 2000);
      } else {
        setMessage({ type: "error", text: "❌ දෝෂයක්: " + data.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "❌ පද්ධතියේ දෝෂයක් ඇතිවිය." });
    } finally {
      setIsLoading(false);
    }
  };

  // Theme Classes
  const themeBg = isDarkMode ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-800";
  const headerBg = isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200";
  const cardBg = isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200";
  const inputBg = isDarkMode ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400" : "bg-white border-slate-300 text-slate-900";

  if (isFetching) {
    return <div className={`min-h-screen flex items-center justify-center font-bold ${isDarkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>දත්ත ලබාගනිමින් පවතී...</div>;
  }

  return (
    <div className={`modern-font min-h-screen transition-colors duration-300 ${themeBg}`}>
      
      {/* --- Admin Header --- */}
      <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-md transition-all duration-300 ${headerBg}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm">ADMIN</div>
            <span className="logo-font text-lg md:text-2xl font-semibold truncate">20minutes.lk</span>
          </div>
          <div className="flex items-center space-x-3 md:space-x-5">
            <button onClick={toggleTheme} className={`rounded-full p-2 transition-colors focus:outline-none ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-slate-100 text-slate-600'}`}>
              {isDarkMode ? <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg> : <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
            </button>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="rounded-full bg-red-500/10 border border-red-500/50 px-4 py-1.5 text-xs md:text-sm font-semibold text-red-500 transition hover:bg-red-500 hover:text-white">
              ඉවත් වන්න
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8 mt-4">
        <div className={`rounded-2xl shadow-sm border p-6 md:p-8 ${cardBg}`}>
          
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
            <h1 className="text-xl md:text-2xl font-bold">පාඨමාලාව වෙනස් කිරීම (Edit)</h1>
            <Link href="/admin" className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}>
              &larr; ආපසු
            </Link>
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-xl font-bold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. ප්‍රධාන විස්තර */}
            <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <h2 className="text-lg font-bold mb-4">1. ප්‍රධාන විස්තර</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-bold mb-2">පාඨමාලාවේ නම *</label>
                  <input type="text" required value={courseData.title} onChange={(e) => setCourseData({...courseData, title: e.target.value})} className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none ${inputBg}`} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">පාඨමාලාවේ ගාස්තුව (Price) *</label>
                  <input type="text" required value={courseData.price} onChange={(e) => setCourseData({...courseData, price: e.target.value})} className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none ${inputBg}`} placeholder="උදා: රු. 2500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2">WhatsApp Group Link</label>
                  <input type="url" value={courseData.whatsappLink} onChange={(e) => setCourseData({...courseData, whatsappLink: e.target.value})} className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none ${inputBg}`} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2">Cover Image එක (අලුත් එකක් දමන්නේ නම් පමණක් තෝරන්න)</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className={`block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:px-4 file:py-2 file:text-xs file:font-bold ${inputBg} file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100`} />
                  {courseData.coverImage && <img src={courseData.coverImage} alt="Cover Preview" className="mt-4 h-32 w-auto object-cover rounded-xl border" />}
                </div>
              </div>
            </div>

            {/* 2. බැංකු ගිණුම් විස්තර */}
            <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <h2 className="text-lg font-bold mb-4">2. ගෙවීම් කළ යුතු බැංකු ගිණුම්</h2>
              {courseData.bankAccounts.map((bank, index) => (
                <div key={index} className={`grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 rounded-xl border relative ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'}`}>
                  {index > 0 && (
                    <button type="button" onClick={() => removeBankAccount(index)} className="absolute -top-3 -right-3 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-600 hover:text-white transition shadow-sm border border-red-200"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
                  )}
                  <div>
                    <label className="block text-xs font-bold mb-1">බැංකුවේ නම *</label>
                    <input type="text" required value={bank.bankName} onChange={(e) => { const updated = [...courseData.bankAccounts]; updated[index].bankName = e.target.value; setCourseData({...courseData, bankAccounts: updated}); }} className={`w-full p-2.5 rounded-lg border text-sm ${inputBg}`} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">ශාඛාව *</label>
                    <input type="text" required value={bank.branch} onChange={(e) => { const updated = [...courseData.bankAccounts]; updated[index].branch = e.target.value; setCourseData({...courseData, bankAccounts: updated}); }} className={`w-full p-2.5 rounded-lg border text-sm ${inputBg}`} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">ගිණුම් අංකය *</label>
                    <input type="text" required value={bank.accNumber} onChange={(e) => { const updated = [...courseData.bankAccounts]; updated[index].accNumber = e.target.value; setCourseData({...courseData, bankAccounts: updated}); }} className={`w-full p-2.5 rounded-lg border text-sm ${inputBg}`} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">ගිණුමේ නම *</label>
                    <input type="text" required value={bank.accName} onChange={(e) => { const updated = [...courseData.bankAccounts]; updated[index].accName = e.target.value; setCourseData({...courseData, bankAccounts: updated}); }} className={`w-full p-2.5 rounded-lg border text-sm ${inputBg}`} />
                  </div>
                </div>
              ))}
              <button type="button" onClick={addBankAccount} className="mt-2 text-sm bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg font-bold hover:bg-emerald-200 transition">+ තව බැංකු ගිණුමක්</button>
            </div>

            {/* 3. විෂයයන් සහ පාඩම් */}
            <div>
              <h2 className="text-lg font-bold mb-4">3. විෂයයන් සහ පාඩම්</h2>
              {courseData.subjects.map((subject, sIndex) => (
                <div key={subject.subjectId || subject._id} className={`p-6 rounded-xl mb-6 shadow-sm border relative ${isDarkMode ? 'bg-blue-950/20 border-blue-900/50' : 'bg-white border-blue-100'}`}>
                  
                  <button type="button" onClick={() => removeSubject(sIndex)} className="absolute -top-3 -right-3 bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-600 hover:text-white transition shadow-sm border border-red-200" title="විෂය මකන්න">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="md:col-span-3">
                      <label className="block text-sm font-bold mb-2">විෂයයේ නම *</label>
                      <input type="text" required value={subject.name} onChange={(e) => { const updated = [...courseData.subjects]; updated[sIndex].name = e.target.value; setCourseData({...courseData, subjects: updated}); }} className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none ${inputBg}`} />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-bold mb-2">Live Class වෙලාව</label>
                      <input type="text" value={subject.liveClass?.time || ""} onChange={(e) => { const updated = [...courseData.subjects]; if(!updated[sIndex].liveClass) updated[sIndex].liveClass = {time:"", zoomLink:""}; updated[sIndex].liveClass.time = e.target.value; setCourseData({...courseData, subjects: updated}); }} className={`w-full p-2.5 rounded-xl border text-sm ${inputBg}`} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold mb-2">Zoom Link එක</label>
                      <input type="url" value={subject.liveClass?.zoomLink || ""} onChange={(e) => { const updated = [...courseData.subjects]; if(!updated[sIndex].liveClass) updated[sIndex].liveClass = {time:"", zoomLink:""}; updated[sIndex].liveClass.zoomLink = e.target.value; setCourseData({...courseData, subjects: updated}); }} className={`w-full p-2.5 rounded-xl border text-sm ${inputBg}`} />
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <h3 className="text-sm font-bold mb-4 border-b pb-2">පාඩම් ලැයිස්තුව</h3>
                    {subject.lessons.map((lesson, lIndex) => (
                      <div key={lesson.lessonId || lesson._id} className={`grid grid-cols-1 md:grid-cols-12 gap-3 mb-4 p-3 rounded-lg border relative pr-10 ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white'}`}>
                        <button type="button" onClick={() => removeLesson(sIndex, lIndex)} className="absolute top-1/2 -translate-y-1/2 right-2 text-red-400 hover:text-red-600 p-1 bg-red-50 hover:bg-red-100 rounded-md transition"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        <div className="md:col-span-4">
                          <label className="block text-[10px] font-bold mb-1">පාඩමේ මාතෘකාව *</label>
                          <input type="text" required value={lesson.title} onChange={(e) => { const updated = [...courseData.subjects]; updated[sIndex].lessons[lIndex].title = e.target.value; setCourseData({...courseData, subjects: updated}); }} className={`w-full p-2 rounded-lg border text-sm ${inputBg}`} />
                        </div>
                        <div className="md:col-span-4">
                          <label className="block text-[10px] font-bold mb-1">YouTube Embed Link *</label>
                          <input type="url" required value={lesson.videoEmbed} onChange={(e) => { const updated = [...courseData.subjects]; updated[sIndex].lessons[lIndex].videoEmbed = e.target.value; setCourseData({...courseData, subjects: updated}); }} className={`w-full p-2 rounded-lg border text-sm ${inputBg}`} />
                        </div>
                        <div className="md:col-span-4">
                          <label className="block text-[10px] font-bold mb-1">Tute (PDF) Link</label>
                          <input type="url" value={lesson.pdfUrl} onChange={(e) => { const updated = [...courseData.subjects]; updated[sIndex].lessons[lIndex].pdfUrl = e.target.value; setCourseData({...courseData, subjects: updated}); }} className={`w-full p-2 rounded-lg border text-sm ${inputBg}`} />
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => addLesson(sIndex)} className="mt-2 text-xs md:text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold hover:bg-blue-200 transition">+ අලුත් පාඩමක්</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addSubject} className={`w-full py-3 border-2 border-dashed font-bold rounded-xl transition-colors ${isDarkMode ? 'border-slate-600 text-slate-400 hover:border-blue-500 hover:text-blue-400' : 'border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-500'}`}>+ අලුත් විෂයයක් එකතු කරන්න</button>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-blue-700 transition shadow-lg disabled:bg-slate-400 flex justify-center items-center gap-2">
              {isLoading ? "Update වෙමින් පවතී..." : <><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Update කරන්න (Save Changes)</>}
            </button>

          </form>
        </div>
      </main>
    </div>
  );
}