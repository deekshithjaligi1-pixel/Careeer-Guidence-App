// Runs DSA solutions in the user's browser, inside a Web Worker, so user code
// can never touch the server and an infinite loop only kills its own worker.
// JavaScript runs directly, TypeScript is stripped to JavaScript with sucrase,
// and Python runs on Pyodide (real CPython compiled to WebAssembly).
import { getAllLevels } from "./dsa-curriculum";

export type RunnableLanguage = "javascript" | "typescript" | "python";

export const RUNNABLE_LANGUAGES: { id: RunnableLanguage; label: string }[] = [
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python 3" },
];

export interface CodeExecutionResult {
  status: "accepted" | "wrong_answer" | "compile_error" | "runtime_error" | "time_limit_exceeded";
  error?: string;
  passedCount: number;
  totalCount: number;
  testResults: {
    testIndex: number;
    passed: boolean;
    input: string;
    expected: string;
    actual: string;
    logs?: string;
  }[];
}

type WorkerReply =
  | { ok: true; results: { actual: string; logs: string; error?: string }[] }
  | { ok: false; error: string; phase: "compile" | "runtime" };

const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
const JS_TIMEOUT_MS = 5000;
const PY_TIMEOUT_MS = 8000;
const PY_LOAD_TIMEOUT_MS = 60000;

// Worker source lives in a string so it needs no bundler configuration.
const WORKER_SOURCE = `
const fmt = (v) => {
  if (v === undefined) return "null";
  if (typeof v === "object" && v !== null) return JSON.stringify(v);
  return String(v);
};

let pyodide = null;
async function loadPython(url) {
  if (!pyodide) {
    importScripts(url + "pyodide.js");
    pyodide = await loadPyodide({ indexURL: url });
  }
  return pyodide;
}

self.onmessage = async (e) => {
  const { language, code, functionName, inputs, pyodideUrl } = e.data;
  try {
    if (language === "python") {
      const py = await loadPython(pyodideUrl);
      self.postMessage({ type: "ready" });
      const results = [];
      let logs = [];
      py.setStdout({ batched: (s) => logs.push(s) });
      py.setStderr({ batched: (s) => logs.push(s) });
      const ns = py.toPy({});
      try {
        py.runPython(code, { globals: ns });
      } catch (err) {
        self.postMessage({ type: "done", reply: { ok: false, phase: "compile", error: String(err.message || err) } });
        return;
      }
      const fn = ns.get(functionName);
      if (!fn) {
        self.postMessage({ type: "done", reply: { ok: false, phase: "compile", error: "Function '" + functionName + "' is not defined. Keep the function name from the template." } });
        return;
      }
      for (const input of inputs) {
        logs = [];
        try {
          const args = JSON.parse("[" + input + "]").map((a) => py.toPy(a));
          let out = fn(...args);
          if (out && typeof out.toJs === "function") {
            const js = out.toJs({ dict_converter: Object.fromEntries });
            out.destroy();
            out = js;
          }
          results.push({ actual: fmt(out), logs: logs.join("\\n") });
        } catch (err) {
          results.push({ actual: "", logs: logs.join("\\n"), error: String(err.message || err) });
        }
      }
      self.postMessage({ type: "done", reply: { ok: true, results } });
      return;
    }

    // JavaScript (TypeScript arrives already transpiled).
    let factory;
    try {
      factory = new Function("console", '"use strict";\\n' + code + "\\nreturn typeof " + functionName + ' === "function" ? ' + functionName + " : undefined;");
    } catch (err) {
      self.postMessage({ type: "done", reply: { ok: false, phase: "compile", error: String(err.message || err) } });
      return;
    }
    const results = [];
    for (const input of inputs) {
      const logs = [];
      const consoleShim = { log: (...a) => logs.push(a.map(fmt).join(" ")), error: (...a) => logs.push(a.map(fmt).join(" ")) };
      try {
        const fn = factory(consoleShim);
        if (!fn) throw new Error("Function '" + functionName + "' is not defined. Keep the function name from the template.");
        const args = JSON.parse("[" + input + "]");
        results.push({ actual: fmt(fn(...args)), logs: logs.join("\\n") });
      } catch (err) {
        results.push({ actual: "", logs: logs.join("\\n"), error: String(err.message || err) });
      }
    }
    self.postMessage({ type: "done", reply: { ok: true, results } });
  } catch (err) {
    self.postMessage({ type: "done", reply: { ok: false, phase: "runtime", error: String(err.message || err) } });
  }
};
`;

let workerUrl: string | null = null;
function newWorker() {
  workerUrl ??= URL.createObjectURL(new Blob([WORKER_SOURCE], { type: "text/javascript" }));
  return new Worker(workerUrl);
}

// Python keeps one warm worker so Pyodide only downloads once per page.
let pyWorker: Worker | null = null;
let pyReady = false;

// The Python worker handles one job at a time, so Python jobs run in order.
let pyQueue: Promise<unknown> = Promise.resolve();

