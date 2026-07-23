"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link"; 

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export default function CoursePlayerPage({ params }: PageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [courseId, setCourseId] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [course, setCourse] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [courseQuizzes, setCourseQuizzes] = useState<any[]>([]);
  const [activeSubjectId, setActiveSubjectId] = useState<string>("");
  const [activeVideoUrl, setActiveVideoUrl] = useState<string>("");
  const [activeVideoTitle, setActiveVideoTitle] = useState<string>("");
  const [activePdfUrl, setActivePdfUrl] = useState<string>("");

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(100);

  // 🔴 Custom Player States
  const ytPlayerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setCourseId(resolved.id);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) setIsDarkMode(true);
  }, []);

  // Security Check
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const checkSession = async () => {
      if (status !== "authenticated" || !session?.user) return;
      const phone = (session.user as any).phone || session.user.name || session.user.email;
      const sessionId = (session.user as any).sessionId;
      if (!phone || !sessionId) return;
      try {
        const res = await fetch("/api/student/check-device", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, currentSessionId: sessionId }),
          cache: "no-store"
        });
        const data = await res.json();
        if (data.logout) {
          alert("⚠️ ඔබගේ ගිණුම වෙනත් උපාංගයකින් ලොග් වී ඇත. වීඩියෝ නැරඹීම නතර කර ඔබව ඉවත් කෙරේ.");
          signOut({ callbackUrl: "/" });
        }
      } catch (error) { console.error("Session check failed", error); }
    };

    if (status === "authenticated") {
      checkSession();
      interval = setInterval(checkSession, 15000);
      window.addEventListener("focus", checkSession);
      window.addEventListener("visibilitychange", () => {
        if (document.visibilityState === 'visible') checkSession();
      });
    }
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", checkSession);
      window.removeEventListener("visibilitychange", checkSession);
    };
  }, [status, session]);

  // Database දත්ත ගෙන ඒම
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/dashboard");
      return;
    }

    const verifyAccessAndFetchCourse = async () => {
      if (status !== "authenticated" || !courseId) return;

      try {
        const userPhone = (session?.user as any)?.phone || session?.user?.name || session?.user?.email;
        const accessRes = await fetch(`/api/student/courses?phone=${userPhone}`);
        const accessData = await accessRes.json();
        const isApproved = accessData.approvedCourses?.some((c: any) => c.courseId === courseId || c._id === courseId);

        if (!isApproved) {
          alert("🚫 ඔබට මෙම පාඨමාලාව නැරඹීමට අවසර නොමැත.");
          router.push("/dashboard");
          return;
        }

        const courseRes = await fetch(`/api/courses/${courseId}`);
        const courseDataRes = await courseRes.json();

        if (courseDataRes.success) {
          const fetchedCourse = courseDataRes.data;
          setCourse(fetchedCourse);
          setHasAccess(true);

          if (fetchedCourse.subjects && fetchedCourse.subjects.length > 0) {
            const firstSub = fetchedCourse.subjects[0];
            setActiveSubjectId(firstSub.subjectId || firstSub._id);
            if (firstSub.lessons && firstSub.lessons.length > 0) {
              setActiveVideoUrl(firstSub.lessons[0].videoEmbed || "");
              setActiveVideoTitle(firstSub.lessons[0].title || "");
              setActivePdfUrl(firstSub.lessons[0].pdfUrl || "");
            }
          }
        } else {
          setErrorMsg("පාඨමාලාව සොයාගැනීමට නොහැක!");
          return;
        }

        try {
          const quizRes = await fetch(`/api/student/quizzes/course/${courseId}`);
          if (quizRes.ok) {
            const quizData = await quizRes.json();
            if (quizData.success) setCourseQuizzes(quizData.data);
          }
        } catch (quizError) {}

      } catch (error: any) {
        setErrorMsg("දත්ත ලබාගැනීමේදී දෝෂයක් මතු විය: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    verifyAccessAndFetchCourse();
  }, [status, session, courseId, router]);


  // 🔴 අලුත්: දෝෂ රහිත YouTube API ක්‍රියාවලිය
  const getYoutubeId = (url: string) => {
    if(!url) return null;
    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(ytRegex);
    return match ? match[1] : null;
  };

  useEffect(() => {
    const ytId = getYoutubeId(activeVideoUrl);
    if (!ytId) return;

    const initPlayer = () => {
      // 1. ප්ලේයරය දැනටමත් සාදා ඇත්නම්, අලුත් වීඩියෝව එයටම Load කිරීම (මෙමඟින් වීඩියෝ මාරු වීමේ දෝෂය නැතිවේ)
      if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
        ytPlayerRef.current.loadVideoById(ytId);
        setIsPlaying(false);
        setCurrentTime(0);
        return;
      }

      // 2. Container එක නොමැති නම් නවතින්න
      if (!document.getElementById('yt-player-container')) return;

      // 3. අලුතින්ම ප්ලේයරය සෑදීම
      if ((window as any).YT && (window as any).YT.Player) {
        ytPlayerRef.current = new (window as any).YT.Player('yt-player-container', {
          videoId: ytId,
          playerVars: {
            controls: 0,
            disablekb: 1,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            fs: 0,
            playsinline: 1,
            iv_load_policy: 3
          },
          events: {
            onReady: (event: any) => {
              setDuration(event.target.getDuration());
              event.target.setVolume(volumeLevel);
              if (isMuted) event.target.mute();
              event.target.setPlaybackRate(playbackSpeed);
            },
            onStateChange: (event: any) => {
              if (event.data === (window as any).YT.PlayerState.PLAYING) {
                setIsPlaying(true);
                setDuration(event.target.getDuration());
              } else if (
                event.data === (window as any).YT.PlayerState.PAUSED || 
                event.data === (window as any).YT.PlayerState.ENDED
              ) {
                setIsPlaying(false);
              }
            }
          }
        });
      }
    };

    if (typeof window !== "undefined" && !(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag?.parentNode) firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      else document.head.appendChild(tag);
      
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }
  }, [activeVideoUrl]); // වීඩියෝව වෙනස් වන සෑම විටම ධාවනය වේ

  // Progress Bar
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
          setCurrentTime(ytPlayerRef.current.getCurrentTime());
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);


  // --- Custom Controls ---
  const togglePlay = () => {
    if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
      if (isPlaying) ytPlayerRef.current.pauseVideo();
      else ytPlayerRef.current.playVideo();
    }
  };

  const handleStop = () => {
    if (ytPlayerRef.current && typeof ytPlayerRef.current.stopVideo === 'function') {
      ytPlayerRef.current.stopVideo();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleSkip = (seconds: number) => {
    if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      const newTime = currentTime + seconds;
      ytPlayerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    }
  };

  const changeSpeed = () => {
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setPlaybackRate === 'function') {
      const newSpeed = playbackSpeed === 1 ? 1.25 : playbackSpeed === 1.25 ? 1.5 : playbackSpeed === 1.5 ? 2 : playbackSpeed === 2 ? 0.75 : 1;
      ytPlayerRef.current.setPlaybackRate(newSpeed);
      setPlaybackSpeed(newSpeed);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      ytPlayerRef.current.seekTo(time, true);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleToggleMute = () => {
    if (isMuted) {
      if(ytPlayerRef.current && typeof ytPlayerRef.current.unMute === 'function') ytPlayerRef.current.unMute();
      setIsMuted(false);
    } else {
      if(ytPlayerRef.current && typeof ytPlayerRef.current.mute === 'function') ytPlayerRef.current.mute();
      setIsMuted(true);
    }
  };

  const handleVolumeDown = () => {
    const newVol = Math.max(volumeLevel - 10, 0);
    setVolumeLevel(newVol);
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') ytPlayerRef.current.setVolume(newVol);
    if (newVol === 0) { 
      if(ytPlayerRef.current && typeof ytPlayerRef.current.mute === 'function') ytPlayerRef.current.mute();
      setIsMuted(true); 
    }
  };

  const handleVolumeUp = () => {
    const newVol = Math.min(volumeLevel + 10, 100);
    setVolumeLevel(newVol);
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') ytPlayerRef.current.setVolume(newVol);
    if (isMuted) { 
       if(ytPlayerRef.current && typeof ytPlayerRef.current.unMute === 'function') ytPlayerRef.current.unMute();
       setIsMuted(false); 
    }
  };

  const handleSubjectChange = (subId: string) => {
    setActiveSubjectId(subId);
    const selectedSub = course?.subjects?.find((s: any) => (s.subjectId || s._id) === subId);
    if (selectedSub && selectedSub.lessons && selectedSub.lessons.length > 0) {
      setActiveVideoUrl(selectedSub.lessons[0].videoEmbed || "");
      setActiveVideoTitle(selectedSub.lessons[0].title || "");
      setActivePdfUrl(selectedSub.lessons[0].pdfUrl || "");
    } else {
      setActiveVideoUrl(""); setActiveVideoTitle(""); setActivePdfUrl("");
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
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

  // Styles
  const themeBg = isDarkMode ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-800";
  const headerBg = isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200";
  const cardBg = isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200";
  const textPrimary = isDarkMode ? "text-white" : "text-slate-900";
  const textSecondary = isDarkMode ? "text-slate-400" : "text-slate-500";
  const playlistActiveBg = isDarkMode ? "bg-blue-600/20 border-blue-500" : "bg-blue-50 border-blue-500";

  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${themeBg}`}>
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-lg text-slate-500 mb-6">පාඨමාලාවට පිවිසෙමින් පවතී...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${themeBg}`}>
        <h2 className="text-2xl font-bold text-red-500 mb-2">සමාවෙන්න!</h2>
        <p className="font-bold text-lg text-slate-500 mb-6">{errorMsg}</p>
        <button onClick={() => router.push('/dashboard')} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg">Dashboard එකට ආපසු යන්න</button>
      </div>
    );
  }

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
          <div className="flex items-center flex-shrink-0 gap-3">
            <button onClick={toggleTheme} className={`rounded-full p-2 transition-colors focus:outline-none ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-slate-100 text-slate-600'}`}>
              {isDarkMode ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 mt-2 md:mt-4 pb-12">
        {course?.notification && course.notification.trim() !== "" && (
          <div className="mb-6 p-4 md:p-5 bg-yellow-100 dark:bg-amber-900/30 border-2 border-yellow-400 dark:border-amber-600 rounded-xl flex items-start gap-3 shadow-md animate-in fade-in">
            <span className="text-2xl mt-0.5">📢</span>
            <div>
              <h4 className="text-yellow-900 dark:text-amber-400 font-extrabold text-sm md:text-base mb-1">විශේෂ පණිවිඩයයි</h4>
              <p className="text-yellow-900/90 dark:text-amber-200 text-sm font-bold whitespace-pre-wrap leading-relaxed">{course.notification}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 md:mb-8">
          {course?.whatsappLink && (
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
          
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            
            {/* 🔴 අලුත්: Custom Video Player */}
            <div className={isFullscreen ? "fixed inset-0 z-[99999] bg-black w-screen h-[100dvh] flex flex-col justify-center select-none" : "w-full flex flex-col relative rounded-xl md:rounded-2xl overflow-hidden shadow-lg select-none bg-black border border-slate-800"}>
              
              <div className="relative w-full flex-grow flex items-center justify-center bg-black aspect-video overflow-hidden group">
                  
                  {/* YouTube Iframe Container - Scale 1.35 කින් විශාල කර ලෝගෝ සඟවා ඇත */}
                  <div className="w-full h-full absolute inset-0 overflow-hidden scale-[1.35] md:scale-[1.3] pointer-events-none">
                    {/* මෙම div එක තුළට YouTube Iframe එක ස්වයංක්‍රීයව ඇතුළු වේ */}
                    <div id="yt-player-container" className="w-full h-full pointer-events-none"></div>
                  </div>

                  {!activeVideoUrl && (
                    <div className="absolute inset-0 z-[50] flex items-center justify-center text-slate-500 font-bold bg-black">
                      වීඩියෝවක් තෝරා නොමැත
                    </div>
                  )}
                  
                  {/* 🔴 Click Blocker (සම්පූර්ණ ආරක්ෂාව) - වීඩියෝව මත ක්ලික් කිරීම වළක්වයි */}
                  <div className="absolute inset-0 z-[60] cursor-pointer" onClick={togglePlay}>
                    {!isPlaying && activeVideoUrl && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-all">
                          <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600/90 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] backdrop-blur-md hover:scale-110 transition-transform">
                              <svg className="w-8 h-8 md:w-10 md:h-10 ml-1 md:ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                        </div>
                    )}
                  </div>
              </div>

              {/* 🔴 Control Bar - z-index ඉහළ දමා ඇත */}
              <div className={`relative z-[70] p-3 md:p-4 flex flex-col gap-2 ${isFullscreen ? 'bg-slate-900/95 backdrop-blur-md pb-6 absolute bottom-0 left-0 w-full' : isDarkMode ? 'bg-slate-900 border-t border-slate-800' : 'bg-white border-t border-slate-200'}`}>
                
                <div className="flex items-center gap-2 md:gap-3 w-full px-1 md:px-2">
                    <span className={`text-[10px] md:text-xs font-bold w-9 md:w-10 text-right ${isFullscreen ? 'text-slate-300' : textSecondary}`}>{formatTime(currentTime)}</span>
                    <input 
                      type="range" min="0" max={duration || 100} value={currentTime} onChange={handleSeek}
                      className="flex-grow h-1.5 md:h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <span className={`text-[10px] md:text-xs font-bold w-9 md:w-10 ${isFullscreen ? 'text-slate-300' : textSecondary}`}>{formatTime(duration)}</span>
                </div>

                <div className="flex items-center justify-between px-1 md:px-2 mt-1 md:mt-2">
                    <div className="flex items-center gap-1.5 md:gap-3">
                        <button onClick={handleStop} className="p-1.5 md:p-2 rounded-full hover:bg-red-100 text-red-500 transition group" title="Stop">
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>
                        </button>
                        <button onClick={() => handleSkip(-10)} className={`p-1.5 md:p-2 rounded-full transition ${isFullscreen ? 'text-white hover:bg-slate-700' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`} title="Backward 10s">
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" /></svg>
                        </button>
                        <button onClick={togglePlay} className="p-2 md:p-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition shadow-md flex items-center justify-center">
                          {isPlaying ? (
                              <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                          ) : (
                              <svg className="w-5 h-5 md:w-6 md:h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          )}
                        </button>
                        <button onClick={() => handleSkip(10)} className={`p-1.5 md:p-2 rounded-full transition ${isFullscreen ? 'text-white hover:bg-slate-700' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`} title="Forward 10s">
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.934 11.2a1 1 0 010 1.6l-5.334 4A1 1 0 015 16V8a1 1 0 011.6-.8l5.334 4zM19.934 11.2a1 1 0 010 1.6l-5.334 4A1 1 0 0113 16V8a1 1 0 011.6-.8l5.334 4z" /></svg>
                        </button>
                        
                        <button onClick={changeSpeed} className={`ml-1 md:ml-2 px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition ${isFullscreen ? 'bg-purple-900/50 text-purple-300 hover:bg-purple-800' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 hover:bg-purple-200'}`}>
                          {playbackSpeed}x Speed
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-1 md:gap-2">
                        <button onClick={handleVolumeDown} className={`p-1.5 rounded-full transition ${isFullscreen ? 'text-white hover:bg-slate-700' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" /></svg>
                        </button>
                        <button onClick={handleToggleMute} className={`p-1.5 rounded-full transition ${isFullscreen ? 'text-white hover:bg-slate-700' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                          {isMuted ? (
                            <svg className="w-4 h-4 md:w-5 md:h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                          ) : (
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                          )}
                        </button>
                        <button onClick={handleVolumeUp} className={`p-1.5 rounded-full transition ${isFullscreen ? 'text-white hover:bg-slate-700' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        </button>
                        
                        <button onClick={toggleFullScreen} className={`ml-1 md:ml-2 p-1.5 md:p-2 rounded-full transition ${isFullscreen ? 'text-white hover:bg-red-500' : isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`} title="Full Screen">
                          {isFullscreen ? (
                             <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                          ) : (
                             <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
                          )}
                        </button>
                    </div>
                </div>
              </div>
            </div>

            {/* Now Playing & PDF Tute Box */}
            {!isFullscreen && (
              <div className={`p-4 md:p-5 rounded-xl md:rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${cardBg}`}>
                <div className="truncate">
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-blue-500">දැන් ධාවනය වේ (Now Playing)</span>
                  <h3 className={`text-sm md:text-lg font-bold mt-0.5 truncate ${textPrimary}`}>{activeVideoTitle || "පාඩමක් තෝරන්න"}</h3>
                </div>
                
                {activePdfUrl && activePdfUrl.trim() !== "" && (
                  <a 
                    href={activePdfUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 md:px-5 md:py-3 text-xs md:text-sm font-bold transition-all shadow-sm flex-shrink-0"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 16l-5-5h3V4h4v7h3l-5 5zm9-2v6H3v-6H1v8h22v-8h-2z"/></svg>
                    Tute එක (PDF)
                  </a>
                )}
              </div>
            )}

            {courseQuizzes.length > 0 && (
              <div className={`p-4 md:p-6 rounded-xl md:rounded-2xl border shadow-sm ${cardBg}`}>
                <h3 className={`text-sm md:text-lg font-extrabold tracking-wide text-purple-600 dark:text-purple-400 mb-4 border-l-4 border-purple-500 pl-3`}>මෙම පාඨමාලාවට අදාළ MCQ විභාග</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {courseQuizzes.map((quiz: any) => (
                    <div key={quiz._id} className={`flex flex-col p-4 rounded-xl border transition-all ${isDarkMode ? 'bg-purple-900/10 border-purple-800/30' : 'bg-purple-50 border-purple-100'}`}>
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 bg-purple-600 text-white shadow-sm">Q</div>
                        <div>
                          <h4 className={`text-sm md:text-base font-bold line-clamp-2 text-purple-900 dark:text-purple-300`}>{quiz.title}</h4>
                          <p className="text-xs font-bold text-purple-500/80 mt-1">ප්‍රශ්න {quiz.questions?.length || 0} ක් අඩංගුයි</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 mt-auto">
                        <Link href={`/course/${courseId}/quiz/${quiz._id}`} className="w-full bg-purple-600 hover:bg-purple-700 text-white text-center text-sm font-bold py-2.5 rounded-lg transition-colors shadow-sm">
                          විභාගය අරඹන්න (Start)
                        </Link>
                        {quiz.pdfUrl && quiz.pdfUrl.trim() !== "" && (
                          <a href={quiz.pdfUrl} target="_blank" rel="noopener noreferrer" className={`w-full text-center text-sm font-bold py-2.5 rounded-lg transition-colors border shadow-sm ${isDarkMode ? 'bg-slate-800 border-red-500/50 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600'}`}>
                            PDF එක බලන්න (Download)
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Playlist Section (Right side) */}
          <div className={`rounded-xl md:rounded-2xl border p-4 shadow-sm md:h-[650px] overflow-y-auto ${cardBg}`}>
            <h3 className="text-xs md:text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-3">විෂයයන් තෝරන්න</h3>
            <div className="flex flex-col gap-2 mb-4 border-b pb-3 dark:border-slate-700">
              {course.subjects?.map((subject: any) => (
                <button 
                  key={subject._id || subject.subjectId} onClick={() => handleSubjectChange(subject.subjectId || subject._id)}
                  className={`w-full text-left px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[11px] md:text-xs font-bold transition-all ${activeSubjectId === (subject.subjectId || subject._id) ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"}`}
                >
                  {subject.name}
                </button>
              ))}
            </div>

            <h3 className="text-xs md:text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-3">පාඩම් ලැයිස්තුව (Playlist)</h3>
            <div className="space-y-2 md:space-y-2.5 mb-6">
              {activeSubject?.lessons?.length > 0 ? (
                activeSubject.lessons.map((lesson: any, index: number) => {
                  const isActive = activeVideoUrl === lesson.videoEmbed;
                  return (
                    <div 
                      key={lesson.lessonId || lesson._id}
                      onClick={() => {
                        setActiveVideoUrl(lesson.videoEmbed || "");
                        setActiveVideoTitle(lesson.title || "");
                        setActivePdfUrl(lesson.pdfUrl || "");
                      }}
                      className={`flex items-start gap-2.5 md:gap-3 p-2.5 md:p-3 rounded-lg md:rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${isActive ? playlistActiveBg : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800"}`}
                    >
                      <div className={`w-5 h-5 md:w-6 md:h-6 rounded-md md:rounded-lg flex items-center justify-center font-bold text-[10px] md:text-xs flex-shrink-0 mt-0.5 ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                        {index + 1}
                      </div>
                      <div className="truncate flex-grow">
                        <p className={`text-xs md:text-sm font-bold truncate ${isActive ? 'text-blue-600 dark:text-blue-400' : textPrimary}`}>{lesson.title}</p>
                        <p className="text-[9px] md:text-[11px] text-slate-400 mt-0.5 flex items-center gap-1"><span>▶ Recorded Lesson</span></p>
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