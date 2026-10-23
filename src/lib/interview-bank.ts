export type Level = "easy" | "medium" | "hard";

type Bank = Record<Level, string[]>;

const HR: Bank = {
  easy: [
    "Tell me about yourself.",
    "Why do you want this role?",
    "What are your strengths?",
    "What are your weaknesses and how are you working on them?",
    "Where do you see yourself in three years?",
    "What do you know about our company?",
    "Why should we hire you?",
  ],
  medium: [
    "Tell me about a difficult situation you handled and what you learned.",
    "Describe a time you disagreed with a teammate. How did you resolve it?",
    "How do you prioritise work when everything feels urgent?",
    "Tell me about a project you are proud of and your exact contribution.",
    "How do you handle feedback or criticism on your code or work?",
    "Describe a time you missed a deadline. What did you do?",
    "How do you keep learning new technologies?",
    "What kind of work environment helps you perform best?",
  ],
  hard: [
    "Tell me about a time you had to make a decision with incomplete information. How did you decide?",
    "Describe a situation where you had to influence people without authority.",
    "Tell me about a serious mistake you made in production or in a project. How did you recover?",
    "How would you handle a teammate who consistently delivers late and blocks you?",
    "Describe a time you had to push back on a manager or client requirement.",
    "How do you balance shipping fast against long-term code quality? Give a real example.",
    "Tell me about a time you led something without being the official lead.",
    "What would you do in your first 90 days here to add real value?",
    "Describe a conflict between two priorities you owned and how you resolved it.",
    "Tell me about a time you changed your mind after receiving new data.",
  ],
};