function execute(
  language: RunnableLanguage,
  code: string,
  functionName: string,
  inputs: string[],
): Promise<WorkerReply | "timeout" | "load_timeout"> {
  if (language !== "python") return executeNow(language, code, functionName, inputs);
  const job = pyQueue.then(() => executeNow(language, code, functionName, inputs));
  pyQueue = job.catch(() => undefined);
  return job;
}

function executeNow(
  language: RunnableLanguage,
  code: string,
  functionName: string,
  inputs: string[],
): Promise<WorkerReply | "timeout" | "load_timeout"> {
  const isPy = language === "python";
  const worker = isPy ? (pyWorker ??= newWorker()) : newWorker();

  return new Promise((resolve) => {
    let timer = setTimeout(
      onTimeout,
      isPy && !pyReady ? PY_LOAD_TIMEOUT_MS : isPy ? PY_TIMEOUT_MS : JS_TIMEOUT_MS,
    );

    function finish(value: WorkerReply | "timeout" | "load_timeout") {
      clearTimeout(timer);
      worker.onmessage = null;
      if (!isPy) worker.terminate();
      resolve(value);
    }
    function onTimeout() {
      const wasLoading = isPy && !pyReady;
      worker.terminate();
      if (isPy) {
        pyWorker = null;
        pyReady = false;
      }
      finish(wasLoading ? "load_timeout" : "timeout");
    }

    worker.onmessage = (e: MessageEvent) => {
      if (e.data.type === "ready" && !pyReady) {
        pyReady = true;
        clearTimeout(timer);
        timer = setTimeout(onTimeout, PY_TIMEOUT_MS);
      } else if (e.data.type === "done") {
        finish(e.data.reply);
      }
    };
    worker.postMessage({ language, code, functionName, inputs, pyodideUrl: PYODIDE_URL });
  });
}

function normalize(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str));
  } catch {
    return str.trim().replace(/\s+/g, "");
  }
}

export function isPythonLoaded() {
  return pyReady;
}

// Start downloading Python in the background (e.g. when the learner picks it),
// so the first Run doesn't wait for the ~10 MB download.
export function warmUpPython() {
  if (pyReady || pyWorker) return;
  void execute("python", "", "__warmup__", []);
}

export async function runChallenge(opts: {
  topicId: string;
  levelId: string;
  language: RunnableLanguage;
  code: string;
  mode: "run" | "submit";
}): Promise<CodeExecutionResult> {
  const level = getAllLevels().find(
    (l) => l.topicId === opts.topicId && l.level.id === opts.levelId,
  );
  const challenge = level?.level.codingChallenge;
  if (!challenge) throw new Error("No coding challenge found for this level.");

  // "Run" checks the visible samples; "Submit" checks every case, hidden ones included.
  const cases = opts.mode === "run" ? challenge.testCases.slice(0, 2) : challenge.testCases;
  const empty = { passedCount: 0, totalCount: cases.length, testResults: [] };

  let code = opts.code;
  if (opts.language === "typescript") {
    try {
      const { transform } = await import("sucrase");
      code = transform(code, { transforms: ["typescript"] }).code;
    } catch (err) {
      return { status: "compile_error", error: (err as Error).message, ...empty };
    }
  }

  const reply = await execute(
    opts.language,
    code,
    challenge.functionName,
    cases.map((c) => c.input),
  );

  if (reply === "timeout" || reply === "load_timeout") {
    return {
      status: "time_limit_exceeded",
      error:
        reply === "load_timeout"
          ? "Python took too long to load. Check your internet connection and try again."
          : "Your code took too long. Check for an infinite loop.",
      ...empty,
    };
  }
  if (!reply.ok) {
    return {
      status: reply.phase === "compile" ? "compile_error" : "runtime_error",
      error: reply.error,
      ...empty,
    };
  }

  const testResults = cases.map((tc, i) => {
    const r = reply.results[i];
    const actual = r.error ? `Error: ${r.error}` : r.actual;
    return {
      testIndex: i + 1,
      passed: !r.error && normalize(r.actual) === normalize(tc.expectedOutput),
      input: tc.isHidden && opts.mode === "submit" ? "Hidden test case" : tc.input,
      expected: tc.isHidden && opts.mode === "submit" ? "Hidden" : tc.expectedOutput,
      actual,
      logs: r.logs || undefined,
    };
  });
  const passedCount = testResults.filter((t) => t.passed).length;
  const firstError = reply.results.find((r) => r.error)?.error;

  return {
    status:
      passedCount === cases.length ? "accepted" : firstError ? "runtime_error" : "wrong_answer",
    error: firstError,
    passedCount,
    totalCount: cases.length,
    testResults,
  };
}

// Turns a full reference solution into an empty template that keeps only the
// function signature, so learners write the body themselves.
export function starterTemplate(language: RunnableLanguage, reference: string): string {
  const firstLine = reference.split("\n")[0];
  if (language === "python" && /^def\s+\w+\(.*\):\s*$/.test(firstLine)) {
    return `${firstLine}\n    # Write your solution here\n    pass\n`;
  }
  if (language !== "python" && /^function\s+\w+\(.*\)\s*(:\s*[^{]+)?\{\s*$/.test(firstLine)) {
    return `${firstLine}\n  // Write your solution here\n\n}\n`;
  }
  return reference;
}
