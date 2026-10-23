import { dsaLearningOrder } from "./dsa-roadmap";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface CodingChallenge {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  functionName: string;
  starterCode: {
    javascript: string;
    typescript: string;
    python: string;
    java: string;
    cpp: string;
  };
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  testCases: TestCase[];
  externalLinks?: {
    platform: "LeetCode" | "GeeksforGeeks";
    title: string;
    url: string;
  }[];
}

export interface DsaLevel {
  id: string;
  title: string;
  shortDesc: string;
  estimatedMinutes: number;
  order: number;
  requiresCoding: boolean;
  theory: {
    summary: string;
    sections: {
      heading: string;
      content: string;
      codeSnippet?: {
        language: string;
        code: string;
      };
      keyTakeaways?: string[];
      complexity?: {
        time: string;
        space: string;
      };
    }[];
  };
  quiz: {
    passThreshold: number; // e.g. 3 out of 5
    questions: QuizQuestion[];
  };
  codingChallenge?: CodingChallenge;
}

export interface DsaTopic {
  id: string;
  title: string;
  slug: string;
  iconName: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  order: number;
  levels: DsaLevel[];
}

const curriculumTopics: DsaTopic[] = [
  {
    id: "programming-foundations",
    slug: "programming-foundations",
    title: "Programming Foundations",
    iconName: "Terminal",
    difficulty: "Beginner",
    order: 1,
    description: "Variables, control flow, loops, functions, memory references, and asymptotic Big-O notation.",
    levels: [
      {
        id: "foundations-1",
        title: "Memory & Flow Control",
        shortDesc: "Memory allocation, primitives vs references, conditional logic and iteration patterns.",
        estimatedMinutes: 15,
        order: 1,
        requiresCoding: false,
        theory: {
          summary: "Understanding how memory is addressed in runtime environments and mastering loop bounds is the bedrock of DSA.",
          sections: [
            {
              heading: "Memory Stack vs Heap",
              content: "In modern runtime systems, primitives (integers, booleans) reside in stack frames, while objects and dynamic arrays reside on the heap with pointers referenced on the stack. Passing arrays to functions in most languages passes the reference by value, meaning mutations inside the function affect the caller's structure.",
              codeSnippet: {
                language: "javascript",
                code: "// Reference mutation example\nfunction modify(arr) {\n  arr[0] = 99;\n}\nconst nums = [1, 2, 3];\nmodify(nums);\nconsole.log(nums); // [99, 2, 3]",
              },
              keyTakeaways: [
                "Stack memory is fast and automatically reclaimed when functions return.",
                "Heap memory accommodates dynamic sizes but requires pointer dereferencing.",
              ],
            },
            {
              heading: "Loop Invariants and Iteration Patterns",
              content: "A loop invariant is a formal property that remains true before and after each iteration of a loop. Mastering invariants prevents off-by-one errors (e.g. index <= length vs index < length).",
            },
          ],
        },
        quiz: {
          passThreshold: 3,
          questions: [
            {
              id: "q1",
              question: "Where are dynamic heap objects allocated in memory?",
              options: ["In CPU registers", "On the Heap", "Inside the Call Stack", "In Read-Only ROM"],
              correctIndex: 1,
              explanation: "Dynamic collections and objects whose sizes are determined at runtime are allocated on the Heap.",
            },
            {
              id: "q2",
              question: "What happens when an array reference is passed into a function in JavaScript/Java?",
              options: ["A deep clone is made", "The reference is passed, allowing in-place mutation", "The original array is locked", "A compile error occurs"],
              correctIndex: 1,
              explanation: "References are passed, allowing modifications to array contents in-place.",
            },
            {
              id: "q3",
              question: "Which of the following is a classic cause of off-by-one errors in array indexing?",
              options: ["Iterating with `i <= arr.length` on 0-indexed array", "Using `const` instead of `let`", "Checking `arr.length === 0`", "Returning before the loop"],
              correctIndex: 0,
              explanation: "On 0-indexed arrays with length N, the valid indices are 0 to N-1. `i <= length` causes an out-of-bounds access.",
            },
            {
              id: "q4",
              question: "What is the primary characteristic of a loop invariant?",
              options: ["It must change every loop cycle", "It remains true before, during, and after each valid iteration", "It forces the loop to terminate immediately", "It only applies to while loops"],
              correctIndex: 1,
              explanation: "A loop invariant is a mathematical assertion that remains true across every iteration.",
            },
            {
              id: "q5",
              question: "Why is stack memory allocation faster than heap allocation?",
              options: ["Stack memory uses garbage collection", "Stack allocation merely adjusts a stack pointer pointer", "Stack memory is stored in network cache", "Heap memory does not exist in C++"],
              correctIndex: 1,
              explanation: "Stack allocations simply increment or decrement the stack pointer register, making them virtually instantaneous.",
            },
          ],
        },
      },
      {
        id: "foundations-2",
        title: "Big-O Asymptotic Analysis",
        shortDesc: "Time and Space complexities: Big-O, Big-Omega, Big-Theta, and dominant term rules.",
        estimatedMinutes: 20,
        order: 2,
        requiresCoding: true,
        theory: {
          summary: "Asymptotic notation describes how the runtime or memory requirement of an algorithm scales as input size N grows towards infinity.",
          sections: [
            {
              heading: "Complexity Orders",
              content: "Common complexities ordered from fastest to slowest:\nO(1) < O(log N) < O(N) < O(N log N) < O(N²) < O(2^N) < O(N!).\nWhen analyzing, we drop constant factors (O(3N) becomes O(N)) and lower-order terms (O(N² + 5N) becomes O(N²)).",
              complexity: {
                time: "O(1) to O(N)",
                space: "O(1) aux",
              },
              keyTakeaways: [
                "Big-O represents an asymptotic upper bound (worst-case scaling).",
                "Auxiliary space measures only additional memory allocated beyond the input.",
              ],
            },
          ],
        },
        quiz: {
          passThreshold: 3,
          questions: [
            {
              id: "q1",
              question: "What is the simplified Big-O of an algorithm running in 5N² + 100N + 50 operations?",
              options: ["O(5N²)", "O(N²)", "O(N)", "O(100N)"],
              correctIndex: 1,
              explanation: "We drop constant coefficients and non-dominant terms, leaving O(N²).",
            },
            {
              id: "q2",
              question: "What is the time complexity of searching an element in an unsorted array of size N?",
              options: ["O(1)", "O(log N)", "O(N)", "O(N²)"],
              correctIndex: 2,
              explanation: "In an unsorted array, we may need to inspect all N elements in the worst case, giving O(N).",
            },
            {
              id: "q3",
              question: "If an algorithm halves the search space in each step, what is its time complexity?",
              options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
              correctIndex: 1,
              explanation: "Repeated division by 2 results in logarithmic time O(log₂ N).",
            },
            {
              id: "q4",
              question: "What does Space Complexity measure?",
              options: ["The physical size of the source code file", "Total memory (input + auxiliary) consumed relative to N", "The speed of the CPU", "The number of lines executed"],
              correctIndex: 1,
              explanation: "Space complexity describes how total memory usage scales with input size N.",
            },
            {
              id: "q5",
              question: "Nested loops from 1 to N both iterating sequentially produce which complexity?",
              options: ["O(N)", "O(N log N)", "O(N²)", "O(2^N)"],
              correctIndex: 2,
              explanation: "Outer loop runs N times and inner runs N times, resulting in N * N = O(N²).",
            },
          ],
        },
        codingChallenge: {
          id: "code-foundations-2",
          title: "Find Missing Number",
          difficulty: "Easy",
          description: "Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number in the range that is missing from the array. Achieve O(N) time and O(1) extra space.",
          functionName: "missingNumber",
          starterCode: {
            javascript: "function missingNumber(nums) {\n  // Write your code here\n  const n = nums.length;\n  let expectedSum = (n * (n + 1)) / 2;\n  let actualSum = nums.reduce((a, b) => a + b, 0);\n  return expectedSum - actualSum;\n}",
            typescript: "function missingNumber(nums: number[]): number {\n  const n = nums.length;\n  let expectedSum = (n * (n + 1)) / 2;\n  let actualSum = nums.reduce((a, b) => a + b, 0);\n  return expectedSum - actualSum;\n}",
            python: "def missingNumber(nums):\n    n = len(nums)\n    return (n * (n + 1)) // 2 - sum(nums)",
            java: "class Solution {\n    public int missingNumber(int[] nums) {\n        int n = nums.length;\n        int sum = n * (n + 1) / 2;\n        for (int x : nums) sum -= x;\n        return sum;\n    }\n}",
            cpp: "class Solution {\npublic:\n    int missingNumber(vector<int>& nums) {\n        int n = nums.size();\n        int sum = n * (n + 1) / 2;\n        for (int x : nums) sum -= x;\n        return sum;\n    }\n};",
          },
          examples: [
            {
              input: "[3,0,1]",
              output: "2",
              explanation: "n = 3 since there are 3 numbers, so all numbers are in the range [0,3]. 2 is the missing number.",
            },
            {
              input: "[0,1]",
              output: "2",
              explanation: "n = 2 since there are 2 numbers. 2 is missing.",
            },
          ],
          constraints: [
            "n == nums.length",
            "1 <= n <= 10^4",
            "0 <= nums[i] <= n",
            "All the numbers of nums are unique.",
          ],
          testCases: [
            { input: "[3,0,1]", expectedOutput: "2" },
            { input: "[0,1]", expectedOutput: "2" },
            { input: "[9,6,4,2,3,5,7,0,1]", expectedOutput: "8", isHidden: true },
          ],
          externalLinks: [
            {
              platform: "LeetCode",
              title: "LeetCode 268 - Missing Number",
              url: "https://leetcode.com/problems/missing-number/",
            },
          ],
        },
      },
    ],
  },
  {
    id: "arrays",
    slug: "arrays",
    title: "Arrays",
    iconName: "Rows3",
    difficulty: "Beginner",
    order: 2,
    description: "Contiguous memory structures, prefixes, sliding window, two pointers, and matrix transformations.",
    levels: [
      {
        id: "arrays-1",
        title: "Array Fundamentals & Memory",
        shortDesc: "Contiguous storage, random O(1) indexing, amortized resizing in dynamic arrays.",
        estimatedMinutes: 15,
        order: 1,
        requiresCoding: true,
        theory: {
          summary: "Arrays store elements at consecutive memory addresses: Address(i) = BaseAddress + i * SizeOfElement.",
          sections: [
            {
              heading: "Direct Indexing vs Insertions",
              content: "Reading an element at index `i` is O(1) arithmetic. Inserting or deleting at index `k` requires shifting `N - k` elements, incurring O(N) worst-case time.",
              complexity: {
                time: "Access: O(1), Insertion/Deletion: O(N)",
                space: "O(1) auxiliary",
              },
            },
          ],
        },
        quiz: {
          passThreshold: 3,
          questions: [
            {
              id: "q1",
              question: "What enables O(1) random access in arrays?",
              options: ["Linked pointers", "Contiguous memory and offset arithmetic", "Hash functions", "Binary tree traversal"],
              correctIndex: 1,
              explanation: "Memory is contiguous, so index calculation `Base + i * element_size` takes constant time.",
            },
            {
              id: "q2",
              question: "What is the worst-case time complexity of inserting an element at the beginning of an array?",
              options: ["O(1)", "O(log N)", "O(N)", "O(N²)"],
              correctIndex: 2,
              explanation: "All N existing elements must be shifted one position to the right.",
            },
            {
              id: "q3",
              question: "What is the amortized cost of `push` / `append` in a dynamic array (like JavaScript Array or Java ArrayList)?",
              options: ["O(1)", "O(N)", "O(N²)", "O(log N)"],
              correctIndex: 0,
              explanation: "Doubling capacity when full spreads the reallocation cost over many inserts, yielding amortized O(1).",
            },
            {
              id: "q4",
              question: "Which of the following is true regarding static vs dynamic arrays?",
              options: ["Static arrays can resize on demand", "Dynamic arrays use non-contiguous memory", "Static arrays have fixed capacity defined at allocation", "Dynamic arrays do not support O(1) indexing"],
              correctIndex: 2,
              explanation: "Static arrays have fixed memory allocated up front.",
            },
            {
              id: "q5",
              question: "How do you find the midpoint of indices `left` and `right` without integer overflow?",
              options: ["(left + right) / 2", "left + (right - left) / 2", "right - left / 2", "(left * right) / 2"],
              correctIndex: 1,
              explanation: "`left + (right - left) / 2` avoids potential 32-bit integer overflow from `left + right`.",
            },
          ],
        },
        codingChallenge: {
          id: "code-arrays-1",
          title: "Two Sum",
          difficulty: "Easy",
          description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
          functionName: "twoSum",
          starterCode: {
            javascript: "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}",
            typescript: "function twoSum(nums: number[], target: number): number[] {\n  const map = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement)!, i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}",
            python: "def twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in seen:\n            return [seen[diff], i]\n        seen[n] = i\n    return []",
            java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int comp = target - nums[i];\n            if (map.containsKey(comp)) return new int[]{map.get(comp), i};\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}",
            cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> mp;\n        for (int i = 0; i < nums.size(); ++i) {\n            int comp = target - nums[i];\n            if (mp.count(comp)) return {mp[comp], i};\n            mp[nums[i]] = i;\n        }\n        return {};\n    }\n};",
          },
          examples: [
            { input: "[2,7,11,15], 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
            { input: "[3,2,4], 6", output: "[1,2]", explanation: "nums[1] + nums[2] == 6." },
          ],
          constraints: [
            "2 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "-10^9 <= target <= 10^9",
          ],
          testCases: [
            { input: "[2,7,11,15], 9", expectedOutput: "[0,1]" },
            { input: "[3,2,4], 6", expectedOutput: "[1,2]" },
            { input: "[3,3], 6", expectedOutput: "[0,1]", isHidden: true },
          ],
          externalLinks: [
            {
              platform: "LeetCode",
              title: "LeetCode 1 - Two Sum",
              url: "https://leetcode.com/problems/two-sum/",
            },
          ],
        },
      },
      {
        id: "arrays-2",
        title: "Two Pointers Technique",
        shortDesc: "Opposite-end and fast-slow pointer patterns for linear time transformations.",
        estimatedMinutes: 20,
        order: 2,
        requiresCoding: true,
        theory: {
          summary: "The two pointers pattern processes arrays by maintaining two index pointers moving towards each other or in the same direction, reducing O(N²) quadratic scans to O(N).",
          sections: [
            {
              heading: "Left and Right Convergence",
              content: "On sorted arrays, if `nums[left] + nums[right] < target`, incrementing `left` increases the sum, whereas decrementing `right` decreases the sum.",
              complexity: {
                time: "O(N)",
                space: "O(1)",
              },
            },
          ],
        },
        quiz: {
          passThreshold: 3,
          questions: [
            {
              id: "q1",
              question: "When is the opposite-end Two Pointers technique most applicable for pair sum problems?",
              options: ["When the array is strictly unsorted", "When the array is sorted", "Only when the array has odd length", "Only for 2D matrices"],
              correctIndex: 1,
              explanation: "Sorted order guarantees that moving left increases sum and moving right decreases sum.",
            },
            {
              id: "q2",
              question: "What is the space complexity of in-place two pointers array reversal?",
              options: ["O(N)", "O(N log N)", "O(1)", "O(log N)"],
              correctIndex: 2,
              explanation: "Swapping elements in-place with two pointer variables uses O(1) auxiliary memory.",
            },
            {
              id: "q3",
              question: "In the fast and slow pointer pattern for removing duplicates, when does the slow pointer advance?",
              options: ["Every loop iteration", "Only when a new unique element is found", "When fast pointer reaches the end", "Never"],
              correctIndex: 1,
              explanation: "The slow pointer advances only to record a new distinct value.",
            },
            {
              id: "q4",
              question: "What is the time complexity of the 3Sum problem solved using sorting + Two Pointers?",
              options: ["O(N³)", "O(N²)", "O(N log N)", "O(N)"],
              correctIndex: 1,
              explanation: "Sorting takes O(N log N) and for each of N elements we run an O(N) two-pointer scan, total O(N²).",
            },
            {
              id: "q5",
              question: "How do you detect if a string is a palindrome using two pointers?",
              options: ["Compare left and right characters while left < right", "Count all vowels", "Reverse with extra string and compare", "Check if length is even"],
              correctIndex: 0,
              explanation: "Compare characters at left and right indices and converge towards the center in O(N) time and O(1) space.",
            },
          ],
        },
        codingChallenge: {
          id: "code-arrays-2",
          title: "Container With Most Water",
          difficulty: "Medium",
          description: "You are given an integer array `height` of length `n`. Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.",
          functionName: "maxArea",
          starterCode: {
            javascript: "function maxArea(height) {\n  let left = 0, right = height.length - 1;\n  let maxWater = 0;\n  while (left < right) {\n    const width = right - left;\n    const h = Math.min(height[left], height[right]);\n    maxWater = Math.max(maxWater, width * h);\n    if (height[left] < height[right]) {\n      left++;\n    } else {\n      right--;\n    }\n  }\n  return maxWater;\n}",
            typescript: "function maxArea(height: number[]): number {\n  let left = 0, right = height.length - 1;\n  let maxWater = 0;\n  while (left < right) {\n    const width = right - left;\n    const h = Math.min(height[left], height[right]);\n    maxWater = Math.max(maxWater, width * h);\n    if (height[left] < height[right]) {\n      left++;\n    } else {\n      right--;\n    }\n  }\n  return maxWater;\n}",
            python: "def maxArea(height):\n    left, right = 0, len(height) - 1\n    ans = 0\n    while left < right:\n        ans = max(ans, (right - left) * min(height[left], height[right]))\n        if height[left] < height[right]:\n            left += 1\n        else:\n            right -= 1\n    return ans",
            java: "class Solution {\n    public int maxArea(int[] height) {\n        int l = 0, r = height.length - 1, max = 0;\n        while (l < r) {\n            max = Math.max(max, (r - l) * Math.min(height[l], height[r]));\n            if (height[l] < height[r]) l++; else r--;\n        }\n        return max;\n    }\n}",
            cpp: "class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        int l = 0, r = height.size() - 1, mx = 0;\n        while (l < r) {\n            mx = max(mx, (r - l) * min(height[l], height[r]));\n            if (height[l] < height[r]) l++; else r--;\n        }\n        return mx;\n    }\n};",
          },
          examples: [
            { input: "[1,8,6,2,5,4,8,3,7]", output: "49", explanation: "The max area is between index 1 (height 8) and index 8 (height 7): min(8, 7) * 7 = 49." },
            { input: "[1,1]", output: "1" },
          ],
          constraints: [
            "n == height.length",
            "2 <= n <= 10^5",
            "0 <= height[i] <= 10^4",
          ],
          testCases: [
            { input: "[1,8,6,2,5,4,8,3,7]", expectedOutput: "49" },
            { input: "[1,1]", expectedOutput: "1" },
            { input: "[4,3,2,1,4]", expectedOutput: "16", isHidden: true },
          ],
          externalLinks: [
            {
              platform: "LeetCode",
              title: "LeetCode 11 - Container With Most Water",
              url: "https://leetcode.com/problems/container-with-most-water/",
            },
          ],
        },
      },
    ],
  },
  {
    id: "strings",
    slug: "strings",
    title: "Strings",
    iconName: "Type",
    difficulty: "Beginner",
    order: 3,
    description: "Immutability, character encoding, anagrams, palindromes, and rolling hashes.",
    levels: [
      {
        id: "strings-1",
        title: "String Representations & Anagrams",
        shortDesc: "ASCII/Unicode arrays, character frequency maps, and anagram verification.",
        estimatedMinutes: 15,
        order: 1,
        requiresCoding: true,
        theory: {
          summary: "Strings in most languages (JS, Java, Python) are immutable sequences of Unicode characters. String concatenation in loops should use arrays or string builders to avoid O(N²) overhead.",
          sections: [
            {
              heading: "Frequency Array Technique",
              content: "For lowercase English letters, a fixed array `new Int32Array(26)` provides O(1) space frequency counting and avoids the hashing overhead of Maps.",
              complexity: {
                time: "O(N)",
                space: "O(1) aux (fixed 26-size alphabet)",
              },
            },
          ],
        },
        quiz: {
          passThreshold: 3,
          questions: [
            {
              id: "q1",
              question: "Why does repeated string concatenation `str += char` inside a loop of size N take O(N²)?",
              options: ["Because strings are immutable and copied on each append", "Because memory is freed every step", "Because Unicode requires 8 bytes per char", "It does not take O(N²)"],
              correctIndex: 0,
              explanation: "Immutable strings require creating a new string copy of length `i` on each concatenation.",
            },
            {
              id: "q2",
              question: "What is an Anagram?",
              options: ["A string that reads same backwards", "A word formed by rearranging the letters of another word", "A substring of unique characters", "A compressed string"],
              correctIndex: 1,
              explanation: "Anagrams have identical character frequencies.",
            },
            {
              id: "q3",
              question: "What is the optimal space complexity for counting frequency of lowercase English alphabet strings?",
              options: ["O(N)", "O(26) = O(1)", "O(N²)", "O(log N)"],
              correctIndex: 1,
              explanation: "A fixed 26-element array uses constant O(1) auxiliary space.",
            },
            {
              id: "q4",
              question: "What does the ASCII value of 'a' evaluate to in standard character charts?",
              options: ["65", "97", "48", "0"],
              correctIndex: 1,
              explanation: "Lower-case 'a' is 97 in ASCII, while 'A' is 65.",
            },
            {
              id: "q5",
              question: "How can you check if two strings `s` and `t` are anagrams in O(N) time?",
              options: ["Sort both strings in O(N log N)", "Count character frequencies in one array and verify counts match", "Compare string lengths only", "Use recursive permutations"],
              correctIndex: 1,
              explanation: "Increment counts for `s` and decrement for `t` in a single pass of O(N) time.",
            },
          ],
        },
        codingChallenge: {
          id: "code-strings-1",
          title: "Valid Anagram",
          difficulty: "Easy",
          description: "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.",
          functionName: "isAnagram",
          starterCode: {
            javascript: "function isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  const count = new Array(26).fill(0);\n  for (let i = 0; i < s.length; i++) {\n    count[s.charCodeAt(i) - 97]++;\n    count[t.charCodeAt(i) - 97]--;\n  }\n  return count.every(c => c === 0);\n}",
            typescript: "function isAnagram(s: string, t: string): boolean {\n  if (s.length !== t.length) return false;\n  const count = new Array(26).fill(0);\n  for (let i = 0; i < s.length; i++) {\n    count[s.charCodeAt(i) - 97]++;\n    count[t.charCodeAt(i) - 97]--;\n  }\n  return count.every(c => c === 0);\n}",
            python: "def isAnagram(s, t):\n    if len(s) != len(t): return False\n    from collections import Counter\n    return Counter(s) == Counter(t)",
            java: "class Solution {\n    public boolean isAnagram(String s, String t) {\n        if (s.length() != t.length()) return false;\n        int[] count = new int[26];\n        for (int i = 0; i < s.length(); i++) {\n            count[s.charAt(i) - 'a']++;\n            count[t.charAt(i) - 'a']--;\n        }\n        for (int c : count) if (c != 0) return false;\n        return true;\n    }\n}",
            cpp: "class Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        if (s.length() != t.length()) return false;\n        vector<int> count(26, 0);\n        for (int i = 0; i < s.length(); i++) {\n            count[s[i] - 'a']++;\n            count[t[i] - 'a']--;\n        }\n        for (int c : count) if (c != 0) return false;\n        return true;\n    }\n};",
          },
          examples: [
            { input: '"anagram", "nagaram"', output: "true" },
            { input: '"rat", "car"', output: "false" },
          ],
          constraints: [
            "1 <= s.length, t.length <= 5 * 10^4",
            "s and t consist of lowercase English letters.",
          ],
          testCases: [
            { input: '"anagram", "nagaram"', expectedOutput: "true" },
            { input: '"rat", "car"', expectedOutput: "false" },
            { input: '"a", "ab"', expectedOutput: "false", isHidden: true },
          ],
          externalLinks: [
            {
              platform: "LeetCode",
              title: "LeetCode 242 - Valid Anagram",
              url: "https://leetcode.com/problems/valid-anagram/",
            },
          ],
        },
      },
    ],
  },
  {
    id: "recursion-and-backtracking",
    slug: "recursion-and-backtracking",
    title: "Recursion & Backtracking",
    iconName: "GitFork",
    difficulty: "Intermediate",
    order: 4,
    description: "Call stack unwinding, base cases, state restoration, subsets, permutations, and grid exploration.",
    levels: [
      {
        id: "recursion-1",
        title: "Recursion Tree & Base Cases",
        shortDesc: "Stack frame execution model, recurrence relations, and leap of faith.",
        estimatedMinutes: 20,
        order: 1,
        requiresCoding: true,
        theory: {
          summary: "Recursion breaks a problem into smaller instances of the same problem. Every recursive function requires: 1) Base case (termination), 2) Recursive step (progress towards base case).",
          sections: [
            {
              heading: "Call Stack Mechanics",
              content: "Each call pushes a new frame holding local parameters. Failing to reach a base case results in Call Stack Overflow.",
              complexity: {
                time: "O(BranchingFactor ^ Depth)",
                space: "O(MaxRecursionDepth) stack space",
              },
            },
          ],
        },
        quiz: {
          passThreshold: 3,
          questions: [
            {
              id: "q1",
              question: "What causes a Stack Overflow error in recursive programs?",
              options: ["Missing or unreachable base case", "Using dynamic memory", "Sorting the input array", "Returning null"],
              correctIndex: 0,
              explanation: "Infinite recursion exhausts available call stack memory frames.",
            },
            {
              id: "q2",
              question: "What is the space complexity of naive recursive Fibonacci `fib(n) = fib(n-1) + fib(n-2)`?",
              options: ["O(1)", "O(N) call stack depth", "O(2^N)", "O(N²)"],
              correctIndex: 1,
              explanation: "Although time is O(2^N), maximum call stack depth at any moment is N, so space is O(N).",
            },
            {
              id: "q3",
              question: "What is the core step in Backtracking after exploring a recursive branch?",
              options: ["Rebooting the CPU", "Reverting/undoing the state change (backtracking)", "Throwing an exception", "Exiting the program"],
              correctIndex: 1,
              explanation: "Backtracking restores state so other branches can explore cleanly.",
            },
            {
              id: "q4",
              question: "How many subsets exist for a set of N distinct elements?",
              options: ["N", "N²", "2^N", "N!"],
              correctIndex: 2,
              explanation: "Every element has 2 choices (include or exclude), yielding 2^N total subsets.",
            },
            {
              id: "q5",
              question: "What is tail recursion optimization (TCO)?",
              options: ["Executing the recursive call in a worker thread", "Compiler reusing the current stack frame when the recursive call is the final statement", "Converting recursion to a while loop with O(2^N) memory", "Removing the base case"],
              correctIndex: 1,
              explanation: "When the return value is immediately the recursive call, compilers reuse the frame in O(1) space.",
            },
          ],
        },
        codingChallenge: {
          id: "code-recursion-1",
          title: "Subsets (Power Set)",
          difficulty: "Medium",
          description: "Given an integer array `nums` of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets.",
          functionName: "subsets",
          starterCode: {
            javascript: "function subsets(nums) {\n  const result = [];\n  function backtrack(start, path) {\n    result.push([...path]);\n    for (let i = start; i < nums.length; i++) {\n      path.push(nums[i]);\n      backtrack(i + 1, path);\n      path.pop(); // undo choice\n    }\n  }\n  backtrack(0, []);\n  return result;\n}",
            typescript: "function subsets(nums: number[]): number[][] {\n  const result: number[][] = [];\n  function backtrack(start: number, path: number[]) {\n    result.push([...path]);\n    for (let i = start; i < nums.length; i++) {\n      path.push(nums[i]);\n      backtrack(i + 1, path);\n      path.pop();\n    }\n  }\n  backtrack(0, []);\n  return result;\n}",
            python: "def subsets(nums):\n    res = []\n    def backtrack(start, path):\n        res.append(list(path))\n        for i in range(start, len(nums)):\n            path.append(nums[i])\n            backtrack(i + 1, path)\n            path.pop()\n    backtrack(0, [])\n    return res",
            java: "class Solution {\n    public List<List<Integer>> subsets(int[] nums) {\n        List<List<Integer>> res = new ArrayList<>();\n        backtrack(0, nums, new ArrayList<>(), res);\n        return res;\n    }\n    private void backtrack(int start, int[] nums, List<Integer> path, List<List<Integer>> res) {\n        res.add(new ArrayList<>(path));\n        for (int i = start; i < nums.length; i++) {\n            path.add(nums[i]);\n            backtrack(i + 1, nums, path, res);\n            path.remove(path.size() - 1);\n        }\n    }\n}",
            cpp: "class Solution {\npublic:\n    vector<vector<int>> subsets(vector<int>& nums) {\n        vector<vector<int>> res;\n        vector<int> path;\n        function<void(int)> dfs = [&](int start) {\n            res.push_back(path);\n            for (int i = start; i < nums.size(); ++i) {\n                path.push_back(nums[i]);\n                dfs(i + 1);\n                path.pop_back();\n            }\n        };\n        dfs(0);\n        return res;\n    }\n};",
          },
          examples: [
            { input: "[1,2,3]", output: "[[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]]" },
            { input: "[0]", output: "[[],[0]]" },
          ],
          constraints: [
            "1 <= nums.length <= 10",
            "-10 <= nums[i] <= 10",
            "All the numbers of nums are unique.",
          ],
          testCases: [
            { input: "[1,2,3]", expectedOutput: "[[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]]" },
            { input: "[0]", expectedOutput: "[[],[0]]" },
          ],
          externalLinks: [
            {
              platform: "LeetCode",
              title: "LeetCode 78 - Subsets",
              url: "https://leetcode.com/problems/subsets/",
            },
          ],
        },
      },
    ],
  },
  {
    id: "linked-lists",
    slug: "linked-lists",
    title: "Linked Lists",
    iconName: "Link2",
    difficulty: "Beginner",
    order: 5,
    description: "Singly, doubly, and circular lists, sentinel dummy nodes, fast & slow pointers, and cycle detection.",
    levels: [
      {
        id: "linked-lists-1",
        title: "Node Pointer Manipulation & Reversal",
        shortDesc: "In-place pointer reversal, dummy heads, and Floyd's Cycle Finding.",
        estimatedMinutes: 20,
        order: 1,
        requiresCoding: true,
        theory: {
          summary: "Linked lists store elements in non-contiguous nodes linked via pointer references (`node.next`).",
          sections: [
            {
              heading: "Reversal Pattern",
              content: "Maintain three pointers: `prev = null`, `curr = head`, `next = null`. In each iteration: `next = curr.next`, `curr.next = prev`, `prev = curr`, `curr = next`.",
              complexity: {
                time: "O(N)",
                space: "O(1) auxiliary",
              },
            },
          ],
        },
        quiz: {
          passThreshold: 3,
          questions: [
            {
              id: "q1",
              question: "What is the main advantage of a Linked List over a contiguous Array?",
              options: ["O(1) random index access", "O(1) insertion/deletion at known node without shifting memory", "Lower cache locality", "Binary search capability"],
              correctIndex: 1,
              explanation: "Inserting or deleting at a node simply updates next pointers without shifting contiguous elements.",
            },
            {
              id: "q2",
              question: "How does Floyd's Tortoise and Hare algorithm detect a cycle in a linked list?",
              options: ["Storing nodes in an array", "Using slow (1 step) and fast (2 steps) pointers; if they meet, a cycle exists", "Checking if head is null", "Counting node IDs"],
              correctIndex: 1,
              explanation: "If a loop exists, the fast pointer will lap the slow pointer inside the cycle.",
            },
            {
              id: "q3",
              question: "What is the purpose of a Sentinel / Dummy Head node?",
              options: ["To increase memory usage", "To simplify edge cases when mutating the head of the list", "To prevent cycle creation", "To sort the list automatically"],
              correctIndex: 1,
              explanation: "Dummy head prevents special-casing updates when deleting or inserting at index 0.",
            },
            {
              id: "q4",
              question: "What is the time complexity to find the K-th element from the end in a singly linked list in a single pass?",
              options: ["O(N) using two pointers separated by K steps", "O(N²)", "O(1)", "O(log N)"],
              correctIndex: 0,
              explanation: "Advance fast pointer by K steps, then move both until fast hits the tail.",
            },
            {
              id: "q5",
              question: "How much extra space is required to reverse a singly linked list iteratively?",
              options: ["O(N)", "O(1)", "O(N log N)", "O(N²)"],
              correctIndex: 1,
              explanation: "Only 3 pointer variables (prev, curr, next) are needed, consuming O(1) auxiliary space.",
            },
          ],
        },
        codingChallenge: {
          id: "code-linked-lists-1",
          title: "Reverse Linked List (Array Representation)",
          difficulty: "Easy",
          description: "Given the head values of a singly linked list represented as an array `head`, reverse the list and return the reversed array values.",
          functionName: "reverseList",
          starterCode: {
            javascript: "function reverseList(head) {\n  // In array representation of list nodes:\n  const result = [];\n  for (let i = head.length - 1; i >= 0; i--) {\n    result.push(head[i]);\n  }\n  return result;\n}",
            typescript: "function reverseList(head: number[]): number[] {\n  const result: number[] = [];\n  for (let i = head.length - 1; i >= 0; i--) {\n    result.push(head[i]);\n  }\n  return result;\n}",
            python: "def reverseList(head):\n    return head[::-1]",
            java: "class Solution {\n    public List<Integer> reverseList(List<Integer> head) {\n        Collections.reverse(head);\n        return head;\n    }\n}",
            cpp: "class Solution {\npublic:\n    vector<int> reverseList(vector<int>& head) {\n        reverse(head.begin(), head.end());\n        return head;\n    }\n};",
          },
          examples: [
            { input: "[1,2,3,4,5]", output: "[5,4,3,2,1]" },
            { input: "[1,2]", output: "[2,1]" },
            { input: "[]", output: "[]" },
          ],
          constraints: ["0 <= list.length <= 5000", "-5000 <= node.val <= 5000"],
          testCases: [
            { input: "[1,2,3,4,5]", expectedOutput: "[5,4,3,2,1]" },
            { input: "[1,2]", expectedOutput: "[2,1]" },
            { input: "[]", expectedOutput: "[]", isHidden: true },
          ],
          externalLinks: [
            {
              platform: "LeetCode",
              title: "LeetCode 206 - Reverse Linked List",
              url: "https://leetcode.com/problems/reverse-linked-list/",
            },
          ],
        },
      },
    ],
  },
  {
    id: "stacks-and-queues",
    slug: "stacks-and-queues",
    title: "Stacks & Queues",
    iconName: "Layers",
    difficulty: "Intermediate",
    order: 6,
    description: "LIFO vs FIFO protocols, monotonic stacks, parenthesis balancing, and circular buffers.",
    levels: [
      {
        id: "stacks-1",
        title: "Stack Protocol & Monotonic Stacks",
        shortDesc: "Valid parenthesis parsing, next greater element, and histogram areas.",
        estimatedMinutes: 20,
        order: 1,
        requiresCoding: true,
        theory: {
          summary: "Stacks enforce Last-In-First-Out (LIFO). Monotonic stacks maintain elements in strictly increasing or decreasing order to resolve Next-Greater-Element queries in O(N).",
          sections: [
            {
              heading: "Balanced Parenthesis Grammar",
              content: "Push opening brackets onto stack. When encountering a closing bracket, pop and verify type match.",
              complexity: {
                time: "O(N)",
                space: "O(N)",
              },
            },
          ],
        },
        quiz: {
          passThreshold: 3,
          questions: [
            {
              id: "q1",
              question: "Which data structure follows the Last-In-First-Out (LIFO) order?",
              options: ["Queue", "Stack", "Binary Heap", "Linked List"],
              correctIndex: 1,
              explanation: "A Stack provides LIFO semantics (push and pop at the top).",
            },
            {
              id: "q2",
              question: "What is the time complexity of pushing and popping an element from a Stack?",
              options: ["O(1)", "O(N)", "O(log N)", "O(N²)"],
              correctIndex: 0,
              explanation: "Top modifications take constant O(1) time.",
            },
            {
              id: "q3",
              question: "What problem does a Monotonic Stack solve in O(N) linear time?",
              options: ["Finding Next Greater / Smaller Element for all indices", "Sorting in O(1)", "Computing matrix inverse", "Graph shortest path"],
              correctIndex: 0,
              explanation: "Each element is pushed and popped at most once, providing O(N) overall runtime for Next Greater Element.",
            },
            {
              id: "q4",
              question: "How can a Queue be implemented using two Stacks?",
              options: ["One stack for enqueue, one stack for dequeue with lazy transfer", "Stacks cannot implement queues", "Using a single recursive stack", "Using pointer reversal"],
              correctIndex: 0,
              explanation: "In-stack stores pushed items; out-stack pops items in FIFO order, refilling from in-stack when empty.",
            },
            {
              id: "q5",
              question: "What happens when you pop from an empty Stack?",
              options: ["Stack Underflow error / undefined", "Stack Overflow", "Automatic garbage collection", "Memory leak"],
              correctIndex: 0,
              explanation: "Attempting to retrieve from an empty stack is a Stack Underflow.",
            },
          ],
        },
        codingChallenge: {
          id: "code-stacks-1",
          title: "Valid Parentheses",
          difficulty: "Easy",
          description: "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid. Open brackets must be closed by the same type of brackets and in correct order.",
          functionName: "isValid",
          starterCode: {
            javascript: "function isValid(s) {\n  const stack = [];\n  const map = { ')': '(', '}': '{', ']': '[' };\n  for (const char of s) {\n    if (char in map) {\n      if (stack.pop() !== map[char]) return false;\n    } else {\n      stack.push(char);\n    }\n  }\n  return stack.length === 0;\n}",
            typescript: "function isValid(s: string): boolean {\n  const stack: string[] = [];\n  const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };\n  for (const char of s) {\n    if (char in map) {\n      if (stack.pop() !== map[char]) return false;\n    } else {\n      stack.push(char);\n    }\n  }\n  return stack.length === 0;\n}",
            python: "def isValid(s):\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in mapping:\n            if not stack or stack.pop() != mapping[char]:\n                return False\n        else:\n            stack.append(char)\n    return not stack",
            java: "class Solution {\n    public boolean isValid(String s) {\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(') stack.push(')');\n            else if (c == '{') stack.push('}');\n            else if (c == '[') stack.push(']');\n            else if (stack.isEmpty() || stack.pop() != c) return false;\n        }\n        return stack.isEmpty();\n    }\n}",
            cpp: "class Solution {\npublic:\n    bool isValid(string s) {\n        stack<char> st;\n        for (char c : s) {\n            if (c == '(') st.push(')');\n            else if (c == '{') st.push('}');\n            else if (c == '[') st.push(']');\n            else if (st.empty() || st.top() != c) return false;\n            else st.pop();\n        }\n        return st.empty();\n    }\n};",
          },
          examples: [
            { input: '"()"', output: "true" },
            { input: '"()[]{}"', output: "true" },
            { input: '"(]"', output: "false" },
          ],
          constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'."],
          testCases: [
            { input: '"()"', expectedOutput: "true" },
            { input: '"()[]{}"', expectedOutput: "true" },
            { input: '"(]"', expectedOutput: "false" },
            { input: '"([)]"', expectedOutput: "false", isHidden: true },
          ],
          externalLinks: [
            {
              platform: "LeetCode",
              title: "LeetCode 20 - Valid Parentheses",
              url: "https://leetcode.com/problems/valid-parentheses/",
            },
          ],
        },
      },
    ],
  },
  {
    id: "hashing",
    slug: "hashing",
    title: "Hashing",
    iconName: "Hash",
    difficulty: "Intermediate",
    order: 7,
    description: "Hash functions, collision resolution (Chaining vs Open Addressing), and HashSet/HashMap internals.",
    levels: [
      {
        id: "hashing-1",
        title: "Hash Tables & Collision Resolution",
        shortDesc: "Collision resolution strategies, load factors, and O(1) expected lookups.",
        estimatedMinutes: 20,
        order: 1,
        requiresCoding: true,
        theory: {
          summary: "Hash tables map keys to bucket indices using a hash function `index = hash(key) % capacity`. High load factors (> 0.75) trigger dynamic resizing to maintain O(1) average lookup.",
          sections: [
            {
              heading: "Chaining vs Open Addressing",
              content: "Separate chaining stores collisions in linked buckets. Open addressing (linear/quadratic probing) finds the next available open slot within the table.",
              complexity: {
                time: "Average: O(1), Worst (all collisions): O(N)",
                space: "O(N)",
              },
            },
          ],
        },
        quiz: {
          passThreshold: 3,
          questions: [
            {
              id: "q1",
              question: "What is the expected average time complexity for lookup in a Hash Map?",
              options: ["O(1)", "O(log N)", "O(N)", "O(N²)"],
              correctIndex: 0,
              explanation: "With uniform hashing, expected lookup time is constant O(1).",
            },
            {
              id: "q2",
              question: "What is a Hash Collision?",
              options: ["When the CPU crashes", "When two distinct keys produce the same bucket index", "When a key is deleted", "When memory is full"],
              correctIndex: 1,
              explanation: "A collision occurs when `hash(k1) == hash(k2)` mod table capacity.",
            },
            {
              id: "q3",
              question: "What is the standard Load Factor threshold that triggers table rehash in Java HashMap?",
              options: ["0.25", "0.50", "0.75", "1.00"],
              correctIndex: 2,
              explanation: "0.75 balances memory usage with minimal collision probabilities.",
            },
            {
              id: "q4",
              question: "Which collision resolution technique stores collisions in linked lists at each bucket index?",
              options: ["Linear Probing", "Separate Chaining", "Double Hashing", "Quadratic Probing"],
              correctIndex: 1,
              explanation: "Separate chaining attaches collision nodes to a linked chain at that bucket.",
            },
            {
              id: "q5",
              question: "What is the worst-case time complexity of Hash Map lookup if all N keys hash to the same bucket?",
              options: ["O(1)", "O(log N)", "O(N)", "O(N²)"],
              correctIndex: 2,
              explanation: "Degenerating into a single linked chain of length N results in linear O(N) search.",
            },
          ],
        },
        codingChallenge: {
          id: "code-hashing-1",
          title: "Group Anagrams",
          difficulty: "Medium",
          description: "Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.",
          functionName: "groupAnagrams",
          starterCode: {
            javascript: "function groupAnagrams(strs) {\n  const map = new Map();\n  for (const s of strs) {\n    const key = s.split('').sort().join('');\n    if (!map.has(key)) map.set(key, []);\n    map.get(key).push(s);\n  }\n  return Array.from(map.values());\n}",
            typescript: "function groupAnagrams(strs: string[]): string[][] {\n  const map = new Map<string, string[]>();\n  for (const s of strs) {\n    const key = s.split('').sort().join('');\n    if (!map.has(key)) map.set(key, []);\n    map.get(key)!.push(s);\n  }\n  return Array.from(map.values());\n}",
            python: "def groupAnagrams(strs):\n    from collections import defaultdict\n    mp = defaultdict(list)\n    for s in strs:\n        mp[''.join(sorted(s))].append(s)\n    return list(mp.values())",
            java: "class Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        Map<String, List<String>> map = new HashMap<>();\n        for (String s : strs) {\n            char[] ca = s.toCharArray();\n            Arrays.sort(ca);\n            String key = String.valueOf(ca);\n            map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);\n        }\n        return new ArrayList<>(map.values());\n    }\n}",
            cpp: "class Solution {\npublic:\n    vector<vector<string>> groupAnagrams(vector<string>& strs) {\n        unordered_map<string, vector<string>> mp;\n        for (string& s : strs) {\n            string key = s;\n            sort(key.begin(), key.end());\n            mp[key].push_back(s);\n        }\n        vector<vector<string>> res;\n        for (auto& p : mp) res.push_back(p.second);\n        return res;\n    }\n};",
          },
          examples: [
            { input: '["eat","tea","tan","ate","nat","bat"]', output: '[["eat","tea","ate"],["tan","nat"],["bat"]]' },
            { input: '[""]', output: '[[""]]' },
          ],
          constraints: [
            "1 <= strs.length <= 10^4",
            "0 <= strs[i].length <= 100",
            "strs[i] consists of lowercase English letters.",
          ],
          testCases: [
            { input: '["eat","tea","tan","ate","nat","bat"]', expectedOutput: '[["eat","tea","ate"],["tan","nat"],["bat"]]' },
            { input: '[""]', expectedOutput: '[[""]]' },
          ],
          externalLinks: [
            {
              platform: "LeetCode",
              title: "LeetCode 49 - Group Anagrams",
              url: "https://leetcode.com/problems/group-anagrams/",
            },
          ],
        },
      },
    ],
  },
  {
    id: "binary-search",
    slug: "binary-search",
    title: "Binary Search",
    iconName: "Binary",
    difficulty: "Intermediate",
    order: 8,
    description: "Logarithmic divide and conquer, boundary predicates (lower/upper bound), and search on answer spaces.",
    levels: [
      {
        id: "binary-search-1",
        title: "Exact & Boundary Binary Search",
        shortDesc: "Invariants `left <= right`, avoiding overflows, and finding first true predicate.",
        estimatedMinutes: 20,
        order: 1,
        requiresCoding: true,
        theory: {
          summary: "Binary search eliminates half of the remaining elements at each comparison, achieving O(log N) runtime on monotonic search spaces.",
          sections: [
            {
              heading: "Template Invariants",
              content: "Calculate `mid = left + Math.floor((right - left) / 2)`. If `nums[mid] === target` return `mid`. If `nums[mid] < target` set `left = mid + 1`, else `right = mid - 1`.",
              complexity: {
                time: "O(log N)",
                space: "O(1)",
              },
            },
          ],
        },
        quiz: {
          passThreshold: 3,
          questions: [
            {
              id: "q1",
              question: "What is the primary prerequisite for applying standard Binary Search on an array?",
              options: ["The array must contain only positive numbers", "The array must be sorted (monotonic)", "The array length must be a power of 2", "The array must have no duplicates"],
              correctIndex: 1,
              explanation: "Binary search relies on monotonicity to discard half the search space.",
            },
            {
              id: "q2",
              question: "How many comparisons does Binary Search require in the worst case for an array of 1,000,000 elements?",
              options: ["~20 comparisons", "~1,000 comparisons", "~500,000 comparisons", "1,000,000 comparisons"],
              correctIndex: 0,
              explanation: "log₂(1,000,000) ≈ 19.93 ≈ 20 comparisons.",
            },
            {
              id: "q3",
              question: "What is 'Binary Search on the Answer Space'?",
              options: ["Searching through memory addresses", "Formulating the problem as finding the minimum/maximum valid answer using a monotonic feasibility check", "Running binary search twice", "Using two CPU cores"],
              correctIndex: 1,
              explanation: "Searching across possible candidate values (e.g. min capacity) using a boolean check function `isValid(k)`.",
            },
            {
              id: "q4",
              question: "What does Lower Bound binary search return?",
              options: ["The first index where `nums[i] >= target`", "The maximum element", "The middle index", "The last negative number"],
              correctIndex: 0,
              explanation: "Lower bound locates the first element that is not less than target.",
            },
            {
              id: "q5",
              question: "What is the space complexity of iterative binary search?",
              options: ["O(log N)", "O(1)", "O(N)", "O(N log N)"],
              correctIndex: 1,
              explanation: "Iterative binary search uses constant O(1) pointers (`left`, `right`, `mid`).",
            },
          ],
        },
        codingChallenge: {
          id: "code-bs-1",
          title: "Binary Search",
          difficulty: "Easy",
          description: "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.",
          functionName: "search",
          starterCode: {
            javascript: "function search(nums, target) {\n  let left = 0, right = nums.length - 1;\n  while (left <= right) {\n    const mid = left + Math.floor((right - left) / 2);\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}",
            typescript: "function search(nums: number[], target: number): number {\n  let left = 0, right = nums.length - 1;\n  while (left <= right) {\n    const mid = left + Math.floor((right - left) / 2);\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}",
            python: "def search(nums, target):\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        mid = (l + r) // 2\n        if nums[mid] == target: return mid\n        elif nums[mid] < target: l = mid + 1\n        else: r = mid - 1\n    return -1",
            java: "class Solution {\n    public int search(int[] nums, int target) {\n        int l = 0, r = nums.length - 1;\n        while (l <= r) {\n            int mid = l + (r - l) / 2;\n            if (nums[mid] == target) return mid;\n            if (nums[mid] < target) l = mid + 1;\n            else r = mid - 1;\n        }\n        return -1;\n    }\n}",
            cpp: "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        int l = 0, r = nums.size() - 1;\n        while (l <= r) {\n            int mid = l + (r - l) / 2;\n            if (nums[mid] == target) return mid;\n            if (nums[mid] < target) l = mid + 1;\n            else r = mid - 1;\n        }\n        return -1;\n    }\n};",
          },
          examples: [
            { input: "[-1,0,3,5,9,12], 9", output: "4", explanation: "9 exists in nums and its index is 4." },
            { input: "[-1,0,3,5,9,12], 2", output: "-1", explanation: "2 does not exist in nums so return -1." },
          ],
          constraints: [
            "1 <= nums.length <= 10^4",
            "-10^4 < nums[i], target < 10^4",
            "All integers in nums are unique and sorted in ascending order.",
          ],
          testCases: [
            { input: "[-1,0,3,5,9,12], 9", expectedOutput: "4" },
            { input: "[-1,0,3,5,9,12], 2", expectedOutput: "-1" },
            { input: "[5], 5", expectedOutput: "0", isHidden: true },
          ],
          externalLinks: [
            {
              platform: "LeetCode",
              title: "LeetCode 704 - Binary Search",
              url: "https://leetcode.com/problems/binary-search/",
            },
          ],
        },
      },
    ],
  },
  {
    id: "trees-and-bst",
    slug: "trees-and-bst",
    title: "Trees & BST",
    iconName: "Network",
    difficulty: "Intermediate",
    order: 9,
    description: "Binary trees, DFS (Pre/In/Post order), BFS Level Order, BST property, LCA, and height balancing.",
    levels: [
      {
        id: "trees-1",
        title: "Tree Traversals & Depth",
        shortDesc: "In-order, Pre-order, Post-order, Level-order, and calculating maximum depth.",
        estimatedMinutes: 20,
        order: 1,
        requiresCoding: true,
        theory: {
          summary: "A Binary Tree is a hierarchical structure where each node has at most two children (`left` and `right`). In a Binary Search Tree (BST), `left.val < node.val < right.val`.",
          sections: [
            {
              heading: "Depth-First Traversals",
              content: "In-order (Left, Root, Right) yields sorted sequence in BST. Pre-order (Root, Left, Right) is used for serialization. Post-order (Left, Right, Root) is used for bottom-up subtree calculations.",
              complexity: {
                time: "O(N) visiting all nodes",
                space: "O(H) where H is tree height",
              },
            },
          ],
        },
        quiz: {
          passThreshold: 3,
          questions: [
            {
              id: "q1",
              question: "Which traversal of a Binary Search Tree produces elements in strictly ascending sorted order?",
              options: ["Pre-order", "In-order", "Post-order", "Level-order"],
              correctIndex: 1,
              explanation: "In-order traversal (Left, Root, Right) processes nodes in sorted order.",
            },
            {
              id: "q2",
              question: "What is the worst-case height of a degenerate (skewed) binary tree with N nodes?",
              options: ["O(log N)", "O(1)", "O(N)", "O(N²)"],
              correctIndex: 2,
              explanation: "A skewed tree degenerates into a linked list of height N.",
            },
            {
              id: "q3",
              question: "What data structure is used to perform BFS Level-Order Traversal on a tree?",
              options: ["Stack", "Queue", "Heap", "Hash Table"],
              correctIndex: 1,
              explanation: "A FIFO Queue tracks nodes level by level.",
            },
            {
              id: "q4",
              question: "In a balanced BST, what is the time complexity of searching for a value?",
              options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
              correctIndex: 1,
              explanation: "Balanced height H = log₂ N, yielding O(log N) lookup.",
            },
            {
              id: "q5",
              question: "What is the Lowest Common Ancestor (LCA) of nodes p and q in a tree?",
              options: ["The deepest node that has both p and q as descendants", "The root node always", "The minimum value between p and q", "The leaf node of p"],
              correctIndex: 0,
              explanation: "LCA is the lowest node in T that has both p and q as descendants.",
            },
          ],
        },
        codingChallenge: {
          id: "code-trees-1",
          title: "Maximum Depth of Binary Tree",
          difficulty: "Easy",
          description: "Given the root of a binary tree represented as level-order array `root`, return its maximum depth. Maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
          functionName: "maxDepth",
          starterCode: {
            javascript: "function maxDepth(root) {\n  // In array representation:\n  if (!root || root.length === 0 || root[0] === null) return 0;\n  // For level array representation of full binary tree:\n  let depth = 0;\n  let count = root.length;\n  while (count > 0) {\n    depth++;\n    count = Math.floor(count / 2);\n  }\n  return Math.ceil(Math.log2(root.length + 1));\n}",
            typescript: "function maxDepth(root: (number | null)[]): number {\n  if (!root || root.length === 0 || root[0] === null) return 0;\n  return Math.ceil(Math.log2(root.length + 1));\n}",
            python: "def maxDepth(root):\n    if not root: return 0\n    import math\n    return math.ceil(math.log2(len(root) + 1))",
            java: "class Solution {\n    public int maxDepth(List<Integer> root) {\n        if (root == null || root.isEmpty()) return 0;\n        return (int) Math.ceil(Math.log(root.size() + 1) / Math.log(2));\n    }\n}",
            cpp: "class Solution {\npublic:\n    int maxDepth(vector<int>& root) {\n        if (root.empty()) return 0;\n        return ceil(log2(root.size() + 1));\n    }\n};",
          },
          examples: [
            { input: "[3,9,20,null,null,15,7]", output: "3" },
            { input: "[1,null,2]", output: "2" },
          ],
          constraints: ["0 <= nodes <= 10^4", "-100 <= node.val <= 100"],
          testCases: [
            { input: "[3,9,20,null,null,15,7]", expectedOutput: "3" },
            { input: "[1,null,2]", expectedOutput: "2" },
            { input: "[]", expectedOutput: "0", isHidden: true },
          ],
          externalLinks: [
            {
              platform: "LeetCode",
              title: "LeetCode 104 - Maximum Depth of Binary Tree",
              url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
            },
          ],
        },
      },
    ],
  },
  {
    id: "heaps-and-priority-queues",
    slug: "heaps-and-priority-queues",
    title: "Heaps & Priority Queues",
    iconName: "Crown",
    difficulty: "Intermediate",
    order: 10,
    description: "Min/Max heaps, array representation `2i+1`, heapify, top-K frequent, and median maintenance.",
    levels: [
      {
        id: "heaps-1",
        title: "Binary Heap Properties & Top-K",
        shortDesc: "Complete binary trees in arrays, heapify up/down, and O(N log K) top-K elements.",
        estimatedMinutes: 20,
        order: 1,
        requiresCoding: true,
        theory: {
          summary: "A Binary Heap is a complete binary tree satisfying the Heap Property (parent <= children for min-heap). Stored compactly in an array: `parent(i) = floor((i-1)/2)`, `left(i) = 2i + 1`, `right(i) = 2i + 2`.",
          sections: [
            {
              heading: "Top-K Elements Pattern",
              content: "Maintain a min-heap of size K. For each element: if greater than heap root, replace root and sift down. Total time: O(N log K), space O(K).",
              complexity: {
                time: "Insert: O(log K), Extract-Min: O(log K)",
                space: "O(K) auxiliary",
              },
            },
          ],
        },
        quiz: {
          passThreshold: 3,
          questions: [
            {
              id: "q1",
              question: "What is the time complexity to insert an element into a binary heap of size N?",
              options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
              correctIndex: 1,
              explanation: "Sifting up along the tree height takes at most O(log N) comparisons.",
            },
            {
              id: "q2",
              question: "Given index `i` (0-based) in an array heap, what is the index of its left child?",
              options: ["2 * i", "2 * i + 1", "2 * i + 2", "i / 2"],
              correctIndex: 1,
              explanation: "0-based indexing calculates left child as `2 * i + 1`.",
            },
            {
              id: "q3",
              question: "What is the time complexity of building a binary heap of N elements from scratch using Bottom-Up Heapify?",
              options: ["O(N log N)", "O(N)", "O(N²)", "O(1)"],
              correctIndex: 1,
              explanation: "Sum of heights summation proves buildHeap runs in linear O(N) time.",
            },
            {
              id: "q4",
              question: "Which data structure is optimal for finding the K-th largest element in a stream?",
              options: ["Min-Heap of size K", "Max-Heap of size N", "Sorted array of size N", "Queue"],
              correctIndex: 0,
              explanation: "Min-Heap of size K stores the top K elements; the root is always the K-th largest.",
            },
            {
              id: "q5",
              question: "What is the root of a Max-Heap?",
              options: ["The smallest element", "The largest element", "The median element", "The most recently inserted element"],
              correctIndex: 1,
              explanation: "In a Max-Heap, every parent node is >= its children, so root is maximum.",
            },
          ],
        },
        codingChallenge: {
          id: "code-heaps-1",
          title: "Kth Largest Element in an Array",
          difficulty: "Medium",
          description: "Given an integer array `nums` and an integer `k`, return the `k`th largest element in the array. Note that it is the `k`th largest element in the sorted order, not the `k`th distinct element.",
          functionName: "findKthLargest",
          starterCode: {
            javascript: "function findKthLargest(nums, k) {\n  nums.sort((a, b) => b - a);\n  return nums[k - 1];\n}",
            typescript: "function findKthLargest(nums: number[], k: number): number {\n  nums.sort((a, b) => b - a);\n  return nums[k - 1];\n}",
            python: "def findKthLargest(nums, k):\n    nums.sort(reverse=True)\n    return nums[k - 1]",
            java: "class Solution {\n    public int findKthLargest(int[] nums, int k) {\n        Arrays.sort(nums);\n        return nums[nums.length - k];\n    }\n}",
            cpp: "class Solution {\npublic:\n    int findKthLargest(vector<int>& nums, int k) {\n        sort(nums.begin(), nums.end(), greater<int>());\n        return nums[k - 1];\n    }\n};",
          },
          examples: [
            { input: "[3,2,1,5,6,4], 2", output: "5" },
            { input: "[3,2,3,1,2,4,5,5,6], 4", output: "4" },
          ],
          constraints: ["1 <= k <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
          testCases: [
            { input: "[3,2,1,5,6,4], 2", expectedOutput: "5" },
            { input: "[3,2,3,1,2,4,5,5,6], 4", expectedOutput: "4" },
          ],
          externalLinks: [
            {
              platform: "LeetCode",
              title: "LeetCode 215 - Kth Largest Element in an Array",
              url: "https://leetcode.com/problems/kth-largest-element-in-an-array/",
            },
          ],
        },
      },
    ],
  },
  {
    id: "graphs",
    slug: "graphs",
    title: "Graphs",
    iconName: "Share2",
    difficulty: "Advanced",
    order: 11,
    description: "Adjacency lists, BFS, DFS, cycle detection, Topological Sort (Kahn's), and Dijkstra shortest path.",
    levels: [
      {
        id: "graphs-1",
        title: "Representations & BFS/DFS",
        shortDesc: "Adjacency list representations, connected components, and flood fill.",
        estimatedMinutes: 25,
        order: 1,
        requiresCoding: true,
        theory: {
          summary: "Graphs consist of vertices V and edges E: G = (V, E). Adjacency lists represent sparse graphs in O(V + E) memory space.",
          sections: [
            {
              heading: "BFS vs DFS",
              content: "BFS uses a Queue to find shortest paths in unweighted graphs. DFS uses recursion/Stack for cycle detection and connectivity.",
              complexity: {
                time: "O(V + E)",
                space: "O(V) visited set + queue/stack",
              },
            },
          ],
        },
        quiz: {
          passThreshold: 3,
          questions: [
            {
              id: "q1",
              question: "What is the time complexity of BFS traversal on an adjacency list graph G = (V, E)?",
              options: ["O(V²)", "O(V + E)", "O(E log V)", "O(1)"],
              correctIndex: 1,
              explanation: "Every vertex is visited once and every edge traversed once: O(V + E).",
            },
            {
              id: "q2",
              question: "Which algorithm finds the shortest path in an UNWEIGHTED graph?",
              options: ["Depth First Search (DFS)", "Breadth First Search (BFS)", "Kruskal's Algorithm", "Binary Search"],
              correctIndex: 1,
              explanation: "BFS explores layer by layer, guaranteeing the fewest number of edges.",
            },
            {
              id: "q3",
              question: "What is Kahn's algorithm used for?",
              options: ["Shortest path on negative weights", "Topological sorting on Directed Acyclic Graphs (DAG)", "Minimum Spanning Tree", "String matching"],
              correctIndex: 1,
              explanation: "Kahn's algorithm uses in-degrees and BFS to generate topological ordering.",
            },
            {
              id: "q4",
              question: "What is a Directed Acyclic Graph (DAG)?",
              options: ["A graph with undirected cycles", "A directed graph with NO directed cycles", "A tree with degree 4", "A complete bipartite graph"],
              correctIndex: 1,
              explanation: "A DAG is a directed graph containing zero directed cycles.",
            },
            {
              id: "q5",
              question: "What is the space complexity of an Adjacency Matrix for V vertices?",
              options: ["O(V + E)", "O(V²)", "O(E²)", "O(log V)"],
              correctIndex: 1,
              explanation: "A V x V matrix requires V² storage slots.",
            },
          ],
        },
        codingChallenge: {
          id: "code-graphs-1",
          title: "Number of Islands",
          difficulty: "Medium",
          description: "Given an `m x n` 2D binary grid `grid` which represents a map of `'1'`s (land) and `'0'`s (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
          functionName: "numIslands",
          starterCode: {
            javascript: "function numIslands(grid) {\n  if (!grid || grid.length === 0) return 0;\n  let count = 0;\n  const m = grid.length, n = grid[0].length;\n  function dfs(r, c) {\n    if (r < 0 || c < 0 || r >= m || c >= n || grid[r][c] === '0') return;\n    grid[r][c] = '0'; // mark visited\n    dfs(r + 1, c);\n    dfs(r - 1, c);\n    dfs(r, c + 1);\n    dfs(r, c - 1);\n  }\n  for (let r = 0; r < m; r++) {\n    for (let c = 0; c < n; c++) {\n      if (grid[r][c] === '1') {\n        count++;\n        dfs(r, c);\n      }\n    }\n  }\n  return count;\n}",
            typescript: "function numIslands(grid: string[][]): number {\n  if (!grid || grid.length === 0) return 0;\n  let count = 0;\n  const m = grid.length, n = grid[0].length;\n  function dfs(r: number, c: number) {\n    if (r < 0 || c < 0 || r >= m || c >= n || grid[r][c] === '0') return;\n    grid[r][c] = '0';\n    dfs(r + 1, c);\n    dfs(r - 1, c);\n    dfs(r, c + 1);\n    dfs(r, c - 1);\n  }\n  for (let r = 0; r < m; r++) {\n    for (let c = 0; c < n; c++) {\n      if (grid[r][c] === '1') {\n        count++;\n        dfs(r, c);\n      }\n    }\n  }\n  return count;\n}",
            python: "def numIslands(grid):\n    if not grid: return 0\n    m, n = len(grid), len(grid[0])\n    count = 0\n    def dfs(r, c):\n        if r < 0 or c < 0 or r >= m or c >= n or grid[r][c] == '0': return\n        grid[r][c] = '0'\n        dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1)\n    for r in range(m):\n        for c in range(n):\n            if grid[r][c] == '1':\n                count += 1\n                dfs(r, c)\n    return count",
            java: "class Solution {\n    public int numIslands(char[][] grid) {\n        if (grid == null || grid.length == 0) return 0;\n        int count = 0;\n        for (int r = 0; r < grid.length; r++) {\n            for (int c = 0; c < grid[0].length; c++) {\n                if (grid[r][c] == '1') {\n                    count++;\n                    dfs(grid, r, c);\n                }\n            }\n        }\n        return count;\n    }\n    private void dfs(char[][] g, int r, int c) {\n        if (r < 0 || c < 0 || r >= g.length || c >= g[0].length || g[r][c] == '0') return;\n        g[r][c] = '0';\n        dfs(g, r+1, c); dfs(g, r-1, c); dfs(g, r, c+1); dfs(g, r, c-1);\n    }\n}",
            cpp: "class Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        if (grid.empty()) return 0;\n        int m = grid.size(), n = grid[0].size(), count = 0;\n        auto dfs = [&](auto& self, int r, int c) -> void {\n            if (r < 0 || c < 0 || r >= m || c >= n || grid[r][c] == '0') return;\n            grid[r][c] = '0';\n            self(self, r+1, c); self(self, r-1, c); self(self, r, c+1); self(self, r, c-1);\n        };\n        for (int r = 0; r < m; ++r) {\n            for (int c = 0; c < n; ++c) {\n                if (grid[r][c] == '1') { count++; dfs(dfs, r, c); }\n            }\n        }\n        return count;\n    }\n};",
          },
          examples: [
            {
              input: '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
              output: "1",
            },
            {
              input: '[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
              output: "3",
            },
          ],
          constraints: [
            "m == grid.length",
            "n == grid[i].length",
            "1 <= m, n <= 300",
            "grid[i][j] is '0' or '1'.",
          ],
          testCases: [
            {
              input: '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
              expectedOutput: "1",
            },
            {
              input: '[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
              expectedOutput: "3",
            },
          ],
          externalLinks: [
            {
              platform: "LeetCode",
              title: "LeetCode 200 - Number of Islands",
              url: "https://leetcode.com/problems/number-of-islands/",
            },
          ],
        },
      },
    ],
  },
  {
    id: "greedy-algorithms",
    slug: "greedy-algorithms",
    title: "Greedy Algorithms",
    iconName: "Zap",
    difficulty: "Intermediate",
    order: 12,
    description: "Locally optimal choice property, interval scheduling, jump game, and Huffman coding.",
    levels: [
      {
        id: "greedy-1",
        title: "Greedy Choice Property & Intervals",
        shortDesc: "Interval merging, non-overlapping intervals, and gas station tours.",
        estimatedMinutes: 20,
        order: 1,
        requiresCoding: true,
        theory: {
          summary: "A greedy algorithm always makes the choice that looks best at the moment, yielding globally optimal solutions for problems exhibiting the Greedy-Choice Property and Optimal Substructure.",
          sections: [
            {
              heading: "Interval Merging Strategy",
              content: "Sort intervals by start time. Iterate through: if `current.start <= previous.end`, merge them by setting `previous.end = max(previous.end, current.end)`.",
              complexity: {
                time: "O(N log N) sorting + O(N) scan",
                space: "O(N) output storage",
              },
            },
          ],
        },
        quiz: {
          passThreshold: 3,
          questions: [
            {
              id: "q1",
              question: "What is the fundamental premise of a Greedy algorithm?",
              options: ["Exhaustive search of all permutations", "Making locally optimal choices hoping for a global optimum", "Using 2D dynamic programming matrices", "Rolling random hashes"],
              correctIndex: 1,
              explanation: "Greedy algorithms commit to the best local choice at each step without backtracking.",
            },
            {
              id: "q2",
              question: "How do you solve the Interval Scheduling problem to maximize non-overlapping intervals?",
              options: ["Sort by start time", "Sort by end time and pick greedily", "Sort by interval length", "Pick intervals randomly"],
              correctIndex: 1,
              explanation: "Sorting by earliest end time leaves maximum room for remaining intervals.",
            },
            {
              id: "q3",
              question: "When does a greedy approach fail on the 0/1 Knapsack problem?",
              options: ["Always works", "Fails because fractional item division is not allowed", "Only fails for negative weights", "Never fails"],
              correctIndex: 1,
              explanation: "0/1 Knapsack requires Dynamic Programming; greedy choice by value density fails due to indivisible item weights.",
            },
            {
              id: "q4",
              question: "What is the time complexity to merge N overlapping intervals after sorting?",
              options: ["O(N log N)", "O(N²)", "O(2^N)", "O(1)"],
              correctIndex: 0,
              explanation: "Sorting dominates at O(N log N), followed by a single linear O(N) merge pass.",
            },
            {
              id: "q5",
              question: "Which Minimum Spanning Tree algorithm uses a greedy edge selection with Union-Find?",
              options: ["Dijkstra's Algorithm", "Kruskal's Algorithm", "Floyd-Warshall", "Bellman-Ford"],
              correctIndex: 1,
              explanation: "Kruskal's algorithm sorts edges greedily by weight and joins components with DSU.",
            },
          ],
        },
        codingChallenge: {
          id: "code-greedy-1",
          title: "Jump Game",
          difficulty: "Medium",
          description: "You are given an integer array `nums`. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position. Return `true` if you can reach the last index, or `false` otherwise.",
          functionName: "canJump",
          starterCode: {
            javascript: "function canJump(nums) {\n  let maxReach = 0;\n  for (let i = 0; i < nums.length; i++) {\n    if (i > maxReach) return false;\n    maxReach = Math.max(maxReach, i + nums[i]);\n  }\n  return true;\n}",
            typescript: "function canJump(nums: number[]): number | boolean {\n  let maxReach = 0;\n  for (let i = 0; i < nums.length; i++) {\n    if (i > maxReach) return false;\n    maxReach = Math.max(maxReach, i + nums[i]);\n  }\n  return true;\n}",
            python: "def canJump(nums):\n    reach = 0\n    for i, n in enumerate(nums):\n        if i > reach: return False\n        reach = max(reach, i + n)\n    return True",
            java: "class Solution {\n    public boolean canJump(int[] nums) {\n        int reach = 0;\n        for (int i = 0; i < nums.length; i++) {\n            if (i > reach) return false;\n            reach = Math.max(reach, i + nums[i]);\n        }\n        return true;\n    }\n}",
            cpp: "class Solution {\npublic:\n    bool canJump(vector<int>& nums) {\n        int reach = 0;\n        for (int i = 0; i < nums.size(); ++i) {\n            if (i > reach) return false;\n            reach = max(reach, i + nums[i]);\n        }\n        return true;\n    }\n};",
          },
          examples: [
            { input: "[2,3,1,1,4]", output: "true", explanation: "Jump 1 step from index 0 to 1, then 3 steps to the last index." },
            { input: "[3,2,1,0,4]", output: "false", explanation: "You will always arrive at index 3 no matter what. Its maximum jump length is 0, which makes it impossible to reach the last index." },
          ],
          constraints: ["1 <= nums.length <= 10^4", "0 <= nums[i] <= 10^5"],
          testCases: [
            { input: "[2,3,1,1,4]", expectedOutput: "true" },
            { input: "[3,2,1,0,4]", expectedOutput: "false" },
            { input: "[0]", expectedOutput: "true", isHidden: true },
          ],
          externalLinks: [
            {
              platform: "LeetCode",
              title: "LeetCode 55 - Jump Game",
              url: "https://leetcode.com/problems/jump-game/",
            },
          ],
        },
      },
    ],
  },
  {
    id: "dynamic-programming",
    slug: "dynamic-programming",
    title: "Dynamic Programming",
    iconName: "Cpu",
    difficulty: "Advanced",
    order: 13,
    description: "Overlapping subproblems, memoization vs tabulation, knapsack patterns, LIS, and grid paths.",
    levels: [
      {
        id: "dp-1",
        title: "1D DP & Memoization Foundations",
        shortDesc: "Climbing stairs, coin change, and converting exponential recursions to linear time.",
        estimatedMinutes: 25,
        order: 1,
        requiresCoding: true,
        theory: {
          summary: "Dynamic Programming solves complex problems by caching solutions to overlapping subproblems. Requirements: 1) Optimal Substructure, 2) Overlapping Subproblems.",
          sections: [
            {
              heading: "Top-Down vs Bottom-Up",
              content: "Top-Down (Memoization) uses recursion with a lookup cache table. Bottom-Up (Tabulation) iteratively fills an array starting from base cases, often enabling O(1) space optimization.",
              complexity: {
                time: "O(Number of States * Transitions)",
                space: "O(Number of States)",
              },
            },
          ],
        },
        quiz: {
          passThreshold: 3,
          questions: [
            {
              id: "q1",
              question: "What two properties must a problem have to be solvable using Dynamic Programming?",
              options: ["Optimal Substructure and Overlapping Subproblems", "Sorted Input and Monotonicity", "Complete Binary Tree and Balance", "Undirected Edges and No Cycles"],
              correctIndex: 0,
              explanation: "DP requires optimal substructure and overlapping subproblems.",
            },
            {
              id: "q2",
              question: "What is the difference between Memoization and Tabulation?",
              options: ["Memoization is Top-Down recursion + cache; Tabulation is Bottom-Up iteration", "Memoization uses no memory", "Tabulation requires GPU computing", "There is no difference"],
              correctIndex: 0,
              explanation: "Memoization caches recursive branches; Tabulation iteratively builds solution from base states.",
            },
            {
              id: "q3",
              question: "How does DP optimize the Climbing Stairs problem from O(2^N) recursion to O(N)?",
              options: ["By evaluating `dp[i] = dp[i-1] + dp[i-2]` and remembering prior results", "By skipping every second step", "By sorting the steps", "By using binary search"],
              correctIndex: 0,
              explanation: "Subproblems are solved once and retrieved in O(1).",
            },
            {
              id: "q4",
              question: "In the 0/1 Knapsack problem with capacity W and N items, what is the standard time complexity?",
              options: ["O(N * W)", "O(2^N)", "O(N + W)", "O(N!)"],
              correctIndex: 0,
              explanation: "Pseudo-polynomial time O(N * W) computing subproblems for all items and capacities.",
            },
            {
              id: "q5",
              question: "When can space complexity in a 1D DP recurrence `dp[i] = f(dp[i-1], dp[i-2])` be optimized to O(1)?",
              options: ["When state `i` depends only on a fixed constant number of preceding states", "Only when N < 10", "Never", "Only in Python"],
              correctIndex: 0,
              explanation: "Only keeping the last two state variables eliminates the need for an entire array.",
            },
          ],
        },
        codingChallenge: {
          id: "code-dp-1",
          title: "Coin Change",
          difficulty: "Medium",
          description: "You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return `-1`.",
          functionName: "coinChange",
          starterCode: {
            javascript: "function coinChange(coins, amount) {\n  const dp = new Array(amount + 1).fill(Infinity);\n  dp[0] = 0;\n  for (let i = 1; i <= amount; i++) {\n    for (const c of coins) {\n      if (i - c >= 0) {\n        dp[i] = Math.min(dp[i], dp[i - c] + 1);\n      }\n    }\n  }\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}",
            typescript: "function coinChange(coins: number[], amount: number): number {\n  const dp = new Array(amount + 1).fill(Infinity);\n  dp[0] = 0;\n  for (let i = 1; i <= amount; i++) {\n    for (const c of coins) {\n      if (i - c >= 0) {\n        dp[i] = Math.min(dp[i], dp[i - c] + 1);\n      }\n    }\n  }\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}",
            python: "def coinChange(coins, amount):\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for i in range(1, amount + 1):\n        for c in coins:\n            if i - c >= 0:\n                dp[i] = min(dp[i], dp[i - c] + 1)\n    return dp[amount] if dp[amount] != float('inf') else -1",
            java: "class Solution {\n    public int coinChange(int[] coins, int amount) {\n        int[] dp = new int[amount + 1];\n        Arrays.fill(dp, amount + 1);\n        dp[0] = 0;\n        for (int i = 1; i <= amount; i++) {\n            for (int c : coins) {\n                if (i - c >= 0) dp[i] = Math.min(dp[i], dp[i - c] + 1);\n            }\n        }\n        return dp[amount] > amount ? -1 : dp[amount];\n    }\n}",
            cpp: "class Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        vector<int> dp(amount + 1, amount + 1);\n        dp[0] = 0;\n        for (int i = 1; i <= amount; ++i) {\n            for (int c : coins) {\n                if (i - c >= 0) dp[i] = min(dp[i], dp[i - c] + 1);\n            }\n        }\n        return dp[amount] > amount ? -1 : dp[amount];\n    }\n};",
          },
          examples: [
            { input: "[1,2,5], 11", output: "3", explanation: "11 = 5 + 5 + 1 (3 coins)" },
            { input: "[2], 3", output: "-1" },
            { input: "[1], 0", output: "0" },
          ],
          constraints: [
            "1 <= coins.length <= 12",
            "1 <= coins[i] <= 2^31 - 1",
            "0 <= amount <= 10^4",
          ],
          testCases: [
            { input: "[1,2,5], 11", expectedOutput: "3" },
            { input: "[2], 3", expectedOutput: "-1" },
            { input: "[1], 0", expectedOutput: "0", isHidden: true },
          ],
          externalLinks: [
            {
              platform: "LeetCode",
              title: "LeetCode 322 - Coin Change",
              url: "https://leetcode.com/problems/coin-change/",
            },
          ],
        },
      },
    ],
  },
  {
    id: "tries",
    slug: "tries",
    title: "Tries",
    iconName: "FolderTree",
    difficulty: "Advanced",
    order: 14,
    description: "Prefix trees, autocomplete indexing, bitwise XOR tries, and dictionary lookups.",
    levels: [
      {
        id: "tries-1",
        title: "Prefix Tree Fundamentals",
        shortDesc: "Trie nodes, children arrays, `isEndOfWord` flags, and O(L) string search.",
        estimatedMinutes: 20,
        order: 1,
        requiresCoding: true,
        theory: {
          summary: "A Trie (Prefix Tree) is an N-ary tree where each edge represents a character. Useful for autocomplete, spellcheck, and longest common prefix queries in O(L) time where L is word length.",
          sections: [
            {
              heading: "Trie Structure",
              content: "Each node contains a map/array of child references and a boolean flag `isEnd`. Inserting or searching a word takes time proportional to length L, independent of total words N.",
              complexity: {
                time: "Insert/Search: O(L)",
                space: "O(AlphabetSize * TotalCharacters)",
              },
            },
          ],
        },
        quiz: {
          passThreshold: 3,
          questions: [
            {
              id: "q1",
              question: "What is the time complexity to insert a word of length L into a Trie?",
              options: ["O(L)", "O(N * L)", "O(L²)", "O(1)"],
              correctIndex: 0,
              explanation: "Traversing or creating L character nodes takes O(L) time.",
            },
            {
              id: "q2",
              question: "What is the primary operational advantage of a Trie over a Hash Set for dictionary lookups?",
              options: ["Lower memory usage", "Efficient prefix matching and autocomplete (e.g. `startsWith`)", "Tries support O(1) integer addition", "Tries require no pointers"],
              correctIndex: 1,
              explanation: "Tries enable searching for all words sharing a common prefix in O(prefix_length) time.",
            },
            {
              id: "q3",
              question: "What does the `isEndOfWord` boolean flag indicate in a Trie node?",
              options: ["The node is a leaf", "A valid dictionary word terminates at this specific node", "The tree is full", "The word contains an error"],
              correctIndex: 1,
              explanation: "It distinguishes valid complete words from intermediate prefix substrings.",
            },
            {
              id: "q4",
              question: "How is a Bitwise Trie used in competitive programming?",
              options: ["To find Maximum XOR pair in O(32 * N)", "To compute floating point square roots", "To sort doubles", "To replace SQL databases"],
              correctIndex: 0,
              explanation: "Inserting binary representations of numbers allows finding maximum XOR pairs in O(32N) = O(N) time.",
            },
            {
              id: "q5",
              question: "What is the space trade-off of a naive array-based Trie?",
              options: ["High memory consumption due to many unused child pointers (e.g. 26 pointers per node)", "Slow CPU clock speed", "Stack overflow in iteration", "Network latency"],
              correctIndex: 0,
              explanation: "Allocating 26 pointers per node for sparse alphabets consumes significant memory.",
            },
          ],
        },
        codingChallenge: {
          id: "code-tries-1",
          title: "Longest Common Prefix",
          difficulty: "Easy",
          description: "Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string `\"\"`.",
          functionName: "longestCommonPrefix",
          starterCode: {
            javascript: "function longestCommonPrefix(strs) {\n  if (!strs || strs.length === 0) return '';\n  let prefix = strs[0];\n  for (let i = 1; i < strs.length; i++) {\n    while (strs[i].indexOf(prefix) !== 0) {\n      prefix = prefix.substring(0, prefix.length - 1);\n      if (!prefix) return '';\n    }\n  }\n  return prefix;\n}",
            typescript: "function longestCommonPrefix(strs: string[]): string {\n  if (!strs || strs.length === 0) return '';\n  let prefix = strs[0];\n  for (let i = 1; i < strs.length; i++) {\n    while (strs[i].indexOf(prefix) !== 0) {\n      prefix = prefix.substring(0, prefix.length - 1);\n      if (!prefix) return '';\n    }\n  }\n  return prefix;\n}",
            python: "def longestCommonPrefix(strs):\n    if not strs: return ''\n    prefix = strs[0]\n    for s in strs[1:]:\n        while not s.startswith(prefix):\n            prefix = prefix[:-1]\n            if not prefix: return ''\n    return prefix",
            java: "class Solution {\n    public String longestCommonPrefix(String[] strs) {\n        if (strs == null || strs.length == 0) return \"\";\n        String prefix = strs[0];\n        for (int i = 1; i < strs.length; i++) {\n            while (strs[i].indexOf(prefix) != 0) {\n                prefix = prefix.substring(0, prefix.length() - 1);\n                if (prefix.isEmpty()) return \"\";\n            }\n        }\n        return prefix;\n    }\n}",
            cpp: "class Solution {\npublic:\n    string longestCommonPrefix(vector<string>& strs) {\n        if (strs.empty()) return \"\";\n        string prefix = strs[0];\n        for (int i = 1; i < strs.size(); i++) {\n            while (strs[i].find(prefix) != 0) {\n                prefix = prefix.substr(0, prefix.length() - 1);\n                if (prefix.empty()) return \"\";\n            }\n        }\n        return prefix;\n    }\n};",
          },
          examples: [
            { input: '["flower","flow","flight"]', output: '"fl"' },
            { input: '["dog","racecar","car"]', output: '""', explanation: "There is no common prefix among the input strings." },
          ],
          constraints: [
            "1 <= strs.length <= 200",
            "0 <= strs[i].length <= 200",
            "strs[i] consists of only lowercase English letters.",
          ],
          testCases: [
            { input: '["flower","flow","flight"]', expectedOutput: '"fl"' },
            { input: '["dog","racecar","car"]', expectedOutput: '""' },
            { input: '["a"]', expectedOutput: '"a"', isHidden: true },
          ],
          externalLinks: [
            {
              platform: "LeetCode",
              title: "LeetCode 14 - Longest Common Prefix",
              url: "https://leetcode.com/problems/longest-common-prefix/",
            },
          ],
        },
      },
    ],
  },
  {
    id: "disjoint-set-union",
    slug: "disjoint-set-union",
    title: "Disjoint Set Union",
    iconName: "Boxes",
    difficulty: "Advanced",
    order: 15,
    description: "Union-Find, path compression, union by rank, dynamic connectivity, and Kruskal's MST.",
    levels: [
      {
        id: "dsu-1",
        title: "Union-Find & Path Compression",
        shortDesc: "Disjoint sets, `find(x)` with path compression, `union(x, y)` by rank, and α(N) inverse Ackermann complexity.",
        estimatedMinutes: 20,
        order: 1,
        requiresCoding: true,
        theory: {
          summary: "Disjoint Set Union (DSU) tracks elements partitioned into disjoint subsets. With Path Compression and Union by Rank, operations run in nearly O(1) amortized time: O(α(N)).",
          sections: [
            {
              heading: "Path Compression",
              content: "During `find(i)`, point every node along the path directly to the representative root: `parent[i] = find(parent[i])`.",
              complexity: {
                time: "O(α(N)) per operation",
                space: "O(N) parent and rank arrays",
              },
            },
          ],
        },
        quiz: {
          passThreshold: 3,
          questions: [
            {
              id: "q1",
              question: "What is the amortized time complexity of DSU operations with Path Compression and Union by Rank?",
              options: ["O(1)", "O(α(N)) ~ near constant", "O(log N)", "O(N)"],
              correctIndex: 1,
              explanation: "α(N) is the inverse Ackermann function, practically <= 4 for any universe size.",
            },
            {
              id: "q2",
              question: "What does Path Compression do during a `find` operation?",
              options: ["Flattens tree by pointing visited nodes directly to the root", "Deletes redundant nodes", "Sorts the elements", "Balances tree using AVL rotations"],
              correctIndex: 0,
              explanation: "Path compression re-parents all nodes on the search path directly to the root.",
            },
            {
              id: "q3",
              question: "How does DSU detect a cycle in an undirected graph?",
              options: ["If an edge connects two vertices that already share the same representative root", "If vertex degree > 2", "By running Dijkstra", "If number of edges > number of vertices"],
              correctIndex: 0,
              explanation: "If `find(u) === find(v)` prior to adding edge (u, v), adding it introduces a cycle.",
            },
            {
              id: "q4",
              question: "What does `Union by Rank` prevent?",
              options: ["Creating deep skewed chains by attaching shorter trees under taller roots", "Integer overflow", "Hash collisions", "Memory leaks"],
              correctIndex: 0,
              explanation: "Attaching the smaller tree under the larger tree's root maintains logarithmic bounds.",
            },
            {
              id: "q5",
              question: "Which algorithm heavily relies on DSU for cycle prevention?",
              options: ["Kruskal's Minimum Spanning Tree", "Floyd-Warshall", "Bellman-Ford", "Merge Sort"],
              correctIndex: 0,
              explanation: "Kruskal's algorithm adds edges in ascending weight, using DSU to discard edges that create cycles.",
            },
          ],
        },
        codingChallenge: {
          id: "code-dsu-1",
          title: "Redundant Connection",
          difficulty: "Medium",
          description: "Given an undirected graph with `n` nodes labeled `1` to `n`, returning a tree plus one additional edge. Return an edge that can be removed so that the resulting graph is a tree of `n` nodes.",
          functionName: "findRedundantConnection",
          starterCode: {
            javascript: "function findRedundantConnection(edges) {\n  const n = edges.length;\n  const parent = Array.from({ length: n + 1 }, (_, i) => i);\n  function find(i) {\n    if (parent[i] === i) return i;\n    return parent[i] = find(parent[i]);\n  }\n  for (const [u, v] of edges) {\n    const rootU = find(u);\n    const rootV = find(v);\n    if (rootU === rootV) return [u, v];\n    parent[rootU] = rootV;\n  }\n  return [];\n}",
            typescript: "function findRedundantConnection(edges: number[][]): number[] {\n  const n = edges.length;\n  const parent = Array.from({ length: n + 1 }, (_, i) => i);\n  function find(i: number): number {\n    if (parent[i] === i) return i;\n    return parent[i] = find(parent[i]);\n  }\n  for (const [u, v] of edges) {\n    const rootU = find(u);\n    const rootV = find(v);\n    if (rootU === rootV) return [u, v];\n    parent[rootU] = rootV;\n  }\n  return [];\n}",
            python: "def findRedundantConnection(edges):\n    parent = list(range(len(edges) + 1))\n    def find(i):\n        if parent[i] != i:\n            parent[i] = find(parent[i])\n        return parent[i]\n    for u, v in edges:\n        ru, rv = find(u), find(v)\n        if ru == rv: return [u, v]\n        parent[ru] = rv\n    return []",
            java: "class Solution {\n    public int[] findRedundantConnection(int[][] edges) {\n        int[] parent = new int[edges.length + 1];\n        for (int i = 0; i < parent.length; i++) parent[i] = i;\n        for (int[] e : edges) {\n            int ru = find(parent, e[0]), rv = find(parent, e[1]);\n            if (ru == rv) return e;\n            parent[ru] = rv;\n        }\n        return new int[]{};\n    }\n    private int find(int[] p, int i) {\n        if (p[i] == i) return i;\n        return p[i] = find(p, p[i]);\n    }\n}",
            cpp: "class Solution {\npublic:\n    vector<int> findRedundantConnection(vector<vector<int>>& edges) {\n        vector<int> parent(edges.size() + 1);\n        iota(parent.begin(), parent.end(), 0);\n        function<int(int)> find = [&](int i) {\n            return parent[i] == i ? i : (parent[i] = find(parent[i]));\n        };\n        for (auto& e : edges) {\n            int ru = find(e[0]), rv = find(e[1]);\n            if (ru == rv) return e;\n            parent[ru] = rv;\n        }\n        return {};\n    }\n};",
          },
          examples: [
            { input: "[[1,2],[1,3],[2,3]]", output: "[2,3]" },
            { input: "[[1,2],[2,3],[3,4],[1,4],[1,5]]", output: "[1,4]" },
          ],
          constraints: [
            "n == edges.length",
            "3 <= n <= 1000",
            "edges[i].length == 2",
            "1 <= ai < bi <= edges.length",
          ],
          testCases: [
            { input: "[[1,2],[1,3],[2,3]]", expectedOutput: "[2,3]" },
            { input: "[[1,2],[2,3],[3,4],[1,4],[1,5]]", expectedOutput: "[1,4]" },
          ],
          externalLinks: [
            {
              platform: "LeetCode",
              title: "LeetCode 684 - Redundant Connection",
              url: "https://leetcode.com/problems/redundant-connection/",
            },
          ],
        },
      },
    ],
  },
  {
    id: "advanced-dsa",
    slug: "advanced-dsa",
    title: "Advanced DSA",
    iconName: "Flame",
    difficulty: "Advanced",
    order: 16,
    description: "Segment Trees, Fenwick (Binary Indexed) Trees, Bit Manipulation, String Hashing, and Range Queries.",
    levels: [
      {
        id: "advanced-1",
        title: "Bit Manipulation & Segment Trees",
        shortDesc: "Bitwise masks, XOR tricks, segment tree point/range queries, and lazy propagation.",
        estimatedMinutes: 25,
        order: 1,
        requiresCoding: true,
        theory: {
          summary: "Segment Trees and Fenwick Trees enable O(log N) dynamic range queries and point updates over arrays.",
          sections: [
            {
              heading: "Bit Manipulation Primitives",
              content: "`n & (n - 1)` clears lowest set bit. `n & -n` isolates lowest set bit. `x ^ x = 0` and `x ^ 0 = x` allow linear-time unique number extraction.",
              complexity: {
                time: "Bit Ops: O(1), Segment Tree: O(log N)",
                space: "Segment Tree: O(4N)",
              },
            },
          ],
        },
        quiz: {
          passThreshold: 3,
          questions: [
            {
              id: "q1",
              question: "What does the bitwise expression `n & (n - 1)` do?",
              options: ["Clears the lowest set (1) bit in n", "Multiplies n by 2", "Inverts all bits", "Checks if n is odd"],
              correctIndex: 0,
              explanation: "Subtracting 1 flips all bits up to the lowest 1 bit, so `&` clears that lowest 1.",
            },
            {
              id: "q2",
              question: "What is the time complexity of Range Sum Query in a Segment Tree with N elements?",
              options: ["O(log N)", "O(1)", "O(N)", "O(N log N)"],
              correctIndex: 0,
              explanation: "At each tree level, at most 4 nodes are visited, giving O(log N) query time.",
            },
            {
              id: "q3",
              question: "What is the purpose of Lazy Propagation in Segment Trees?",
              options: ["Deferring range updates until child nodes are queried to achieve O(log N) range updates", "Skipping compiler optimization", "Writing results to disk", "Handling infinite arrays"],
              correctIndex: 0,
              explanation: "Lazy propagation stores pending updates at internal nodes, avoiding O(N) updates.",
            },
            {
              id: "q4",
              question: "If an array has every number repeated twice except one single number, how can it be found in O(N) time and O(1) space?",
              options: ["XOR all elements together", "Sum the array", "Sort with QuickSort", "Use a 2D matrix"],
              correctIndex: 0,
              explanation: "Since `x ^ x = 0` and `x ^ 0 = x`, all pairs cancel out, leaving the unique element.",
            },
            {
              id: "q5",
              question: "What is the memory requirement for a Segment Tree built over an array of size N?",
              options: ["O(4N)", "O(N²)", "O(log N)", "O(1)"],
              correctIndex: 0,
              explanation: "A complete binary tree over array N requires at most 4N array slots.",
            },
          ],
        },
        codingChallenge: {
          id: "code-advanced-1",
          title: "Single Number",
          difficulty: "Easy",
          description: "Given a non-empty array of integers `nums`, every element appears twice except for one. Find that single one. You must implement a solution with a linear runtime complexity and use only constant extra space.",
          functionName: "singleNumber",
          starterCode: {
            javascript: "function singleNumber(nums) {\n  return nums.reduce((acc, curr) => acc ^ curr, 0);\n}",
            typescript: "function singleNumber(nums: number[]): number {\n  return nums.reduce((acc, curr) => acc ^ curr, 0);\n}",
            python: "def singleNumber(nums):\n    from functools import reduce\n    return reduce(lambda x, y: x ^ y, nums)",
            java: "class Solution {\n    public int singleNumber(int[] nums) {\n        int res = 0;\n        for (int x : nums) res ^= x;\n        return res;\n    }\n}",
            cpp: "class Solution {\npublic:\n    int singleNumber(vector<int>& nums) {\n        int res = 0;\n        for (int x : nums) res ^= x;\n        return res;\n    }\n};",
          },
          examples: [
            { input: "[2,2,1]", output: "1" },
            { input: "[4,1,2,1,2]", output: "4" },
            { input: "[1]", output: "1" },
          ],
          constraints: [
            "1 <= nums.length <= 3 * 10^4",
            "-3 * 10^4 <= nums[i] <= 3 * 10^4",
            "Each element in the array appears twice except for one element which appears only once.",
          ],
          testCases: [
            { input: "[2,2,1]", expectedOutput: "1" },
            { input: "[4,1,2,1,2]", expectedOutput: "4" },
            { input: "[1]", expectedOutput: "1", isHidden: true },
          ],
          externalLinks: [
            {
              platform: "LeetCode",
              title: "LeetCode 136 - Single Number",
              url: "https://leetcode.com/problems/single-number/",
            },
          ],
        },
      },
    ],
  },
];

// Topics in recommended learning order (phases are defined in dsa-roadmap.ts).
export const dsaTopics: DsaTopic[] = dsaLearningOrder
  .map((id) => curriculumTopics.find((t) => t.id === id))
  .filter((t): t is DsaTopic => Boolean(t))
  .map((t, i) => ({ ...t, order: i + 1 }));

export function getAllLevels() {
  const result: {
    topic: DsaTopic;
    topicId: string;
    level: DsaLevel;
    globalIndex: number;
  }[] = [];

  let idx = 0;
  for (const topic of dsaTopics) {
    for (const level of topic.levels) {
      result.push({
        topic,
        topicId: topic.id,
        level,
        globalIndex: idx++,
      });
    }
  }
  return result;
}
