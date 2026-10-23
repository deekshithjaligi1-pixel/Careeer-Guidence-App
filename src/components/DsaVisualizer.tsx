import { useState, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Info,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  BarChart2,
  Share2,
} from "lucide-react";

interface VisualAlgorithm {
  id: string;
  title: string;
  category: "Arrays & Sorting" | "Pointers & Sliding Window" | "Linked Lists" | "Trees & Graphs" | "Binary Search";
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  defaultArray: number[];
  stepsGenerator: (arr: number[]) => {
    array: number[];
    activeIndices: number[];
    sortedIndices: number[];
    pointers?: { name: string; index: number; color?: string }[];
    explanation: string;
    codeLine: number;
  }[];
  pseudoCode: string[];
}

export const visualAlgorithms: VisualAlgorithm[] = [
  {
    id: "two-pointers-sum",
    title: "Two Pointers - Target Pair Sum",
    category: "Pointers & Sliding Window",
    difficulty: "Easy",
    description: "Converge left and right pointers towards the center to find a pair adding up to target in O(N) time on sorted arrays.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    defaultArray: [2, 7, 11, 15, 19, 23],
    pseudoCode: [
      "let left = 0, right = n - 1;",
      "while (left < right) {",
      "  let sum = nums[left] + nums[right];",
      "  if (sum === target) return [left, right];",
      "  else if (sum < target) left++;",
      "  else right--;",
      "}",
    ],
    stepsGenerator: (arr) => {
      const sorted = [...arr].sort((a, b) => a - b);
      const target = sorted[1] + sorted[4]; // target
      const steps: any[] = [];

      let left = 0;
      let right = sorted.length - 1;

      steps.push({
        array: [...sorted],
        activeIndices: [left, right],
        sortedIndices: [],
        pointers: [
          { name: "L", index: left, color: "#38bdf8" },
          { name: "R", index: right, color: "#f59e0b" },
        ],
        explanation: `Target = ${target}. Initialize Left at index 0 (val: ${sorted[left]}) and Right at index ${right} (val: ${sorted[right]}).`,
        codeLine: 1,
      });

      while (left < right) {
        const sum = sorted[left] + sorted[right];
        if (sum === target) {
          steps.push({
            array: [...sorted],
            activeIndices: [left, right],
            sortedIndices: [left, right],
            pointers: [
              { name: "L", index: left, color: "#10b981" },
              { name: "R", index: right, color: "#10b981" },
            ],
            explanation: `Match found! nums[${left}] (${sorted[left]}) + nums[${right}] (${sorted[right]}) == ${target}. Solution indices: [${left}, ${right}].`,
            codeLine: 4,
          });
          break;
        } else if (sum < target) {
          steps.push({
            array: [...sorted],
            activeIndices: [left, right],
            sortedIndices: [],
            pointers: [
              { name: "L", index: left, color: "#38bdf8" },
              { name: "R", index: right, color: "#f59e0b" },
            ],
            explanation: `Sum (${sum}) < Target (${target}). Increment Left pointer to index ${left + 1} to increase sum.`,
            codeLine: 5,
          });
          left++;
        } else {
          steps.push({
            array: [...sorted],
            activeIndices: [left, right],
            sortedIndices: [],
            pointers: [
              { name: "L", index: left, color: "#38bdf8" },
              { name: "R", index: right, color: "#f59e0b" },
            ],
            explanation: `Sum (${sum}) > Target (${target}). Decrement Right pointer to index ${right - 1} to decrease sum.`,
            codeLine: 6,
          });
          right--;
        }
      }

      return steps;
    },
  },
  {
    id: "binary-search",
    title: "Binary Search - Divide & Conquer",
    category: "Binary Search",
    difficulty: "Easy",
    description: "Repeatedly halve the search interval on sorted data. If target is less than midpoint, narrow to lower half; otherwise upper half.",
    timeComplexity: "O(log N)",
    spaceComplexity: "O(1)",
    defaultArray: [3, 8, 14, 22, 35, 47, 59, 73, 88, 95],
    pseudoCode: [
      "let low = 0, high = n - 1;",
      "while (low <= high) {",
      "  let mid = Math.floor((low + high) / 2);",
      "  if (nums[mid] === target) return mid;",
      "  else if (nums[mid] < target) low = mid + 1;",
      "  else high = mid - 1;",
      "}",
    ],
    stepsGenerator: (arr) => {
      const sorted = [...arr].sort((a, b) => a - b);
      const target = sorted[6]; // target 59
      const steps: any[] = [];

      let low = 0;
      let high = sorted.length - 1;

      steps.push({
        array: [...sorted],
        activeIndices: [low, high],
        sortedIndices: [],
        pointers: [
          { name: "Low", index: low, color: "#38bdf8" },
          { name: "High", index: high, color: "#f43f5e" },
        ],
        explanation: `Target is ${target}. Set search window from index ${low} to ${high}.`,
        codeLine: 1,
      });

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);

        steps.push({
          array: [...sorted],
          activeIndices: [mid],
          sortedIndices: [],
          pointers: [
            { name: "Low", index: low, color: "#38bdf8" },
            { name: "Mid", index: mid, color: "#eab308" },
            { name: "High", index: high, color: "#f43f5e" },
          ],
          explanation: `Midpoint index = ${mid} (val: ${sorted[mid]}). Comparing nums[${mid}] with target ${target}.`,
          codeLine: 3,
        });

        if (sorted[mid] === target) {
          steps.push({
            array: [...sorted],
            activeIndices: [mid],
            sortedIndices: [mid],
            pointers: [{ name: "Target Found", index: mid, color: "#10b981" }],
            explanation: `Found target ${target} at index ${mid}! Halving completed.`,
            codeLine: 4,
          });
          break;
        } else if (sorted[mid] < target) {
          steps.push({
            array: [...sorted],
            activeIndices: [mid],
            sortedIndices: [],
            pointers: [
              { name: "Low", index: mid + 1, color: "#38bdf8" },
              { name: "High", index: high, color: "#f43f5e" },
            ],
            explanation: `nums[${mid}] (${sorted[mid]}) < ${target}. Eliminate left half. Move Low to ${mid + 1}.`,
            codeLine: 5,
          });
          low = mid + 1;
        } else {
          steps.push({
            array: [...sorted],
            activeIndices: [mid],
            sortedIndices: [],
            pointers: [
              { name: "Low", index: low, color: "#38bdf8" },
              { name: "High", index: mid - 1, color: "#f43f5e" },
            ],
            explanation: `nums[${mid}] (${sorted[mid]}) > ${target}. Eliminate right half. Move High to ${mid - 1}.`,
            codeLine: 6,
          });
          high = mid - 1;
        }
      }

      return steps;
    },
  },
  {
    id: "bubble-sort",
    title: "Bubble Sort - Adjacent Swaps",
    category: "Arrays & Sorting",
    difficulty: "Easy",
    description: "Step-by-step compare adjacent elements and bubble the largest element to the end of the array on each pass.",
    timeComplexity: "O(N²)",
    spaceComplexity: "O(1)",
    defaultArray: [45, 12, 85, 32, 89, 39, 69, 21],
    pseudoCode: [
      "for (let i = 0; i < n - 1; i++) {",
      "  for (let j = 0; j < n - i - 1; j++) {",
      "    if (nums[j] > nums[j + 1]) {",
      "      swap(nums[j], nums[j + 1]);",
      "    }",
      "  }",
      "}",
    ],
    stepsGenerator: (arr) => {
      const a = [...arr];
      const steps: any[] = [];
      const n = a.length;
      const sortedIdx: number[] = [];

      steps.push({
        array: [...a],
        activeIndices: [],
        sortedIndices: [],
        explanation: "Starting Bubble Sort on unsorted array.",
        codeLine: 1,
      });

      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          steps.push({
            array: [...a],
            activeIndices: [j, j + 1],
            sortedIndices: [...sortedIdx],
            pointers: [
              { name: "j", index: j, color: "#38bdf8" },
              { name: "j+1", index: j + 1, color: "#f59e0b" },
            ],
            explanation: `Comparing nums[${j}] (${a[j]}) with nums[${j + 1}] (${a[j + 1]}).`,
            codeLine: 3,
          });

          if (a[j] > a[j + 1]) {
            const temp = a[j];
            a[j] = a[j + 1];
            a[j + 1] = temp;

            steps.push({
              array: [...a],
              activeIndices: [j, j + 1],
              sortedIndices: [...sortedIdx],
              pointers: [
                { name: "Swap", index: j, color: "#e11d48" },
                { name: "Swap", index: j + 1, color: "#e11d48" },
              ],
              explanation: `Swapped ${a[j + 1]} and ${a[j]} because ${a[j + 1]} > ${a[j]}.`,
              codeLine: 4,
            });
          }
        }
        sortedIdx.push(n - i - 1);
      }
      sortedIdx.push(0);

      steps.push({
        array: [...a],
        activeIndices: [],
        sortedIndices: Array.from({ length: n }, (_, i) => i),
        explanation: "Array is completely sorted!",
        codeLine: 1,
      });

      return steps;
    },
  },
  {
    id: "sliding-window",
    title: "Sliding Window - Max Sum Subarray (K=3)",
    category: "Pointers & Sliding Window",
    difficulty: "Medium",
    description: "Slide a fixed or dynamic window of size K across the array in O(N) by adding incoming element and subtracting outgoing element.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    defaultArray: [2, 1, 5, 1, 3, 2, 8, 4],
    pseudoCode: [
      "let windowSum = 0, maxSum = 0;",
      "for (let i = 0; i < k; i++) windowSum += nums[i];",
      "maxSum = windowSum;",
      "for (let i = k; i < n; i++) {",
      "  windowSum += nums[i] - nums[i - k];",
      "  maxSum = Math.max(maxSum, windowSum);",
      "}",
    ],
    stepsGenerator: (arr) => {
      const k = 3;
      const a = [...arr];
      const steps: any[] = [];
      let windowSum = 0;

      for (let i = 0; i < k; i++) windowSum += a[i];
      let maxSum = windowSum;

      steps.push({
        array: [...a],
        activeIndices: [0, 1, 2],
        sortedIndices: [],
        pointers: [
          { name: "Start", index: 0, color: "#38bdf8" },
          { name: "End", index: 2, color: "#f59e0b" },
        ],
        explanation: `Initial window of size ${k} (indices 0..2). Sum = ${windowSum}. Max Sum = ${maxSum}.`,
        codeLine: 2,
      });

      for (let i = k; i < a.length; i++) {
        const outgoing = a[i - k];
        const incoming = a[i];
        windowSum += incoming - outgoing;
        const isNewMax = windowSum > maxSum;
        if (isNewMax) maxSum = windowSum;

        steps.push({
          array: [...a],
          activeIndices: Array.from({ length: k }, (_, offset) => i - k + 1 + offset),
          sortedIndices: isNewMax ? Array.from({ length: k }, (_, offset) => i - k + 1 + offset) : [],
          pointers: [
            { name: "-Out", index: i - k, color: "#f43f5e" },
            { name: "+In", index: i, color: "#10b981" },
          ],
          explanation: `Slid window: subtracted ${outgoing} (idx ${i - k}) and added ${incoming} (idx ${i}). New window sum = ${windowSum}. Max = ${maxSum}.`,
          codeLine: 5,
        });
      }

      return steps;
    },
  },
];