const TECH: Record<string, Bank> = {
  Java: {
    easy: [
      "What is Java and what makes it platform independent?",
      "What are the main features of Java?",
      "What is the difference between JDK, JRE and JVM?",
      "What is a class and what is an object?",
      "What is inheritance in Java?",
      "What are constructors and how do they differ from methods?",
      "What are the primitive data types in Java?",
    ],
    medium: [
      "What is the difference between == and .equals() in Java?",
      "Explain method overloading and method overriding with an example.",
      "What is the difference between an ArrayList and a LinkedList?",
      "What is the difference between an interface and an abstract class?",
      "How does a HashMap work internally at a basic level?",
      "What is exception handling and why is it important?",
      "What is the difference between checked and unchecked exceptions?",
      "Explain the difference between String, StringBuilder and StringBuffer.",
      "What does the static keyword do, and when would you use it?",
      "Explain the four pillars of OOP with a small Java example for each.",
    ],
    hard: [
      "Explain the Java memory model and how the heap is divided across generations.",
      "How would you diagnose and fix a memory leak in a long-running Java service?",
      "Explain synchronized vs ReentrantLock and when you would pick each.",
      "What problems does the volatile keyword solve, and what does it not solve?",
      "How would you design a thread-safe cache with expiry using the concurrency utilities?",
      "Explain how ConcurrentHashMap achieves thread safety without locking the whole map.",
      "What is a deadlock? Describe a real scenario and how you would detect and prevent it.",
      "How does the garbage collector choice (G1 vs ZGC) affect a latency-sensitive service?",
      "Explain the difference between parallel streams and an ExecutorService for CPU-bound work.",
      "You see intermittent high GC pauses in production. Walk me through your investigation.",
    ],
  },
  "Spring Boot": {
    easy: [
      "What is Spring Boot and why is it used?",
      "What is dependency injection?",
      "What is @RestController used for?",
      "What is the purpose of application.properties?",
      "What does @SpringBootApplication do?",
      "How do you create a simple GET endpoint in Spring Boot?",
    ],
    medium: [
      "What is the difference between @Component, @Service and @Repository?",
      "Explain the flow of a request through Controller, Service and Repository layers.",
      "How does a REST API work in Spring Boot, from request to JSON response?",
      "What is the difference between @RequestParam and @PathVariable?",
      "How do you handle exceptions globally in Spring Boot?",
      "What are Spring profiles and when would you use them?",
      "How does Spring Data JPA reduce boilerplate for database access?",
      "How would you validate incoming request payloads?",
    ],
    hard: [
      "How does Spring Boot auto-configuration actually work under the hood?",
      "How would you handle transaction management across multiple service calls?",
      "Explain the N+1 query problem in JPA and how you would fix it in a Spring Boot app.",
      "How would you design a Spring Boot service to handle 10k requests per second?",
      "How do you implement retries, timeouts and circuit breakers between microservices?",
      "Explain proxy-based AOP and why calling a @Transactional method internally fails.",
      "How would you debug a slow endpoint in production without a debugger?",
      "How would you design idempotent APIs for a payment flow?",
      "How do you secure a Spring Boot REST API with JWT, and where can it go wrong?",
      "Explain connection pool tuning and what symptoms show it is misconfigured.",
    ],
  },
  SQL: {
    easy: [
      "What is a database table, a row and a column?",
      "What does the SELECT statement do?",
      "What is a primary key?",
      "What is the difference between DELETE and TRUNCATE?",
      "What are the basic SQL data types you have used?",
      "What does the ORDER BY clause do?",
    ],
    medium: [
      "What is the difference between WHERE and HAVING?",
      "Explain INNER JOIN vs LEFT JOIN with an example.",
      "What is normalization and why is it used?",
      "What is the difference between a primary key and a foreign key?",
      "Write a query to find the second-highest salary from an employees table.",
      "What are GROUP BY and aggregate functions? Give an example.",
      "What is an index and how does it speed up a query?",
      "What is the difference between UNION and UNION ALL?",
    ],
    hard: [
      "A report query takes 40 seconds. Walk me through how you would optimise it.",
      "How do you read an execution plan and what would make you add an index?",
      "Explain window functions and rewrite a top-N-per-group query using them.",
      "Explain transaction isolation levels and the anomalies each one prevents.",
      "How would you handle a deadlock happening between two frequent transactions?",
      "When would a composite index help and what does column order change?",
      "How would you paginate efficiently over a 100 million row table?",
      "Explain how you would design schema and indexes for a high-write audit log.",
      "What are the trade-offs of denormalisation in a reporting database?",
      "How would you migrate a large table schema with zero downtime?",
    ],
  },
  JavaScript: {
    easy: [
      "What is JavaScript used for on a web page?",
      "What is the difference between null and undefined?",
      "What are the primitive data types in JavaScript?",
      "What is a function and how do you declare one?",
      "What is an array and name a few common array methods.",
      "What is the DOM?",
    ],
    medium: [
      "What is the difference between var, let and const?",
      "Explain closures with a practical example.",
      "What is the difference between == and ===?",
      "What is event bubbling and how do you stop it?",
      "Explain promises and async/await.",
      "What is the difference between map(), filter() and reduce()?",
      "How does the 'this' keyword behave in different contexts?",
      "What is the event loop, explained simply?",
    ],
    hard: [
      "Explain the event loop including microtasks vs macrotasks with an ordering example.",
      "How would you debug a memory leak in a long-lived single page application?",
      "Implement a debounce function and explain the trade-offs vs throttle.",
      "Explain prototypal inheritance and how class syntax maps onto it.",
      "How would you handle backpressure when processing a large stream of events in JS?",
      "What causes 'this' bugs in callbacks and what are the robust fixes?",
      "How do you optimise the load performance of a large JS bundle?",
      "Explain how you would implement a retry-with-backoff wrapper around fetch.",
      "What are the pitfalls of Promise.all in a batch job and how would you fix them?",
      "Explain immutability and how it affects performance and correctness at scale.",
    ],
  },
  React: {
    easy: [
      "What is React and why is it used?",
      "What is a component?",
      "What is JSX?",
      "What are props?",
      "What is state?",
      "How do you handle a button click in React?",
    ],
    medium: [
      "What is the difference between state and props?",
      "What is the difference between controlled and uncontrolled components?",
      "What is useEffect and when is it used?",
      "Why are keys required when rendering lists?",
      "How does component re-rendering happen in React?",
      "What is useState and how do you update state based on the previous value?",
      "How do you lift state up and why would you do it?",
      "What is conditional rendering and what are the common patterns?",
    ],
    hard: [
      "How would you diagnose and fix unnecessary re-renders in a large React tree?",
      "Explain useMemo, useCallback and React.memo and when each is actually worth it.",
      "How would you manage server state vs client state in a large application?",
      "Explain reconciliation and how keys affect it in dynamic lists.",
      "How would you implement virtualisation for a list of 50,000 rows?",
      "What are the common useEffect pitfalls (stale closures, race conditions) and the fixes?",
      "How would you architect state for a multi-step form with autosave?",
      "Explain code splitting and how you decide split points.",
      "How would you handle optimistic updates and rollback on failure?",
      "How do you avoid prop drilling without over-using global context?",
    ],
  },
  Python: {
    easy: [
      "What is Python and where is it commonly used?",
      "What is the difference between a list and a tuple?",
      "What is a dictionary in Python?",
      "How do you define a function in Python?",
      "What are Python's basic data types?",
      "What is indentation used for in Python?",
    ],
    medium: [
      "What is the difference between a list, set and dictionary, and when do you use each?",
      "Explain list comprehensions with an example.",
      "What are *args and **kwargs?",
      "How does exception handling work in Python?",
      "What is a decorator and give a practical use case.",
      "What is the difference between shallow copy and deep copy?",
      "Explain generators and why they save memory.",
      "How do modules and packages work in Python?",
    ],
    hard: [
      "Explain the GIL and how it affects CPU-bound vs IO-bound workloads.",
      "How would you profile and optimise a slow Python data pipeline?",
      "Explain asyncio and when it beats threads or processes.",
      "How does Python's memory management and reference counting work?",
      "How would you process a 50GB file that does not fit in memory?",
      "Explain metaclasses and a legitimate use case.",
      "How would you make a Python service handle high concurrency in production?",
      "What are the pitfalls of mutable default arguments and closures in loops?",
      "How would you design retries and idempotency in a Python job runner?",
      "How do you structure a large Python codebase for testability?",
    ],
  },
};

