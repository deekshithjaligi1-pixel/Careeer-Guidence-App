import { useState } from "react";
import {
  Play,
  Send,
  Code2,
  Terminal,
  RotateCcw,
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  runChallenge,
  isPythonLoaded,
  warmUpPython,
  RUNNABLE_LANGUAGES,
  type CodeExecutionResult,
  type RunnableLanguage,
} from "@/lib/code-runner";
import { CodeEditor } from "@/components/CodeEditor";

interface PresetProblem {
  id: string;
  topicId: string;
  levelId: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  pattern: string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  starterCodes: {
    javascript: string;
    typescript: string;
    python: string;
    java: string;
    cpp: string;
  };
}

const PRESET_PROBLEMS: PresetProblem[] = [
  {
    id: "two-sum",
    topicId: "arrays",
    levelId: "arrays-1",
    title: "Two Sum",
    difficulty: "Easy",
    pattern: "Hash Map / Complement Lookup",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: [
      { input: "[2,7,11,15], 9", output: "[0,1]", explanation: "nums[0] + nums[1] == 9, so return [0, 1]." },
      { input: "[3,2,4], 6", output: "[1,2]" },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
    ],
    starterCodes: {
      javascript: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      python: `def twoSum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        diff = target - n
        if diff in seen:
            return [seen[diff], i]
        seen[n] = i
    return []`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int comp = target - nums[i];
            if (map.containsKey(comp)) return new int[]{map.get(comp), i};
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> mp;
        for (int i = 0; i < nums.size(); ++i) {
            int comp = target - nums[i];
            if (mp.count(comp)) return {mp[comp], i};
            mp[nums[i]] = i;
        }
        return {};
    }
};`,
    },
  },
  {
    id: "max-water",
    topicId: "arrays",
    levelId: "arrays-2",
    title: "Container With Most Water",
    difficulty: "Medium",
    pattern: "Two Pointers (Inward Convergence)",
    description: "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\nReturn the maximum amount of water a container can store.",
    examples: [
      { input: "[1,8,6,2,5,4,8,3,7]", output: "49", explanation: "The above vertical lines form a container with maximum area 49." },
      { input: "[1,1]", output: "1" },
    ],
    constraints: ["n == height.length", "2 <= n <= 10^5", "0 <= height[i] <= 10^4"],
    starterCodes: {
      javascript: `function maxArea(height) {
  let left = 0, right = height.length - 1;
  let maxWater = 0;
  while (left < right) {
    const width = right - left;
    const h = Math.min(height[left], height[right]);
    maxWater = Math.max(maxWater, width * h);
    if (height[left] < height[right]) left++;
    else right--;
  }
  return maxWater;
}`,
      typescript: `function maxArea(height: number[]): number {
  let left = 0, right = height.length - 1;
  let maxWater = 0;
  while (left < right) {
    const width = right - left;
    const h = Math.min(height[left], height[right]);
    maxWater = Math.max(maxWater, width * h);
    if (height[left] < height[right]) left++;
    else right--;
  }
  return maxWater;
}`,
      python: `def maxArea(height):
    left, right = 0, len(height) - 1
    ans = 0
    while left < right:
        ans = max(ans, (right - left) * min(height[left], height[right]))
        if height[left] < height[right]: left += 1
        else: right -= 1
    return ans`,
      java: `class Solution {
    public int maxArea(int[] height) {
        int l = 0, r = height.length - 1, max = 0;
        while (l < r) {
            max = Math.max(max, (r - l) * Math.min(height[l], height[r]));
            if (height[l] < height[r]) l++; else r--;
        }
        return max;
    }
}`,
      cpp: `class Solution {
public:
    int maxArea(vector<int>& height) {
        int l = 0, r = height.size() - 1, mx = 0;
        while (l < r) {
            mx = max(mx, (r - l) * min(height[l], height[r]));
            if (height[l] < height[r]) l++; else r--;
        }
        return mx;
    }
};`,
    },
  },
  {
    id: "valid-anagram",
    topicId: "strings",
    levelId: "strings-1",
    title: "Valid Anagram",
    difficulty: "Easy",
    pattern: "Frequency Count / ASCII Array",
    description: "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
    examples: [
      { input: '"anagram", "nagaram"', output: "true" },
      { input: '"rat", "car"', output: "false" },
    ],
    constraints: ["1 <= s.length, t.length <= 5 * 10^4", "s and t consist of lowercase English letters."],
    starterCodes: {
      javascript: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = new Array(26).fill(0);
  for (let i = 0; i < s.length; i++) {
    count[s.charCodeAt(i) - 97]++;
    count[t.charCodeAt(i) - 97]--;
  }
  return count.every(c => c === 0);
}`,
      typescript: `function isAnagram(s: string, t: string): boolean {
  if (s.length !== t.length) return false;
  const count = new Array(26).fill(0);
  for (let i = 0; i < s.length; i++) {
    count[s.charCodeAt(i) - 97]++;
    count[t.charCodeAt(i) - 97]--;
  }
  return count.every(c => c === 0);
}`,
      python: `def isAnagram(s, t):
    if len(s) != len(t): return False
    from collections import Counter
    return Counter(s) == Counter(t)`,
      java: `class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        int[] count = new int[26];
        for (int i = 0; i < s.length(); i++) {
            count[s.charAt(i) - 'a']++;
            count[t.charAt(i) - 'a']--;
        }
        for (int c : count) if (c != 0) return false;
        return true;
    }
}`,
      cpp: `class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.length() != t.length()) return false;
        vector<int> count(26, 0);
        for (int i = 0; i < s.length(); i++) {
            count[s[i] - 'a']++;
            count[t[i] - 'a']--;
        }
        for (int c : count) if (c != 0) return false;
        return true;
    }
};`,
    },
  },
];