export function DsaVisualizer() {
  const [selectedAlgoId, setSelectedAlgoId] = useState<string>(visualAlgorithms[0].id);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(900);

  const currentAlgo = visualAlgorithms.find((a) => a.id === selectedAlgoId) || visualAlgorithms[0];
  const steps = currentAlgo.stepsGenerator(currentAlgo.defaultArray);
  const currentStep = steps[stepIndex] || steps[0];

  useEffect(() => {
    setStepIndex(0);
    setIsPlaying(false);
  }, [selectedAlgoId]);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speedMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, steps.length, speedMs]);

  const maxVal = Math.max(...currentStep.array, 1);

  return (
    <div className="rounded-3xl glass border border-border/80 p-6 md:p-8 space-y-8 shadow-card">
      {/* Header & Algorithm selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border/70">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold">
              <Sparkles className="h-4 w-4" />
            </span>
            <h2 className="text-2xl font-bold text-foreground font-display">
              Interactive DSA Visualizer
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              AlgoMaster Animation Style
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Explore step-by-step visual transitions, pointer movements, and line-by-line algorithm execution.
          </p>
        </div>

        {/* Algorithm Tabs */}
        <div className="flex flex-wrap gap-2">
          {visualAlgorithms.map((algo) => (
            <button
              key={algo.id}
              onClick={() => setSelectedAlgoId(algo.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                algo.id === selectedAlgoId
                  ? "bg-primary text-primary-foreground border-primary shadow-glow font-bold"
                  : "glass border-border/70 text-muted-foreground hover:text-foreground"
              }`}
            >
              {algo.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Visualizer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Canvas */}
        <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
          <div className="p-6 rounded-2xl bg-surface/50 border border-border/70 space-y-6">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-muted-foreground">Step:</span>
                <span className="text-primary font-bold">{stepIndex + 1} / {steps.length}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground font-mono">Time: <strong className="text-foreground">{currentAlgo.timeComplexity}</strong></span>
                <span className="text-muted-foreground font-mono">Space: <strong className="text-foreground">{currentAlgo.spaceComplexity}</strong></span>
              </div>
            </div>

            {/* Array Bars / Elements Animation Area */}
            <div className="h-56 flex items-end justify-center gap-3 md:gap-4 px-4 py-4 bg-[#0b0f19] rounded-2xl border border-border/60 relative overflow-hidden">
              {currentStep.array.map((val, idx) => {
                const isActive = currentStep.activeIndices.includes(idx);
                const isSorted = currentStep.sortedIndices.includes(idx);
                const heightPercent = Math.max(18, Math.round((val / maxVal) * 85));

                const pointer = currentStep.pointers?.find((p) => p.index === idx);

                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 max-w-[50px] relative">
                    {/* Pointer badge */}
                    {pointer && (
                      <span
                        className="absolute -top-7 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-tight text-black shadow-glow animate-bounce"
                        style={{ background: pointer.color || "var(--primary)" }}
                      >
                        {pointer.name}
                      </span>
                    )}

                    {/* Value label on top */}
                    <span
                      className={`text-xs font-mono font-bold transition-all ${
                        isActive ? "text-primary scale-110" : isSorted ? "text-emerald-400" : "text-muted-foreground"
                      }`}
                    >
                      {val}
                    </span>

                    {/* Bar graphic */}
                    <div
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-t from-primary/70 to-primary shadow-glow ring-2 ring-primary"
                          : isSorted
                            ? "bg-gradient-to-t from-emerald-600/70 to-emerald-400 shadow-sm"
                            : "bg-surface-2 hover:bg-surface border border-border/50"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />

                    {/* Index label at bottom */}
                    <span className="text-[10px] font-mono text-muted-foreground/70">
                      [{idx}]
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Step Explanation Banner */}
            <div className="p-4 rounded-xl glass border border-primary/30 flex items-start gap-3 text-xs leading-relaxed">
              <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-primary font-semibold">Current State: </strong>
                <span className="text-foreground/90">{currentStep.explanation}</span>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass border border-border/70">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setStepIndex(0);
                }}
                className="p-2 rounded-xl glass text-muted-foreground hover:text-foreground hover:border-primary/50 transition cursor-pointer"
                title="Reset to beginning"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs text-primary-foreground shadow-glow transition hover:scale-105 cursor-pointer"
                style={{ background: "var(--gradient-gold)" }}
              >
                {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                {isPlaying ? "Pause" : "Play Animation"}
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
                }}
                disabled={stepIndex >= steps.length - 1}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass text-xs font-semibold text-foreground hover:bg-surface-2 transition disabled:opacity-40 cursor-pointer"
              >
                Step <SkipForward className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Speed slider */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
              <span>Speed:</span>
              <button
                onClick={() => setSpeedMs(1200)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${speedMs === 1200 ? "bg-primary text-primary-foreground" : "glass"}`}
              >
                0.75x
              </button>
              <button
                onClick={() => setSpeedMs(800)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${speedMs === 800 ? "bg-primary text-primary-foreground" : "glass"}`}
              >
                1x
              </button>
              <button
                onClick={() => setSpeedMs(400)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${speedMs === 400 ? "bg-primary text-primary-foreground" : "glass"}`}
              >
                2x
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Code Sync & Theory */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-[#0b0f19] border border-border/80 p-5 space-y-4 font-mono text-xs shadow-card">
            <div className="flex items-center justify-between pb-2 border-b border-border/60 text-muted-foreground text-[11px]">
              <span className="text-primary font-bold">Pseudocode Execution</span>
              <span>Line {currentStep.codeLine}</span>
            </div>

            <div className="space-y-1 leading-relaxed">
              {currentAlgo.pseudoCode.map((line, lineIdx) => {
                const isCurrentLine = lineIdx + 1 === currentStep.codeLine;
                return (
                  <div
                    key={lineIdx}
                    className={`flex items-center gap-3 px-2.5 py-1 rounded-lg transition-all ${
                      isCurrentLine
                        ? "bg-primary/20 text-primary font-bold border border-primary/40 shadow-glow"
                        : "text-muted-foreground/80 hover:text-foreground"
                    }`}
                  >
                    <span className="text-[10px] text-muted-foreground/50 w-4 text-right font-mono">
                      {lineIdx + 1}
                    </span>
                    <pre className="text-xs font-mono overflow-x-auto"><code>{line}</code></pre>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl glass border border-border/70 p-5 space-y-2.5 text-xs">
            <h4 className="font-bold text-foreground font-display flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" /> Key Concept Insight
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              {currentAlgo.description}
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
              <span className="px-2 py-1 rounded bg-surface border border-border/60 text-emerald-400 font-mono">
                Time: {currentAlgo.timeComplexity}
              </span>
              <span className="px-2 py-1 rounded bg-surface border border-border/60 text-amber-400 font-mono">
                Space: {currentAlgo.spaceComplexity}
              </span>
              <span className="px-2 py-1 rounded bg-surface border border-border/60 text-foreground font-medium">
                Category: {currentAlgo.category}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
