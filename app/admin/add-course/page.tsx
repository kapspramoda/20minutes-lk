"use client";

import React, { useState } from "react";

export default function AddCoursePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // පෝරමයේ මූලික දත්ත ව්‍යුහය (State එක)
  const [courseData, setCourseData] = useState({
    title: "",
    whatsappLink: "",
    subjects: [
      {
        subjectId: "sub_" + Date.now(), // ඉබේම ID එකක් හැදෙන්න
        name: "",
        liveClass: { time: "", zoomLink: "" },
        lessons: [],
      }
    ]
  });

  // විෂයයක් (Subject) අලුතින් එකතු කිරීම
  const addSubject = () => {
    setCourseData({
      ...courseData,
      subjects: [
        ...courseData.subjects,
        { subjectId: "sub_" + Date.now(), name: "", liveClass: { time: "", zoomLink: "" }, lessons: [] }
      ]
    });
  };

  // විෂයයකට අලුත් පාඩමක් (Lesson) එකතු කිරීම
  const addLesson = (subjectIndex: number) => {
    const updatedSubjects = [...courseData.subjects];
    updatedSubjects[subjectIndex].lessons.push({
      lessonId: "les_" + Date.now(), // ඉබේම ID එකක් හැදෙන්න
      title: "",
      videoEmbed: "",
      pdfUrl: ""
    } as never);
    setCourseData({ ...courseData, subjects: updatedSubjects });
  };

  // දත්ත Database එකට යැවීම (Submit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "✅ පාඨමාලාව සාර්ථකව Database එකට ඇතුළත් කළා!" });
        // පෝරමය නැවත හිස් කිරීම
        setCourseData({
          title: "", whatsappLink: "", subjects: [{ subjectId: "sub_" + Date.now(), name: "", liveClass: { time: "", zoomLink: "" }, lessons: [] }]
        });
      } else {
        setMessage({ type: "error", text: "❌ දෝෂයක්: " + data.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "❌ පද්ධතියේ දෝෂයක් ඇතිවිය." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 modern-font text-slate-800">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        
        <h1 className="text-2xl font-bold mb-6 text-slate-900 border-b pb-4">
          අලුත් පාඨමාලාවක් ඇතුළත් කිරීම (Add New Course)
        </h1>

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
                placeholder="උදා: සාමාන්‍ය පෙළ ගණිතය 2026"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">WhatsApp Group Link</label>
              <input 
                type="url" 
                value={courseData.whatsappLink}
                onChange={(e) => setCourseData({...courseData, whatsappLink: e.target.value})}
                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="https://chat.whatsapp.com/..."
              />
            </div>
          </div>

          {/* 2. විෂයයන් සහ පාඩම් */}
          <div>
            <h2 className="text-lg font-bold text-slate-700 mb-4">2. විෂයයන් (Subjects) සහ පාඩම් (Lessons)</h2>
            
            {courseData.subjects.map((subject, sIndex) => (
              <div key={subject.subjectId} className="bg-white border-2 border-blue-100 p-6 rounded-xl mb-6 shadow-sm">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-bold mb-2">විෂයයේ නම (Subject Name) *</label>
                    <input 
                      type="text" required
                      value={subject.name}
                      onChange={(e) => {
                        const updated = [...courseData.subjects];
                        updated[sIndex].name = e.target.value;
                        setCourseData({...courseData, subjects: updated});
                      }}
                      className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="උදා: වීජ ගණිතය"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Live Class වෙලාව</label>
                    <input 
                      type="text" 
                      value={subject.liveClass.time}
                      onChange={(e) => {
                        const updated = [...courseData.subjects];
                        updated[sIndex].liveClass.time = e.target.value;
                        setCourseData({...courseData, subjects: updated});
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
                      placeholder="සෑම ඉරිදාවකම රාත්‍රී 8 ට"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold mb-2">Zoom Link එක</label>
                    <input 
                      type="url" 
                      value={subject.liveClass.zoomLink}
                      onChange={(e) => {
                        const updated = [...courseData.subjects];
                        updated[sIndex].liveClass.zoomLink = e.target.value;
                        setCourseData({...courseData, subjects: updated});
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
                      placeholder="https://zoom.us/..."
                    />
                  </div>
                </div>

                {/* අදාළ විෂයයේ පාඩම් ටික */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-600 mb-4 border-b pb-2">මෙම විෂයයේ පාඩම් ලැයිස්තුව</h3>
                  
                  {subject.lessons.map((lesson: any, lIndex: number) => (
                    <div key={lesson.lessonId} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 bg-white p-3 rounded-lg border">
                      <div>
                        <label className="block text-xs font-bold mb-1 text-slate-500">පාඩමේ මාතෘකාව *</label>
                        <input 
                          type="text" required
                          value={lesson.title}
                          onChange={(e) => {
                            const updated = [...courseData.subjects];
                            updated[sIndex].lessons[lIndex].title = e.target.value;
                            setCourseData({...courseData, subjects: updated});
                          }}
                          className="w-full p-2 rounded-lg border text-sm"
                          placeholder="උදා: 1 වන පාඩම"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1 text-slate-500">YouTube Embed Link *</label>
                        <input 
                          type="url" required
                          value={lesson.videoEmbed}
                          onChange={(e) => {
                            const updated = [...courseData.subjects];
                            updated[sIndex].lessons[lIndex].videoEmbed = e.target.value;
                            setCourseData({...courseData, subjects: updated});
                          }}
                          className="w-full p-2 rounded-lg border text-sm"
                          placeholder="https://www.youtube.com/embed/..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1 text-slate-500">Tute (PDF) Link</label>
                        <input 
                          type="url" 
                          value={lesson.pdfUrl}
                          onChange={(e) => {
                            const updated = [...courseData.subjects];
                            updated[sIndex].lessons[lIndex].pdfUrl = e.target.value;
                            setCourseData({...courseData, subjects: updated});
                          }}
                          className="w-full p-2 rounded-lg border text-sm"
                          placeholder="Drive link..."
                        />
                      </div>
                    </div>
                  ))}

                  <button 
                    type="button" 
                    onClick={() => addLesson(sIndex)}
                    className="mt-2 text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold hover:bg-blue-200 transition"
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
            className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-blue-700 transition shadow-lg disabled:bg-slate-400"
          >
            {isLoading ? "Course එක Database එකට Save වෙමින් පවතී..." : "Course එක Save කරන්න (Submit)"}
          </button>

        </form>
      </div>
    </div>
  );
}