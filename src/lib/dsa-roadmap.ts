// Learning path for the DSA hub: topic order, key concepts and practice problems.
// Topic ids match `dsaTopics` in dsa-curriculum.ts, which is ordered from this file.

export type ProblemDifficulty = "Easy" | "Medium" | "Hard";

export interface RoadmapProblem {
  id: string; // LeetCode slug, also used as the progress key
  title: string;
  difficulty: ProblemDifficulty;
}

export interface RoadmapTopic {
  concepts: string[];
  problems: RoadmapProblem[];
}

export interface RoadmapPhase {
  id: string;
  title: string;
  summary: string;
  topicIds: string[];
}

export const dsaPhases: RoadmapPhase[] = [
  {
    id: "foundations",
    title: "Foundations",
    summary: "Complexity analysis and the linear data structures every other topic builds on.",
    topicIds: ["programming-foundations", "arrays", "strings", "hashing"],
  },
  {
    id: "core-techniques",
    title: "Core Techniques",
    summary: "Search, recursion and pointer-based structures that show up in most interview problems.",
    topicIds: ["binary-search", "recursion-and-backtracking", "linked-lists", "stacks-and-queues"],
  },
  {
    id: "trees-graphs",
    title: "Trees & Graphs",
    summary: "Hierarchical and connected data: traversals, priority ordering and connectivity.",
    topicIds: ["trees-and-bst", "heaps-and-priority-queues", "tries", "graphs", "disjoint-set-union"],
  },
  {
    id: "optimization",
    title: "Optimization",
    summary: "Making the best choice: greedy strategies, dynamic programming and advanced structures.",
    topicIds: ["greedy-algorithms", "dynamic-programming", "advanced-dsa"],
  },
];

export const dsaLearningOrder: string[] = dsaPhases.flatMap((p) => p.topicIds);

const p = (id: string, title: string, difficulty: ProblemDifficulty): RoadmapProblem => ({
  id,
  title,
  difficulty,
});

