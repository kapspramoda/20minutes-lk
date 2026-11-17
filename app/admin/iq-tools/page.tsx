"use client";

import React, { useState } from "react";
import Link from "next/link";

// --- 5 වන මෙවලම (Mixed Cube) සඳහා අවශ්‍ය Types ---
type SubBlock = {
  id: string;
  x: number; // ආරම්භක X (0 සිට N-1)
  y: number; // ආරම්භක Y (0 සිට N-1)
  z: number; // ආරම්භක Z (0 සිට N-1)
  w: number; // පළල (X දිශාවට ඒකක ගණන)
  h: number; // උස (Y දිශාවට ඒකක ගණන)
  d: number; // ගැඹුර (Z දිශාවට ඒකක ගණන)
  showUnitGrid: boolean; // පොඩි දාදු කැටවල Grid Lines පෙන්වන්නද යන්න
};

export default function IQToolsPage() {
  const [activeTool, setActiveTool] = useState<"menu" | "dice" | "unfold" | "rotate" | "cube" | "mixedCube">("menu");

  // --- 1. 3D Dice (පැරණි කේතය එලෙසම) ---
  const [diceRotateX, setDiceRotateX] = useState(-15);
  const [diceRotateY, setDiceRotateY] = useState(15);

  // --- 2. Unfolding Box (පැරණි කේතය එලෙසම) ---
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

  // --- 3. Rotation (පැරණි කේතය එලෙසම) ---
  const [patternRotation, setPatternRotation] = useState(0);

  // --- 4. Cube Counter Tool (පැරණි කේතය + Sub-grid පහසුකම) ---
  const [gridSize, setGridSize] = useState(3);
  const [cubeColors, setCubeColors] = useState<Record<string, string>>({});
  const [activeCubeColor, setActiveCubeColor] = useState("bg-red-500");
  const [cubeRotX, setCubeRotX] = useState(-20);
  const [cubeRotY, setCubeRotY] = useState(30);
  // 4 වන මෙවලමේ අලුත් Sub-grid (පොඩි කැට බෙදීමේ) states
  const [cubeToolAction, setCubeToolAction] = useState<"paint" | "subdivide">("paint");
  const [subdividedCubes, setSubdividedCubes] = useState<Record<string, boolean>>({});
  const [subFaceColors, setSubFaceColors] = useState<Record<string, string>>({});

  const handleCubeClick = (x: number, y: number, z: number) => {
    const key = `${x}-${y}-${z}`;
    if (cubeToolAction === "subdivide") {
      setSubdividedCubes(prev => ({ ...prev, [key]: !prev[key] }));
      return;
    }
    setCubeColors(prev => {
      if (prev[key] === activeCubeColor) {
        const newColors = { ...prev };
        delete newColors[key];
        return newColors;
      }
      return { ...prev, [key]: activeCubeColor };
    });
  };

  const handleSubCellClick = (e: React.MouseEvent, cubeKey: string, faceName: string, cellIdx: number) => {
    e.stopPropagation();
    if (cubeToolAction === "subdivide") {
      setSubdividedCubes(prev => ({ ...prev, [cubeKey]: !prev[cubeKey] }));
      return;
    }
    const subKey = `${cubeKey}-${faceName}-${cellIdx}`;
    setSubFaceColors(prev => {
      if (prev[subKey] === activeCubeColor) {
        const copy = { ...prev };
        delete copy[subKey];
        return copy;
      }
      return { ...prev, [subKey]: activeCubeColor };
    });
  };

  const colorCubeGroup = (type: "edges" | "corners" | "faces" | "all" | "clear") => {
    if (type === "clear") {
      setCubeColors({});
      setSubdividedCubes({});
      setSubFaceColors({});
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

  // ============================================================================
  // --- 5. අලුත්ම මෙවලම: මිශ්‍ර ඝනක සහ දාදු කැට බෙදුම (Mixed / Sub-divided Cube) ---
  // ============================================================================
  const [mixedTotalUnits, setMixedTotalUnits] = useState(5); // 5x5x5 ඒකක පද්ධතිය (ඔයාගේ රූපයේ පරිදි)
  const [mixedRotX, setMixedRotX] = useState(-22);
  const [mixedRotY, setMixedRotY] = useState(-28);
  const [mixedGap, setMixedGap] = useState(2); // කොටස් අතර පරතරය (Explode view)
  const [mixedActiveColor, setMixedActiveColor] = useState("bg-blue-400");
  const [mixedMode, setMixedMode] = useState<"paintUnit" | "paintBlock" | "toggleGrid" | "markX" | "markDot">("paintUnit");

  // ඔයා එවූ රූපසටහනේ (5x5x5) ආකෘතිය Default ලෙස ලබා දීම:
  // වම් පැත්තේ පළල 2 කොටස (x: 0..2) -> 2 x 5 x 5 කුඩා දාදු කැට සහිතව
  // දකුණු පැත්තේ පළල 3 කොටස (x: 2..5) -> ඉහළ සහ පහළ ලොකු කුට්ටි ලෙස
  const getNotebookDiagramBlocks = (): SubBlock[] => [
    // වම් පැත්තේ කුඩා දාදු කැට කොටස (පළල 2, උස 5, ගැඹුර 5 = කැට 50)
    { id: "left-small-grid", x: 0, y: 0, z: 0, w: 2, h: 5, d: 5, showUnitGrid: true },
    // දකුණු පැත්තේ ඉහළ ඉදිරිපස ලොකු කොටස
    { id: "right-top-front", x: 2, y: 0, z: 2, w: 3, h: 2, d: 3, showUnitGrid: false },
    // දකුණු පැත්තේ ඉහළ පසුපස ලොකු කොටස
    { id: "right-top-back", x: 2, y: 0, z: 0, w: 3, h: 2, d: 2, showUnitGrid: false },
    // දකුණු පැත්තේ පහළ ඉදිරිපස ලොකු කොටස (ඊතලයෙන් පෙන්වා ඇති නිල් මුහුණත සහිත කොටස)
    { id: "right-bottom-front", x: 2, y: 2, z: 2, w: 3, h: 3, d: 3, showUnitGrid: false },
    // දකුණු පැත්තේ පහළ පසුපස ලොකු කොටස
    { id: "right-bottom-back", x: 2, y: 2, z: 0, w: 3, h: 3, d: 2, showUnitGrid: false },
  ];

  const [mixedBlocks, setMixedBlocks] = useState<SubBlock[]>(getNotebookDiagramBlocks());
  // එක් එක් කුඩා ඒකක මුහුණතක වර්ණය: key = `${blockId}-${face}-${row}-${col}`
  const [mixedFaceColors, setMixedFaceColors] = useState<Record<string, string>>({});
  // එක් එක් කුඩා ඒකක මුහුණතක ලකුණ (X හෝ •): key = `${blockId}-${face}-${row}-${col}`
  const [mixedFaceMarks, setMixedFaceMarks] = useState<Record<string, string>>({});

  // Custom Slicer (X, Y, Z කැපුම් රේඛා)
  const [xCutInput, setXCutInput] = useState("2");
  const [yCutInput, setYCutInput] = useState("2");
  const [zCutInput, setZCutInput] = useState("2");

  const applyCustomSlicer = (totalN: number, xStr: string, yStr: string, zStr: string) => {
    const parseCuts = (str: string) => {
      const nums = str
        .split(",")
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n) && n > 0 && n < totalN)
        .sort((a, b) => a - b);
      const unique = Array.from(new Set(nums));
      return [0, ...unique, totalN];
    };

    const xBounds = parseCuts(xStr);
    const yBounds = parseCuts(yStr);
    const zBounds = parseCuts(zStr);

    const newBlocks: SubBlock[] = [];
    for (let xi = 0; xi < xBounds.length - 1; xi++) {
      for (let yi = 0; yi < yBounds.length - 1; yi++) {
        for (let zi = 0; zi < zBounds.length - 1; zi++) {
          const x = xBounds[xi];
          const y = yBounds[yi];
          const z = zBounds[zi];
          const w = xBounds[xi + 1] - x;
          const h = yBounds[yi + 1] - y;
          const d = zBounds[zi + 1] - z;
          newBlocks.push({
            id: `blk-${x}-${y}-${z}`,
            x, y, z, w, h, d,
            // පළල 2 හෝ ඊට අඩු කොටස්වලට ඉබේම පොඩි කැට Grid එක දානවා (වෙනස් කළ හැක)
            showUnitGrid: xi === 0
          });
        }
      }
    }
    setMixedBlocks(newBlocks);
    setMixedFaceColors({});
    setMixedFaceMarks({});
  };

  // Preset ආකෘති ලෝඩ් කිරීම
  const loadMixedPreset = (preset: "notebook" | "halfSplit" | "cornerBlock" | "fullSmall") => {
    setMixedFaceColors({});
    setMixedFaceMarks({});
    if (preset === "notebook") {
      setMixedTotalUnits(5);
      setMixedBlocks(getNotebookDiagramBlocks());
    } else if (preset === "halfSplit") {
      setMixedTotalUnits(4);
      setMixedBlocks([
        { id: "left-small", x: 0, y: 0, z: 0, w: 2, h: 4, d: 4, showUnitGrid: true },
        { id: "right-big", x: 2, y: 0, z: 0, w: 2, h: 4, d: 4, showUnitGrid: false },
      ]);
    } else if (preset === "cornerBlock") {
      setMixedTotalUnits(4);
      setMixedBlocks([
        { id: "corner-small", x: 0, y: 0, z: 2, w: 2, h: 2, d: 2, showUnitGrid: true },
        { id: " corner-2", x: 2, y: 0, z: 2, w: 2, h: 2, d: 2, showUnitGrid: false },
        { id: "bottom-front", x: 0, y: 2, z: 2, w: 4, h: 2, d: 2, showUnitGrid: false },
        { id: "back-whole", x: 0, y: 0, z: 0, w: 4, h: 4, d: 2, showUnitGrid: false },
      ]);
    } else if (preset === "fullSmall") {
      setMixedTotalUnits(5);
      setMixedBlocks([
        { id: "all-small", x: 0, y: 0, z: 0, w: 5, h: 5, d: 5, showUnitGrid: true }
      ]);
    }
  };

  // Mixed Cube එකේ මුහුණතක් Click කළ විට සිදුවන දේ
  const handleMixedCellClick = (
    block: SubBlock,
    faceName: string,
    r: number,
    c: number,
    rowsCount: number,
    colsCount: number
  ) => {
    // 1. Grid Lines පෙන්වීම / ඉවත් කිරීම (Toggle Grid Mode)
    if (mixedMode === "toggleGrid") {
      setMixedBlocks(prev =>
        prev.map(b => (b.id === block.id ? { ...b, showUnitGrid: !b.showUnitGrid } : b))
      );
      return;
    }

    // 2. X හෝ • ලකුණු යෙදීම
    if (mixedMode === "markX" || mixedMode === "markDot") {
      const markChar = mixedMode === "markX" ? "✕" : "●";
      const cellKey = `${block.id}-${faceName}-${r}-${c}`;
      setMixedFaceMarks(prev => {
        if (prev[cellKey] === markChar) {
          const copy = { ...prev };
          delete copy[cellKey];
          return copy;
        }
        return { ...prev, [cellKey]: markChar };
      });
      return;
    }

    // 3. මුළු Block එකේම මුහුණත් එකවර පාට කිරීම හෝ Grid නැති විට මුළු මුහුණතම පාට කිරීම
    if (mixedMode === "paintBlock" || !block.showUnitGrid) {
      setMixedFaceColors(prev => {
        const next = { ...prev };
        // දැනටමත් පාට කර ඇත්දැයි බලන්න
        const firstKey = `${block.id}-${faceName}-0-0`;
        const isAlreadyColored = prev[firstKey] === mixedActiveColor;

        if (mixedMode === "paintBlock") {
          // Block එකේ මුහුණත් 6ම පාට කිරීම
          const allFaces = [
            { f: "front", rc: block.h, cc: block.w },
            { f: "back", rc: block.h, cc: block.w },
            { f: "right", rc: block.h, cc: block.d },
            { f: "left", rc: block.h, cc: block.d },
            { f: "top", rc: block.d, cc: block.w },
            { f: "bottom", rc: block.d, cc: block.w },
          ];
          allFaces.forEach(({ f, rc, cc }) => {
            for (let rr = 0; rr < rc; rr++) {
              for (let ccIdx = 0; ccIdx < cc; ccIdx++) {
                const k = `${block.id}-${f}-${rr}-${ccIdx}`;
                if (isAlreadyColored) delete next[k];
                else next[k] = mixedActiveColor;
              }
            }
          });
        } else {
          // Click කළ මුහුණත පමණක් සම්පූර්ණයෙන් පාට කිරීම
          for (let rr = 0; rr < rowsCount; rr++) {
            for (let ccIdx = 0; ccIdx < colsCount; ccIdx++) {
              const k = `${block.id}-${faceName}-${rr}-${ccIdx}`;
              if (isAlreadyColored) delete next[k];
              else next[k] = mixedActiveColor;
            }
          }
        }
        return next;
      });
      return;
    }

    // 4. තනි කුඩා දාදු කැට කොටුවක් (Single Unit Cell) පමණක් පාට කිරීම
    const cellKey = `${block.id}-${faceName}-${r}-${c}`;
    setMixedFaceColors(prev => {
      if (prev[cellKey] === mixedActiveColor) {
        const copy = { ...prev };
        delete copy[cellKey];
        return copy;
      }
      return { ...prev, [cellKey]: mixedActiveColor };
    });
  };

  // Tools Menu View
  if (activeTool === "menu") {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-12 modern-font">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800">IQ ඉගැන්වීම් මෙවලම් 🧩</h1>
              <p className="text-slate-500 font-bold mt-2">සිසුන්ට IQ ගැටලු පැහැදිලි කිරීමට භාවිතා කළ හැකි සජීවී ආකෘති</p>
            </div>
            <Link href="/admin" className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm">
              &larr; Admin Dashboard
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           
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

            {/* 🔴 අලුතින් එකතු කළ 5 වන මෙවලම */}
            <div
              onClick={() => setActiveTool("mixedCube")}
              className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all cursor-pointer border-2 border-indigo-300 hover:-translate-y-2 group relative overflow-hidden"
            >
              <span className="absolute top-4 right-4 bg-indigo-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">NEW</span>
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform origin-left">🧊</div>
              <h3 className="text-lg font-extrabold text-indigo-950 mb-2">මිශ්‍ර ඝනක බෙදුම (Mixed Cube)</h3>
              <p className="text-xs text-indigo-700 font-bold leading-relaxed">එකම ඝනකයේ ලොකු කොටස් සහ පොඩි දාදු කැට Grid Lines ගසා වෙන් කිරීම සහ වෙන වෙනම පාට කිරීම.</p>
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
      <div className="max-w-5xl w-full bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-slate-200 flex flex-col items-center overflow-hidden">
       
        {/* ==================== 1. DICE ==================== */}
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

        {/* ==================== 2. UNFOLD ==================== */}
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

        {/* ==================== 3. ROTATE ==================== */}
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

        {/* ==================== 4. CUBE COUNTER (පැරණි + Sub-grid) ==================== */}
        {activeTool === "cube" && (
          <div className="w-full flex flex-col items-center">
            <ToolHeader title="IQ ඝනක ගණනය (Cube Counter)" />
           
            <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
              <div className="flex items-center gap-4 bg-slate-100 p-2 rounded-xl border border-slate-300">
                <button
                  onClick={() => {setGridSize(s => Math.max(1, s - 1)); setCubeColors({}); setSubdividedCubes({}); setSubFaceColors({});}}
                  className="bg-white hover:bg-slate-200 w-10 h-10 rounded-lg font-bold text-xl shadow-sm border border-slate-200"
                >-</button>
                <span className="font-extrabold text-slate-700 min-w-[80px] text-center">{gridSize} x {gridSize} x {gridSize}</span>
                <button
                  onClick={() => {setGridSize(s => Math.min(5, s + 1)); setCubeColors({}); setSubdividedCubes({}); setSubFaceColors({});}}
                  className="bg-white hover:bg-slate-200 w-10 h-10 rounded-lg font-bold text-xl shadow-sm border border-slate-200"
                >+</button>
              </div>

              {/* 🔴 4 වන මෙවලමට එකතු කළ කුඩා කැටවලට බෙදීමේ බොත්තම */}
              <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-300">
                <button
                  onClick={() => setCubeToolAction("paint")}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${cubeToolAction === "paint" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200"}`}
                >
                  🎨 පාට කරන්න (Paint)
                </button>
                <button
                  onClick={() => setCubeToolAction("subdivide")}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${cubeToolAction === "subdivide" ? "bg-purple-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200"}`}
                >
                  ⊞ කුඩා කැටවලට බෙදන්න (Split 2x2)
                </button>
              </div>
            </div>

            <div className="flex gap-2 mb-8">
              {["bg-red-500", "bg-blue-500", "bg-yellow-400", "bg-green-500", "bg-purple-500"].map(color => (
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
                      const isSubdivided = subdividedCubes[key];

                      const faces = [
                        { name: "front", tr: `translate(-50%, -50%) rotateY(0deg) translateZ(${sizePx/2}px)` },
                        { name: "back", tr: `translate(-50%, -50%) rotateY(180deg) translateZ(${sizePx/2}px)` },
                        { name: "right", tr: `translate(-50%, -50%) rotateY(90deg) translateZ(${sizePx/2}px)` },
                        { name: "left", tr: `translate(-50%, -50%) rotateY(-90deg) translateZ(${sizePx/2}px)` },
                        { name: "top", tr: `translate(-50%, -50%) rotateX(90deg) translateZ(${sizePx/2}px)` },
                        { name: "bottom", tr: `translate(-50%, -50%) rotateX(-90deg) translateZ(${sizePx/2}px)` },
                      ];
                     
                      return (
                        <div
                          key={key}
                          className="absolute [transform-style:preserve-3d]"
                          style={{ transform: `translate3d(${px}px, ${py}px, ${pz}px)` }}
                        >
                          {faces.map((f) => (
                            <div
                              key={f.name}
                              onClick={() => handleCubeClick(x, y, z)}
                              className={`absolute border border-black/40 cursor-pointer transition-colors ${color} ${isSubdivided ? 'grid grid-cols-2 grid-rows-2' : 'hover:brightness-110'}`}
                              style={{ width: sizePx, height: sizePx, transform: f.tr }}
                            >
                              {isSubdivided && [0, 1, 2, 3].map((cellIdx) => {
                                const subColor = subFaceColors[`${key}-${f.name}-${cellIdx}`] || "";
                                return (
                                  <div
                                    key={cellIdx}
                                    onClick={(e) => handleSubCellClick(e, key, f.name, cellIdx)}
                                    className={`border border-slate-900/60 hover:brightness-125 transition-colors ${subColor}`}
                                  />
                                );
                              })}
                            </div>
                          ))}
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

        {/* =========================================================================
            5. අලුත්ම මෙවලම: මිශ්‍ර ඝනක සහ දාදු කැට බෙදුම (MIXED / SUB-DIVIDED CUBE)
           ========================================================================= */}
        {activeTool === "mixedCube" && (
          <div className="w-full flex flex-col items-center">
            <ToolHeader title="මිශ්‍ර ඝනක බෙදුම (Mixed Big & Small Cube Slicer)" />

            {/* Presets (රූපසටහනේ ආකෘති තේරීම) */}
            <div className="w-full bg-indigo-50/70 border border-indigo-200 p-4 rounded-2xl mb-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider">📌 සූදානම් කළ ආකෘති (Presets):</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => loadMixedPreset("notebook")}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    📐 රූපසටහනේ ආකෘතිය (5x5x5: වම 2 පොඩි කැට + දකුණ ලොකු කොටස්)
                  </button>
                  <button
                    onClick={() => loadMixedPreset("halfSplit")}
                    className="bg-white hover:bg-indigo-100 text-indigo-900 border border-indigo-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                  >
                    ½ භාගයක පොඩි කැට (4x4x4)
                  </button>
                  <button
                    onClick={() => loadMixedPreset("cornerBlock")}
                    className="bg-white hover:bg-indigo-100 text-indigo-900 border border-indigo-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                  >
                    🧩 කොනක පොඩි කැට (Corner 2x2x2)
                  </button>
                  <button
                    onClick={() => loadMixedPreset("fullSmall")}
                    className="bg-white hover:bg-indigo-100 text-indigo-900 border border-indigo-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                  >
                    🔢 සම්පූර්ණ 5x5x5 දැල
                  </button>
                </div>
              </div>

              {/* Custom Slicer (කැමති විදිහට කැපුම් රේඛා යෙදීම) */}
              <div className="mt-4 pt-3 border-t border-indigo-200/70 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-700">මුළු ඒකක (N):</span>
                  <select
                    value={mixedTotalUnits}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setMixedTotalUnits(val);
                      applyCustomSlicer(val, xCutInput, yCutInput, zCutInput);
                    }}
                    className="bg-white border border-slate-300 rounded-lg px-2 py-1 font-bold"
                  >
                    {[3, 4, 5, 6].map(n => <option key={n} value={n}>{n}x{n}x{n}</option>)}
                  </select>

                  <span className="font-bold text-slate-700 ml-2">X කැපුම් (වමේ සිට):</span>
                  <input value={xCutInput} onChange={e => setXCutInput(e.target.value)} className="w-14 bg-white border border-slate-300 rounded-lg px-2 py-1 font-bold text-center" placeholder="2" />

                  <span className="font-bold text-slate-700">Y කැපුම් (ඉහළ සිට):</span>
                  <input value={yCutInput} onChange={e => setYCutInput(e.target.value)} className="w-14 bg-white border border-slate-300 rounded-lg px-2 py-1 font-bold text-center" placeholder="2" />

                  <span className="font-bold text-slate-700">Z කැපුම්:</span>
                  <input value={zCutInput} onChange={e => setZCutInput(e.target.value)} className="w-14 bg-white border border-slate-300 rounded-lg px-2 py-1 font-bold text-center" placeholder="2" />
                </div>

                <button
                  onClick={() => applyCustomSlicer(mixedTotalUnits, xCutInput, yCutInput, zCutInput)}
                  className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-1.5 rounded-lg font-bold transition-all"
                >
                  ✂️ කොටස් වෙන් කරන්න (Slice)
                </button>
              </div>
            </div>

            {/* Tool Modes සහ වර්ණ තේරීම */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6 w-full">
              <div className="flex flex-wrap justify-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-300">
                <button
                  onClick={() => setMixedMode("paintUnit")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${mixedMode === "paintUnit" ? "bg-blue-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-200"}`}
                >
                  🖌️ තනි මුහුණත පාට කරන්න
                </button>
                <button
                  onClick={() => setMixedMode("paintBlock")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${mixedMode === "paintBlock" ? "bg-blue-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-200"}`}
                >
                  🪣 මුළු කොටසම පාට කරන්න
                </button>
                <button
                  onClick={() => setMixedMode("toggleGrid")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${mixedMode === "toggleGrid" ? "bg-purple-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-200"}`}
                >
                  ⊞ පොඩි කැට Grid Lines දාන්න/අයින් කරන්න
                </button>
                <button
                  onClick={() => setMixedMode("markX")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${mixedMode === "markX" ? "bg-rose-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-200"}`}
                >
                  ✕ ලකුණු කරන්න
                </button>
                <button
                  onClick={() => setMixedMode("markDot")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${mixedMode === "markDot" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-200"}`}
                >
                  ● තිතක් තබන්න
                </button>
              </div>

              {/* වර්ණ පැලට් එක */}
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-2xl border border-slate-300">
                {[
                  { cls: "bg-blue-400", title: "නිල්" },
                  { cls: "bg-red-400", title: "රතු" },
                  { cls: "bg-yellow-300", title: "කහ" },
                  { cls: "bg-emerald-400", title: "කොළ" },
                  { cls: "bg-purple-400", title: "දම්" },
                  { cls: "bg-orange-400", title: "තැඹිලි" },
                ].map(c => (
                  <button
                    key={c.cls}
                    onClick={() => setMixedActiveColor(c.cls)}
                    title={c.title}
                    className={`w-8 h-8 rounded-full border-4 transition-all ${c.cls} ${mixedActiveColor === c.cls ? "border-slate-900 scale-110" : "border-transparent"}`}
                  />
                ))}
              </div>
            </div>

            {/* 3D Mixed Cube Canvas */}
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 [perspective:1600px] my-10 flex items-center justify-center select-none">
              <div
                className="relative transition-transform duration-500 ease-out [transform-style:preserve-3d]"
                style={{ transform: `rotateX(${mixedRotX}deg) rotateY(${mixedRotY}deg)` }}
              >
                {mixedBlocks.map((block) => {
                  const unitPx = Math.floor(210 / mixedTotalUnits); // 1 ඒකකයක ප්‍රමාණය (px)
                  const wPx = block.w * unitPx;
                  const hPx = block.h * unitPx;
                  const dPx = block.d * unitPx;

                  // සම්පූර්ණ ඝනකයේ මැද සිට අදාළ කුට්ටියේ මැදට ඇති දුර
                  const centerOffsetX = (block.x + block.w / 2 - mixedTotalUnits / 2);
                  const centerOffsetY = (block.y + block.h / 2 - mixedTotalUnits / 2);
                  const centerOffsetZ = (block.z + block.d / 2 - mixedTotalUnits / 2);

                  // Explode gap (කොටස් වෙන් කර පෙන්වීමේ පරතරය)
                  const gapFactor = mixedGap * 1.5;
                  const cx = centerOffsetX * unitPx + centerOffsetX * gapFactor;
                  const cy = centerOffsetY * unitPx + centerOffsetY * gapFactor;
                  const cz = centerOffsetZ * unitPx + centerOffsetZ * gapFactor;

                  const blockFaces = [
                    { name: "front", fw: wPx, fh: hPx, rows: block.h, cols: block.w, tr: `translate(-50%, -50%) rotateY(0deg) translateZ(${dPx / 2}px)` },
                    { name: "back", fw: wPx, fh: hPx, rows: block.h, cols: block.w, tr: `translate(-50%, -50%) rotateY(180deg) translateZ(${dPx / 2}px)` },
                    { name: "right", fw: dPx, fh: hPx, rows: block.h, cols: block.d, tr: `translate(-50%, -50%) rotateY(90deg) translateZ(${wPx / 2}px)` },
                    { name: "left", fw: dPx, fh: hPx, rows: block.h, cols: block.d, tr: `translate(-50%, -50%) rotateY(-90deg) translateZ(${wPx / 2}px)` },
                    { name: "top", fw: wPx, fh: dPx, rows: block.d, cols: block.w, tr: `translate(-50%, -50%) rotateX(90deg) translateZ(${hPx / 2}px)` },
                    { name: "bottom", fw: wPx, fh: dPx, rows: block.d, cols: block.w, tr: `translate(-50%, -50%) rotateX(-90deg) translateZ(${hPx / 2}px)` },
                  ];

                  return (
                    <div
                      key={block.id}
                      className="absolute [transform-style:preserve-3d] transition-all duration-300"
                      style={{ transform: `translate3d(${cx}px, ${cy}px, ${cz}px)` }}
                    >
                      {blockFaces.map((bf) => (
                        <div
                          key={bf.name}
                          className="absolute bg-slate-100/95 border-[2.5px] border-slate-900 grid overflow-hidden shadow-inner"
                          style={{
                            width: bf.fw,
                            height: bf.fh,
                            transform: bf.tr,
                            gridTemplateColumns: `repeat(${bf.cols}, minmax(0, 1fr))`,
                            gridTemplateRows: `repeat(${bf.rows}, minmax(0, 1fr))`,
                          }}
                        >
                          {Array.from({ length: bf.rows }).map((_, r) =>
                            Array.from({ length: bf.cols }).map((_, c) => {
                              const cellKey = `${block.id}-${bf.name}-${r}-${c}`;
                              const cellColor = mixedFaceColors[cellKey] || "bg-slate-200/80";
                              const cellMark = mixedFaceMarks[cellKey] || "";

                              return (
                                <div
                                  key={`${r}-${c}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMixedCellClick(block, bf.name, r, c, bf.rows, bf.cols);
                                  }}
                                  className={`flex items-center justify-center cursor-pointer transition-colors hover:brightness-95 ${cellColor} ${
                                    block.showUnitGrid ? "border border-slate-700/70" : "border-0"
                                  }`}
                                >
                                  {cellMark && (
                                    <span className={`font-black text-sm sm:text-base ${cellMark === "✕" ? "text-rose-700" : "text-slate-900"}`}>
                                      {cellMark}
                                    </span>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* පහළ Controls: Gap Slider සහ Rotation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-4">
              <div className="flex flex-col justify-between bg-slate-50 p-5 rounded-3xl border border-slate-200">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-extrabold text-slate-700">↔️ කොටස් අතර පරතරය (Explode / Separate):</span>
                    <span className="text-xs font-extrabold bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full">{mixedGap} px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={mixedGap}
                    onChange={(e) => setMixedGap(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer mb-4"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200">
                  <button
                    onClick={() =>
                      setMixedBlocks(prev => {
                        const allShown = prev.every(b => b.showUnitGrid);
                        return prev.map(b => ({ ...b, showUnitGrid: !allShown }));
                      })
                    }
                    className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-2.5 rounded-xl font-bold text-xs transition-all"
                  >
                    ⊞ සියලුම Grid පෙන්වන්න/සඟවන්න
                  </button>
                  <button
                    onClick={() => {
                      setMixedFaceColors({});
                      setMixedFaceMarks({});
                    }}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2.5 rounded-xl font-bold text-xs transition-all"
                  >
                    🗑️ වර්ණ සහ ලකුණු මකන්න
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center bg-slate-100 p-4 rounded-3xl border border-slate-200">
                <span className="text-sm font-bold text-slate-500 mb-3">ඝනකය කරකවන්න (Rotate 3D):</span>
                <div className="grid grid-cols-3 gap-2">
                  <div></div>
                  <button onClick={() => setMixedRotX(p => p + 25)} className="bg-indigo-600 hover:bg-indigo-700 text-white w-12 h-10 rounded-lg font-bold shadow-md transition-all active:scale-95">⬆</button>
                  <div></div>
                  <button onClick={() => setMixedRotY(p => p - 25)} className="bg-indigo-600 hover:bg-indigo-700 text-white w-12 h-10 rounded-lg font-bold shadow-md transition-all active:scale-95">⬅</button>
                  <button onClick={() => { setMixedRotX(-22); setMixedRotY(-28); }} className="bg-slate-300 hover:bg-slate-400 text-slate-800 text-[10px] w-12 h-10 rounded-lg font-bold transition-all active:scale-95">Reset</button>
                  <button onClick={() => setMixedRotY(p => p + 25)} className="bg-indigo-600 hover:bg-indigo-700 text-white w-12 h-10 rounded-lg font-bold shadow-md transition-all active:scale-95">➡</button>
                  <div></div>
                  <button onClick={() => setMixedRotX(p => p - 25)} className="bg-indigo-600 hover:bg-indigo-700 text-white w-12 h-10 rounded-lg font-bold shadow-md transition-all active:scale-95">⬇</button>
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