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
  // 🔴 අලුත්: Zoom Recording, Hide/Show සහ Schedule
  zoomRecordLink?: string; 
  isVisible?: boolean; 
  publishDate?: string;
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

  const [courseData, setCourseData] = useState<CourseDataType>({
    title: "",
    coverImage: "",
    price: "",
    whatsappLink: "",
    bankAccounts: [],
    subjects: []
  });

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const resolvedParams = await params;
        setCourseId(resolvedParams.id);

        const res = await fetch(`/api/courses/${resolvedParams.id}`);
        const data = await res.json();

        if (res.ok) {
          const fetchedCourse = data.data;
          
          const subjectsWithDefaults = fetchedCourse.subjects.map((sub: any) => ({
            ...sub,
            lessons: sub.lessons.map((les: any) => ({
              ...les,
              isVisible: les.isVisible !== undefined ? les.isVisible : true,
              publishDate: les.publishDate || "",
              zoomRecordLink: les.zoomRecordLink || ""
            }))
          }));

          setCourseData({
            ...fetchedCourse,
            price: fetchedCourse.price || "",
            coverImage: fetchedCourse.coverImage || "",
            subjects: subjectsWithDefaults,
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
    updatedSubjects[subjectIndex].lessons.push({ lessonId: "les_" + Date.now(), title: "", videoEmbed: "", pdfUrl: "", zoomRecordLink: "", isVisible: true, publishDate: "" });
    setCourseData({ ...courseData, subjects: updatedSubjects });
  };

  const removeLesson = (subjectIndex: number, lessonIndexToRemove: number) => {
    const updatedSubjects = [...courseData.subjects];
    updatedSubjects[subjectIndex].lessons = updatedSubjects[subjectIndex].lessons.filter((_, index) => index !== lessonIndexToRemove);
    setCourseData({ ...courseData, subjects: updatedSubjects });
  };

  const toggleLessonVisibility = (subjectIndex: number, lessonIndex: number) => {
    const updatedSubjects = [...courseData.subjects];
    const currentVis = updatedSubjects[subjectIndex].lessons[lessonIndex].isVisible;
    updatedSubjects[subjectIndex].lessons[lessonIndex].isVisible = !currentVis;
    setCourseData({ ...courseData, subjects: updatedSubjects });
  };

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

  const themeBg = isDarkMode ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-800";
  const headerBg = isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200";
  const cardBg = isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200";
  const inputBg = isDarkMode ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400" : "bg-white border-slate-300 text-slate-900";

  if (isFetching) {
    return <div className={`min-h-screen flex items-center justify-center font-bold ${isDarkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>දත්ත ලබාගනිමින් පවතී...</div>;
  }

  return (
    <div className={`modern-font min-h-screen transition-colors duration-300 ${themeBg}`}>
      <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-md transition-all duration-300 ${headerBg}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm">ADMIN</div>
            <span className="logo-font text-lg md:text-2xl font-semibold truncate">20minutes.lk</span>
          </div>
          <div className="flex items-center space-x-3 md:space-x-5">
            <button onClick={toggleTheme} className={`rounded-full p-2 transition-colors focus:outline-none ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-slate-100 text-slate-600'}`}>
              {isDarkMode ? '🌞' : '🌙'}
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
            <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <h2 className="text-lg font-bold mb-4">1. ප්‍රධාන විස්තර</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-bold mb-2">පාඨමාලාවේ නම *</label>
                  <input type="text" required value={courseData.title} onChange={(e) => setCourseData({...courseData, title: e.target.value})} className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none ${inputBg}`} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">පාඨමාලාවේ ගාස්තුව (Price) *</label>
                  <input type="text" required value={courseData.price} onChange={(e) => setCourseData({...courseData, price: e.target.value})} className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none ${inputBg}`} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2">WhatsApp Group Link</label>
                  <input type="url" value={courseData.whatsappLink} onChange={(e) => setCourseData({...courseData, whatsappLink: e.target.value})} className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none ${inputBg}`} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2">Cover Image</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className={`block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:px-4 file:py-2 file:text-xs file:font-bold ${inputBg} file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100`} />
                  {courseData.coverImage && <img src={courseData.coverImage} alt="Cover Preview" className="mt-4 h-32 w-auto object-cover rounded-xl border" />}
                </div>
              </div>
            </div>

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
                      <div key={lesson.lessonId || lesson._id} className={`grid grid-cols-1 md:grid-cols-12 gap-3 mb-4 p-4 rounded-lg border relative ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white'}`}>
                        <button type="button" onClick={() => removeLesson(sIndex, lIndex)} className="absolute -top-2 -right-2 text-red-400 hover:text-white p-1 bg-red-50 hover:bg-red-500 border border-red-100 rounded-full transition shadow-sm z-10"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                        
                        <div className="md:col-span-6">
                          <label className="block text-[10px] font-bold mb-1">පාඩමේ මාතෘකාව *</label>
                          <input type="text" required value={lesson.title} onChange={(e) => { const updated = [...courseData.subjects]; updated[sIndex].lessons[lIndex].title = e.target.value; setCourseData({...courseData, subjects: updated}); }} className={`w-full p-2.5 rounded-lg border text-sm ${inputBg}`} />
                        </div>
                        <div className="md:col-span-6">
                          <label className="block text-[10px] font-bold mb-1">YouTube Embed Link (අත්‍යවශ්‍ය නැත)</label>
                          <input type="url" value={lesson.videoEmbed} onChange={(e) => { const updated = [...courseData.subjects]; updated[sIndex].lessons[lIndex].videoEmbed = e.target.value; setCourseData({...courseData, subjects: updated}); }} className={`w-full p-2.5 rounded-lg border text-sm ${inputBg}`} />
                        </div>
                        <div className="md:col-span-6">
                          <label className="block text-[10px] font-bold mb-1">Zoom Recording Link (අත්‍යවශ්‍ය නැත)</label>
                          <input type="url" value={lesson.zoomRecordLink || ""} onChange={(e) => { const updated = [...courseData.subjects]; updated[sIndex].lessons[lIndex].zoomRecordLink = e.target.value; setCourseData({...courseData, subjects: updated}); }} className={`w-full p-2.5 rounded-lg border text-sm ${inputBg}`} />
                        </div>
                        <div className="md:col-span-6">
                          <label className="block text-[10px] font-bold mb-1">Tute (PDF) Link (අත්‍යවශ්‍ය නැත)</label>
                          <input type="url" value={lesson.pdfUrl} onChange={(e) => { const updated = [...courseData.subjects]; updated[sIndex].lessons[lIndex].pdfUrl = e.target.value; setCourseData({...courseData, subjects: updated}); }} className={`w-full p-2.5 rounded-lg border text-sm ${inputBg}`} />
                        </div>

                        <div className="md:col-span-12 flex flex-col md:flex-row gap-4 items-center justify-between border-t pt-3 mt-1 dark:border-slate-700">
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-bold text-slate-500">Video Status:</span>
                            <button 
                              type="button" 
                              onClick={() => toggleLessonVisibility(sIndex, lIndex)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${lesson.isVisible ? 'bg-emerald-500' : 'bg-slate-400'}`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${lesson.isVisible ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                            <span className={`text-xs font-bold ${lesson.isVisible ? 'text-emerald-500' : 'text-slate-500'}`}>
                              {lesson.isVisible ? "👀 සිසුන්ට පෙනේ" : "🚫 සඟවා ඇත (Hidden)"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 w-full md:w-auto">
                            <span className="text-[11px] font-bold text-slate-500">⏰ Auto-Publish:</span>
                            <input 
                              type="datetime-local" 
                              value={lesson.publishDate || ""} 
                              onChange={(e) => { const updated = [...courseData.subjects]; updated[sIndex].lessons[lIndex].publishDate = e.target.value; setCourseData({...courseData, subjects: updated}); }} 
                              className={`p-1.5 rounded-md border text-xs outline-none ${inputBg} flex-grow md:w-48`} 
                            />
                            {lesson.publishDate && (
                              <button type="button" onClick={() => { const updated = [...courseData.subjects]; updated[sIndex].lessons[lIndex].publishDate = ""; setCourseData({...courseData, subjects: updated}); }} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition" title="Clear Schedule">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    ))}
                    <button type="button" onClick={() => addLesson(sIndex)} className="mt-2 w-full md:w-auto text-xs md:text-sm bg-blue-100 text-blue-700 px-4 py-3 rounded-lg font-bold hover:bg-blue-200 transition">+ අලුත් පාඩමක් (Video/Link) එකතු කරන්න</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addSubject} className={`w-full py-4 border-2 border-dashed font-bold rounded-xl transition-colors ${isDarkMode ? 'border-slate-600 text-slate-400 hover:border-blue-500 hover:text-blue-400' : 'border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-500'}`}>+ අලුත් විෂයයක් (Subject) එකතු කරන්න</button>
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