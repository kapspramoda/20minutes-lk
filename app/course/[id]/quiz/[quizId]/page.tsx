"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string; quizId: string }> | { id: string; quizId: string };
};

export default function StudentExamPage({ params }: PageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [quiz, setQuiz] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // අලුත් States: විභාගයේ පියවර සහ කාලය
  const [step, setStep] = useState<"instructions" | "playing" | "results">("instructions");
  const [hasAgreed, setHasAgreed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); 

  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [score, setScore] = useState(0);

  // 1. Database එකෙන් ප්‍රශ්න පත්‍රය ගෙන ඒම
  useEffect(() => {
    const fetchQuizData = async () => {
      const resolved = await params;
      try {
        const res = await fetch(`/api/student/quizzes/${resolved.quizId}`);
        const data = await res.json();
        if (res.ok && data.data) {
          setQuiz(data.data);
          // එක් ප්‍රශ්නයකට විනාඩි 2 බැගින් කාලය ලබා දීම (තත්පර වලින්)
          setTimeLeft(data.data.questions.length * 120); 
        }
      } catch (error) { 
        console.error(error); 
      } finally { 
        setIsLoading(false); 
      }
    };
    fetchQuizData();
  }, [params]);

  // 2. Timer එක හැසිරවීම (තත්පරයෙන් තත්පරය අඩුවීම)
  useEffect(() => {
    if (step !== "playing") return;

    if (timeLeft <= 0) {
      alert("⏳ කාලය අවසන්! ඔබගේ පිළිතුරු ස්වයංක්‍රීයව පද්ධතියට යොමු කෙරේ.");
      handleSubmitExam();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, timeLeft]);

  // කාලය මිනිත්තු සහ තත්පර ලෙස හැඩගැන්වීම
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelectOption = (qIndex: number, oIndex: number) => {
    if (step === "results") return; 
    setSelectedAnswers({ ...selectedAnswers, [qIndex]: oIndex });
  };

  // 3. විභාගය අවසන් කර Submit කිරීම
  const handleSubmitExam = async () => {
    if (step === "results") return;

    let calculatedScore = 0;
    const answersArray: number[] = [];

    quiz.questions.forEach((q: any, idx: number) => {
      const studentChoice = selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : -1;
      answersArray.push(studentChoice);
      if (studentChoice === q.correctOptionIndex) {
        calculatedScore++;
      }
    });

    setScore(calculatedScore);
    setStep("results"); // ප්‍රතිඵල පිටුවට මාරු වීම

    try {
      const userPhone = (session?.user as any)?.phone || session?.user?.name;
      await fetch("/api/student/quizzes/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPhone,
          quizId: quiz._id,
          quizTitle: quiz.title,
          score: calculatedScore,
          totalQuestions: quiz.questions.length,
          studentAnswers: answersArray
        })
      });
    } catch (error) { console.error("Result save error", error); }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500 animate-pulse">ප්‍රශ්න පත්‍රය සූදානම් වෙමින් පවතී...</div>;
  if (!quiz) return <div className="min-h-screen flex items-center justify-center font-bold text-red-500">ප්‍රශ්න පත්‍රය සොයාගත නොහැක.</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 modern-font relative pb-10">
      
      {/* ඇලෙනසුළු (Sticky) Header එක සහ Timer එක */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
        <h1 className="text-sm md:text-xl font-bold text-slate-900 truncate max-w-[50%] md:max-w-[70%]">{quiz.title}</h1>
        
        {step === "playing" && (
          <div className={`px-4 py-1.5 md:py-2 rounded-full font-black text-sm md:text-lg border ${timeLeft < 60 ? 'bg-red-100 text-red-600 border-red-200 animate-pulse' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
            ⏱ {formatTime(timeLeft)}
          </div>
        )}
        
        {step !== "playing" && (
          <button onClick={() => router.back()} className="text-xs md:text-sm font-bold bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition">
            &larr; ආපසු (Back)
          </button>
        )}
      </div>

      <div className="max-w-3xl mx-auto mt-6 md:mt-8 px-4">
        
        {/* =========================================
            පියවර 1: උපදෙස් පිටුව (Instructions)
           ========================================= */}
        {step === "instructions" && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-10 shadow-sm">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 flex items-center justify-center rounded-2xl mb-6 mx-auto">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            
            <h2 className="text-2xl font-black text-center text-slate-900 mb-8">විභාග උපදෙස් මාලාව</h2>
            
            <ul className="space-y-4 text-sm md:text-base text-slate-600 mb-8 font-medium">
              <li className="flex items-start gap-3">
                <span className="text-blue-500 mt-0.5">✔️</span>
                මෙම ප්‍රශ්න පත්‍රය සඳහා ප්‍රශ්න <b>{quiz.questions.length}</b> ක් අඩංගු වේ.
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 mt-0.5">✔️</span>
                ඔබට හිමිවන මුළු කාලය විනාඩි <b>{quiz.questions.length * 2}</b> කි.
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 mt-0.5">⚠️</span>
                කාලය අවසන් වූ විගස ඔබගේ පිළිතුරු ස්වයංක්‍රීයව පද්ධතියට යොමු වේ.
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 mt-0.5">⚠️</span>
                විභාගය අතරතුර පිටුව Reload කිරීමෙන් වළකින්න. එසේ වුවහොත් ඔබගේ පිළිතුරු මැකී යනු ඇත.
              </li>
            </ul>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3 mb-8 cursor-pointer" onClick={() => setHasAgreed(!hasAgreed)}>
              <div className={`w-6 h-6 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${hasAgreed ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'}`}>
                {hasAgreed && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <p className="text-sm font-bold text-blue-900 select-none">මම ඉහත උපදෙස් කියවා තේරුම් ගත්තෙමි. විභාගය ආරම්භ කිරීමට මම එකඟ වෙමි.</p>
            </div>

            <button 
              onClick={() => setStep("playing")}
              disabled={!hasAgreed}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-md transition-all text-lg"
            >
              🚀 විභාගය අරඹන්න (Start Quiz)
            </button>

            {/* 🔴 අලුත් PDF බටන් එක (උපදෙස් පිටුවේ) */}
            {quiz.pdfUrl && (
              <a 
                href={quiz.pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full mt-4 flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-bold py-3.5 rounded-xl transition-all text-base shadow-sm"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 16l-5-5h3V4h4v7h3l-5 5zm9-2v6H3v-6H1v8h22v-8h-2z"/></svg>
                ප්‍රශ්න පත්‍රය (PDF) බලන්න
              </a>
            )}
          </div>
        )}

        {/* =========================================
            පියවර 2 & 3: විභාගය කිරීම සහ ප්‍රතිඵල
           ========================================= */}
        {step !== "instructions" && (
          <>
            {step === "results" && (
              <div className="mb-8 p-8 bg-white border border-slate-200 rounded-3xl text-center shadow-sm">
                <h2 className="text-xl md:text-2xl font-black text-slate-800">🎯 ඔබගේ ප්‍රතිඵල</h2>
                <div className="my-6 relative w-32 h-32 mx-auto flex items-center justify-center bg-slate-50 rounded-full border-4 border-slate-100">
                  <p className="text-4xl font-black text-blue-600">{score}<span className="text-xl text-slate-400">/{quiz.questions.length}</span></p>
                </div>
                <p className="text-lg text-slate-600 font-bold mb-6">ලබාගත් ප්‍රතිශතය: <span className="text-blue-600">{((score / quiz.questions.length) * 100).toFixed(1)}%</span></p>
                
                <p className="text-sm font-bold text-slate-400 border-t pt-4">පහතින් ඔබගේ හරි/වැරදි පිළිතුරු පරීක්ෂා කර බලන්න 👇</p>
                
                {/* 🔴 අලුත් PDF බටන් එක (ප්‍රතිඵල පිටුවේ) */}
                {quiz.pdfUrl && (
                  <div className="mt-5 flex justify-center">
                    <a 
                      href={quiz.pdfUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 16l-5-5h3V4h4v7h3l-5 5zm9-2v6H3v-6H1v8h22v-8h-2z"/></svg>
                      ප්‍රශ්න පත්‍රය (PDF) නැවත බලන්න
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-6 md:space-y-8">
              {quiz.questions.map((q: any, qIdx: number) => (
                <div key={qIdx} className="p-5 md:p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-base md:text-lg mb-6 text-slate-800 leading-relaxed">
                    <span className="text-blue-500 mr-2">{qIdx + 1}.</span> {q.questionText}
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {q.options.map((option: string, oIdx: number) => {
                      const isSelected = selectedAnswers[qIdx] === oIdx;
                      const isCorrectAnswer = q.correctOptionIndex === oIdx;
                      
                      let optionStyle = "border-slate-200 bg-white hover:bg-slate-50 text-slate-700";
                      let indicator = String.fromCharCode(65 + oIdx);
                      let indicatorStyle = "bg-slate-100 text-slate-600";
                      
                      // පිළිතුරු සපයන අවස්ථාවේදී
                      if (step === "playing" && isSelected) {
                        optionStyle = "border-blue-500 bg-blue-50/50 text-blue-800 font-bold";
                        indicatorStyle = "bg-blue-600 text-white";
                      }
                      
                      // ප්‍රතිඵල පෙන්වන අවස්ථාවේදී (Colors)
                      if (step === "results") {
                        if (isCorrectAnswer) {
                          optionStyle = "border-green-500 bg-green-50 text-green-800 font-bold ring-1 ring-green-500";
                          indicatorStyle = "bg-green-500 text-white";
                          indicator = "✓"; // හරි එකට හරි ලකුණ
                        } else if (isSelected && !isCorrectAnswer) {
                          optionStyle = "border-red-400 bg-red-50 text-red-800 font-bold";
                          indicatorStyle = "bg-red-500 text-white";
                          indicator = "✕"; // වැරදි එකට කතිරය
                        } else {
                          optionStyle = "border-slate-100 bg-white opacity-50 text-slate-500 cursor-not-allowed";
                        }
                      }

                      return (
                        <button
                          key={oIdx} type="button" 
                          disabled={step === "results"}
                          onClick={() => handleSelectOption(qIdx, oIdx)}
                          className={`w-full text-left p-3 md:p-4 rounded-xl border transition-all flex items-center gap-4 text-sm md:text-base ${optionStyle}`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${indicatorStyle}`}>
                            {indicator}
                          </div>
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {step === "playing" && (
              <button
                onClick={() => {
                  const confirm = window.confirm("ඔබට විභාගය අවසන් කර පිළිතුරු ලබා දීමට අවශ්‍ය බව විශ්වාසද?");
                  if (confirm) handleSubmitExam();
                }}
                className="w-full mt-10 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 md:py-5 rounded-2xl shadow-lg transition-all text-lg"
              >
                📋 පිළිතුරු පත්‍රය ලබා දෙන්න (Submit Exam)
              </button>
            )}

          </>
        )}

      </div>
    </div>
  );
}