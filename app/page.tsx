"use client";

import React, { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();

  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // 🔴 අලුත්: "forgot" කියන State එක එකතු කළා
  const [heroView, setHeroView] = useState<"carousel" | "login" | "register" | "forgot">("carousel");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [apiCourses, setApiCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  const resultsData = [
    { id: 1, img: "/RESULTS.jpeg", name: "විශිෂ්ට ප්‍රතිඵල", rank: "ප්‍රාථමික අධ්‍යාපන" },
    { id: 2, img: "/2425.png", name: "විශිෂ්ට ප්‍රතිඵල", rank: "නීතීවේදී" },
    { id: 3, img: "/PrExam.png", name: "විශිෂ්ට ප්‍රතිඵල", rank: "ප්‍රාථමික අධ්‍යාපන" },
    { id: 4, img: "/LLBOUSL.png", name: "විශිෂ්ට ප්‍රතිඵල", rank: "නීතිවේදී" },
    { id: 5, img: "/results2.jpeg", name: "විශිෂ්ට ප්‍රතිඵල", rank: "පොලිස් සේවය" },
  ];

  const testimonialsData = [
    { id: 1, title: "📌 විශ්වවිද්‍යාල තෝරාගැනීමේ පරීක්ෂණ සමත් වූ සිසුන්ගේ අදහස්", link: "https://youtube.com/playlist?list=PLUmQc9YvKzLIHxO1GHa0kafOGwHen68mc&si=gjrOl9dDrqrOKVZN" },
    { id: 2, title: "📌 විවෘත විශ්වවිද්‍යාල තෝරාගැනීමේ පරීක්ෂණ සමත් වූ සිසුන්ගේ අදහස්", link: "https://youtube.com/playlist?list=PLUmQc9YvKzLJSolBkpLrbr_xZDKy5Z-lZ&si=aXygorZ3VS4m1tVV" },
    { id: 3, title: "📌 රාජ්‍ය සේවා තරග විභාග ජයග්‍රහණය කළ සිසුන්ගේ අදහස්", link: "https://youtube.com/playlist?list=PLUmQc9YvKzLLnvf1AkQbEhtw-9i-BDryq&si=mD0YS2oIAm9BDhCg" }
  ];

  const slides = [
    { id: 1, title: "ඔබේ සිහිනය සැබෑ කරන හොඳම මාර්ගගත වේදිකාව", subtitle: "කෙටි කාලයකින් වැඩි විෂය කරුණු ප්‍රමාණයක් අවබෝධ කරගනිමින් තරග විභාග ජයගන්න.", btnText: "දැන්ම එක්වන්න", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1920&auto=format&fit=crop" },
    { id: 2, title: "2023 වසරේ විශිෂ්ටතම ප්‍රතිඵල", subtitle: "LLB ප්‍රවේශ විභාගයෙන් දිවයිනේ ඉහළම සාමාර්ථ ලබාගත් අපගේ සිසුන්.", btnText: "ප්‍රතිඵල බලන්න", image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1920&auto=format&fit=crop" },
    { id: 3, title: "විශේෂ වට්ටම් සහිතයි!", subtitle: "මෙම දීමනාව සීමිත කාලයක් සඳහා පමණි.", btnText: "වට්ටම ලබාගන්න", image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1920&auto=format&fit=crop" }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [courseIndex, setCourseIndex] = useState(0);
  const [resultIndex, setResultIndex] = useState(0);
  const [testiIndex, setTestiIndex] = useState(0);

  const courseRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const testiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAvailableCourses = async () => {
      try {
        const res = await fetch("/api/courses");
        const data = await res.json();
        if (res.ok) setApiCourses(data.data.filter((c: any) => c.isVisible === true));
      } catch (error) { console.error(error); } 
      finally { setIsLoadingCourses(false); }
    };
    fetchAvailableCourses();
  }, []);

  useEffect(() => {
    if (heroView !== "carousel") return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length, heroView]);

  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  const handleScroll = (ref: React.RefObject<HTMLDivElement | null>, setIndex: (idx: number) => void, totalItems: number) => {
    if (!ref.current) return;
    const { scrollLeft, scrollWidth } = ref.current;
    const itemWidth = scrollWidth / totalItems;
    setIndex(Math.round(scrollLeft / itemWidth));
  };

  const scrollToIndex = (ref: React.RefObject<HTMLDivElement | null>, index: number, totalItems: number) => {
    if (!ref.current) return;
    const itemWidth = ref.current.scrollWidth / totalItems;
    ref.current.scrollTo({ left: index * itemWidth, behavior: 'smooth' });
  };

  const changeViewAndScrollTop = (view: "carousel" | "login" | "register" | "forgot") => {
    setHeroView(view);
    setError("");
    setPassword("");
    setConfirmPassword("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (heroView === "login") {
      if (phone === "960431251V" && password === "Malindu@12411") {
        router.push("/admin");
        setLoading(false);
        return;
      }
      
      const res = await signIn("credentials", { redirect: false, phone, password });
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } 
    else if (heroView === "register") {
      if (password !== confirmPassword) {
        setError("මුරපදයන් එකිනෙකට නොගැලපේ. කරුණාකර නැවත පරීක්ෂා කරන්න.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone, password }),
        });
        if (res.ok) {
          setPassword(""); setConfirmPassword("");
          changeViewAndScrollTop("login");
          alert("ලියාපදිංචි වීම සාර්ථකයි! කරුණාකර දැන් ලොග් වන්න.");
        } else {
          const data = await res.json();
          setError(data.message || "ලියාපදිංචි වීමේදී දෝෂයක් මතු විය.");
        }
      } catch (err) {
        setError("තාක්ෂණික දෝෂයකි. කරුණාකර නැවත උත්සාහ කරන්න.");
      } finally {
        setLoading(false);
      }
    }
    // 🔴 අලුත්: Forgot Password Submit එක
    else if (heroView === "forgot") {
      if (password !== confirmPassword) {
        setError("මුරපදයන් එකිනෙකට නොගැලපේ.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/auth/forgot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, newPassword: password }),
        });
        if (res.ok) {
          setPassword(""); setConfirmPassword(""); setPhone("");
          changeViewAndScrollTop("login");
          alert("✅ ඔබගේ ඉල්ලීම Admin වෙත යොමු කරන ලදී! ඉල්ලීම අනුමත වූ පසු ඔබට WhatsApp පණිවිඩයක් ලැබෙනු ඇත.");
        } else {
          const data = await res.json();
          setError(data.message || "දෝෂයක් මතු විය.");
        }
      } catch (err) {
        setError("තාක්ෂණික දෝෂයකි.");
      } finally {
        setLoading(false);
      }
    }
  };

  const themeBg = isDarkMode ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-800";
  const headerBg = isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200";
  const logoTextColor = isDarkMode ? "text-white" : "text-slate-900";
  const btnOutline = isDarkMode ? "border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" : "border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50";
  const sectionTitleColor = isDarkMode ? "text-white" : "text-slate-900";
  const sectionDescColor = isDarkMode ? "text-slate-400" : "text-slate-500";
  const cardBg = isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100";
  const cardTitle = isDarkMode ? "text-white" : "text-slate-800";
  const textSecondary = isDarkMode ? "text-slate-400" : "text-slate-500"; 
  const authBg = isDarkMode ? "bg-slate-950" : "bg-slate-100";
  const authCardBg = isDarkMode ? "bg-slate-800/95 border-slate-700 shadow-blue-900/20" : "bg-white/90 border-white shadow-2xl";
  const inputBg = isDarkMode ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:bg-slate-600" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 focus:bg-white";

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&family=Oswald:wght@500;600;700&display=swap');
        .modern-font { font-family: 'Lato', 'Iskoola Pota', sans-serif; }
        .logo-font { font-family: 'Oswald', sans-serif; letter-spacing: 0.5px; }
      `}} />

      <div className={`modern-font flex min-h-screen flex-col transition-colors duration-300 ${themeBg}`}>
        
        <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-md transition-all duration-300 ${headerBg}`}>
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
            <button onClick={() => changeViewAndScrollTop("carousel")} className="flex items-center gap-2 md:gap-3 focus:outline-none">
              <img src="/logo.png" alt="20minutes.lk Logo" className="h-7 w-auto sm:h-8 md:h-10 rounded-xl shadow-sm opacity-95" />
              <span className={`logo-font text-lg md:text-2xl font-semibold truncate ${logoTextColor}`}>20minutes.lk</span>
            </button>

            <div className="flex items-center space-x-3 md:space-x-5 flex-shrink-0">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className={`rounded-full p-2 transition-colors focus:outline-none ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {isDarkMode ? <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg> : <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
              </button>
              <button onClick={() => changeViewAndScrollTop("login")} className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold transition-all md:px-5 md:py-2 md:text-sm focus:outline-none ${btnOutline}`}>
                ලොග් වන්න
              </button>
              <button onClick={() => changeViewAndScrollTop("register")} className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all md:px-5 md:py-2 md:text-sm focus:outline-none">
                ලියාපදිංචි වන්න
              </button>
            </div>
          </div>
        </header>

        <main className="flex-grow">
          
          {heroView === "carousel" && (
            <section className="relative h-[450px] w-full overflow-hidden md:h-[550px]">
              <div className="flex h-full transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {slides.map((slide) => (
                  <div key={slide.id} className="relative flex h-full w-full flex-shrink-0 items-center justify-center px-6 text-center text-white">
                    <img src={slide.image} alt={slide.title} className="absolute inset-0 h-full w-full object-cover z-0" />
                    <div className={`absolute inset-0 z-0 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950/80' : 'bg-slate-900/65'}`}></div>
                    
                    <div className="relative z-10 max-w-3xl">
                      <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl drop-shadow-lg">
                        {slide.title}
                      </h1>
                      <p className="mb-8 text-sm text-slate-200 md:text-xl drop-shadow-md">
                        {slide.subtitle}
                      </p>
                      <button onClick={() => slide.id === 2 ? window.location.href="#results" : changeViewAndScrollTop("register")} className="inline-block rounded-full bg-emerald-500 px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-600 hover:shadow-xl hover:-translate-y-1 md:px-10 md:py-4 md:text-lg focus:outline-none">
                        {slide.btnText}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-md hover:bg-white/40 focus:outline-none md:left-6 md:p-3 transition-all z-20">
                <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-md hover:bg-white/40 focus:outline-none md:right-6 md:p-3 transition-all z-20">
                <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>

              <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 space-x-3 z-20">
                {slides.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentSlide(idx)} className={`h-2.5 rounded-full transition-all duration-300 ${currentSlide === idx ? "w-8 bg-white" : "w-2.5 bg-white/40 hover:bg-white/70"}`} />
                ))}
              </div>
            </section>
          )}

          {(heroView === "login" || heroView === "register" || heroView === "forgot") && (
            <section className={`flex min-h-[450px] items-center justify-center py-12 px-4 transition-colors duration-300 md:min-h-[550px] ${authBg}`}>
              <div className={`w-full max-w-md rounded-3xl border p-6 backdrop-blur-lg transition-colors duration-300 md:p-10 ${authCardBg}`}>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className={`text-2xl font-extrabold ${cardTitle}`}>
                    {heroView === "login" ? "පද්ධතියට ඇතුළු වන්න" : heroView === "register" ? "නව ගිණුමක් සාදන්න" : "මුරපදය යාවත්කාලීන කිරීම"}
                  </h2>
                  <button onClick={() => changeViewAndScrollTop("carousel")} className={`rounded-full p-2 transition-colors focus:outline-none ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:text-red-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500'}`}>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                
                {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100">{error}</div>}
                
                {heroView === "forgot" && (
                  <p className={`text-xs mb-5 font-bold p-3 rounded-xl ${isDarkMode ? 'bg-blue-900/30 text-blue-300 border border-blue-800' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                    ඔබගේ දුරකථන අංකය සහ ඔබට අවශ්‍ය නව මුරපදය පහතින් ලබාදෙන්න.
                  </p>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-5">
                  {heroView === "register" && (
                    <div>
                      <label className={`mb-1.5 block text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>නම</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="උදා: P.K. Silva" className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all ${inputBg}`} required />
                    </div>
                  )}

                  <div>
                    <label className={`mb-1.5 block text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>WhatsApp අංකය</label>
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="උදා: 0712345678" className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all ${inputBg}`} required />
                  </div>

                  <div>
                    <label className={`mb-1.5 block text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {heroView === "forgot" ? "නව මුරපදය (New Password)" : "මුරපදය (Password)"}
                    </label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="රහස්‍ය මුරපදයක් ලබා දෙන්න" className={`w-full rounded-xl border px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all ${inputBg}`} required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 transition-colors focus:outline-none ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-600' : 'text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`}>
                        {showPassword ? <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg> : <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /></svg>}
                      </button>
                    </div>
                  </div>

                  {(heroView === "register" || heroView === "forgot") && (
                    <div>
                      <label className={`mb-1.5 block text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>මුරපදය තහවුරු කරන්න</label>
                      <div className="relative">
                        <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="මුරපදය නැවත ඇතුළත් කරන්න" className={`w-full rounded-xl border px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all ${inputBg}`} required />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 transition-colors focus:outline-none ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-600' : 'text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`}>
                           {showConfirmPassword ? <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg> : <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /></svg>}
                        </button>
                      </div>
                    </div>
                  )}

                  <button type="submit" disabled={loading} className={`mt-2 w-full rounded-full px-4 py-3.5 text-sm font-bold text-white shadow-lg transition-all focus:outline-none focus:ring-4 disabled:opacity-70 disabled:cursor-not-allowed ${heroView === "login" ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:ring-emerald-500/30" : heroView === "register" ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500/30" : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:ring-purple-500/30"}`}>
                    {loading ? "කරුණාකර රැඳෙන්න..." : (heroView === "login" ? "ඇතුළු වන්න" : heroView === "register" ? "ලියාපදිංචි වන්න" : "ඉල්ලීම යොමු කරන්න")}
                  </button>
                </form>
                
                <div className={`mt-6 text-center text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {heroView === "login" ? (
                    <>
                      <p className="mb-3"><button type="button" onClick={() => changeViewAndScrollTop("forgot")} className={`font-bold transition-colors ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-600'}`}>මුරපදය අමතක වුණාද?</button></p>
                      <p>ගිණුමක් නැද්ද? <button onClick={() => changeViewAndScrollTop("register")} className={`font-bold transition-colors ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>ලියාපදිංචි වන්න</button></p>
                    </>
                  ) : (
                    <p>දැනටමත් ගිණුමක් තිබේද? <button onClick={() => changeViewAndScrollTop("login")} className={`font-bold transition-colors ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>ලොග් වන්න</button></p>
                  )}
                </div>
              </div>
            </section>
          )}

          <section className={`py-16 px-4 md:py-24 md:px-6 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950/50 border-y border-slate-800' : 'bg-blue-50/50 border-y border-blue-100'}`}>
            <div className="mx-auto max-w-5xl text-center">
              <h2 className={`mb-6 text-2xl font-extrabold md:text-4xl ${sectionTitleColor}`}>
                20 minutesLK Institute <span className="text-blue-600">වෙත ඔබව සාදරයෙන් පිළිගනිමු!</span>
              </h2>
              <div className="mx-auto mb-8 h-1.5 w-16 rounded-full bg-blue-600 md:w-24"></div>
              
              <div className={`space-y-6 text-sm md:text-lg leading-relaxed ${sectionDescColor}`}>
                <p>
                  තෝරාගැනීමේ පරීක්ෂණ සඳහා ශ්‍රී ලංකාවේ විශ්වාසනීය ප්‍රමුඛතම පුහුණු ආයතනයක් වන <b>20 minutesLK Institute</b> සමඟ මේ වන විට සිසුන් <b>8,000+</b> ක් අධ්‍යයනය කර ඇති අතර, ඔවුන් අතරින් <b>3,000+</b> දෙනෙකු විවිධ තෝරාගැනීමේ පරීක්ෂණ සාර්ථකව සමත් වී ඔවුන්ගේ සිහින උපාධි හා වෘත්තීය අවස්ථා දිනාගෙන ඇත.
                </p>
                
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-3xl mx-auto mt-8 p-6 md:p-8 rounded-3xl shadow-sm border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-500 text-xl">✅</span>
                    <span className={`font-bold ${cardTitle}`}>විශේෂඥ දේශක මණ්ඩලය</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-500 text-xl">✅</span>
                    <span className={`font-bold ${cardTitle}`}>විභාග ඉලක්ක කරගත් ක්‍රමානුකූල ඉගැන්වීම්</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-500 text-xl">✅</span>
                    <span className={`font-bold ${cardTitle}`}>සම්පූර්ණ ආදර්ශ ප්‍රශ්න පත්‍ර හා Mock Exams</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-500 text-xl">✅</span>
                    <span className={`font-bold ${cardTitle}`}>පුද්ගලික මඟපෙන්වීම සහ අඛණ්ඩ සහාය</span>
                  </div>
                </div>
                
                <p className="font-extrabold text-blue-600 text-lg md:text-2xl mt-8 pt-4">
                  "ඔබගේ ජයග්‍රහණය අපගේ වගකීමයි."
                </p>
              </div>
            </div>
          </section>

          <section id="courses" className="py-16 px-4 md:py-24 md:px-6">
            <div className="mx-auto max-w-7xl">
              <div className="mb-10 text-center md:mb-16">
                <h2 className={`text-2xl font-extrabold md:text-4xl ${sectionTitleColor}`}>දැනට පැවැත්වෙන පාඨමාලා</h2>
                <div className="mx-auto mt-4 h-1.5 w-16 rounded-full bg-blue-600 md:w-24"></div>
              </div>

              {isLoadingCourses ? (
                <div className="text-center py-10 font-bold text-slate-400 animate-pulse">
                  පාඨමාලා ලබාගනිමින් පවතී...
                </div>
              ) : apiCourses.length === 0 ? (
                <div className={`p-8 text-center rounded-2xl border ${cardBg}`}>
                  <p className={textSecondary}>දැනට අලුත් පාඨමාලා කිසිවක් නොමැත.</p>
                </div>
              ) : (
                <div 
                  ref={courseRef}
                  onScroll={() => handleScroll(courseRef as any, setCourseIndex, apiCourses.length)}
                  className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
                >
                  {apiCourses.map((course) => (
                    <div key={course._id} className={`group flex-none w-[70%] sm:w-[45%] snap-center flex flex-col overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl md:w-auto border ${cardBg}`}>
                      {course.coverImage ? (
                        <img src={course.coverImage} alt={course.title} className="flex h-32 items-center justify-center transition-colors shrink-0 md:h-40 object-cover w-full" />
                      ) : (
                        <div className={`flex h-32 items-center justify-center transition-colors shrink-0 md:h-40 bg-blue-500/10`}>
                          <svg className="h-10 w-10 md:h-12 md:w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        </div>
                      )}
                      
                      <div className="flex flex-col flex-grow p-4 md:p-5">
                        <h3 className={`mb-2 text-sm font-bold leading-snug line-clamp-2 md:mb-3 md:text-base ${cardTitle}`}>{course.title}</h3>
                        
                        <div className={`mt-auto flex flex-col items-start justify-between border-t pt-3 gap-3 sm:flex-row sm:items-center md:pt-4 sm:gap-0 ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                          <span className={`text-sm font-extrabold md:text-lg ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{course.price || "මිලක් නැත"}</span>
                          <button onClick={() => changeViewAndScrollTop("register")} className={`w-full text-center rounded-full px-4 py-2 text-xs font-bold transition-all hover:shadow-md sm:w-auto md:px-4 md:py-2 md:text-xs ${isDarkMode ? 'bg-slate-700 text-slate-200 hover:bg-blue-600 hover:text-white' : 'bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white'}`}>
                            ඇතුළත් වන්න
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-2 flex justify-center space-x-2.5 md:hidden">
                {apiCourses.map((_, idx) => (
                  <button key={idx} onClick={() => scrollToIndex(courseRef as any, idx, apiCourses.length)} className={`h-2 rounded-full transition-all duration-300 ${courseIndex === idx ? "w-6 bg-blue-600" : (isDarkMode ? "w-2 bg-slate-700" : "w-2 bg-slate-200")}`} />
                ))}
              </div>
            </div>
          </section>

          <section id="results" className={`py-16 px-4 border-y md:py-24 md:px-6 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
            <div className="mx-auto max-w-7xl">
              <div className="mb-10 text-center md:mb-16">
                <h2 className={`text-2xl font-extrabold md:text-4xl ${sectionTitleColor}`}>අපගේ විශිෂ්ට ප්‍රතිඵල</h2>
                <div className="mx-auto mt-4 h-1.5 w-16 rounded-full bg-blue-600 md:w-24"></div>
                <p className={`mt-4 text-xs font-medium md:text-base ${sectionDescColor}`}>පසුගිය වසරේ තරග විභාග වලින් විශිෂ්ට සාමාර්ථ ලබාගත් අපගේ සිසුන්</p>
              </div>

              <div 
                ref={resultRef}
                onScroll={() => handleScroll(resultRef as any, setResultIndex, resultsData.length)}
                className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
              >
                {resultsData.map((item) => (
                  <div key={item.id} className={`flex-none w-[75%] sm:w-[50%] snap-center overflow-hidden rounded-2xl shadow-sm transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-xl md:w-auto border flex flex-col ${cardBg}`}>
                    <div className="flex h-56 md:h-64 w-full overflow-hidden shrink-0">
                      <img src={item.img} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                    </div>
                    <div className="p-4 text-center flex-grow flex flex-col justify-center">
                      <h3 className={`text-sm font-extrabold md:text-lg ${cardTitle}`}>{item.name}</h3>
                      <p className={`mt-1 text-[11px] font-bold md:text-sm ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{item.rank}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-2 flex justify-center space-x-2.5 md:hidden">
                {resultsData.map((_, idx) => (
                  <button key={idx} onClick={() => scrollToIndex(resultRef as any, idx, resultsData.length)} className={`h-2 rounded-full transition-all duration-300 ${resultIndex === idx ? "w-6 bg-blue-600" : (isDarkMode ? "w-2 bg-slate-700" : "w-2 bg-slate-200")}`} />
                ))}
              </div>
            </div>
          </section>

          <section id="testimonials" className="py-16 px-4 md:py-24 md:px-6">
            <div className="mx-auto max-w-7xl">
              <div className="mb-10 text-center md:mb-16">
                <h2 className={`text-2xl font-extrabold md:text-4xl ${sectionTitleColor}`}>සිසුන්ගේ අදහස්</h2>
                <div className="mx-auto mt-4 h-1.5 w-16 rounded-full bg-red-600 md:w-24"></div>
              </div>

              <div 
                ref={testiRef}
                onScroll={() => handleScroll(testiRef as any, setTestiIndex, testimonialsData.length)}
                className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
              >
                {testimonialsData.map((video) => (
                  <a 
                    key={video.id} 
                    href={video.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-none w-[85%] sm:w-[60%] snap-center md:w-auto group flex flex-col items-center justify-center p-6 md:p-8 overflow-hidden rounded-3xl shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border text-center ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-red-500/50' : 'bg-white border-slate-200 hover:border-red-400'}`}
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-red-100 dark:bg-red-500/20 text-red-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all duration-300 shadow-sm">
                      <svg className="w-8 h-8 md:w-10 md:h-10 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                    </div>
                    <h3 className={`text-base md:text-lg font-bold leading-snug group-hover:text-red-500 transition-colors ${cardTitle}`}>
                      {video.title}
                    </h3>
                    <span className="mt-5 inline-block rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 px-5 py-2 text-xs md:text-sm font-bold group-hover:bg-red-600 group-hover:text-white transition-colors">
                      YouTube ඔස්සේ නරඹන්න
                    </span>
                  </a>
                ))}
              </div>

              <div className="mt-2 flex justify-center space-x-2.5 md:hidden">
                {testimonialsData.map((_, idx) => (
                  <button key={idx} onClick={() => scrollToIndex(testiRef as any, idx, testimonialsData.length)} className={`h-2 rounded-full transition-all duration-300 ${testiIndex === idx ? "w-6 bg-red-600" : (isDarkMode ? "w-2 bg-slate-700" : "w-2 bg-slate-200")}`} />
                ))}
              </div>
            </div>
          </section>

        </main>

        <footer className={`px-4 py-10 transition-colors duration-300 md:px-6 md:py-16 mt-12 ${isDarkMode ? 'bg-black text-slate-400 border-t border-slate-900' : 'bg-slate-900 text-slate-300'}`}>
          <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3 md:gap-12">
            
            <div>
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <img src="/logo.png" alt="20minutes.lk Logo" className="h-8 w-auto md:h-10 opacity-90 rounded-xl" />
                <h3 className="logo-font text-xl font-extrabold text-white md:text-2xl tracking-tight">20minutes.lk</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                තරග විභාග ජයගැනීමට අවශ්‍ය නිවැරදිම මඟපෙන්වීම ලබාදෙන ශ්‍රී ලංකාවේ ප්‍රමුඛතම මාර්ගගත වේදිකාව.
              </p>
              
              <div className="mt-6 flex space-x-5">
                <a href="https://www.facebook.com/share/1D4uc4UiGn/?mibextid=wwXIfr" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-500 transition-colors" title="Facebook">
                 
                </a>
                <a href="https://youtube.com/@20minuteslk?si=YhilxLi7_6FPuk9X" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-red-500 transition-colors" title="YouTube">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" /></svg>
                </a>
                <a href="https://www.tiktok.com/@20minuteslk?_r=1&_t=ZS-97ClcnnMoCX" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors" title="TikTok">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="mb-4 text-base font-bold text-white md:mb-6 md:text-lg">ඉක්මන් සබැඳි</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><button onClick={() => changeViewAndScrollTop("login")} className="hover:text-white transition-colors focus:outline-none">ලොග් වන්න</button></li>
                <li><button onClick={() => changeViewAndScrollTop("register")} className="hover:text-white transition-colors focus:outline-none">ලියාපදිංචි වන්න</button></li>
                <li><a href="#courses" className="hover:text-white transition-colors">පාඨමාලා</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-4 text-base font-bold text-white md:mb-6 md:text-lg">අපව සම්බන්ධ කරගන්න</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li className="flex items-start">
                  <span className="mr-3 text-lg mt-0.5">📍</span>
                  <span className="leading-relaxed">Sewana Mawatha, Gagabada Road,<br/>Suwarapola, Piliyandala</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-3 text-lg">💬</span> 
                  <a href="https://wa.me/94719689513" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">071 968 9513 (WhatsApp)</a>
                </li>
                <li className="flex items-center">
                  <span className="mr-3 text-lg">📞</span> 
                  <a href="tel:0775315799" className="hover:text-blue-400 transition-colors">077 531 5799 (Call)</a>
                </li>
                <li className="flex items-center">
                  <span className="mr-3 text-lg">✉️</span> 
                  <a href="mailto:20minuteslkinstituteclass@gmail.com" className="hover:text-blue-400 transition-colors break-all">20minuteslkinstituteclass@gmail.com</a>
                </li>
              </ul>
            </div>

          </div>
          
          <div className={`mx-auto mt-10 max-w-7xl border-t pt-6 text-center text-xs md:mt-16 md:pt-8 md:text-sm ${isDarkMode ? 'border-slate-800 text-slate-600' : 'border-slate-800 text-slate-500'}`}>
            &copy; {new Date().getFullYear()} 20minutes.lk. All rights reserved.
          </div>
        </footer>

      </div>
    </>
  );
}