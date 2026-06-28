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
          { id: "l1", title: "1 වන පාඩම - ශ්‍රී ලංකාවේ ඉතිහාසය", videoEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ", pdfUrl: "https://example.com/tute1.pdf" },
          { id: "l2", title: "2 වන පාඩම - භූගෝල විද්‍යාව", videoEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ", pdfUrl: "https://example.com/tute2.pdf" }
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
          { id: "l3", title: "1 වන පාඩම - සංඛ්‍යා රටා", videoEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ", pdfUrl: "https://example.com/tute3.pdf" }
        ]
      }
    ]
  };

  const [activeVideoUrl, setActiveVideoUrl] = useState<string>(courseData.subjects[0].lessons[0].videoEmbed);
  const [activeVideoTitle, setActiveVideoTitle] = useState<string>(courseData.subjects[0].lessons[0].title);
  const [activePdfUrl, setActivePdfUrl] = useState<string>(courseData.subjects[0].lessons[0].pdfUrl);

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) setIsDarkMode(true);
    
    const resolveParams = async () => {
      const resolved = await params;
      setCourseId(resolved.id);
    };
    resolveParams();
  }, [params]);

  const handleSubjectChange = (subId: string) => {
    setActiveSubjectId(subId);
    const selectedSub = courseData.subjects.find(s => s.id === subId);
    if (selectedSub && selectedSub.lessons.length > 0) {
      setActiveVideoUrl(selectedSub.lessons[0].videoEmbed);
      setActiveVideoTitle(selectedSub.lessons[0].title);
      setActivePdfUrl(selectedSub.lessons[0].pdfUrl);
    }
  };

  // --- Theme Classes ---
  const themeBg = isDarkMode ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-800";
  const headerBg = isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200";
  const cardBg = isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200";
  const textPrimary = isDarkMode ? "text-white" : "text-slate-900";
  const textSecondary = isDarkMode ? "text-slate-400" : "text-slate-500";
  const playlistActiveBg = isDarkMode ? "bg-blue-600/20 border-blue-500" : "bg-blue-50 border-blue-500";

  const handleJoinWhatsApp = () => {
    window.open(courseData.whatsappLink, "_blank", "noopener,noreferrer");
  };

  const handleJoinZoom = (link: string) => {
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const activeSubject = courseData.subjects.find((s) => s.id === activeSubjectId);

  // YouTube ආරක්ෂිත Parameters
  const getSecuredVideoUrl = (originalUrl: string) => {
    return `${originalUrl}?rel=0&modestbranding=1&showinfo=0&controls=1&disablekb=1&iv_load_policy=3&fs=0`;
  };

  return (
    <div className={`modern-font min-h-screen transition-colors duration-300 ${themeBg}`}>
      
      <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-md ${headerBg}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-2 md:gap-3">
            <button onClick={() => window.location.href = '/dashboard'} className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <h1 className={`text-base md:text-xl font-bold truncate max-w-[200px] sm:max-w-md md:max-w-lg ${textPrimary}`}>{courseData.title}</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 mt-2 md:mt-4">
        
        {/* --- WhatsApp & Zoom ලින්ක් තීරුව --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 md:mb-8">
          <div className={`flex items-center justify-between rounded-2xl p-4 border shadow-sm ${isDarkMode ? 'bg-emerald-900/10 border-emerald-800/30' : 'bg-emerald-50/60 border-emerald-100'}`}>
            <div className="flex items-center gap-3 truncate">
              <div className="bg-emerald-500 rounded-full p-2 text-white flex-shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.16 5.338 5.495 0 12.05 0a11.94 11.94 0 018.513 3.532 11.85 11.85 0 013.48 8.413c-.003 6.557-5.338 11.892-11.893 11.892-2.096-.002-4.142-.549-5.945-1.59L0 24zm6.305-1.654a9.92 9.92 0 005.683 1.448h.005c5.454 0 9.888-4.435 9.89-9.889a9.85 9.85 0 00-2.893-6.994A9.87 9.87 0 0012.05 1.958c-5.451 0-9.887 4.434-9.889 9.888 0 2.22.58 4.38 1.683 6.286l-.235.374-3.648.997 1.012-3.692-.361-.214a9.9 9.9 0 00-1.51-5.26c0 .01 0 0 0 0z"/></svg>
              </div>
              <div className="truncate">
                <h4 className="text-sm font-bold">WhatsApp Group</h4>
                <p className={`text-xs truncate ${textSecondary}`}>නිල නිවේදන ලබාගැනීමට</p>
              </div>
            </div>
            <button onClick={handleJoinWhatsApp} className="rounded-xl bg-emerald-500 text-white px-4 py-2 text-xs font-bold hover:bg-emerald-600 transition-all flex-shrink-0">Join</button>
          </div>

          {activeSubject && (
            <div className={`flex items-center justify-between rounded-2xl p-4 border shadow-sm ${isDarkMode ? 'bg-blue-900/10 border-blue-800/30' : 'bg-blue-50/60 border-blue-100'}`}>
              <div className="flex items-center gap-3 truncate">
                <div className="bg-blue-600 rounded-full p-2 text-white flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M21.378 12.012l-6.86-4.526a.5.5 0 00-.77.418v9.052a.5.5 0 00.77.418l6.86-4.526a.5.5 0 000-.836zM11 5H3a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2z"/></svg>
                </div>
                <div className="truncate">
                  <h4 className="text-sm font-bold">සජීවී Zoom පන්තිය</h4>
                  <p className={`text-xs truncate ${textSecondary}`}>{activeSubject.liveClass.time}</p>
                </div>
              </div>
              <button onClick={() => handleJoinZoom(activeSubject.liveClass.zoomLink)} className="rounded-xl bg-blue-600 text-white px-4 py-2 text-xs font-bold hover:bg-blue-700 transition-all flex-shrink-0">Zoom</button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
          
          {/* 🎬 [වම් පැත්ත] ප්‍රධාන වීඩියෝ ප්ලේයර් කොටස */}
          <div className="lg:col-span-2 space-y-4">
            
            <div className="aspect-video w-full bg-black relative rounded-xl md:rounded-2xl overflow-hidden shadow-lg select-none"
                 onContextMenu={(e) => e.preventDefault()}
            >
              {/* 1. සම්පූර්ණ ඉහළ තීරුවම වසන කළු ආවරණය (Responsive: 12% height) */}
              <div className="absolute top-0 left-0 w-full h-[12%] z-[999] bg-black pointer-events-none"></div>
              
              {/* 2. සම්පූර්ණ පහළ තීරුවම වසන කළු ආවරණය (Responsive: 12% height) - Watermark එක සහිතව */}
              <div className="absolute bottom-0 left-0 w-full h-[12%] z-[999] bg-black pointer-events-none flex items-center justify-end px-3 md:px-5">
                <span className="text-[10px] md:text-xs font-bold text-slate-500/80">20minutes.lk</span>
              </div>

              <iframe 
                src={getSecuredVideoUrl(activeVideoUrl)} 
                title={activeVideoTitle}
                className="w-full h-full relative z-0 pointer-events-auto"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              ></iframe>
            </div>

            {/* වීඩියෝවට යටින් මාතෘකාව සහ PDF බටන් එක */}
            <div className={`p-4 md:p-5 rounded-xl md:rounded-2xl border shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${cardBg}`}>
              <div className="truncate">
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-blue-500">දැන් ධාවනය වේ (Now Playing)</span>
                <h3 className={`text-sm md:text-lg font-bold mt-0.5 truncate ${textPrimary}`}>{activeVideoTitle}</h3>
              </div>
              <a 
                href={activePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 md:px-5 md:py-3 text-xs md:text-sm font-bold transition-all shadow-sm flex-shrink-0"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 16l-5-5h3V4h4v7h3l-5 5zm9-2v6H3v-6H1v8h22v-8h-2z"/></svg>
                Tute එක (PDF)
              </a>
            </div>
          </div>

          {/* 📑 [දකුණු පැත්ත] විෂයයන් සහ පාඩම් මාලා ලිස්ට් එක (Playlist) */}
          <div className={`rounded-xl md:rounded-2xl border p-4 shadow-sm h-[400px] md:h-[auto] md:max-h-[580px] overflow-y-auto ${cardBg}`}>
            <h3 className="text-xs md:text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-3">විෂයයන් තෝරන්න</h3>
            
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden border-b pb-3 dark:border-slate-700">
              {courseData.subjects.map((subject) => (
                <button 
                  key={subject.id}
                  onClick={() => handleSubjectChange(subject.id)}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[11px] md:text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                    activeSubjectId === subject.id 
                      ? "bg-blue-600 text-white shadow-sm" 
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {subject.name}
                </button>
              ))}
            </div>

            <h3 className="text-xs md:text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-3">පාඩම් ලැයිස්තුව (Playlist)</h3>
            
            <div className="space-y-2 md:space-y-2.5">
              {activeSubject?.lessons.map((lesson, index) => {
                const isActive = activeVideoUrl === lesson.videoEmbed;
                return (
                  <div 
                    key={lesson.id}
                    onClick={() => {
                      setActiveVideoUrl(lesson.videoEmbed);
                      setActiveVideoTitle(lesson.title);
                      setActivePdfUrl(lesson.pdfUrl);
                    }}
                    className={`flex items-start gap-2.5 md:gap-3 p-2.5 md:p-3 rounded-lg md:rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${
                      isActive 
                        ? playlistActiveBg 
                        : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className={`w-5 h-5 md:w-6 md:h-6 rounded-md md:rounded-lg flex items-center justify-center font-bold text-[10px] md:text-xs flex-shrink-0 mt-0.5 ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                      {index + 1}
                    </div>
                    <div className="truncate flex-grow">
                      <p className={`text-xs md:text-sm font-bold truncate ${isActive ? 'text-blue-600 dark:text-blue-400' : textPrimary}`}>
                        {lesson.title}
                      </p>
                      <p className="text-[9px] md:text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <span>▶ Recorded Lesson</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}