export const roadmapTopics: Record<string, RoadmapTopic> = {
  "programming-foundations": {
    concepts: [
      "Big-O, Big-Θ and Big-Ω notation",
      "Time vs space complexity",
      "Stack vs heap memory",
      "Loops, invariants and off-by-one errors",
      "Basic math: primes, digits, modulo",
    ],
    problems: [
      p("fizz-buzz", "Fizz Buzz", "Easy"),
      p("running-sum-of-1d-array", "Running Sum of 1d Array", "Easy"),
      p("palindrome-number", "Palindrome Number", "Easy"),
      p("power-of-two", "Power of Two", "Easy"),
      p("reverse-integer", "Reverse Integer", "Medium"),
      p("count-primes", "Count Primes", "Medium"),
    ],
  },
  arrays: {
    concepts: [
      "Traversal, insertion and deletion",
      "Prefix sums",
      "Two pointers",
      "Kadane's algorithm",
      "In-place rearrangement",
    ],
    problems: [
      p("best-time-to-buy-and-sell-stock", "Best Time to Buy and Sell Stock", "Easy"),
      p("move-zeroes", "Move Zeroes", "Easy"),
      p("remove-duplicates-from-sorted-array", "Remove Duplicates from Sorted Array", "Easy"),
      p("maximum-subarray", "Maximum Subarray", "Medium"),
      p("product-of-array-except-self", "Product of Array Except Self", "Medium"),
      p("rotate-array", "Rotate Array", "Medium"),
      p("container-with-most-water", "Container With Most Water", "Medium"),
      p("3sum", "3Sum", "Medium"),
      p("trapping-rain-water", "Trapping Rain Water", "Hard"),
    ],
  },
  strings: {
    concepts: [
      "Character counting and frequency arrays",
      "Palindromes and two pointers",
      "Sliding window",
      "Expand-around-center",
    ],
    problems: [
      p("valid-palindrome", "Valid Palindrome", "Easy"),
      p("valid-anagram", "Valid Anagram", "Easy"),
      p("longest-common-prefix", "Longest Common Prefix", "Easy"),
      p("longest-substring-without-repeating-characters", "Longest Substring Without Repeating Characters", "Medium"),
      p("longest-repeating-character-replacement", "Longest Repeating Character Replacement", "Medium"),
      p("longest-palindromic-substring", "Longest Palindromic Substring", "Medium"),
      p("minimum-window-substring", "Minimum Window Substring", "Hard"),
    ],
  },
  hashing: {
    concepts: [
      "Hash maps and hash sets",
      "Collision handling",
      "Frequency counting",
      "Prefix sum + hash map",
    ],
    problems: [
      p("two-sum", "Two Sum", "Easy"),
      p("contains-duplicate", "Contains Duplicate", "Easy"),
      p("group-anagrams", "Group Anagrams", "Medium"),
      p("top-k-frequent-elements", "Top K Frequent Elements", "Medium"),
      p("longest-consecutive-sequence", "Longest Consecutive Sequence", "Medium"),
      p("subarray-sum-equals-k", "Subarray Sum Equals K", "Medium"),
    ],
  },
  "binary-search": {
    concepts: [
      "Classic binary search",
      "Lower and upper bound",
      "Rotated sorted arrays",
      "Binary search on the answer",
    ],
    problems: [
      p("binary-search", "Binary Search", "Easy"),
      p("search-insert-position", "Search Insert Position", "Easy"),
      p("find-first-and-last-position-of-element-in-sorted-array", "Find First and Last Position of Element", "Medium"),
      p("search-in-rotated-sorted-array", "Search in Rotated Sorted Array", "Medium"),
      p("find-minimum-in-rotated-sorted-array", "Find Minimum in Rotated Sorted Array", "Medium"),
      p("koko-eating-bananas", "Koko Eating Bananas", "Medium"),
      p("median-of-two-sorted-arrays", "Median of Two Sorted Arrays", "Hard"),
    ],
  },
  "recursion-and-backtracking": {
    concepts: [
      "Base case and recursive case",
      "Recursion tree and call stack",
      "Subsets and permutations",
      "Backtracking with pruning",
    ],
    problems: [
      p("powx-n", "Pow(x, n)", "Medium"),
      p("subsets", "Subsets", "Medium"),
      p("permutations", "Permutations", "Medium"),
      p("combination-sum", "Combination Sum", "Medium"),
      p("generate-parentheses", "Generate Parentheses", "Medium"),
      p("word-search", "Word Search", "Medium"),
      p("n-queens", "N-Queens", "Hard"),
    ],
  },
  "linked-lists": {
    concepts: [
      "Singly and doubly linked lists",
      "Reversal",
      "Fast and slow pointers",
      "Dummy head technique",
    ],
    problems: [
      p("reverse-linked-list", "Reverse Linked List", "Easy"),
      p("merge-two-sorted-lists", "Merge Two Sorted Lists", "Easy"),
      p("linked-list-cycle", "Linked List Cycle", "Easy"),
      p("middle-of-the-linked-list", "Middle of the Linked List", "Easy"),
      p("remove-nth-node-from-end-of-list", "Remove Nth Node From End of List", "Medium"),
      p("reorder-list", "Reorder List", "Medium"),
      p("lru-cache", "LRU Cache", "Medium"),
      p("merge-k-sorted-lists", "Merge k Sorted Lists", "Hard"),
    ],
  },
  "stacks-and-queues": {
    concepts: [
      "Stack (LIFO) and queue (FIFO)",
      "Balanced brackets",
      "Monotonic stack",
      "Deque and monotonic queue",
    ],
    problems: [
      p("valid-parentheses", "Valid Parentheses", "Easy"),
      p("implement-queue-using-stacks", "Implement Queue using Stacks", "Easy"),
      p("next-greater-element-i", "Next Greater Element I", "Easy"),
      p("min-stack", "Min Stack", "Medium"),
      p("evaluate-reverse-polish-notation", "Evaluate Reverse Polish Notation", "Medium"),
      p("daily-temperatures", "Daily Temperatures", "Medium"),
      p("sliding-window-maximum", "Sliding Window Maximum", "Hard"),
      p("largest-rectangle-in-histogram", "Largest Rectangle in Histogram", "Hard"),
    ],
  },
  "trees-and-bst": {
    concepts: [
      "Preorder, inorder and postorder traversal",
      "Level-order traversal (BFS)",
      "Height, depth and diameter",
      "Binary search tree properties",
      "Lowest common ancestor",
    ],
    problems: [
      p("maximum-depth-of-binary-tree", "Maximum Depth of Binary Tree", "Easy"),
      p("invert-binary-tree", "Invert Binary Tree", "Easy"),
      p("same-tree", "Same Tree", "Easy"),
      p("binary-tree-level-order-traversal", "Binary Tree Level Order Traversal", "Medium"),
      p("validate-binary-search-tree", "Validate Binary Search Tree", "Medium"),
      p("lowest-common-ancestor-of-a-binary-search-tree", "Lowest Common Ancestor of a BST", "Medium"),
      p("kth-smallest-element-in-a-bst", "Kth Smallest Element in a BST", "Medium"),
      p("binary-tree-maximum-path-sum", "Binary Tree Maximum Path Sum", "Hard"),
    ],
  },
  "heaps-and-priority-queues": {
    concepts: [
      "Min-heap and max-heap",
      "Heapify and heap sort",
      "Top-K pattern",
      "Two heaps",
    ],
    problems: [
      p("kth-largest-element-in-a-stream", "Kth Largest Element in a Stream", "Easy"),
      p("last-stone-weight", "Last Stone Weight", "Easy"),
      p("kth-largest-element-in-an-array", "Kth Largest Element in an Array", "Medium"),
      p("k-closest-points-to-origin", "K Closest Points to Origin", "Medium"),
      p("task-scheduler", "Task Scheduler", "Medium"),
      p("find-median-from-data-stream", "Find Median from Data Stream", "Hard"),
    ],
  },
  tries: {
    concepts: [
      "Trie node structure",
      "Insert, search and prefix lookup",
      "Wildcard search with DFS",
    ],
    problems: [
      p("implement-trie-prefix-tree", "Implement Trie (Prefix Tree)", "Medium"),
      p("design-add-and-search-words-data-structure", "Design Add and Search Words Data Structure", "Medium"),
      p("replace-words", "Replace Words", "Medium"),
      p("word-search-ii", "Word Search II", "Hard"),
    ],
  },
  graphs: {
    concepts: [
      "Adjacency list and matrix",
      "BFS and DFS",
      "Grid traversal",
      "Topological sort",
      "Dijkstra's shortest path",
    ],
    problems: [
      p("flood-fill", "Flood Fill", "Easy"),
      p("number-of-islands", "Number of Islands", "Medium"),
      p("clone-graph", "Clone Graph", "Medium"),
      p("rotting-oranges", "Rotting Oranges", "Medium"),
      p("course-schedule", "Course Schedule", "Medium"),
      p("pacific-atlantic-water-flow", "Pacific Atlantic Water Flow", "Medium"),
      p("network-delay-time", "Network Delay Time", "Medium"),
      p("word-ladder", "Word Ladder", "Hard"),
    ],
  },
  "disjoint-set-union": {
    concepts: [
      "Find and union operations",
      "Path compression",
      "Union by rank / size",
      "Kruskal's minimum spanning tree",
    ],
    problems: [
      p("find-if-path-exists-in-graph", "Find if Path Exists in Graph", "Easy"),
      p("number-of-provinces", "Number of Provinces", "Medium"),
      p("redundant-connection", "Redundant Connection", "Medium"),
      p("accounts-merge", "Accounts Merge", "Medium"),
      p("min-cost-to-connect-all-points", "Min Cost to Connect All Points", "Medium"),
    ],
  },
  "greedy-algorithms": {
    concepts: [
      "Greedy choice property",
      "Sorting-based greedy",
      "Interval scheduling",
      "Proving a greedy choice is safe",
    ],
    problems: [
      p("assign-cookies", "Assign Cookies", "Easy"),
      p("jump-game", "Jump Game", "Medium"),
      p("jump-game-ii", "Jump Game II", "Medium"),
      p("gas-station", "Gas Station", "Medium"),
      p("merge-intervals", "Merge Intervals", "Medium"),
      p("non-overlapping-intervals", "Non-overlapping Intervals", "Medium"),
      p("candy", "Candy", "Hard"),
    ],
  },
  "dynamic-programming": {
    concepts: [
      "Overlapping subproblems",
      "Memoization vs tabulation",
      "1D DP",
      "2D / grid DP",
      "Knapsack and subsequence DP",
    ],
    problems: [
      p("climbing-stairs", "Climbing Stairs", "Easy"),
      p("house-robber", "House Robber", "Medium"),
      p("coin-change", "Coin Change", "Medium"),
      p("longest-increasing-subsequence", "Longest Increasing Subsequence", "Medium"),
      p("unique-paths", "Unique Paths", "Medium"),
      p("longest-common-subsequence", "Longest Common Subsequence", "Medium"),
      p("partition-equal-subset-sum", "Partition Equal Subset Sum", "Medium"),
      p("edit-distance", "Edit Distance", "Medium"),
    ],
  },
  "advanced-dsa": {
    concepts: [
      "Bitwise operators and tricks",
      "Segment trees",
      "Fenwick tree (BIT)",
      "Range queries with updates",
    ],
    problems: [
      p("single-number", "Single Number", "Easy"),
      p("number-of-1-bits", "Number of 1 Bits", "Easy"),
      p("counting-bits", "Counting Bits", "Easy"),
      p("range-sum-query-mutable", "Range Sum Query - Mutable", "Medium"),
      p("count-of-smaller-numbers-after-self", "Count of Smaller Numbers After Self", "Hard"),
    ],
  },
};

export function getRoadmapTopic(topicId: string): RoadmapTopic {
  return roadmapTopics[topicId] ?? { concepts: [], problems: [] };
}

export function leetcodeUrl(problemId: string) {
  return `https://leetcode.com/problems/${problemId}/`;
}

export const allRoadmapProblems: RoadmapProblem[] = dsaLearningOrder.flatMap(
  (id) => getRoadmapTopic(id).problems
);
