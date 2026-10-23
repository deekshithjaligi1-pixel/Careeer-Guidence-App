export interface UserLevelProgress {
  topicId: string;
  levelId: string;
  quizCompleted: boolean;
  quizScore: number;
  quizPassed: boolean;
  codingCompleted: boolean;
  completed: boolean;
  completedAt?: string;
  lastCodeSnippet?: string;
}

export interface UserDsaProgress {
  userId?: string;
  completedLevels: Record<string, UserLevelProgress>; // key: `${topicId}_${levelId}`
  currentTopicId: string;
  currentLevelId: string;
  totalCompleted: number;
  totalLevels: number;
  percentComplete: number;
}