const GENERIC: Bank = {
  easy: [
    "Explain the core concepts of {skill} in your own words.",
    "What is {skill} mainly used for?",
    "What are the basic building blocks of {skill}?",
    "Which {skill} features do you use most often and why?",
    "What did you build using {skill}?",
  ],
  medium: [
    "Explain a practical problem you solved using {skill}.",
    "What are the most common mistakes beginners make with {skill}?",
    "How would you explain {skill} to a junior developer joining your team?",
    "Compare {skill} with an alternative you have used and explain the trade-offs.",
    "Walk me through how you would structure a small project using {skill}.",
    "What are the debugging tools or techniques you use with {skill}?",
    "How do you test work built with {skill}?",
    "What performance considerations matter when working with {skill}?",
  ],
  hard: [
    "How would you design a large-scale system that relies heavily on {skill}?",
    "Describe the hardest bug you can imagine hitting with {skill} and how you would isolate it.",
    "How would you optimise a {skill} based component that has become a bottleneck?",
    "What are the failure modes of {skill} in production and how do you guard against them?",
    "How would you migrate a legacy system to {skill} with zero downtime?",
    "How do you make {skill} work reliably under high concurrency?",
    "How would you measure and improve reliability in a {skill} heavy service?",
    "What security concerns arise when using {skill} and how do you mitigate them?",
    "How would you review someone else's {skill} code for correctness and maintainability?",
    "Explain a trade-off in {skill} where the obvious answer is wrong.",
  ],
};

/** Skills implied by a role, used when the candidate picks no skills explicitly. */
const ROLE_SKILLS: Record<string, string[]> = {
  "java developer": ["Java", "SQL"],
  "spring boot developer": ["Spring Boot", "Java", "SQL"],
  "backend developer": ["Java", "SQL", "REST API"],
  "full stack developer": ["JavaScript", "React", "SQL"],
  "frontend developer": ["JavaScript", "React"],
  "software engineer": ["Java", "Data Structures", "SQL"],
  "python developer": ["Python", "SQL"],
  "data analyst": ["SQL", "Python"],
};

export function skillsForRole(role: string): string[] {
  return ROLE_SKILLS[role.trim().toLowerCase()] ?? [];
}

