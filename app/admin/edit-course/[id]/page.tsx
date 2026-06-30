"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  liveClass: {
    time: string;
    zoomLink: string;
  };
  lessons: Lesson[];
};

type CourseDataType = {
  _id?: string;
  title: string;
  whatsappLink: string;
  subjects: Subject[];
};

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export default function EditCoursePage({ params }: PageProps) {
  const router = useRouter();
  const [courseId, setCourseId] = useState<string>("");
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // State
  const [courseData, setCourseData] = useState<CourseDataType>({
    title: "",
    whatsappLink: "",
    subjects: [],
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
          setCourseData(data.data);
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

  // --- Functions ---
  const addSubject = () => {
    setCourseData({
      ...courseData,
      subjects: [
        ...courseData.subjects,
        { subjectId: "sub_" + Date.now(), name: "", liveClass: { time: "", zoomLink: "" }, lessons: [] }
      ]
    });
  };

  const removeSubject = (indexToRemove: number) => {
    const confirmDelete = window.confirm("මෙම විෂය සහ එහි ඇති සියලුම පාඩම් මකා දැමීමට අවශ්‍ය බව විශ්වාසද?");
    if (!confirmDelete) return;
    
    const updatedSubjects = courseData.subjects.filter((_, index) => index !== indexToRemove);
    setCourseData({ ...courseData, subjects: updatedSubjects });
  };

  const addLesson = (subjectIndex: number) => {
    const updatedSubjects = [...courseData.subjects];
    updatedSubjects[subjectIndex].lessons.push({
      lessonId: "les_" + Date.now(),
      title: "",
      videoEmbed: "",
      pdfUrl: ""
    });
    setCourseData({ ...courseData, subjects: updatedSubjects });
  };

  const removeLesson = (subjectIndex: number, lessonIndexToRemove: number) => {
    const updatedSubjects = [...courseData.subjects];
    updatedSubjects[subjectIndex].lessons = updatedSubjects[subjectIndex].lessons.filter((_, index) => index !== lessonIndexToRemove);
    setCourseData({ ...courseData, subjects: updatedSubjects });
  };

  // 2. වෙනස් කළ දත්ත Database එකට යවා Update (PUT) කිරීම
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
        // තත්පර 2කින් පසුව ආපසු Dashboard එකට යාම
        setTimeout(() => {
          router.push("/admin");
        }, 2000);
      } else {
        setMessage({ type: "error", text: "❌ දෝෂයක්: " + data.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "❌ පද්ධතියේ දෝෂයක් ඇතිවිය." });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">දත්ත ලබාගනිමින් පවතී...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 modern-font text-slate-800">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">
            පාඨමාලාව වෙනස් කිරීම (Edit Course)
          </h1>
          <Link href="/admin" className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors bg-slate-100 px-4 py-2 rounded-lg">
            &larr; ආපසු Dashboard එකට
          </Link>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl font-bold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 1. ප්‍රධාන පාඨමාලා විස්තර */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-700">1. ප්‍රධාන විස්තර</h2>
            <div>
              <label className="block text-sm font-bold mb-2">පාඨමාලාවේ නම *</label>
              <input 
                type="text" required
                value={courseData.title}
                onChange={(e) => setCourseData({...courseData, title: e.target.value})}
                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">WhatsApp Group Link</label>
              <input 
                type="url" 
                value={courseData.whatsappLink}
                onChange={(e) => setCourseData({...courseData, whatsappLink: e.target.value})}
                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* 2. විෂයයන් සහ පාඩම් */}
          <div>
            <h2 className="text-lg font-bold text-slate-700 mb-4">2. විෂයයන් (Subjects) සහ පාඩම් (Lessons)</h2>
            
            {courseData.subjects.map((subject, sIndex) => (
              <div key={subject.subjectId} className="bg-white border-2 border-blue-100 p-6 rounded-xl mb-6 shadow-sm relative group">
                
                {/* විෂය මකා දැමීමේ බොත්තම */}
                <button 
                  type="button" onClick={() => removeSubject(sIndex)}
                  className="absolute -top-3 -right-3 bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-600 hover:text-white transition shadow-sm border border-red-200"
                  title="මෙම විෂය මකන්න"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-bold mb-2">විෂයයේ නම *</label>
                    <input 
                      type="text" required
                      value={subject.name}
                      onChange={(e) => {
                        const updated = [...courseData.subjects];
                        updated[sIndex].name = e.target.value;
                        setCourseData({...courseData, subjects: updated});
                      }}
                      className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Live Class වෙලාව</label>
                    <input 
                      type="text" 
                      value={subject.liveClass?.time || ""}
                      onChange={(e) => {
                        const updated = [...courseData.subjects];
                        if(!updated[sIndex].liveClass) updated[sIndex].liveClass = { time: "", zoomLink: "" };
                        updated[sIndex].liveClass.time = e.target.value;
                        setCourseData({...courseData, subjects: updated});
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold mb-2">Zoom Link එක</label>
                    <input 
                      type="url" 
                      value={subject.liveClass?.zoomLink || ""}
                      onChange={(e) => {
                        const updated = [...courseData.subjects];
                        if(!updated[sIndex].liveClass) updated[sIndex].liveClass = { time: "", zoomLink: "" };
                        updated[sIndex].liveClass.zoomLink = e.target.value;
                        setCourseData({...courseData, subjects: updated});
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                </div>

                {/* අදාළ විෂයයේ පාඩම් ටික */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-600 mb-4 border-b pb-2">පාඩම් ලැයිස්තුව</h3>
                  
                  {subject.lessons.map((lesson, lIndex) => (
                    <div key={lesson.lessonId} className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4 bg-white p-3 rounded-lg border relative pr-10">
                      
                      <button 
                        type="button" onClick={() => removeLesson(sIndex, lIndex)}
                        className="absolute top-1/2 -translate-y-1/2 right-2 text-red-400 hover:text-red-600 p-1 bg-red-50 hover:bg-red-100 rounded-md transition"
                        title="පාඩම මකන්න"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>

                      <div className="md:col-span-4">
                        <label className="block text-[10px] font-bold mb-1 text-slate-500">පාඩමේ මාතෘකාව *</label>
                        <input 
                          type="text" required
                          value={lesson.title}
                          onChange={(e) => {
                            const updated = [...courseData.subjects];
                            updated[sIndex].lessons[lIndex].title = e.target.value;
                            setCourseData({...courseData, subjects: updated});
                          }}
                          className="w-full p-2 rounded-lg border text-sm"
                        />
                      </div>
                      <div className="md:col-span-4">
                        <label className="block text-[10px] font-bold mb-1 text-slate-500">YouTube Embed Link *</label>
                        <input 
                          type="url" required
                          value={lesson.videoEmbed}
                          onChange={(e) => {
                            const updated = [...courseData.subjects];
                            updated[sIndex].lessons[lIndex].videoEmbed = e.target.value;
                            setCourseData({...courseData, subjects: updated});
                          }}
                          className="w-full p-2 rounded-lg border text-sm"
                        />
                      </div>
                      <div className="md:col-span-4">
                        <label className="block text-[10px] font-bold mb-1 text-slate-500">Tute (PDF) Link</label>
                        <input 
                          type="url" 
                          value={lesson.pdfUrl}
                          onChange={(e) => {
                            const updated = [...courseData.subjects];
                            updated[sIndex].lessons[lIndex].pdfUrl = e.target.value;
                            setCourseData({...courseData, subjects: updated});
                          }}
                          className="w-full p-2 rounded-lg border text-sm"
                        />
                      </div>
                    </div>
                  ))}

                  <button 
                    type="button" 
                    onClick={() => addLesson(sIndex)}
                    className="mt-2 text-xs md:text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold hover:bg-blue-200 transition"
                  >
                    + අලුත් පාඩමක් එකතු කරන්න
                  </button>
                </div>

              </div>
            ))}

            <button 
              type="button" 
              onClick={addSubject}
              className="w-full py-3 border-2 border-dashed border-slate-300 text-slate-500 font-bold rounded-xl hover:border-blue-400 hover:text-blue-500 transition-colors"
            >
              + අලුත් විෂයයක් (Subject) එකතු කරන්න
            </button>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-blue-700 transition shadow-lg disabled:bg-slate-400 flex items-center justify-center gap-2"
          >
            {isLoading ? "Update වෙමින් පවතී..." : <><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Update කරන්න (Save Changes)</>}
          </button>

        </form>
      </div>
    </div>
  );
}