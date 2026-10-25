"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function IQToolsPage() {
  const [activeTool, setActiveTool] = useState<"menu" | "dice" | "unfold" | "rotate" | "cube">("menu");

  // --- 1. 3D Dice ---
  const [diceRotateX, setDiceRotateX] = useState(-15);
  const [diceRotateY, setDiceRotateY] = useState(15);

  // --- 2. Unfolding Box ---
  const [isFolded, setIsFolded] = useState(false);
  const [boxRotateX, setBoxRotateX] = useState(-20);
  const [boxRotateY, setBoxRotateY] = useState(30);
  const [activeNetIndex, setActiveNetIndex] = useState(0);

  const nets = [
    {
      name: "කුරුසිය (Cross)",
      faces: [
        { id: 1, label: "1", color: "bg-white", fold: "rotateY(0deg) translateZ(48px)", flat: "translate(0px, 0px)" },
        { id: 2, label: "2", color: "bg-yellow-200", fold: "rotateX(90deg) translateZ(48px)", flat: "translate(0px, -100px)" },
        { id: 3, label: "3", color: "bg-green-200", fold: "rotateX(-90deg) translateZ(48px)", flat: "translate(0px, 100px)" },
        { id: 4, label: "4", color: "bg-red-200", fold: "rotateY(-90deg) translateZ(48px)", flat: "translate(-100px, 0px)" },
        { id: 5, label: "5", color: "bg-blue-200", fold: "rotateY(90deg) translateZ(48px)", flat: "translate(100px, 0px)" },
        { id: 6, label: "6", color: "bg-purple-200", fold: "rotateY(180deg) translateZ(48px)", flat: "translate(0px, 200px)" },
      ]
    },
    {
      name: "T හැඩය (T-Shape)",
      faces: [
        { id: 1, label: "1", color: "bg-white", fold: "rotateY(0deg) translateZ(48px)", flat: "translate(0px, 0px)" },
        { id: 2, label: "2", color: "bg-yellow-200", fold: "rotateX(90deg) translateZ(48px)", flat: "translate(-100px, -100px)" },
        { id: 3, label: "3", color: "bg-green-200", fold: "rotateX(-90deg) translateZ(48px)", flat: "translate(-100px, 100px)" },
        { id: 4, label: "4", color: "bg-red-200", fold: "rotateY(-90deg) translateZ(48px)", flat: "translate(-100px, 0px)" },
        { id: 5, label: "5", color: "bg-blue-200", fold: "rotateY(90deg) translateZ(48px)", flat: "translate(100px, 0px)" },
        { id: 6, label: "6", color: "bg-purple-200", fold: "rotateY(180deg) translateZ(48px)", flat: "translate(200px, 0px)" },
      ]
    },
    {
      name: "පඩිපෙළ (Staircase)",
      faces: [
        { id: 1, label: "1", color: "bg-white", fold: "rotateY(0deg) translateZ(48px)", flat: "translate(0px, 0px)" },
        { id: 2, label: "2", color: "bg-yellow-200", fold: "rotateX(90deg) translateZ(48px)", flat: "translate(0px, -100px)" },
        { id: 3, label: "3", color: "bg-green-200", fold: "rotateX(-90deg) translateZ(48px)", flat: "translate(100px, 100px)" },
        { id: 4, label: "4", color: "bg-red-200", fold: "rotateY(-90deg) translateZ(48px)", flat: "translate(-100px, -100px)" },
        { id: 5, label: "5", color: "bg-blue-200", fold: "rotateY(90deg) translateZ(48px)", flat: "translate(100px, 0px)" },
        { id: 6, label: "6", color: "bg-purple-200", fold: "rotateY(180deg) translateZ(48px)", flat: "translate(200px, 100px)" },
      ]
    },
    {
      name: "L හැඩය (L-Shape variation)",
      faces: [
        { id: 1, label: "1", color: "bg-white", fold: "rotateY(0deg) translateZ(48px)", flat: "translate(0px, 0px)" },
        { id: 2, label: "2", color: "bg-yellow-200", fold: "rotateX(90deg) translateZ(48px)", flat: "translate(0px, -100px)" },
        { id: 3, label: "3", color: "bg-green-200", fold: "rotateX(-90deg) translateZ(48px)", flat: "translate(0px, 100px)" },
        { id: 4, label: "4", color: "bg-red-200", fold: "rotateY(-90deg) translateZ(48px)", flat: "translate(-100px, 0px)" },
        { id: 5, label: "5", color: "bg-blue-200", fold: "rotateY(90deg) translateZ(48px)", flat: "translate(100px, 200px)" },
        { id: 6, label: "6", color: "bg-purple-200", fold: "rotateY(180deg) translateZ(48px)", flat: "translate(0px, 200px)" },
      ]
    }
  ];

  // --- 3. Rotation ---
  const [patternRotation, setPatternRotation] = useState(0);

  // --- 4. Cube Counter Tool ---
  const [gridSize, setGridSize] = useState(3);
  const [cubeColors, setCubeColors] = useState<Record<string, string>>({});
  const [activeCubeColor, setActiveCubeColor] = useState("bg-red-500");
  const [cubeRotX, setCubeRotX] = useState(-20);
  const [cubeRotY, setCubeRotY] = useState(30);

  const handleCubeClick = (x: number, y: number, z: number) => {
    setCubeColors(prev => {
      const key = `${x}-${y}-${z}`;
      if (prev[key] === activeCubeColor) {
        const newColors = { ...prev };
        delete newColors[key];
        return newColors;
      }
      return { ...prev, [key]: activeCubeColor };
    });
  };

  const colorCubeGroup = (type: "edges" | "corners" | "faces" | "all" | "clear") => {
    if (type === "clear") {
      setCubeColors({});
      return;
    }
    const newColors = { ...cubeColors };
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          const isEdgeX = x === 0 || x === gridSize - 1 ? 1 : 0;
          const isEdgeY = y === 0 || y === gridSize - 1 ? 1 : 0;
          const isEdgeZ = z === 0 || z === gridSize - 1 ? 1 : 0;
          const edgeCount = isEdgeX + isEdgeY + isEdgeZ;
          
          if (type === "corners" && edgeCount === 3) newColors[`${x}-${y}-${z}`] = activeCubeColor;
          if (type === "edges" && edgeCount === 2) newColors[`${x}-${y}-${z}`] = activeCubeColor;
          if (type === "faces" && edgeCount === 1) newColors[`${x}-${y}-${z}`] = activeCubeColor;
          if (type === "all") newColors[`${x}-${y}-${z}`] = activeCubeColor;
        }
      }
    }
    setCubeColors(newColors);
  };


  // Tools Menu View
  if (activeTool === "menu") {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-12 modern-font">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800">IQ ඉගැන්වීම් මෙවලම් 🧩</h1>
              <p className="text-slate-500 font-bold mt-2">සිසුන්ට IQ ගැටලු පැහැදිලි කිරීමට භාවිතා කළ හැකි සජීවී ආකෘති</p>
            </div>
            <Link href="/admin" className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm">
              &larr; Admin Dashboard
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div 
              onClick={() => setActiveTool("dice")}
              className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all cursor-pointer border border-slate-200 hover:-translate-y-2 group"
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform origin-left">🎲</div>
              <h3 className="text-lg font-extrabold text-slate-800 mb-2">3D දාදු කැටය</h3>
              <p className="text-xs text-slate-500 font-bold leading-relaxed">අංශක 90 බැගින් ඕනෑම දිශාවකට කැරකැවිය හැකි සජීවී දාදු කැට ආකෘතියකි.</p>
            </div>

            <div 
              onClick={() => setActiveTool("unfold")}
              className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all cursor-pointer border border-slate-200 hover:-translate-y-2 group"
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform origin-left">📦</div>
              <h3 className="text-lg font-extrabold text-slate-800 mb-2">දිගහැරුම් පෙට්ටිය</h3>
              <p className="text-xs text-slate-500 font-bold leading-relaxed">2D දැලක් (Net) නමා 3D ඝනකයක් සාදෙන ආකාරය පෙන්විය හැකි ආකෘතියකි.</p>
            </div>

            <div 
              onClick={() => setActiveTool("rotate")}
              className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all cursor-pointer border border-slate-200 hover:-translate-y-2 group"
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform origin-left">🔄</div>
              <h3 className="text-lg font-extrabold text-slate-800 mb-2">රටා කැරකැවීම</h3>
              <p className="text-xs text-slate-500 font-bold leading-relaxed">රූපයක් අංශක 90, 180 ලෙස කැරකුණු විට පෙනෙන ආකාරය පෙන්විය හැක.</p>
            </div>

            <div 
              onClick={() => setActiveTool("cube")}
              className="bg-blue-50 p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all cursor-pointer border border-blue-200 hover:-translate-y-2 group"
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform origin-left">🧮</div>
              <h3 className="text-lg font-extrabold text-blue-900 mb-2">ඝනක ගණනය</h3>
              <p className="text-xs text-blue-700 font-bold leading-relaxed">කුඩා ඝනක වලින් සැදුණු විශාල ඝනකයක දාර, මුහුණත් සහ කොන් වර්ණ ගැන්වීම.</p>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Common Header for Tools
  const ToolHeader = ({ title }: { title: string }) => (
    <div className="w-full flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
      <h2 className="text-2xl font-extrabold text-slate-800">{title}</h2>
      <button 
        onClick={() => setActiveTool("menu")}
        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm transition-all"
      >
        &larr; වෙනත් මෙවලමක්
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-8 modern-font px-4">
      <div className="max-w-4xl w-full bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-slate-200 flex flex-col items-center overflow-hidden">
        
        {activeTool === "dice" && (
          <>
            <ToolHeader title="IQ දාදු කැට ආකෘතිය (3D Dice)" />
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 [perspective:1200px] mb-16">
              <div 
                className="w-full h-full relative transition-transform duration-700 ease-out [transform-style:preserve-3d]"
                style={{ transform: `rotateX(${diceRotateX}deg) rotateY(${diceRotateY}deg)` }}
              >
                <div className="absolute inset-0 bg-white/95 border-4 border-slate-800 flex items-center justify-center text-7xl font-extrabold text-slate-800 rounded-2xl" style={{ transform: 'rotateY(0deg) translateZ(8rem)' }}>1</div>
                <div className="absolute inset-0 bg-blue-100/95 border-4 border-slate-800 flex items-center justify-center text-7xl font-extrabold text-blue-800 rounded-2xl" style={{ transform: 'rotateY(180deg) translateZ(8rem)' }}>6</div>
                <div className="absolute inset-0 bg-red-100/95 border-4 border-slate-800 flex items-center justify-center text-7xl font-extrabold text-red-800 rounded-2xl" style={{ transform: 'rotateY(90deg) translateZ(8rem)' }}>3</div>
                <div className="absolute inset-0 bg-green-100/95 border-4 border-slate-800 flex items-center justify-center text-7xl font-extrabold text-green-800 rounded-2xl" style={{ transform: 'rotateY(-90deg) translateZ(8rem)' }}>4</div>
                <div className="absolute inset-0 bg-yellow-100/95 border-4 border-slate-800 flex items-center justify-center text-7xl font-extrabold text-yellow-700 rounded-2xl" style={{ transform: 'rotateX(90deg) translateZ(8rem)' }}>2</div>
                <div className="absolute inset-0 bg-purple-100/95 border-4 border-slate-800 flex items-center justify-center text-7xl font-extrabold text-purple-800 rounded-2xl" style={{ transform: 'rotateX(-90deg) translateZ(8rem)' }}>5</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:gap-4 bg-slate-100 p-6 rounded-3xl w-full max-w-sm border border-slate-200">
              <div></div>
              <button onClick={() => setDiceRotateX(p => p + 90)} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold shadow-md transition-all active:scale-95 flex flex-col items-center justify-center text-xs">⬆ ඉහළට</button>
              <div></div>
              <button onClick={() => setDiceRotateY(p => p - 90)} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold shadow-md transition-all active:scale-95 flex flex-col items-center justify-center text-xs">⬅ වමට</button>
              <button onClick={() => { setDiceRotateX(-15); setDiceRotateY(15); }} className="bg-slate-300 hover:bg-slate-400 text-slate-800 p-3 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center text-xs">Reset</button>
              <button onClick={() => setDiceRotateY(p => p + 90)} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold shadow-md transition-all active:scale-95 flex flex-col items-center justify-center text-xs">දකුණට ➡</button>
              <div></div>
              <button onClick={() => setDiceRotateX(p => p - 90)} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold shadow-md transition-all active:scale-95 flex flex-col items-center justify-center text-xs">⬇ පහළට</button>
              <div></div>
            </div>
          </>
        )}

        {activeTool === "unfold" && (
          <>
            <ToolHeader title="දිගහැරුම් පෙට්ටිය (Unfolding Box)" />
            
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {nets.map((net, idx) => (
                <button 
                  key={idx}
                  onClick={() => { setActiveNetIndex(idx); setIsFolded(false); }}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeNetIndex === idx ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {net.name}
                </button>
              ))}
            </div>

            <div className="relative w-64 h-64 [perspective:1000px] mb-12 flex items-center justify-center">
              <div
                className="relative w-24 h-24 [transform-style:preserve-3d] transition-transform duration-700"
                style={{ transform: isFolded ? `rotateX(${boxRotateX}deg) rotateY(${boxRotateY}deg)` : `rotateX(0deg) rotateY(0deg) scale(0.65)` }}
              >
                {nets[activeNetIndex].faces.map((face) => (
                  <div 
                    key={face.id} 
                    className={`absolute w-24 h-24 flex items-center justify-center text-3xl font-extrabold border-2 border-slate-800 transition-all duration-1000 opacity-90 ${face.color}`}
                    style={isFolded ? { transform: face.fold } : { transform: face.flat }}
                  >
                    {face.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center gap-6 w-full">
              <button onClick={() => setIsFolded(!isFolded)} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg transition-all active:scale-95 w-full sm:w-auto text-lg">
                {isFolded ? "📦 පෙට්ටිය දිගහරින්න (Unfold)" : "🧊 පෙට්ටිය නමන්න (Fold)"}
              </button>
              <div className={`transition-all duration-500 ${isFolded ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden'}`}>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <button onClick={() => setBoxRotateY(p => p - 90)} className="bg-slate-100 hover:bg-slate-200 border border-slate-300 px-4 py-2.5 rounded-xl font-bold active:scale-95">⬅ වමට</button>
                    <button onClick={() => setBoxRotateX(p => p + 90)} className="bg-slate-100 hover:bg-slate-200 border border-slate-300 px-4 py-2.5 rounded-xl font-bold active:scale-95">⬆ උඩට</button>
                    <button onClick={() => setBoxRotateX(p => p - 90)} className="bg-slate-100 hover:bg-slate-200 border border-slate-300 px-4 py-2.5 rounded-xl font-bold active:scale-95">⬇ පහළට</button>
                    <button onClick={() => setBoxRotateY(p => p + 90)} className="bg-slate-100 hover:bg-slate-200 border border-slate-300 px-4 py-2.5 rounded-xl font-bold active:scale-95">දකුණට ➡</button>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTool === "rotate" && (
          <>
            <ToolHeader title="රටා කැරකැවීම (Shape Rotation)" />
            <div className="mb-12 p-8 border-4 border-slate-200 rounded-[2.5rem] bg-slate-50 shadow-inner">
                <div className="grid grid-cols-3 gap-2 w-48 h-48 transition-transform duration-700 ease-in-out" style={{ transform: `rotate(${patternRotation}deg)` }}>
                    <div className="bg-blue-600 rounded-tl-2xl"></div>
                    <div className="bg-transparent flex items-center justify-center"><div className="w-4 h-4 bg-slate-400 rounded-full"></div></div>
                    <div className="bg-red-500 rounded-tr-2xl"></div>
                    <div className="bg-transparent flex items-center justify-center"><div className="w-4 h-4 bg-slate-400 rounded-full"></div></div>
                    <div className="bg-slate-800 rounded-full scale-50"></div>
                    <div className="bg-green-500"></div>
                    <div className="bg-yellow-400 rounded-bl-2xl flex items-center justify-center text-white font-bold text-xl">X</div>
                    <div className="bg-transparent flex items-center justify-center"><div className="w-4 h-4 bg-slate-400 rounded-full"></div></div>
                    <div className="bg-purple-600 rounded-br-2xl flex items-center justify-center text-white font-bold text-xl">O</div>
                </div>
            </div>
            <div className="flex flex-col items-center gap-2 w-full">
              <span className="text-blue-600 font-extrabold text-xl mb-4">දැනට හැරී ඇති කෝණය: {patternRotation % 360}°</span>
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={() => setPatternRotation(r => r - 90)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all active:scale-95">
                  ↺ වමට 90° (වාමාවර්ත)
                </button>
                <button onClick={() => setPatternRotation(0)} className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-6 py-3 rounded-xl font-bold shadow-sm transition-all active:scale-95">
                  මුල් තත්ත්වයට
                </button>
                <button onClick={() => setPatternRotation(r => r + 90)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all active:scale-95">
                  දකුණට 90° ↻ (දක්ෂිණාවර්ත)
                </button>
              </div>
            </div>
          </>
        )}

        {activeTool === "cube" && (
          <div className="w-full flex flex-col items-center">
            <ToolHeader title="IQ ඝනක ගණනය (Cube Counter)" />
            
            <div className="flex items-center gap-4 bg-slate-100 p-2 rounded-xl border border-slate-300 mb-8">
              <button 
                onClick={() => {setGridSize(s => Math.max(1, s - 1)); setCubeColors({});}} 
                className="bg-white hover:bg-slate-200 w-10 h-10 rounded-lg font-bold text-xl shadow-sm border border-slate-200"
              >-</button>
              <span className="font-extrabold text-slate-700 min-w-[80px] text-center">{gridSize} x {gridSize} x {gridSize}</span>
              <button 
                onClick={() => {setGridSize(s => Math.min(5, s + 1)); setCubeColors({});}} 
                className="bg-white hover:bg-slate-200 w-10 h-10 rounded-lg font-bold text-xl shadow-sm border border-slate-200"
              >+</button>
            </div>

            <div className="flex gap-2 mb-8">
              {["bg-red-500", "bg-blue-500", "bg-yellow-400", "bg-green-500"].map(color => (
                <button 
                  key={color} 
                  onClick={() => setActiveCubeColor(color)}
                  className={`w-10 h-10 rounded-full border-4 transition-all ${color} ${activeCubeColor === color ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                />
              ))}
            </div>

            <div className="relative w-64 h-64 [perspective:1500px] mb-16 mt-8 flex items-center justify-center">
              <div 
                className="relative transition-transform duration-500 ease-out [transform-style:preserve-3d]"
                style={{ transform: `rotateX(${cubeRotX}deg) rotateY(${cubeRotY}deg)` }}
              >
                {Array.from({ length: gridSize }).map((_, x) =>
                  Array.from({ length: gridSize }).map((_, y) =>
                    Array.from({ length: gridSize }).map((_, z) => {
                      const offset = (gridSize - 1) / 2;
                      const sizePx = 40;
                      const gap = 2;
                      const px = (x - offset) * (sizePx + gap);
                      const py = (y - offset) * (sizePx + gap);
                      const pz = (z - offset) * (sizePx + gap);
                      
                      const key = `${x}-${y}-${z}`;
                      const color = cubeColors[key] || "bg-slate-300";
                      
                      return (
                        <div 
                          key={key} 
                          className="absolute [transform-style:preserve-3d]" 
                          style={{ transform: `translate3d(${px}px, ${py}px, ${pz}px)` }}
                        >
                          {/* Front Face */}
                          <div onClick={() => handleCubeClick(x, y, z)} className={`absolute border border-black/30 cursor-pointer hover:brightness-110 transition-colors ${color}`} style={{ width: sizePx, height: sizePx, transform: `translate(-50%, -50%) rotateY(0deg) translateZ(${sizePx/2}px)` }} />
                          {/* Back Face */}
                          <div onClick={() => handleCubeClick(x, y, z)} className={`absolute border border-black/30 cursor-pointer hover:brightness-110 transition-colors ${color}`} style={{ width: sizePx, height: sizePx, transform: `translate(-50%, -50%) rotateY(180deg) translateZ(${sizePx/2}px)` }} />
                          {/* Right Face */}
                          <div onClick={() => handleCubeClick(x, y, z)} className={`absolute border border-black/30 cursor-pointer hover:brightness-110 transition-colors ${color}`} style={{ width: sizePx, height: sizePx, transform: `translate(-50%, -50%) rotateY(90deg) translateZ(${sizePx/2}px)` }} />
                          {/* Left Face */}
                          <div onClick={() => handleCubeClick(x, y, z)} className={`absolute border border-black/30 cursor-pointer hover:brightness-110 transition-colors ${color}`} style={{ width: sizePx, height: sizePx, transform: `translate(-50%, -50%) rotateY(-90deg) translateZ(${sizePx/2}px)` }} />
                          {/* Top Face */}
                          <div onClick={() => handleCubeClick(x, y, z)} className={`absolute border border-black/30 cursor-pointer hover:brightness-110 transition-colors ${color}`} style={{ width: sizePx, height: sizePx, transform: `translate(-50%, -50%) rotateX(90deg) translateZ(${sizePx/2}px)` }} />
                          {/* Bottom Face */}
                          <div onClick={() => handleCubeClick(x, y, z)} className={`absolute border border-black/30 cursor-pointer hover:brightness-110 transition-colors ${color}`} style={{ width: sizePx, height: sizePx, transform: `translate(-50%, -50%) rotateX(-90deg) translateZ(${sizePx/2}px)` }} />
                        </div>
                      );
                    })
                  )
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-4">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-bold text-slate-500 mb-1">කෙටිමං වර්ණ ගැන්වීම් (Quick Colors):</span>
                <button onClick={() => colorCubeGroup("corners")} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95">
                  කොන් පමණක් පාට කරන්න (Corners)
                </button>
                <button onClick={() => colorCubeGroup("edges")} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95">
                  දාර පමණක් පාට කරන්න (Edges)
                </button>
                <button onClick={() => colorCubeGroup("faces")} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95">
                  මැද මුහුණත් පාට කරන්න (Centers)
                </button>
                <button onClick={() => colorCubeGroup("clear")} className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2.5 rounded-xl font-bold text-sm mt-2 transition-all active:scale-95">
                  සියල්ල මකන්න (Clear)
                </button>
              </div>

              <div className="flex flex-col items-center justify-center bg-slate-100 p-4 rounded-3xl border border-slate-200">
                <span className="text-sm font-bold text-slate-500 mb-3">ඝනකය කරකවන්න (Rotate):</span>
                <div className="grid grid-cols-3 gap-2">
                  <div></div>
                  <button onClick={() => setCubeRotX(p => p + 30)} className="bg-blue-600 hover:bg-blue-700 text-white w-12 h-10 rounded-lg font-bold shadow-md transition-all active:scale-95">⬆</button>
                  <div></div>
                  <button onClick={() => setCubeRotY(p => p - 30)} className="bg-blue-600 hover:bg-blue-700 text-white w-12 h-10 rounded-lg font-bold shadow-md transition-all active:scale-95">⬅</button>
                  <button onClick={() => { setCubeRotX(-20); setCubeRotY(30); }} className="bg-slate-300 hover:bg-slate-400 text-slate-800 text-[10px] w-12 h-10 rounded-lg font-bold transition-all active:scale-95">Reset</button>
                  <button onClick={() => setCubeRotY(p => p + 30)} className="bg-blue-600 hover:bg-blue-700 text-white w-12 h-10 rounded-lg font-bold shadow-md transition-all active:scale-95">➡</button>
                  <div></div>
                  <button onClick={() => setCubeRotX(p => p - 30)} className="bg-blue-600 hover:bg-blue-700 text-white w-12 h-10 rounded-lg font-bold shadow-md transition-all active:scale-95">⬇</button>
                  <div></div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}