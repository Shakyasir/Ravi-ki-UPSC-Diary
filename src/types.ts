export type StudyCategory = 
  | 'GS'
  | 'Optional'
  | 'Current Affairs'
  | 'NCERT'
  | 'Standard Book'
  | 'PW Class'
  | 'Revision'
  | 'MCQ'
  | 'PYQ'
  | 'Answer Writing'
  | 'Test'
  | 'CSAT'
  | 'Essay'
  | 'Routine'
  | 'Job'
  | 'Break'
  | 'Sleep'
  | 'Diary'
  | 'Other';

export type PreparationMode = 'JOB + UPSC' | 'FULL-TIME UPSC';
export type StudyStatus = 'Completed' | 'In Progress' | 'Planned';
export type DifficultyLevel = 'Easy' | 'Moderate' | 'Hard';

export interface UserProfile {
  name: string;
  displayName: string;
  fullName?: string;
  role: string;
  mission: string;
  tagline: string;
  targetYear: number;
  firstAttemptYear: number;
  jobEndDate: string; // '2026-12-31'
  fullTimeStartDate: string; // '2027-01-01'
  dailyTargetJobHours: number; // 5.5
  dailyTargetFullTimeHours: number; // 12.0
  jobModeTargetHours?: number;
  fullTimeTargetHours?: number;
  currentMode?: PreparationMode;
  sleepTargetHours: number; // 6.0
  optionalSubject: string;
  profilePhoto: string | null; // Base64 or URL
  manualModeOverride?: PreparationMode | 'AUTO';
  pwClassTiming: string;
}

export interface ScheduleItem {
  id: string;
  dayOfWeek: 'all' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  startTime: string; // '05:30'
  endTime: string;   // '07:00'
  title: string;
  durationHours: number;
  category: StudyCategory;
  isStudy: boolean;
  completed: boolean;
  mode: 'JOB + UPSC' | 'FULL-TIME UPSC' | 'BOTH';
  notes?: string;
}

export interface TodayTask {
  id: string;
  date: string; // 'YYYY-MM-DD'
  title: string;
  durationHours: number;
  category: StudyCategory;
  completed: boolean;
  order: number;
  notes?: string;
  subject?: string;
  priority?: 'High' | 'Medium' | 'Low';
  startTime?: string;
  endTime?: string;
  description?: string;
}

export interface StudyEntry {
  id: string;
  date: string; // 'YYYY-MM-DD'
  subject: string;
  topic: string;
  studyType: StudyCategory;
  startTime: string;
  endTime: string;
  durationHours: number;
  source: string;
  book?: string;
  lecture?: string;
  revision: boolean;
  mcqCount: number;
  pyqCount: number;
  answerWritingCount: number;
  testCount: number;
  status: StudyStatus;
  difficulty: DifficultyLevel;
  notes: string;
  createdAt: string;
}

export interface SubjectItem {
  id: string;
  name: string;
  paper?: string;
  category: 'GS' | 'Optional' | 'Other';
  studyHours: number;
  totalTopics: number;
  completedTopics: number;
  progressPercent?: number;
  revisionCount: number;
  pyqCount: number;
  mcqCount: number;
  testCount: number;
  color: string;
  description?: string;
}
export type Subject = SubjectItem;

export type BookStatus = 'Not Started' | 'Reading' | 'Completed' | 'Revision 1' | 'Revision 2' | 'Reference';

export interface BookItem {
  id: string;
  name: string;
  subject: string;
  author: string;
  type?: 'NCERT' | 'Standard Book' | 'Reference' | 'PW Material' | 'PDF' | 'Notes' | 'Other';
  totalPages: number;
  completedPages?: number;
  pagesRead?: number;
  progressPercent: number;
  status: BookStatus;
  revisionCount?: number;
  notes?: string;
}
export type Book = BookItem;

export interface PYQItem {
  id: string;
  year: number;
  exam: 'Prelims' | 'Mains';
  paper?: string;
  subject: string;
  topic: string;
  question: string;
  attempted?: boolean;
  correct?: boolean;
  status?: 'Solved' | 'Attempted' | 'Unsolved' | 'Mastered';
  difficulty?: 'Easy' | 'Moderate' | 'Hard';
  explanation?: string;
  solutionNotes?: string;
  revisionRequired?: boolean;
  createdAt?: string;
}

export interface MCQEntry {
  id: string;
  date: string;
  subject: string;
  topic: string;
  totalQuestions: number;
  correct: number;
  wrong?: number;
  incorrect?: number;
  skipped?: number;
  accuracy: number; // percentage
  source: string;
  weakAreas?: string;
  notes?: string;
}
export type MCQPractice = MCQEntry;

