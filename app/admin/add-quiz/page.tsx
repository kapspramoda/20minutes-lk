"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddQuizPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [courses, setCourses] = useState<any[]>([]);

  // Quiz දත්ත ව්‍යුහය
  const [quizData, setQuizData] = useState({
    courseId: "",
    title: "",
    questions: [
      { questionText: "", options: ["", "", "", ""], correctOptionIndex: 0 }
    ]
  });

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) setIsDarkMode(true);
    
    // පවතින පාඨමාලා ගෙන්වා ගැනීම (Course Dropdown එකට)
    const fetchCourses = async () => {
      const res = await fetch("/api/courses");
      const data = await res.json();
      if (res.ok) setCourses(data.data);
    };
    fetchCourses();
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  // --- ප්‍රශ්න වෙනස් කිරීමේ Functions ---
  const handleQuestionTextChange = (index: number, text: string) => {
    const updated = [...quizData.questions];
    updated[index].questionText = text;
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
      questions: [...quizData.questions, { questionText: "", options: ["", "", "", ""], correctOptionIndex: 0 }]
    });
  };

  const removeQuestion = (indexToRemove: number) => {
    if (quizData.questions.length === 1) return alert("අවම වශයෙන් එක් ප්‍රශ්නයක් හෝ තිබිය යුතුය!");
    const updated = quizData.questions.filter((_, index) => index !== indexToRemove);
    setQuizData({ ...quizData, questions: updated });
  };

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizData.courseId) return alert("කරුණාකර අදාළ පාඨමාලාව තෝරන්න.");
    
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/admin/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "✅ ප්‍රශ්න පත්‍රය සාර්ථකව Database එකට ඇතුළත් කළා!" });
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

  return (
    <div className={`modern-font min-h-screen transition-colors duration-300 ${themeBg}`}>
      
      <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-md transition-all duration-300 ${headerBg}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm">QUIZ MAKER</div>
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
            <h1 className="text-xl md:text-2xl font-bold">නව MCQ ප්‍රශ්න පත්‍රයක් එක් කරන්න</h1>
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
            
            {/* 1. මූලික විස්තර */}
            <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-bold mb-2">අදාළ පාඨමාලාව තෝරන්න *</label>
                  <select required value={quizData.courseId} onChange={(e) => setQuizData({...quizData, courseId: e.target.value})} className={`w-full p-3 rounded-xl border outline-none font-bold ${inputBg}`}>
                    <option value="" disabled>පාඨමාලාවක් තෝරන්න...</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>{course.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">ප්‍රශ්න පත්‍රයේ නම (Title) *</label>
                  <input type="text" required value={quizData.title} onChange={(e) => setQuizData({...quizData, title: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${inputBg}`} placeholder="උදා: 1 වන ඒකකය ඇගයීම" />
                </div>
              </div>
            </div>

            {/* 2. ප්‍රශ්න ලැයිස්තුව */}
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
                    <textarea required value={q.questionText} onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)} rows={2} className={`w-full p-3 rounded-xl border outline-none resize-none ${inputBg}`} placeholder="ප්‍රශ්නය මෙහි ටයිප් කරන්න..."></textarea>
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
                            placeholder="පිළිතුර..." 
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
              {isLoading ? "Save වෙමින් පවතී..." : "ප්‍රශ්න පත්‍රය පද්ධතියට එක් කරන්න (Save Quiz)"}
            </button>

          </form>
        </div>
      </main>
    </div>
  );
}