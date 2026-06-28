"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export default function CoursePlayerPage({ params }: PageProps) {
  const { data: session } = useSession();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeSubjectId, setActiveSubjectId] = useState<string>("sub1");
  const [courseId, setCourseId] = useState<string>("");

  // Next.js 版本 Compatibility (Build Error මඟහැරවීමට)
  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) setIsDarkMode(true);
    
    const resolveParams = async () => {
      const resolved = await params;
      setCourseId(resolved.id);
    };
    resolveParams();
  }, [params]);

  // --- Theme Classes ---
  const themeBg = isDarkMode ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-800";
  const headerBg = isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200";
  const cardBg = isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200";
  const textPrimary = isDarkMode ? "text-white" : "text-slate-900";
  const textSecondary = isDarkMode ? "text-slate-400" : "text-slate-500";

  // --- තාවකාලික පාඨමාලා දත්ත ---
  const courseData = {
    title: "තරග විභාග - සාමාන්‍ය දැනීම සහ IQ සම්පූර්ණ පාඨමාලාව",
    whatsappLink: "https://chat.whatsapp.com/your-hidden-invite-link", 
    subjects: [
      {
        id: "sub1",
        name: "සාමාන්‍ය දැනීම (GK)",
        liveClass: {
          time: "සෑම ඉරිදාවකම රාත්‍රී 8:00 ට",
          zoomLink: "https://zoom.us/j/123456789"
        },
        lessons: [
          { id: "l1", title: "1 වන පාඩම - ශ්‍රී ලංකාවේ ඉතිහාසය", videoEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ", pdfUrl: "#" },
          { id: "l2", title: "2 වන පාඩම - භූගෝල විද්‍යාව", videoEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ", pdfUrl: "#" }
        ]
      },
      {
        id: "sub2",
        name: "බුද්ධි පරීක්ෂණය (IQ)",
        liveClass: {
          time: "සෑම බදාදාවකම රාත්‍රී 7:30 ට",
          zoomLink: "https://zoom.us/j/987654321"
        },
        lessons: [
          { id: "l3", title: "1 වන පාඩම - සංඛ්‍යා රටා", videoEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ", pdfUrl: "#" }
        ]
      }
    ]
  };

  const handleJoinWhatsApp = () => {
    window.open(courseData.whatsappLink, "_blank", "noopener,noreferrer");
  };

  const handleJoinZoom = (link: string) => {
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const activeSubject = courseData.subjects.find((s) => s.id === activeSubjectId);

  // YouTube ආරක්ෂිත Parameters එකතු කිරීම
  const getSecuredVideoUrl = (originalUrl: string) => {
    return `${originalUrl}?rel=0&modestbranding=1&showinfo=0&controls=1&disablekb=1&iv_load_policy=3`;
  };

  return (
    <div className={`modern-font min-h-screen transition-colors duration-300 ${themeBg}`}>
      
      {/* Header */}
      <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-md ${headerBg}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => window.location.href = '/dashboard'} className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <h1 className={`text-lg md:text-xl font-bold truncate ${textPrimary}`}>{courseData.title}</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 mt-4">
        
        {/* WhatsApp Banner */}
        <div className={`mb-8 flex flex-col md:flex-row items-center justify-between rounded-2xl p-6 border shadow-sm ${isDarkMode ? 'bg-emerald-900/20 border-emerald-800/30' : 'bg-emerald-50 border-emerald-100'}`}>
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="bg-emerald-500 rounded-full p-3 shadow-md flex-shrink-0">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            </div>
            <div>
              <h2 className={`text-lg font-bold ${textPrimary}`}>නිල WhatsApp සමූහයට සම්බන්ධ වන්න</h2>
              <p className={`text-sm ${textSecondary}`}>සියලුම නිවේදන, Tutes සහ පන්ති වෙලාවන් සමූහයට එවනු ලැබේ.</p>
            </div>
          </div>
          <button 
            onClick={handleJoinWhatsApp}
            className="w-full md:w-auto rounded-full bg-emerald-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-emerald-600 hover:-translate-y-1 transition-all duration-300"
          >
            සමූහයට එක්වන්න (Join Group)
          </button>
        </div>

        {/* Subjects Tabs */}
        <div className="mb-8 flex space-x-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden border-b border-slate-200 dark:border-slate-800">
          {courseData.subjects.map((subject) => (
            <button 
              key={subject.id} 
              onClick={() => setActiveSubjectId(subject.id)} 
              className={`px-6 py-3 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
                activeSubjectId === subject.id 
                  ? "border-blue-600 text-blue-600 dark:text-blue-400" 
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {subject.name}
            </button>
          ))}
        </div>

        {activeSubject && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Live Class Card */}
            <div className={`mb-8 flex flex-col md:flex-row items-center justify-between rounded-2xl p-6 border shadow-sm ${isDarkMode ? 'bg-blue-900/10 border-blue-800/30' : 'bg-blue-50 border-blue-100'}`}>
              <div className="flex flex-col mb-4 md:mb-0">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-1">Live Class (සජීවී පන්තිය)</span>
                <h3 className={`text-lg font-bold ${textPrimary}`}>වේලාව: {activeSubject.liveClass.time}</h3>
              </div>
              <button 
                onClick={() => handleJoinZoom(activeSubject.liveClass.zoomLink)}
                className="w-full md:w-auto flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-blue-700 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M21.378 12.012l-6.86-4.526a.5.5 0 00-.77.418v9.052a.5.5 0 00.77.418l6.86-4.526a.5.5 0 000-.836z"/><path d="M11 5H3a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2z"/></svg>
                Zoom පන්තියට යන්න
              </button>
            </div>

            {/* Recorded Lessons List */}
            <h2 className={`mb-6 text-xl font-bold border-l-4 border-slate-500 pl-3 ${textPrimary}`}>පටිගත කළ පාඩම් (Recorded Lessons)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {activeSubject.lessons.map((lesson) => (
                <div key={lesson.id} className={`flex flex-col overflow-hidden rounded-2xl border shadow-sm ${cardBg}`}>
                  
                  {/* --- 🛡️ ආරක්ෂිත වීඩියෝ ප්ලේයර් කොටස --- */}
                  <div 
                    className="aspect-video w-full bg-black relative overflow-hidden select-none"
                    onContextMenu={(e) => {
                      e.preventDefault();
                      alert("ආරක්ෂාව හේතුවෙන් මෙහි Right-click කිරීම තහනම් කර ඇත.");
                    }}
                  >
                    {/* 1. Share බටන් එක වසන ඉහළ දකුණු විනිවිද පෙනෙන ආවරණය */}
                    <div className="absolute top-0 right-0 w-[40%] h-[25%] bg-transparent z-10 cursor-default" />
                    
                    {/* 2. YouTube ලෝගෝ එක වසන පහළ දකුණු විනිවිද පෙනෙන ආවරණය */}
                    <div className="absolute bottom-0 right-0 w-[25%] h-[20%] bg-transparent z-10 cursor-default" />

                    <iframe 
                      src={getSecuredVideoUrl(lesson.videoEmbed)} 
                      title={lesson.title}
                      className="w-full h-full z-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  </div>
                  
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className={`text-lg font-bold mb-4 ${textPrimary}`}>{lesson.title}</h3>
                    <div className="mt-auto">
                      <a 
                        href={lesson.pdfUrl} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-bold transition-colors border ${isDarkMode ? 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                      >
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 16l-5-5h3V4h4v7h3l-5 5zm9-2v6H3v-6H1v8h22v-8h-2z"/></svg>
                        Tute එක Download කරන්න (PDF)
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}