export interface TestEntry {
  id: string;
  testName: string;
  date: string;
  subject: string;
  testType: 'Sectional' | 'Prelims' | 'Mains' | 'CSAT' | 'Optional' | 'Essay' | 'Full Length' | 'Mains Mock';
  totalQuestions?: number;
  attempted?: number;
  correct?: number;
  wrong?: number;
  score: number;
  maxScore: number;
  percentage: number;
  accuracy?: number;
  rank?: string;
  timeTakenMinutes?: number;
  mistakes?: string;
  weakAreas?: string;
  improvementNotes?: string;
  analysisNotes?: string;
}
export type TestItem = TestEntry;

export interface AnswerWritingEntry {
  id: string;
  date: string;
  question: string;
  paper?: string;
  subject?: string;
  topic?: string;
  wordLimit?: number;
  wordCount?: number;
  wordsWritten?: number;
  timeTakenMinutes?: number;
  score?: number;
  selfScore?: number;
  maxScore: number;
  modelAnswerReviewed?: boolean;
  feedback?: string;
  keyPointsIncluded?: string[];
  improvementNotes?: string;
}
export type AnswerWritingItem = AnswerWritingEntry;

export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  whatIStudied?: string;
  whatILearned: string;      // आज मैंने क्या सीखा?
  whatICompleted: string;    // आज क्या पूरा किया?
  whatWentWell?: string;
  whatCouldBeImproved?: string;
  mistakesMade?: string;      // आज कहाँ गलती हुई?
  howToImproveTomorrow?: string; // कल क्या बेहतर करना है?
  biggestAchievement: string; // आज की सबसे बड़ी उपलब्धि
  todaysLesson: string;       // आज का lesson
  mood: string;
  thoughtsAndFeelings?: string;
  tomorrowsPlan?: string;
  quoteForToday?: string;
  overallRating?: number; // 1 - 5
  createdAt?: string;
  updatedAt?: string;
}

export type GoalCategory = 
  | 'Weekly' 
  | 'Monthly' 
  | 'Quarterly' 
  | 'Yearly' 
  | '2029 Ultimate' 
  | 'NCERT' 
  | 'Polity' 
  | 'PW Module' 
  | 'PYQs' 
  | 'Answer Writing' 
  | 'Optional' 
  | 'Revision' 
  | 'Test Series' 
  | 'Other';

export interface GoalItem {
  id: string;
  title: string;
  category: GoalCategory;
  targetValue?: string;
  currentValue?: string;
  deadline: string;
  progressPercent: number;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';
  notes?: string;
}

export interface BacklogItem {
  id: string;
  task?: string;
  subject?: string;
  topic?: string;
  reason?: string;
  category?: 'Missed Lecture' | 'Pending Topic' | 'Pending Revision' | 'Pending PYQ' | 'Pending MCQ' | 'Pending Answer Writing' | 'Other';
  priority: 'Low' | 'Medium' | 'High';
  plannedDate?: string;
  missedDate?: string;
  cleared?: boolean;
  deadline?: string;
  status?: 'Pending' | 'In Progress' | 'Resolved';
  notes?: string;
  createdAt?: string;
  originalTaskId?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  category: 'Study' | 'PW Class' | 'Revision' | 'Test' | 'Mock Test' | 'PYQ' | 'Answer Writing' | 'Deadline' | 'Goal' | 'Personal';
  description: string;
  status: 'Scheduled' | 'Completed' | 'Missed';
}

export interface RoadmapPhase {
  id?: string;
  year: number; // 2026, 2027, 2028, 2029
  title?: string;
  phaseName: string;
  subtitle: string;
  focus?: string;
  focusPoints: string[];
  timeframe?: string;
  status?: string;
  progressPercent: number;
  isCurrent: boolean;
  goals?: string[];
  keyBooks?: string[];
  milestones: { id: string; title: string; completed: boolean }[];
  notes: string;
}

export interface DailyReview {
  id: string;
  date: string;
  targetHours: number;
  actualHours: number;
  achievementPercent: number;
  tasksCompleted: number;
  tasksTotal: number;
  whatWentWell: string;
  whatWentWrong: string;
  improvementsTomorrow: string;
  submittedAt: string;
}

export interface WeeklyReview {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  totalHours: number;
  targetHours: number;
  achievementPercent: number;
  studyStreak: number;
  mcqCount: number;
  pyqCount: number;
  testsCount: number;
  answersCount: number;
  reflections: string;
  nextWeekPriorities: string;
  weakSubjects: string[];
}

export interface MonthlyReview {
  id: string;
  month: string; // YYYY-MM
  totalHours: number;
  avgDailyStudy: number;
  bestStudyDay: string;
  longestStreak: number;
  subjectsCovered: string[];
  mcqs: number;
  pyqs: number;
  tests: number;
  answersWritten: number;
  goalsCompleted: number;
  goalsPending: number;
  reflection: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'test' | 'backlog' | 'goal' | 'revision' | 'countdown' | 'streak';
  timestamp: string;
  read: boolean;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastSyncedAt?: string;
}
