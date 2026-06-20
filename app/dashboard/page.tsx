"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // ළමයා ලොග් වෙලා නැත්නම් ආයෙත් මුල් පිටුවට යවනවා
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Dark/Light Mode මාරු කරන Function එක
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // පන්තියට අදාළ විස්තර (මේවා පස්සේ Database එකෙන් ගන්න පුළුවන්)
  const availableCourses = [
    {
      id: 1,
      title: "2026 A/L Chemistry - Theory",
      description: "සම්පූර්ණ සිද්ධාන්ත සහ ප්‍රායෝගික පරීක්ෂණ සහිතයි.",
      image: "🧪",
      status: "Available",
    },
    {
      id: 2,
      title: "2026 A/L Chemistry - Revision",
      description: "පසුගිය ප්‍රශ්න පත්‍ර සාකච්ඡාව සහ කෙටි ක්‍රම.",
      image: "📚",
      status: "Coming Soon",
    },
  ];

  // ලොග් වෙනකම් Loading පෙන්වීම
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ලොග් වුණාට පස්සේ පෙන්වන පිටුව
  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "dark bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      
      {/* Header කොටස */}
      <header className="sticky top-0 z-50 flex justify-between items-center p-4 md:px-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">
            20
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
            minutes.lk
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle බොත්තම */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Toggle Dark/Light Mode"
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>

          {/* User Name & Logout */}
          <div className="hidden md:block font-medium">
            ආයුබෝවන්, <span className="text-blue-600 dark:text-blue-400">{session?.user?.name || "ශිෂ්‍යයා"}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            ඉවත් වන්න (Logout)
          </button>
        </div>
      </header>

      {/* Main Content (Courses පෙන්වන කොටස) */}
      <main className="max-w-6xl mx-auto p-6 md:p-8 mt-4">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">ඔබේ පාඨමාලා (Courses)</h2>
          <p className="text-gray-600 dark:text-gray-400">ඔබට සම්බන්ධ විය හැකි පන්ති පහතින් තෝරන්න.</p>
        </div>

        {/* Courses Grid එක */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="text-4xl mb-4">{course.image}</div>
              <h3 className="text-xl font-bold mb-2">{course.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 h-10">
                {course.description}
              </p>
              <button 
                className={`w-full py-3 rounded-xl font-bold transition-colors ${
                  course.status === "Available" 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                }`}
                disabled={course.status !== "Available"}
              >
                {course.status === "Available" ? "පන්තියට ඇතුළු වන්න" : "ළඟදීම..."}
              </button>
            </div>
          ))}
        </div>
      </main>

    </div>
  );
}