"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string; quizId: string }> | { id: string; quizId: string };
};

export default function StudentQuizPage({ params }: PageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [quiz, setQuiz] = useState<any>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuizData = async () => {
      const resolved = await params;
      try {
        const res = await fetch(`/api/student/quizzes/${resolved.quizId}`);
        const data = await res.json();
        if (res.ok) setQuiz(data.data);
      } catch (error) { 
        console.error(error); 
      } finally { 
        setIsLoading(false); // 🔴 මෙතන තමයි වරද හැදුවේ
      }
    };
    fetchQuizData();
  }, [params]);

  const handleSelectOption = (qIndex: number, oIndex: number) => {
    if (isSubmitted) return; // Submit කරාට පස්සේ වෙනස් කරන්න බෑ
    setSelectedAnswers({ ...selectedAnswers, [qIndex]: oIndex });
  };

  const handleSubmitExam = async () => {
    if (Object.keys(selectedAnswers).length < quiz.questions.length) {
      const confirm = window.confirm("ඔබ සියලුම ප්‍රශ්න වලට පිළිතුරු සපයා නැත. විභාගය අවසන් කිරීමට අවශ්‍ය බව විශ්වාසද?");
      if (!confirm) return;
    }

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
    setIsSubmitted(true);

    // Database එකට ලකුණු සේව් කිරීමට යැවීම
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

  if (isLoading) return <div className="text-center py-20 font-bold">ප්‍රශ්න පත්‍රය සූදානම් වෙමින් පවතී...</div>;
  if (!quiz) return <div className="text-center py-20 font-bold text-red-500">ප්‍රශ්න පත්‍රය සොයාගත නොහැක.</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 modern-font text-slate-800">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border p-6 md:p-8 shadow-sm">
        
        <div className="border-b pb-4 mb-6 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">{quiz.title}</h1>
          <button onClick={() => router.back()} className="text-sm font-bold bg-slate-100 px-4 py-2 rounded-xl">&larr; Back</button>
        </div>

        {isSubmitted && (
          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-2xl text-center">
            <h2 className="text-lg font-bold text-blue-900">🎯 ඔබගේ ප්‍රතිඵල ලැබී ඇත!</h2>
            <p className="text-3xl font-black text-blue-600 mt-2">{score} / {quiz.questions.length}</p>
            <p className="text-sm text-blue-500 font-bold mt-1">ප්‍රතිශතය: {((score / quiz.questions.length) * 100).toFixed(1)}%</p>
          </div>
        )}

        <div className="space-y-8">
          {quiz.questions.map((q: any, qIdx: number) => (
            <div key={qIdx} className="p-5 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-base md:text-lg mb-4 text-slate-900">{qIdx + 1}. {q.questionText}</h3>
              
              <div className="grid grid-cols-1 gap-3">
                {q.options.map((option: string, oIdx: number) => {
                  const isSelected = selectedAnswers[qIdx] === oIdx;
                  const isCorrectAnswer = q.correctOptionIndex === oIdx;
                  
                  let optionStyle = "border-slate-200 bg-white hover:bg-slate-100";
                  if (isSelected) optionStyle = "border-blue-500 bg-blue-50/50 text-blue-700 font-bold";
                  
                  // Submit කළාට පස්සේ පාට වෙනස් වීම
                  if (isSubmitted) {
                    if (isCorrectAnswer) {
                      optionStyle = "border-green-500 bg-green-100 text-green-800 font-bold"; // හරි උත්තරේ කොළ පාටයි
                    } else if (isSelected && !isCorrectAnswer) {
                      optionStyle = "border-red-500 bg-red-100 text-red-800 font-bold"; // ළමයා ලියපු වැරදි එක රතු පාටයි
                    } else {
                      optionStyle = "border-slate-200 bg-white opacity-60";
                    }
                  }

                  return (
                    <button
                      key={oIdx} type="button" disabled={isSubmitted}
                      onClick={() => handleSelectOption(qIdx, oIdx)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 text-sm md:text-base ${optionStyle}`}
                    >
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}>
                        {String.fromCharCode(65 + oIdx)}
                      </div>
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {!isSubmitted && (
          <button
            onClick={handleSubmitExam}
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all text-lg"
          >
            📋 විභාගය අවසන් කරන්න (Submit Exam)
          </button>
        )}

      </div>
    </div>
  );
}