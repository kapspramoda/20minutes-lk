"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export default function CoursePlayerPage({ params }: PageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [course, setCourse] = useState<any>(null); // Database එකෙන් එන දත්ත
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const [activeSubjectId, setActiveSubjectId] = useState<string>("");
  const [activeVideoUrl, setActiveVideoUrl] = useState<string>("");
  const [activeVideoTitle, setActiveVideoTitle] = useState<string>("");
  const [activePdfUrl, setActivePdfUrl] = useState<string>("");

  const playerRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(100);

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) setIsDarkMode(true);
  }, []);

  // --- 🛡️ ආරක්ෂක පරීක්ෂාව සහ Database දත්ත ගෙන ඒම ---
  useEffect(() => {
    // 1. ලොග් වී නැත්නම් ඉවත් කිරීම
    if (status === "unauthenticated") {
      router.push("/dashboard");
      return;
    }

    const verifyAccessAndFetchCourse = async () => {
      if (status !== "authenticated") return;

      try {
        const resolvedParams = await params;
        const currentCourseId = resolvedParams.id;
        const userPhone = (session?.user as any)?.phone || session?.user?.name || session?.user?.email;

        // 2. ළමයාගේ ගිණුමේ අනුමත වූ (Approved) පාඨමාලා මොනවාදැයි පරීක්ෂා කිරීම
        const accessRes = await fetch(`/api/student/courses?phone=${userPhone}`);
        const accessData = await accessRes.json();

        // ළමයාගේ approved ලැයිස්තුවේ මේ URL එකේ තියෙන Course ID එක තියෙනවද බලනවා
        const isApproved = accessData.approvedCourses?.some((c: any) => c.courseId === currentCourseId || c._id === currentCourseId);

        if (!isApproved) {
          alert("🚫 ඔබට මෙම පාඨමාලාව නැරඹීමට අවසර නොමැත. කරුණාකර මුදල් ගෙවා අනුමැතිය ලබාගන්න.");
          router.push("/dashboard");
          return;
        }

        // 3. අවසරය ඇත්නම් පමණක් පාඨමාලාවේ වීඩියෝ/පාඩම් විස්තර Database එකෙන් ගෙන ඒම
        const courseRes = await fetch(`/api/courses/${currentCourseId}`);
        const courseDataRes = await courseRes.json();

        if (courseDataRes.success) {
          const fetchedCourse = courseDataRes.data;
          setCourse(fetchedCourse);
          setHasAccess(true);

          // පළමු විෂයයේ පළමු පාඩම ඉබේම ප්ලේ වීමට සැකසීම
          if (fetchedCourse.subjects && fetchedCourse.subjects.length > 0) {
            const firstSub = fetchedCourse.subjects[0];
            setActiveSubjectId(firstSub.subjectId || firstSub._id);
            
            if (firstSub.lessons && firstSub.lessons.length > 0) {
              setActiveVideoUrl(firstSub.lessons[0].videoEmbed);
              setActiveVideoTitle(firstSub.lessons[0].title);
              setActivePdfUrl(firstSub.lessons[0].pdfUrl);
            }
          }
        } else {
          alert("පාඨමාලාව සොයාගැනීමට නොහැක!");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("දෝෂයක් මතු විය:", error);
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    verifyAccessAndFetchCourse();
  }, [status, session, params, router]);


  const handleSubjectChange = (subId: string) => {
    setActiveSubjectId(subId);
    const selectedSub = course?.subjects?.find((s: any) => (s.subjectId || s._id) === subId);
    if (selectedSub && selectedSub.lessons && selectedSub.lessons.length > 0) {
      setActiveVideoUrl(selectedSub.lessons[0].videoEmbed);
      setActiveVideoTitle(selectedSub.lessons[0].title);
      setActivePdfUrl(selectedSub.lessons[0].pdfUrl);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  // Theme Classes
  const themeBg = isDarkMode ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-800";
  const headerBg = isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200";
  const cardBg = isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200";
  const textPrimary = isDarkMode ? "text-white" : "text-slate-900";
  const textSecondary = isDarkMode ? "text-slate-400" : "text-slate-500";
  const playlistActiveBg = isDarkMode ? "bg-blue-600/20 border-blue-500" : "bg-blue-50 border-blue-500";

  const getSecuredVideoUrl = (originalUrl: string) => {
    if(!originalUrl) return "";
    return `${originalUrl}?rel=0&modestbranding=1&showinfo=0&controls=1&disablekb=1&iv_load_policy=3&fs=0&enablejsapi=1`;
  };

  const sendYouTubeCommand = (func: string, args: any[] = []) => {
    if (playerRef.current && playerRef.current.contentWindow) {
      playerRef.current.contentWindow.postMessage(JSON.stringify({ event: "command", func: func, args: args }), "*");
    }
  };

  const handleToggleMute = () => {
    if (isMuted) { sendYouTubeCommand("unMute"); setIsMuted(false); } 
    else { sendYouTubeCommand("mute"); setIsMuted(true); }
  };

  const handleVolumeDown = () => {
    const newVol = Math.max(volumeLevel - 10, 0);
    setVolumeLevel(newVol);
    sendYouTubeCommand("setVolume", [newVol]);
    if (newVol === 0) { sendYouTubeCommand("mute"); setIsMuted(true); }
  };

  const handleVolumeUp = () => {
    const newVol = Math.min(volumeLevel + 10, 100);
    setVolumeLevel(newVol);
    sendYouTubeCommand("setVolume", [newVol]);
    if (isMuted) { sendYouTubeCommand("unMute"); setIsMuted(false); }
  };

  const toggleFullScreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      try { if (screen.orientation && (screen.orientation as any).lock) (screen.orientation as any).lock("landscape").catch(() => {}); } catch (e) {}
    } else {
      setIsFullscreen(false);
      try { if (screen.orientation && (screen.orientation as any).unlock) (screen.orientation as any).unlock(); } catch (e) {}
    }
  };

  // Loading Screen
  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${themeBg}`}>
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-lg text-slate-500">පාඨමාලාවේ ආරක්ෂාව තහවුරු කරමින් පවතී...</p>
      </div>
    );
  }

  // අනුමැතිය නැත්නම් කිසිවක් පෙන්වන්නේ නැත (Redirect වන බැවින්)
  if (!hasAccess || !course) return null;

  const activeSubject = course.subjects?.find((s: any) => (s.subjectId || s._id) === activeSubjectId);

  return (
    <div className={`modern-font min-h-screen transition-colors duration-300 ${themeBg}`}>
      
      <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-md ${headerBg}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-2 md:gap-3">
            <button onClick={() => router.push('/dashboard')} className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <h1 className={`text-base md:text-xl font-bold truncate max-w-[200px] sm:max-w-md md:max-w-lg ${textPrimary}`}>{course.title}</h1>
          </div>
          
          <div className="flex items-center flex-shrink-0">
            <button onClick={toggleTheme} className={`rounded-full p-2 transition-colors focus:outline-none ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 mt-2 md:mt-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 md:mb-8">
          {/* WhatsApp Banner */}
          {course.whatsappLink && (
            <div className={`flex items-center justify-between rounded-2xl p-4 border shadow-sm ${isDarkMode ? 'bg-emerald-900/10 border-emerald-800/30' : 'bg-emerald-50/60 border-emerald-100'}`}>
              <div className="flex items-center gap-3 truncate">
                <div className="bg-[#25D366] rounded-full p-2.5 text-white flex-shrink-0 shadow-sm">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.383 0 12.032c0 2.128.552 4.195 1.6 6.012L.15 24l6.105-1.597A11.964 11.964 0 0012.031 24c6.643 0 12.032-5.385 12.032-12.032C24.063 5.383 18.674 0 12.031 0zm7.143 17.15c-.302.854-1.745 1.622-2.42 1.706-.527.067-1.196.126-3.414-.795-2.65-1.1-4.329-3.82-4.46-3.993-.134-.176-1.066-1.423-1.066-2.715 0-1.291.674-1.93 9.17-2.18.232-.174.526-.298.777-.074.251.222.79 1.107.962 1.328.172.222.155.397-.094.646-.248.248-.567.58-.826.855-.276.294-.567.616-.251 1.157.316.541 1.405 2.321 3.003 3.766 2.062 1.865 3.864 2.457 4.417 2.712.553.254.877.206 1.206-.178.328-.383 1.41-1.642 1.79-2.204.381-.564.76-.469 1.258-.293.498.177 3.153 1.488 3.693 1.754.541.266.903.398 1.036.621.132.222.132 1.288-.17 2.143z" /></svg>
                </div>
                <div className="truncate">
                  <h4 className="text-sm font-bold">WhatsApp Group</h4>
                  <p className={`text-xs truncate ${textSecondary}`}>නිල නිවේදන ලබාගැනීමට</p>
                </div>
              </div>
              <button onClick={() => window.open(course.whatsappLink, "_blank")} className="rounded-xl bg-[#25D366] text-white px-4 py-2 text-xs font-bold hover:bg-[#20b858] transition-all flex-shrink-0 shadow-sm">Join</button>
            </div>
          )}

          {/* Zoom Class Banner */}
          {activeSubject?.liveClass?.zoomLink && (
            <div className={`flex items-center justify-between rounded-2xl p-4 border shadow-sm ${isDarkMode ? 'bg-blue-900/10 border-blue-800/30' : 'bg-blue-50/60 border-blue-100'}`}>
              <div className="flex items-center gap-3 truncate">
                <div className="bg-[#2D8CFF] rounded-full p-2.5 text-white flex-shrink-0 shadow-sm">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.064 7.604a1.442 1.442 0 00-1.428.169l-2.915 1.943v-2.3a1.944 1.944 0 00-1.943-1.943H2.943A1.944 1.944 0 001 7.417v9.166A1.944 1.944 0 002.943 18.53h7.835a1.944 1.944 0 001.943-1.943v-2.3l2.915 1.943a1.44 1.44 0 002.264-1.196V9.166a1.44 1.44 0 00-1.836-1.162z" /></svg>
                </div>
                <div className="truncate">
                  <h4 className="text-sm font-bold">සජීවී Zoom පන්තිය</h4>
                  <p className={`text-xs truncate ${textSecondary}`}>{activeSubject.liveClass.time}</p>
                </div>
              </div>
              <button onClick={() => window.open(activeSubject.liveClass.zoomLink, "_blank")} className="rounded-xl bg-[#2D8CFF] text-white px-4 py-2 text-xs font-bold hover:bg-[#257ae0] transition-all flex-shrink-0 shadow-sm">Zoom</button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
          
          <div className="lg:col-span-2 space-y-4">
            
            <div className={
                  isFullscreen 
                  ? "fixed inset-0 z-[99999] bg-black w-screen h-[100dvh] flex flex-col justify-center select-none" 
                  : "aspect-video w-full bg-black relative rounded-xl md:rounded-2xl overflow-hidden shadow-lg select-none"
                }
                 onContextMenu={(e) => e.preventDefault()}
            >
              
              {isFullscreen && (
                <button 
                  onClick={toggleFullScreen} 
                  className="absolute top-4 right-4 z-[1000] bg-white/20 p-2 rounded-full text-white hover:bg-white/40 border border-white/30 backdrop-blur-sm transition-all"
                  title="Close Fullscreen"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}

              <div className="relative w-full h-full flex-grow">
                <div className="absolute top-0 left-0 w-full h-[65px] md:h-[75px] z-[999] bg-black pointer-events-none"></div>
                
                <div className="absolute bottom-0 left-0 w-full h-[60px] md:h-[65px] z-[999] bg-black pointer-events-none flex items-center justify-end px-3 md:px-5">
                  <span className="text-[10px] md:text-xs font-bold text-slate-500/80 mb-2 mr-1">20minutes.lk</span>
                </div>

                {activeVideoUrl ? (
                  <iframe 
                    ref={playerRef}
                    src={getSecuredVideoUrl(activeVideoUrl)} 
                    title={activeVideoTitle}
                    className="w-full h-full relative z-0 pointer-events-auto"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">වීඩියෝවක් තෝරා නොමැත</div>
                )}
              </div>
            </div>

            <div className={`p-4 md:p-5 rounded-xl md:rounded-2xl border shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 ${cardBg}`}>
              <div className="truncate">
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-blue-500">දැන් ධාවනය වේ (Now Playing)</span>
                <h3 className={`text-sm md:text-lg font-bold mt-0.5 truncate ${textPrimary}`}>{activeVideoTitle || "පාඩමක් තෝරන්න"}</h3>
              </div>
              
              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                
                <div className={`flex items-center rounded-xl border overflow-hidden shadow-sm flex-shrink-0 ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-slate-100 border-slate-300'}`}>
                  <button onClick={handleVolumeDown} title="Sound අඩු කරන්න" className={`px-3 py-2.5 md:py-3 transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-200 text-slate-700'}`}>
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 12H6" /></svg>
                  </button>
                  <button onClick={handleToggleMute} title={isMuted ? "Sound දාන්න" : "Mute කරන්න"} className={`px-3 py-2.5 md:py-3 transition-colors border-x ${isDarkMode ? 'hover:bg-slate-700 border-slate-600' : 'hover:bg-slate-200 border-slate-300'}`}>
                    {isMuted ? (
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                    ) : (
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                    )}
                  </button>
                  <button onClick={handleVolumeUp} title="Sound වැඩි කරන්න" className={`px-3 py-2.5 md:py-3 transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-200 text-slate-700'}`}>
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </button>
                </div>

                <button 
                  onClick={toggleFullScreen}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 md:px-5 md:py-3 text-xs md:text-sm font-bold transition-all shadow-sm flex-shrink-0 ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white hover:bg-slate-700' : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'}`}
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                  Full Screen
                </button>

                {activePdfUrl && (
                  <a 
                    href={activePdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 md:px-5 md:py-3 text-xs md:text-sm font-bold transition-all shadow-sm flex-shrink-0"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 16l-5-5h3V4h4v7h3l-5 5zm9-2v6H3v-6H1v8h22v-8h-2z"/></svg>
                    Tute එක (PDF)
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className={`rounded-xl md:rounded-2xl border p-4 shadow-sm h-[400px] md:h-[auto] md:max-h-[580px] overflow-y-auto ${cardBg}`}>
            <h3 className="text-xs md:text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-3">විෂයයන් තෝරන්න</h3>
            
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden border-b pb-3 dark:border-slate-700">
              {course.subjects?.map((subject: any) => (
                <button 
                  key={subject._id || subject.subjectId}
                  onClick={() => handleSubjectChange(subject.subjectId || subject._id)}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[11px] md:text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                    activeSubjectId === (subject.subjectId || subject._id)
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
              {activeSubject?.lessons?.length > 0 ? (
                activeSubject.lessons.map((lesson: any, index: number) => {
                  const isActive = activeVideoUrl === lesson.videoEmbed;
                  return (
                    <div 
                      key={lesson.lessonId || lesson._id}
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
                })
              ) : (
                <p className="text-sm text-slate-400 font-bold text-center mt-6">දැනට පාඩම් කිසිවක් එක් කර නොමැත.</p>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}