type SupportedLang = RunnableLanguage;

export function InteractiveDsaStudio() {
  const [selectedProblemId, setSelectedProblemId] = useState<string>(PRESET_PROBLEMS[0].id);
  const [language, setLanguage] = useState<SupportedLang>("javascript");

  const problem = PRESET_PROBLEMS.find((p) => p.id === selectedProblemId) || PRESET_PROBLEMS[0];
  const [code, setCode] = useState<string>(problem.starterCodes[language]);

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "output">("description");
  const [execResult, setExecResult] = useState<CodeExecutionResult | null>(null);

  const handleProblemChange = (probId: string) => {
    setSelectedProblemId(probId);
    const newProb = PRESET_PROBLEMS.find((p) => p.id === probId) || PRESET_PROBLEMS[0];
    setCode(newProb.starterCodes[language]);
    setExecResult(null);
  };

  const handleLanguageChange = (newLang: SupportedLang) => {
    setLanguage(newLang);
    if (newLang === "python") warmUpPython();
    setCode(problem.starterCodes[newLang]);
    setExecResult(null);
  };

  const handleResetCode = () => {
    setCode(problem.starterCodes[language]);
    toast.info("Code reset to template.");
  };

  const handleRun = async () => {
    setIsRunning(true);
    setActiveTab("output");
    try {
      if (language === "python" && !isPythonLoaded()) {
        toast.info("Loading Python for the first time — this takes a few seconds.");
      }
      const result = await runChallenge({
        topicId: problem.topicId,
        levelId: problem.levelId,
        language,
        code,
        mode: "run",
      });
      setExecResult(result);
      if (result.status === "accepted") {
        toast.success("Sample test cases passed!");
      } else {
        toast.error("Test cases failed.");
      }
    } catch (e: any) {
      toast.error(e?.message || "Execution error");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setActiveTab("output");
    try {
      if (language === "python" && !isPythonLoaded()) {
        toast.info("Loading Python for the first time — this takes a few seconds.");
      }
      const result = await runChallenge({
        topicId: problem.topicId,
        levelId: problem.levelId,
        language,
        code,
        mode: "submit",
      });
      setExecResult(result);
      if (result.status === "accepted") {
        toast.success("🎉 All test cases passed! Solution Accepted.");
      } else {
        toast.error(`Submission failed: ${result.passedCount}/${result.totalCount} tests passed.`);
      }
    } catch (e: any) {
      toast.error(e?.message || "Submission error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl glass border border-border/80 overflow-hidden shadow-card space-y-0">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-surface/70 border-b border-border/70">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-500/20 text-purple-400 font-bold">
            <Code2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Select Problem:</span>
              <select
                value={selectedProblemId}
                onChange={(e) => handleProblemChange(e.target.value)}
                className="rounded-lg bg-surface border border-border/70 px-3 py-1 text-xs font-bold text-foreground focus:outline-none focus:border-primary cursor-pointer"
              >
                {PRESET_PROBLEMS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.difficulty}) - {p.pattern}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Language selector & Run buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as SupportedLang)}
            className="rounded-lg bg-surface border border-border/70 px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            {RUNNABLE_LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleResetCode}
            className="p-2 rounded-lg glass text-muted-foreground hover:text-foreground hover:border-primary/50 transition cursor-pointer"
            title="Reset code"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-lg glass px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-2 transition disabled:opacity-50 cursor-pointer"
          >
            {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 text-primary" />}
            Run
          </button>

          <button
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-glow transition hover:scale-105 disabled:opacity-50 cursor-pointer"
            style={{ background: "var(--gradient-gold)" }}
          >
            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Submit
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
        {/* Left Column: Problem & Output */}
        <div className="lg:col-span-5 flex flex-col border-b lg:border-b-0 lg:border-r border-border/70 bg-surface/30">
          <div className="flex items-center border-b border-border/70 bg-surface/40 px-4 pt-2">
            <button
              onClick={() => setActiveTab("description")}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition ${
                activeTab === "description"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Description & Pattern
            </button>
            <button
              onClick={() => setActiveTab("output")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition ${
                activeTab === "output"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Terminal className="h-3 w-3" />
              Console {execResult && `(${execResult.passedCount}/${execResult.totalCount})`}
            </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto max-h-[540px] space-y-4 text-xs leading-relaxed">
            {activeTab === "description" ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-base font-bold text-foreground font-display">
                      {problem.title}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        problem.difficulty === "Easy"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">
                      {problem.pattern}
                    </span>
                  </div>

                  <p className="text-foreground/90 whitespace-pre-line leading-relaxed">
                    {problem.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground">Examples</h4>
                  {problem.examples.map((ex, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-surface/60 border border-border/60 space-y-1 font-mono text-[11px]">
                      <div><strong className="text-primary font-sans">Input:</strong> {ex.input}</div>
                      <div><strong className="text-emerald-400 font-sans">Output:</strong> {ex.output}</div>
                      {ex.explanation && (
                        <div className="text-muted-foreground font-sans text-[11px] pt-1 border-t border-border/40 mt-1">
                          {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-foreground mb-1">Constraints</h4>
                  <ul className="list-disc pl-4 space-y-0.5 font-mono text-[11px] text-foreground/80">
                    {problem.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {!execResult ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                    <Terminal className="h-8 w-8 text-muted-foreground/40 mb-2" />
                    <p>Click "Run" or "Submit" to test your solution in real-time.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        execResult.status === "accepted"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {execResult.status === "accepted" ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-rose-400" />
                        )}
                        <div>
                          <div className="font-bold uppercase tracking-wider text-xs">
                            {execResult.status.replaceAll("_", " ")}
                          </div>
                          <div className="text-[11px] opacity-90">
                            Passed {execResult.passedCount} of {execResult.totalCount} test cases
                          </div>
                        </div>
                      </div>
                    </div>

                    {execResult.error && (
                      <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 font-mono text-[11px] text-rose-300">
                        {execResult.error}
                      </div>
                    )}

                    <div className="space-y-2">
                      <h5 className="text-xs font-bold text-foreground">Test Case Details</h5>
                      {execResult.testResults.map((tr) => (
                        <div
                          key={tr.testIndex}
                          className={`p-3 rounded-xl border font-mono text-[11px] space-y-1 ${
                            tr.passed ? "bg-emerald-950/20 border-emerald-800/40" : "bg-rose-950/20 border-rose-800/40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-sans font-semibold text-foreground">Test #{tr.testIndex}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tr.passed ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"}`}>
                              {tr.passed ? "PASSED" : "FAILED"}
                            </span>
                          </div>
                          <div><span className="text-muted-foreground font-sans">Input:</span> {tr.input}</div>
                          <div><span className="text-muted-foreground font-sans">Expected:</span> <span className="text-emerald-400">{tr.expected}</span></div>
                          <div><span className="text-muted-foreground font-sans">Your Output:</span> <span className={tr.passed ? "text-emerald-400" : "text-rose-400"}>{tr.actual}</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Code Editor */}
        <div className="lg:col-span-7 flex flex-col bg-[#0b0f19]">
          <div className="flex items-center justify-between px-4 py-2 bg-surface/50 border-b border-border/60 text-[11px] font-mono text-muted-foreground">
            <span>Editor ({language.toUpperCase()})</span>
            <span>Tab: 2 spaces</span>
          </div>

          <div className="flex-1">
            <CodeEditor value={code} onChange={setCode} minHeight={460} />
          </div>
        </div>
      </div>
    </div>
  );
}
