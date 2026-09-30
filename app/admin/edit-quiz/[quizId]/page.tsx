"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditQuizPage({ params }: any) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isCoursesLoading, setIsCoursesLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [quizId, setQuizId] = useState<string>("");

  const [courses, setCourses] = useState<any[]>([]);

  const [quizData, setQuizData] = useState({
    courseIds: [] as string[],
    title: "",
    timeLimit: "", 
    pdfUrl: "",
    isVisible: true,
    questions: [
      { questionText: "", imageUrl: "", options: ["", "", "", ""], correctOptionIndex: 0 }
    ]
  });

  // 🔴 වෙනස: Loading හිරවෙන එක නවත්වන්න, useEffect එක Safe විදිහට ලිව්වා
  useEffect(() => {
    let isMounted = true;
    if (document.documentElement.classList.contains("dark")) setIsDarkMode(true);

    const fetchInitialData = async () => {
      try {
        // Next.js 13/14/15 වලට ගැළපෙන පරිදි Parameter එක ලබාගැනීම
        const resolvedParams = await Promise.resolve(params);
        const currentId = resolvedParams?.quizId || resolvedParams?.id;

        if (!currentId) {
          if (isMounted) {
            setMessage({ type: "error", text: "ID එක සොයාගැනීමට නොහැක." });
            setIsFetching(false);
          }
          return;
        }

        if (isMounted) setQuizId(currentId);

        // 1. Courses ටික ගෙන ඒම
        if (isMounted) setIsCoursesLoading(true);
        const courseRes = await fetch("/api/courses", { cache: "no-store" });
        const courseData = await courseRes.json();
        if (courseRes.ok && isMounted) setCourses(courseData.data);
        if (isMounted) setIsCoursesLoading(false);

        // 2. Quiz එකේ පරණ දත්ත ටික ගෙන ඒම
        const quizRes = await fetch(`/api/admin/quizzes/${currentId}`, { cache: "no-store" });
        const fetchedQuiz = await quizRes.json();
        
        if (quizRes.ok && fetchedQuiz.data && isMounted) {
          const q = fetchedQuiz.data;
          
          // පරණ Quiz වල තිබ්බේ courseId (තනි String එකක්) නම් ඒක array එකක් කිරීම
          let mappedCourseIds = q.courseIds || [];
          if (mappedCourseIds.length === 0 && q.courseId) {
              mappedCourseIds = [q.courseId];
          }

          setQuizData({
            courseIds: mappedCourseIds,
            title: q.title || "",
            timeLimit: q.timeLimit ? q.timeLimit.toString() : "",
            pdfUrl: q.pdfUrl || "",
            isVisible: q.isVisible !== undefined ? q.isVisible : true,
            questions: q.questions && q.questions.length > 0 ? q.questions.map((question: any) => ({
              questionText: question.questionText || "",
              imageUrl: question.imageUrl || "",
              options: question.options || ["", "", "", ""],
              correctOptionIndex: question.correctOptionIndex !== undefined ? question.correctOptionIndex : 0
            })) : [{ questionText: "", imageUrl: "", options: ["", "", "", ""], correctOptionIndex: 0 }]
          });
        } else if (isMounted) {
          setMessage({ type: "error", text: "ප්‍රශ්න පත්‍රය සොයාගැනීමට නොහැක." });
        }
      } catch (error) {
        console.error(error);
        if (isMounted) setMessage({ type: "error", text: "දත්ත ලබා ගැනීමේදී දෝෂයක් මතු විය." });
      } finally {
        if (isMounted) setIsFetching(false);
      }
    };

    fetchInitialData();
    
    return () => {
      isMounted = false;
    };
  }, []); // 🔴 Dependency Array එක හිස්ව තැබුවා (එවිට එකවරක් පමණක් Load වී හිරවීම නවතී)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const handleCourseToggle = (courseId: string) => {
    setQuizData((prev) => {
      const isSelected = prev.courseIds.includes(courseId);
      if (isSelected) {
        return { ...prev, courseIds: prev.courseIds.filter(id => id !== courseId) };
      } else {
        return { ...prev, courseIds: [...prev.courseIds, courseId] };
      }
    });
  };

  const handleQuestionTextChange = (index: number, text: string) => {
    const updated = [...quizData.questions];
    updated[index].questionText = text;
    setQuizData({ ...quizData, questions: updated });
  };

  const handleQuestionImageChange = (index: number, url: string) => {
    const updated = [...quizData.questions];
    updated[index].imageUrl = url;
    setQuizData({ ...quizData, questions: updated });
  };

  const handleOptionChange = (qIndex: number, oIndex: number, text: string) => {
    const updated = [...quizData.questions];
    updated[qIndex].options[oIndex] = text;
    setQuizData({ ...quizData, questions: updated });
  };

  const handleCorrectOptionChange = (qIndex: number, correctIdx: number) => {
    const updated = [...quizData.questions];
    updated[qIndex].correctOptionIndex = correctIdx;
    setQuizData({ ...quizData, questions: updated });
  };

  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [...quizData.questions, { questionText: "", imageUrl: "", options: ["", "", "", ""], correctOptionIndex: 0 }]
    });
  };

  const removeQuestion = (indexToRemove: number) => {
    if (quizData.questions.length === 1) return alert("අවම වශයෙන් එක් ප්‍රශ්නයක් හෝ තිබිය යුතුය!");
    const updated = quizData.questions.filter((_, index) => index !== indexToRemove);
    setQuizData({ ...quizData, questions: updated });
  };

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent, isDraft: boolean = false) => {
    e.preventDefault();
    if (quizData.courseIds.length === 0) return alert("කරුණාකර අවම වශයෙන් එක් පාඨමාලාවක් හෝ තෝරන්න.");
    if (!quizData.timeLimit) return alert("කරුණාකර ප්‍රශ්න පත්‍රයට අදාළ කාල සීමාව ඇතුළත් කරන්න.");
    
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    // Database එකට යැවීමට සකස් කරන Data Payload එක
    const payload = {
      ...quizData,
      courseId: quizData.courseIds[0], // පරණ ක්‍රමයට සහය දැක්වීමට
      timeLimit: Number(quizData.timeLimit),
      isVisible: !isDraft 
    };

    try {
      const response = await fetch(`/api/admin/quizzes/${quizId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: isDraft ? "✅ ප්‍රශ්න පත්‍රය Draft එකක් ලෙස සාර්ථකව Update කළා!" : "✅ ප්‍රශ්න පත්‍රය සාර්ථකව Update කළා!" });
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

  // 🔴 Loading Animation එක
  if (isFetching) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeBg}`}>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-bold text-slate-500">දත්ත ගෙනෙමින් පවතී...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`modern-font min-h-screen transition-colors duration-300 ${themeBg}`}>
      <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-md transition-all duration-300 ${headerBg}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm">EDIT QUIZ</div>
            <span className="logo-font text-lg md:text-2xl font-semibold truncate">20minutes.lk</span>
          </div>
          <div className="flex items-center space-x-3 md:space-x-5">
            <button onClick={toggleTheme} className={`rounded-full p-2 transition-colors focus:outline-none ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-slate-100 text-slate-600'}`}>
              {isDarkMode ? '🌞' : '🌙'}
            </button>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="rounded-full bg-red-500/10 border border-red-500/50 px-4 py-1.5 text-xs md:text-sm font-semibold text-red-500 hover:bg-red-500 hover:text-white">
              ඉවත් වන්න
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8 mt-4">
        <div className={`rounded-2xl shadow-sm border p-6 md:p-8 ${cardBg}`}>
          
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-blue-500">ප්‍රශ්න පත්‍රය යාවත්කාලීන කිරීම (Edit)</h1>
            <Link href="/admin" className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}>
              &larr; ආපසු
            </Link>
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-xl font-bold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={(e) => handleSubmit(e, !quizData.isVisible)} className="space-y-8">
            
            <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              
              <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                  <label className="block text-sm font-bold">මෙම ප්‍රශ්න පත්‍රය අදාළ වන පාඨමාලා තෝරන්න</label>
                  <button 
                    type="button" 
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={isLoading}
                    className="flex-shrink-0 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                    Draft ලෙස සේව් කරන්න
                  </button>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-xl border ${inputBg}`}>
                  {isCoursesLoading ? (
                    <p className="text-sm font-bold text-blue-500 animate-pulse col-span-full">පාඨමාලා ගෙනෙමින් පවතී...</p>
                  ) : courses.length > 0 ? (
                    courses.map(course => (
                      <label key={course._id} className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                          checked={quizData.courseIds.includes(course._id)}
                          onChange={() => handleCourseToggle(course._id)}
                        />
                        <span className="text-sm font-semibold truncate">{course.title}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 col-span-full">පාඨමාලා කිසිවක් හමු නොවිණි.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-bold mb-2">ප්‍රශ්න පත්‍රයේ නම (Title) *</label>
                  <input type="text" required value={quizData.title} onChange={(e) => setQuizData({...quizData, title: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${inputBg}`} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">කාල සීමාව (විනාඩි) *</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    value={quizData.timeLimit} 
                    onChange={(e) => setQuizData({...quizData, timeLimit: e.target.value})} 
                    className={`w-full p-3 rounded-xl border outline-none ${inputBg}`} 
                  />
                </div>
              </div>

              <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6">
                <label className="block text-sm font-bold mb-2">
                  ප්‍රශ්න පත්‍රයේ PDF ලින්ක් එක <span className="text-slate-400 font-normal text-xs ml-2">(අත්‍යවශ්‍ය නැත)</span>
                </label>
                <input 
                  type="url" 
                  value={quizData.pdfUrl} 
                  onChange={(e) => setQuizData({...quizData, pdfUrl: e.target.value})} 
                  className={`w-full p-3 rounded-xl border outline-none ${inputBg}`} 
                  placeholder="උදා: https://drive.google.com/file/d/..." 
                />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center justify-between">
                <span>ප්‍රශ්න (Questions)</span>
                <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Total: {quizData.questions.length}</span>
              </h2>
              
              {quizData.questions.map((q, qIndex) => (
                <div key={qIndex} className={`p-5 rounded-xl mb-6 shadow-sm border relative ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'}`}>
                  
                  {quizData.questions.length > 1 && (
                    <button type="button" onClick={() => removeQuestion(qIndex)} className="absolute -top-3 -right-3 bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-600 hover:text-white transition shadow-sm border border-red-200" title="මකා දමන්න">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-bold mb-2 text-blue-500">ප්‍රශ්නය {qIndex + 1}</label>
                    <textarea required value={q.questionText} onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)} rows={2} className={`w-full p-3 rounded-xl border outline-none resize-none ${inputBg}`}></textarea>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-xs font-bold mb-2 text-slate-500">ප්‍රශ්නය සඳහා පින්තූරයක් (Image URL - අත්‍යවශ්‍ය නැත)</label>
                    <input 
                      type="url" 
                      value={q.imageUrl || ""} 
                      onChange={(e) => handleQuestionImageChange(qIndex, e.target.value)} 
                      className={`w-full p-2.5 rounded-xl border text-sm outline-none ${inputBg}`} 
                      placeholder="උදා: https://i.imgur.com/your-image.png" 
                    />
                    {/* පින්තූරයක් තියෙනවා නම් ඒක පෙන්වීම */}
                    {q.imageUrl && (
                      <div className="mt-3 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg inline-block">
                         <img src={q.imageUrl} alt={`Question ${qIndex + 1}`} className="max-h-32 object-contain rounded" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-0 md:pl-6 border-l-2 border-blue-200 dark:border-blue-900">
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name={`correct-${qIndex}`} 
                          checked={q.correctOptionIndex === oIndex}
                          onChange={() => handleCorrectOptionChange(qIndex, oIndex)}
                          className="w-5 h-5 text-blue-600 cursor-pointer"
                          title="නිවැරදි පිළිතුර ලෙස ලකුණු කරන්න"
                        />
                        <div className="flex-grow flex items-center relative">
                          <span className={`absolute left-3 text-xs font-bold ${q.correctOptionIndex === oIndex ? 'text-green-500' : 'text-slate-400'}`}>
                            {String.fromCharCode(65 + oIndex)}
                          </span>
                          <input 
                            type="text" required value={opt} 
                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)} 
                            className={`w-full p-2.5 pl-8 rounded-lg border text-sm outline-none ${q.correctOptionIndex === oIndex ? 'border-green-400 bg-green-50/10' : ''} ${inputBg}`} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <button type="button" onClick={addQuestion} className={`w-full py-4 border-2 border-dashed font-bold rounded-xl transition-colors ${isDarkMode ? 'border-slate-600 text-slate-400 hover:border-blue-500 hover:text-blue-400' : 'border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-500'}`}>
                + තව ප්‍රශ්නයක් එකතු කරන්න
              </button>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-blue-700 transition shadow-lg disabled:bg-slate-400 flex justify-center items-center gap-2 mt-8">
              {isLoading ? "Update වෙමින් පවතී..." : "වෙනස්කම් සේව් කරන්න (Update Quiz)"}
            </button>

          </form>
        </div>
      </main>
    </div>
  );
}