export function hasCuratedBank(skill: string): boolean {
  return Object.keys(TECH).some((k) => k.toLowerCase() === skill.trim().toLowerCase());
}


function bankFor(skill: string): Bank {
  const key = Object.keys(TECH).find(
    (k) => k.toLowerCase() === skill.trim().toLowerCase(),
  );
  if (key) return TECH[key]!;
  return {
    easy: GENERIC.easy.map((q) => q.replaceAll("{skill}", skill)),
    medium: GENERIC.medium.map((q) => q.replaceAll("{skill}", skill)),
    hard: GENERIC.hard.map((q) => q.replaceAll("{skill}", skill)),
  };
}

function takeRoundRobin(pools: string[][], count: number): string[] {
  const out: string[] = [];
  const cursors = pools.map(() => 0);
  let guard = 0;
  while (out.length < count && guard < count * pools.length + 50) {
    guard++;
    let progressed = false;
    for (let i = 0; i < pools.length && out.length < count; i++) {
      const pool = pools[i]!;
      const c = cursors[i]!;
      if (c < pool.length) {
        const q = pool[c]!;
        cursors[i] = c + 1;
        if (!out.includes(q)) out.push(q);
        progressed = true;
      }
    }
    if (!progressed) break;
  }
  return out;
}

/** Deterministic, offline question set. Never returns fewer than 1 question. */
export function buildFallbackQuestions(cfg: {
  type: "hr" | "technical" | "mixed";
  difficulty: Level;
  skills: string[];
  totalQuestions: number;
}): string[] {
  const level = cfg.difficulty;
  const skills = (cfg.skills ?? []).map((s) => s.trim()).filter(Boolean);
  const total = Math.max(1, cfg.totalQuestions || 5);

  const techPools = (skills.length ? skills : ["Software Engineering"]).map(
    (s) => bankFor(s)[level],
  );
  const hrPool = HR[level];

  if (cfg.type === "hr") {
    const qs = takeRoundRobin([hrPool], total);
    return pad(qs, hrPool, total);
  }
  if (cfg.type === "technical") {
    const qs = takeRoundRobin(techPools, total);
    return pad(qs, techPools.flat(), total);
  }
  // mixed: ~40% HR, rest technical, interleaved
  const hrCount = Math.max(1, Math.round(total * 0.4));
  const hrQs = takeRoundRobin([hrPool], hrCount);
  const techQs = takeRoundRobin(techPools, total - hrQs.length);
  const merged: string[] = [];
  const max = Math.max(hrQs.length, techQs.length);
  for (let i = 0; i < max; i++) {
    if (techQs[i]) merged.push(techQs[i]!);
    if (hrQs[i]) merged.push(hrQs[i]!);
  }
  return pad(merged.slice(0, total), [...techPools.flat(), ...hrPool], total);
}

function pad(qs: string[], pool: string[], total: number): string[] {
  const out = [...qs];
  for (const q of pool) {
    if (out.length >= total) break;
    if (!out.includes(q)) out.push(q);
  }
  let i = 0;
  while (out.length < total && pool.length) {
    out.push(pool[i % pool.length]!);
    i++;
  }
  return out.slice(0, Math.max(1, total));
}

export const DIFFICULTY_GUIDE: Record<Level, string> = {
  easy:
    "EASY = fundamentals only. Test whether the candidate knows the basic definitions and concepts (what is X, difference between two basic terms, simple syntax). Absolutely no system design, no internals, no optimisation, no tricky edge cases.",
  medium:
    "MEDIUM = practical, commonly asked interview questions. The candidate already knows fundamentals; test whether they can apply and explain concepts in real development situations (e.g. '== vs .equals()', 'ArrayList vs LinkedList', 'WHERE vs HAVING', 'closures with an example', 'useEffect and when to use it'). MEDIUM IS NOT ADVANCED. No system design, no deep internals, no concurrency puzzles, no large-scale optimisation.",
  hard:
    "HARD = advanced reasoning and problem solving: concurrency, performance and memory optimisation, complex query/algorithm problems, architecture, scalability, debugging real production incidents — always relevant to the selected skills.",
};
