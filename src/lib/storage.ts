import {
  UserProfile,
  ScheduleItem,
  TodayTask,
  StudyEntry,
  SubjectItem,
  BookItem,
  PYQItem,
  MCQEntry,
  TestEntry,
  AnswerWritingEntry,
  DiaryEntry,
  GoalItem,
  BacklogItem,
  CalendarEvent,
  RoadmapPhase,
  DailyReview,
  WeeklyReview,
  MonthlyReview,
  AppNotification,
  PreparationMode
} from '../types';
import {
  DEFAULT_PROFILE,
  DEFAULT_JOB_SCHEDULE,
  DEFAULT_FULLTIME_SCHEDULE,
  DEFAULT_TODAY_TASKS,
  DEFAULT_SUBJECTS,
  DEFAULT_BOOKS,
  DEFAULT_GOALS,
  DEFAULT_ROADMAP_PHASES,
  DEFAULT_BACKLOG,
  DEFAULT_STUDY_ENTRIES,
  DEFAULT_PYQS,
  DEFAULT_MCQS,
  DEFAULT_TESTS,
  DEFAULT_ANSWERS,
  DEFAULT_DIARY_ENTRIES
} from './constants';
import {
  fetchUserDataFromSupabase,
  migrateLocalDataToSupabase,
  syncUpsertProfile,
  syncUpsertStudyEntry,
  syncDeleteStudyEntry,
  syncUpsertScheduleItem,
  syncDeleteScheduleItem,
  syncUpsertTask,
  syncDeleteTask,
  syncUpsertSubject,
  syncDeleteSubject,
  syncUpsertBook,
  syncDeleteBook,
  syncUpsertPYQ,
  syncDeletePYQ,
  syncUpsertMCQ,
  syncDeleteMCQ,
  syncUpsertTest,
  syncDeleteTest,
  syncUpsertAnswer,
  syncDeleteAnswer,
  syncUpsertDiary,
  syncDeleteDiary,
  syncUpsertGoal,
  syncDeleteGoal,
  syncUpsertBacklog,
  syncDeleteBacklog,
  syncUpsertCalendarEvent,
  syncDeleteCalendarEvent,
} from './supabaseSync';

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(fn => fn());
}

export function subscribeToStore(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Current active Supabase authenticated user ID
let currentUserId: string | null = null;

// Unique ID generator with timestamp and high-entropy random suffix
export function generateUniqueId(prefix: string): string {
  const rand = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${Date.now()}-${rand}`;
}

// Automatically detect and fix duplicate IDs in arrays stored in localStorage
function deduplicateEntities<T>(items: T, key: string): T {
  if (!Array.isArray(items) || items.length <= 1) return items;
  const first = items[0];
  if (!first || typeof first !== 'object' || typeof (first as any).id !== 'string') {
    return items;
  }

  const seen = new Set<string>();
  let hasDuplicate = false;
  const result: any[] = [];

  for (const item of items) {
    if (!item) continue;
    const itemId = (item as any).id;
    if (!itemId || seen.has(itemId)) {
      hasDuplicate = true;
      const newId = `${itemId || 'item'}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      result.push({ ...item, id: newId });
      seen.add(newId);
    } else {
      seen.add(itemId);
      result.push(item);
    }
  }

  if (hasDuplicate && typeof window !== 'undefined') {
    try {
      localStorage.setItem(`ravi_upsc_${key}`, JSON.stringify(result));
    } catch {
      // ignore
    }
  }

  return result as T;
}

// Helper to get / set typed localStorage
function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(`ravi_upsc_${key}`) : null;
    if (!raw || raw === 'undefined' || raw === 'null') return defaultValue;
    const parsed = JSON.parse(raw);
    if (parsed === null || parsed === undefined) return defaultValue;
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) return defaultValue;
    return deduplicateEntities(parsed, key) as T;
  } catch (err) {
    console.warn(`Error reading key ravi_upsc_${key}:`, err);
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`ravi_upsc_${key}`, JSON.stringify(value));
    }
    notify();
  } catch (err) {
    console.error(`Error saving key ravi_upsc_${key}:`, err);
  }
}

// Current date formatted as YYYY-MM-DD (Uses India timezone Asia/Kolkata)
export function getSystemDateString(): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(new Date());
  } catch (e) {
    const d = new Date();
    const y = d.getFullYear() >= 2026 ? d.getFullYear() : 2026;
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}

// Tomorrow's date formatted as YYYY-MM-DD (calculated as Today + 1 calendar day)
export function getTomorrowDateString(baseDate?: string): string {
  const dateStr = baseDate || getSystemDateString();
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dt = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dt}`;
}

export interface ConsistencyDatePoint {
  dateStr: string;   // YYYY-MM-DD
  day: string;       // "Thu"
  date: string;      // "17 Sep"
  isToday: boolean;
}

// Generate an array of consecutive calendar dates ending today in Asia/Kolkata
export function getConsistencyDateRange(daysCount: number, baseDateStr?: string): ConsistencyDatePoint[] {
  const todayStr = baseDateStr || getSystemDateString();
  const [year, month, day] = todayStr.split('-').map(Number);
  const result: ConsistencyDatePoint[] = [];

  for (let offset = daysCount - 1; offset >= 0; offset--) {
    // Construct UTC noon date so daylight saving or timezone shifts don't affect day step
    const dt = new Date(Date.UTC(year, month - 1, day - offset, 12, 0, 0));
    const y = dt.getUTCFullYear();
    const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const dNum = dt.getUTCDate();
    const dtStr = `${y}-${m}-${String(dNum).padStart(2, '0')}`;

    const dayName = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short'
    }).format(dt);

    const monthName = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      month: 'short'
    }).format(dt);

    result.push({
      dateStr: dtStr,
      day: dayName,
      date: `${dNum} ${monthName}`,
      isToday: dtStr === todayStr
    });
  }

  return result;
}

// Determine preparation mode based on date or manual override
export function getEffectiveMode(profile: UserProfile): PreparationMode {
  if (profile.manualModeOverride && profile.manualModeOverride !== 'AUTO') {
    return profile.manualModeOverride;
  }
  const today = getSystemDateString();
  if (today >= profile.fullTimeStartDate) {
    return 'FULL-TIME UPSC';
  }
  return 'JOB + UPSC';
}

// Days countdown until full-time mode (1 Jan 2027)
export function getDaysUntilFullTime(profile: UserProfile): number {
  const today = new Date(getSystemDateString()).getTime();
  const target = new Date(profile.fullTimeStartDate).getTime();
  const diff = target - today;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function getProfile(): UserProfile {
  return store.getProfile();
}

// ==================== STORE ACCESSORS & MUTATORS ====================

export const store = {
  subscribe(listener: () => void) {
    return subscribeToStore(listener);
  },

  // 0. User & Supabase Session Management
  setCurrentUser(userId: string | null) {
    currentUserId = userId;
    if (userId) {
      this.syncWithCloud(userId);
    }
  },

  getCurrentUserId(): string | null {
    return currentUserId;
  },

  async syncWithCloud(userIdParam?: string) {
    const uid = userIdParam || currentUserId;
    if (!uid) return;

    try {
      const cloudData = await fetchUserDataFromSupabase(uid);
      if (cloudData) {
        const hasCloudRecords = 
          (cloudData.studyEntries && cloudData.studyEntries.length > 0) ||
          (cloudData.subjects && cloudData.subjects.length > 0) ||
          Boolean(cloudData.profile);

        const isMigrated = typeof window !== 'undefined' && localStorage.getItem(`ravi_upsc_migrated_${uid}`) === 'true';

        // If user has no records in Supabase yet, safely migrate existing browser data
        if (!hasCloudRecords && !isMigrated) {
          const localPayload = {
            profile: this.getProfile(),
            schedule: this.getSchedule(),
            todayTasks: this.getAllTasks(),
            studyEntries: this.getStudyEntries(),
            subjects: this.getSubjects(),
            books: this.getBooks(),
            pyqs: this.getPYQs(),
            mcqs: this.getMCQs(),
            tests: this.getTests(),
            answers: this.getAnswers(),
            diaryEntries: this.getDiaryEntries(),
            goals: this.getGoals(),
            backlog: this.getBacklog(),
            calendarEvents: this.getCalendarEvents()
          };
          const res = await migrateLocalDataToSupabase(uid, localPayload);
          if (res.success && typeof window !== 'undefined') {
            localStorage.setItem(`ravi_upsc_migrated_${uid}`, 'true');
          }
        } else if (hasCloudRecords) {
          // Hydrate in-memory state from cloud data
          if (cloudData.profile) {
            setStored('profile', {
              ...this.getProfile(),
              ...cloudData.profile,
              displayName: 'IAS Ravi Ji'
            });
          }
          if (cloudData.schedule && cloudData.schedule.length > 0) setStored('schedule', cloudData.schedule);
          if (cloudData.todayTasks && cloudData.todayTasks.length > 0) setStored('today_tasks', cloudData.todayTasks);
          if (cloudData.studyEntries) setStored('study_entries', cloudData.studyEntries);
          if (cloudData.subjects && cloudData.subjects.length > 0) setStored('subjects', cloudData.subjects);
          if (cloudData.books && cloudData.books.length > 0) setStored('books', cloudData.books);
          if (cloudData.pyqs && cloudData.pyqs.length > 0) setStored('pyqs', cloudData.pyqs);
          if (cloudData.mcqs && cloudData.mcqs.length > 0) setStored('mcqs', cloudData.mcqs);
          if (cloudData.tests && cloudData.tests.length > 0) setStored('tests', cloudData.tests);
          if (cloudData.answers && cloudData.answers.length > 0) setStored('answers', cloudData.answers);
          if (cloudData.diaryEntries && cloudData.diaryEntries.length > 0) setStored('diary_entries', cloudData.diaryEntries);
          if (cloudData.goals && cloudData.goals.length > 0) setStored('goals', cloudData.goals);
          if (cloudData.backlog && cloudData.backlog.length > 0) setStored('backlog', cloudData.backlog);
          if (cloudData.calendarEvents && cloudData.calendarEvents.length > 0) setStored('calendar_events', cloudData.calendarEvents);
          notify();
        }
      }
    } catch (e) {
      console.error('Error during cloud sync:', e);
    }
  },

  // 1. Profile
  getProfile(): UserProfile {
    const stored = getStored<UserProfile>('profile', DEFAULT_PROFILE);
    return {
      ...DEFAULT_PROFILE,
      ...(stored || {}),
      displayName: 'IAS Ravi Ji' // Strict requirement
    };
  },
  updateProfile(updates: Partial<UserProfile>): UserProfile {
    const current = this.getProfile();
    const updated = { ...current, ...updates, displayName: 'IAS Ravi Ji' };
    setStored('profile', updated);
    if (currentUserId) {
      syncUpsertProfile(updated, currentUserId);
    }
    return updated;
  },

  // 2. Schedule
  getSchedule(): ScheduleItem[] {
    const profile = this.getProfile();
    const mode = getEffectiveMode(profile);
    const defaultSchedule = mode === 'FULL-TIME UPSC' ? DEFAULT_FULLTIME_SCHEDULE : DEFAULT_JOB_SCHEDULE;
    return getStored<ScheduleItem[]>('schedule', defaultSchedule);
  },
  saveSchedule(items: ScheduleItem[]): void {
    setStored('schedule', items);
    if (currentUserId) {
      items.forEach(it => syncUpsertScheduleItem(it, currentUserId!));
    }
  },
  addScheduleItem(item: Omit<ScheduleItem, 'id'>): ScheduleItem {
    const items = this.getSchedule();
    const newItem: ScheduleItem = { ...item, id: generateUniqueId('sched') };
    const updated = [...items, newItem];
    setStored('schedule', updated);
    if (currentUserId) {
      syncUpsertScheduleItem(newItem, currentUserId);
    }
    return newItem;
  },
  updateScheduleItem(id: string, updates: Partial<ScheduleItem>): void {
    const items = this.getSchedule();
    const updated = items.map(it => it.id === id ? { ...it, ...updates } : it);
    setStored('schedule', updated);
    const it = updated.find(x => x.id === id);
    if (it && currentUserId) {
      syncUpsertScheduleItem(it, currentUserId);
    }
  },
  deleteScheduleItem(id: string): void {
    const items = this.getSchedule().filter(it => it.id !== id);
    setStored('schedule', items);
    if (currentUserId) {
      syncDeleteScheduleItem(id, currentUserId);
    }
  },
  resetScheduleToDefault(mode?: PreparationMode): void {
    const effective = mode || getEffectiveMode(this.getProfile());
    const initial = effective === 'FULL-TIME UPSC' ? DEFAULT_FULLTIME_SCHEDULE : DEFAULT_JOB_SCHEDULE;
    this.saveSchedule(initial);
  },

  // 3. Today Tasks / Mission
  getAllTasks(): TodayTask[] {
    return getStored<TodayTask[]>('today_tasks', DEFAULT_TODAY_TASKS);
  },
  getTodayTasks(date?: string): TodayTask[] {
    this.performDateRollover();
    const targetDate = date || getSystemDateString();
    const all = this.getAllTasks();
    return all
      .filter(t => t.date === targetDate)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  },
  saveTodayTasks(tasks: TodayTask[]): void {
    setStored('today_tasks', tasks);
    if (currentUserId) {
      tasks.forEach(t => syncUpsertTask(t, currentUserId!));
    }
  },
  updateTodayTask(id: string, updates: Partial<TodayTask>): void {
    const all = this.getAllTasks();
    let updatedTask: TodayTask | null = null;
    const updated = all.map(t => {
      if (t.id === id) {
        updatedTask = { ...t, ...updates };
        return updatedTask;
      }
      return t;
    });
    setStored('today_tasks', updated);
    if (updatedTask && currentUserId) {
      syncUpsertTask(updatedTask, currentUserId);
    }
  },
  toggleTask(id: string): boolean {
    const all = this.getAllTasks();
    let isCompleted = false;
    let modifiedTask: TodayTask | null = null;
    const updated = all.map(t => {
      if (t.id === id) {
        isCompleted = !t.completed;
        modifiedTask = { ...t, completed: isCompleted };
        return modifiedTask;
      }
      return t;
    });
    setStored('today_tasks', updated);
    if (modifiedTask && currentUserId) {
      syncUpsertTask(modifiedTask, currentUserId);
    }
    return isCompleted;
  },
  addTodayTask(task: Omit<TodayTask, 'id' | 'order'>): TodayTask {
    const today = task.date || getSystemDateString();
    const todayTasks = this.getAllTasks().filter(t => t.date === today);
    const newTask: TodayTask = {
      ...task,
      date: today,
      id: generateUniqueId('task'),
      order: todayTasks.length + 1
    };
    const all = this.getAllTasks();
    const updated = [...all, newTask];
    setStored('today_tasks', updated);
    if (currentUserId) {
      syncUpsertTask(newTask, currentUserId);
    }
    return newTask;
  },
  deleteTodayTask(id: string): void {
    const all = this.getAllTasks().filter(t => t.id !== id);
    setStored('today_tasks', all);
    if (currentUserId) {
      syncDeleteTask(id, currentUserId);
    }
  },

  // Automatic Date Rollover to Backlog (Idempotent)
  performDateRollover(): void {
    const today = getSystemDateString();
    const allTasks = this.getAllTasks();
    const currentBacklog = getStored<BacklogItem[]>('backlog', DEFAULT_BACKLOG);
    let backlogChanged = false;
    const updatedBacklog = [...currentBacklog];

    // Find incomplete tasks from previous dates (date < today and not completed)
    const overdueTasks = allTasks.filter(t => t.date && t.date < today && !t.completed);

    for (const task of overdueTasks) {
      const expectedId = `backlog-task-${task.id}`;
      const exists = updatedBacklog.some(
        b => b.id === expectedId || b.originalTaskId === task.id || (b.task === task.title && b.missedDate === task.date)
      );

      if (!exists) {
        const newBacklogItem: BacklogItem = {
          id: expectedId,
          originalTaskId: task.id,
          task: task.title,
          topic: task.title,
          subject: task.subject || (task.category === 'PW Class' ? 'PhysicsWallah UPSC Batch' : task.category === 'Current Affairs' ? 'Current Affairs & Editorials' : 'Indian Polity & GS'),
          category: 'Pending Topic',
          priority: task.priority || 'High',
          missedDate: task.date,
          plannedDate: today,
          cleared: false,
          status: 'Pending',
          notes: task.notes ? `Missed from ${task.date}. ${task.notes}` : `Missed from ${task.date}`,
          createdAt: task.date
        };
        updatedBacklog.unshift(newBacklogItem);
        backlogChanged = true;
        if (currentUserId) {
          syncUpsertBacklog(newBacklogItem, currentUserId);
        }
      }
    }

    if (backlogChanged) {
      setStored('backlog', updatedBacklog);
    }
  },

  // 4. Study Register
  getStudyEntries(): StudyEntry[] {
    return getStored<StudyEntry[]>('study_entries', DEFAULT_STUDY_ENTRIES);
  },
  addStudyEntry(entry: Omit<StudyEntry, 'id' | 'createdAt'>): StudyEntry {
    const entries = this.getStudyEntries();
    const newEntry: StudyEntry = {
      ...entry,
      id: generateUniqueId('study'),
      createdAt: new Date().toISOString()
    };
    const updated = [newEntry, ...entries];
    setStored('study_entries', updated);
    this.recalculateSubjectStats();
    if (currentUserId) {
      syncUpsertStudyEntry(newEntry, currentUserId);
    }
    return newEntry;
  },
  updateStudyEntry(id: string, updates: Partial<StudyEntry>): void {
    const entries = this.getStudyEntries().map(e => e.id === id ? { ...e, ...updates } : e);
    setStored('study_entries', entries);
    this.recalculateSubjectStats();
    const e = entries.find(x => x.id === id);
    if (e && currentUserId) {
      syncUpsertStudyEntry(e, currentUserId);
    }
  },
  deleteStudyEntry(id: string): void {
    const entries = this.getStudyEntries().filter(e => e.id !== id);
    setStored('study_entries', entries);
    this.recalculateSubjectStats();
    if (currentUserId) {
      syncDeleteStudyEntry(id, currentUserId);
    }
  },
  getDailyStudyHours(dateStr: string): number {
    const entries = this.getStudyEntries().filter(e => e.date === dateStr);
    const completedTasks = this.getAllTasks().filter(t => t.date === dateStr && t.completed);

    // Sum hours from study register entries
    let total = entries.reduce((sum, e) => sum + (Number(e.durationHours) || 0), 0);

    // Add completed tasks that are not already present in study register (avoid double counting)
    for (const task of completedTasks) {
      const isAlreadyLogged = entries.some(
        e => e.topic.trim().toLowerCase() === task.title.trim().toLowerCase()
      );
      if (!isAlreadyLogged) {
        total += Number(task.durationHours) || 0;
      }
    }

    return Math.round(total * 10) / 10;
  },

  // 5. Subjects
  getSubjects(): SubjectItem[] {
    return getStored<SubjectItem[]>('subjects', DEFAULT_SUBJECTS);
  },
  saveSubjects(subjects: SubjectItem[]): void {
    setStored('subjects', subjects);
    if (currentUserId) {
      subjects.forEach(s => syncUpsertSubject(s, currentUserId!));
    }
  },
  addSubject(subject: Omit<SubjectItem, 'id'>): SubjectItem {
    const subjects = this.getSubjects();
    const newSubject: SubjectItem = { ...subject, id: generateUniqueId('sub') };
    const updated = [...subjects, newSubject];
    setStored('subjects', updated);
    if (currentUserId) {
      syncUpsertSubject(newSubject, currentUserId);
    }
    return newSubject;
  },
  updateSubject(id: string, updates: Partial<SubjectItem>): void {
    const subjects = this.getSubjects().map(s => s.id === id ? { ...s, ...updates } : s);
    setStored('subjects', subjects);
    const sub = subjects.find(s => s.id === id);
    if (sub && currentUserId) {
      syncUpsertSubject(sub, currentUserId);
    }
  },
  deleteSubject(id: string): void {
    const subjects = this.getSubjects().filter(s => s.id !== id);
    setStored('subjects', subjects);
    if (currentUserId) {
      syncDeleteSubject(id, currentUserId);
    }
  },
  resetSubjectsToDefault(): void {
    this.saveSubjects(DEFAULT_SUBJECTS);
  },
  recalculateSubjectStats(): void {
    const entries = this.getStudyEntries();
    const subjects = this.getSubjects();
    const updated = subjects.map(sub => {
      const related = entries.filter(e => e.subject.toLowerCase() === sub.name.toLowerCase());
      const hours = related.reduce((sum, e) => sum + (e.durationHours || 0), 0);
      const revisions = related.filter(e => e.revision).length;
      const pyqs = related.reduce((sum, e) => sum + (e.pyqCount || 0), 0);
      const mcqs = related.reduce((sum, e) => sum + (e.mcqCount || 0), 0);
      return {
        ...sub,
        studyHours: Math.round((sub.studyHours + (hours > 0 ? 0 : 0)) * 10) / 10,
        revisionCount: Math.max(sub.revisionCount, revisions),
        pyqCount: Math.max(sub.pyqCount, pyqs),
        mcqCount: Math.max(sub.mcqCount, mcqs)
      };
    });
    setStored('subjects', updated);
  },

  // 6. Books
  getBooks(): BookItem[] {
    return getStored<BookItem[]>('books', DEFAULT_BOOKS);
  },
  saveBooks(books: BookItem[]): void {
    setStored('books', books);
    if (currentUserId) {
      books.forEach(b => syncUpsertBook(b, currentUserId!));
    }
  },
  addBook(book: Omit<BookItem, 'id'>): BookItem {
    const books = this.getBooks();
    const newBook: BookItem = { ...book, id: generateUniqueId('book') };
    const updated = [...books, newBook];
    setStored('books', updated);
    if (currentUserId) {
      syncUpsertBook(newBook, currentUserId);
    }
    return newBook;
  },
  updateBook(id: string, updates: Partial<BookItem>): void {
    const books = this.getBooks().map(b => {
      if (b.id === id) {
        const merged = { ...b, ...updates };
        if (updates.completedPages !== undefined && merged.totalPages > 0) {
          merged.progressPercent = Math.min(100, Math.round((merged.completedPages / merged.totalPages) * 100));
        }
        return merged;
      }
      return b;
    });
    setStored('books', books);
    const b = books.find(it => it.id === id);
    if (b && currentUserId) {
      syncUpsertBook(b, currentUserId);
    }
  },
  deleteBook(id: string): void {
    const books = this.getBooks().filter(b => b.id !== id);
    setStored('books', books);
    if (currentUserId) {
      syncDeleteBook(id, currentUserId);
    }
  },

  // 7. PYQs
  getPYQs(): PYQItem[] {
    return getStored<PYQItem[]>('pyqs', DEFAULT_PYQS);
  },
  addPYQ(pyq: Omit<PYQItem, 'id' | 'createdAt'>): PYQItem {
    const pyqs = this.getPYQs();
    const newPYQ: PYQItem = {
      ...pyq,
      id: generateUniqueId('pyq'),
      createdAt: getSystemDateString()
    };
    setStored('pyqs', [newPYQ, ...pyqs]);
    if (currentUserId) {
      syncUpsertPYQ(newPYQ, currentUserId);
    }
    return newPYQ;
  },
  updatePYQ(id: string, updates: Partial<PYQItem>): void {
    const pyqs = this.getPYQs().map(p => p.id === id ? { ...p, ...updates } : p);
    setStored('pyqs', pyqs);
    const p = pyqs.find(it => it.id === id);
    if (p && currentUserId) {
      syncUpsertPYQ(p, currentUserId);
    }
  },
  deletePYQ(id: string): void {
    const pyqs = this.getPYQs().filter(p => p.id !== id);
    setStored('pyqs', pyqs);
    if (currentUserId) {
      syncDeletePYQ(id, currentUserId);
    }
  },

  // 8. MCQs
  getMCQs(): MCQEntry[] {
    return getStored<MCQEntry[]>('mcqs', DEFAULT_MCQS);
  },
  addMCQ(entry: Omit<MCQEntry, 'id' | 'accuracy'>): MCQEntry {
    const mcqs = this.getMCQs();
    const attempted = entry.totalQuestions - (entry.skipped || 0);
    const accuracy = attempted > 0 ? Math.round((entry.correct / attempted) * 1000) / 10 : 0;
    const newMCQ: MCQEntry = {
      ...entry,
      id: generateUniqueId('mcq'),
      accuracy
    };
    setStored('mcqs', [newMCQ, ...mcqs]);
    if (currentUserId) {
      syncUpsertMCQ(newMCQ, currentUserId);
    }
    return newMCQ;
  },
  deleteMCQ(id: string): void {
    const mcqs = this.getMCQs().filter(m => m.id !== id);
    setStored('mcqs', mcqs);
    if (currentUserId) {
      syncDeleteMCQ(id, currentUserId);
    }
  },

  // 9. Tests & Mocks
  getTests(): TestEntry[] {
    return getStored<TestEntry[]>('tests', DEFAULT_TESTS);
  },
  addTest(entry: Omit<TestEntry, 'id' | 'percentage'>): TestEntry {
    const tests = this.getTests();
    const percentage = entry.maxScore > 0 ? Math.round((entry.score / entry.maxScore) * 1000) / 10 : 0;
    const newTest: TestEntry = {
      ...entry,
      id: generateUniqueId('test'),
      percentage
    };
    setStored('tests', [newTest, ...tests]);
    if (currentUserId) {
      syncUpsertTest(newTest, currentUserId);
    }
    return newTest;
  },
  updateTest(id: string, updates: Partial<TestEntry>): void {
    const tests = this.getTests().map(t => {
      if (t.id === id) {
        const merged = { ...t, ...updates };
        if (merged.maxScore > 0) {
          merged.percentage = Math.round((merged.score / merged.maxScore) * 1000) / 10;
        }
        return merged;
      }
      return t;
    });
    setStored('tests', tests);
    const t = tests.find(it => it.id === id);
    if (t && currentUserId) {
      syncUpsertTest(t, currentUserId);
    }
  },
  deleteTest(id: string): void {
    const tests = this.getTests().filter(t => t.id !== id);
    setStored('tests', tests);
    if (currentUserId) {
      syncDeleteTest(id, currentUserId);
    }
  },

  // 10. Answer Writing
  getAnswers(): AnswerWritingEntry[] {
    return getStored<AnswerWritingEntry[]>('answers', DEFAULT_ANSWERS);
  },
  addAnswer(entry: Omit<AnswerWritingEntry, 'id'>): AnswerWritingEntry {
    const answers = this.getAnswers();
    const newAnswer: AnswerWritingEntry = {
      ...entry,
      id: generateUniqueId('ans')
    };
    setStored('answers', [newAnswer, ...answers]);
    if (currentUserId) {
      syncUpsertAnswer(newAnswer, currentUserId);
    }
    return newAnswer;
  },
  updateAnswer(id: string, updates: Partial<AnswerWritingEntry>): void {
    const answers = this.getAnswers().map(a => a.id === id ? { ...a, ...updates } : a);
    setStored('answers', answers);
    const a = answers.find(it => it.id === id);
    if (a && currentUserId) {
      syncUpsertAnswer(a, currentUserId);
    }
  },
  deleteAnswer(id: string): void {
    const answers = this.getAnswers().filter(a => a.id !== id);
    setStored('answers', answers);
    if (currentUserId) {
      syncDeleteAnswer(id, currentUserId);
    }
  },
  getAnswerWriting(): AnswerWritingEntry[] {
    return this.getAnswers();
  },
  addAnswerWriting(entry: Omit<AnswerWritingEntry, 'id'>): AnswerWritingEntry {
    return this.addAnswer(entry);
  },
  deleteAnswerWriting(id: string): void {
    this.deleteAnswer(id);
  },

  // 11. Diary
  getDiaryEntries(): DiaryEntry[] {
    return getStored<DiaryEntry[]>('diary_entries', DEFAULT_DIARY_ENTRIES);
  },
  getDiaryEntryByDate(date: string): DiaryEntry | undefined {
    const entry = this.getDiaryEntries().find(d => d.date === date);
    if (!entry) return undefined;
    return {
      ...entry,
      whatILearned: entry.whatILearned || entry.whatIStudied || '',
      whatIStudied: entry.whatIStudied || entry.whatILearned || '',
      whatICompleted: entry.whatICompleted || '',
      whatWentWell: entry.whatWentWell || '',
      whatCouldBeImproved: entry.whatCouldBeImproved || entry.howToImproveTomorrow || '',
      todaysLesson: entry.todaysLesson || '',
      biggestAchievement: entry.biggestAchievement || '',
      mood: entry.mood || 'Focused',
      thoughtsAndFeelings: entry.thoughtsAndFeelings || '',
      tomorrowsPlan: entry.tomorrowsPlan || '',
      quoteForToday: entry.quoteForToday || '“चलो कुछ ऐसा कर जाएँ, कि नाम हमारा मिसाल बन जाए।”'
    };
  },
  saveDiaryEntry(entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): DiaryEntry {
    const entries = this.getDiaryEntries();
    const now = new Date().toISOString();
    const existingIndex = entries.findIndex(e => e.date === entry.date);

    let result: DiaryEntry;
    if (existingIndex >= 0) {
      const existing = entries[existingIndex];
      result = {
        ...existing,
        ...entry,
        id: existing.id,
        updatedAt: now
      };
      entries[existingIndex] = result;
      setStored('diary_entries', entries);
    } else {
      result = {
        ...entry,
        id: generateUniqueId('diary'),
        createdAt: now,
        updatedAt: now
      };
      setStored('diary_entries', [result, ...entries]);
    }
    if (currentUserId) {
      syncUpsertDiary(result, currentUserId);
    }
    return result;
  },
  deleteDiaryEntry(id: string): void {
    const entries = this.getDiaryEntries().filter(e => e.id !== id);
    setStored('diary_entries', entries);
    if (currentUserId) {
      syncDeleteDiary(id, currentUserId);
    }
  },

  // 12. Goals
  getGoals(): GoalItem[] {
    return getStored<GoalItem[]>('goals', DEFAULT_GOALS);
  },
  addGoal(goal: Omit<GoalItem, 'id'>): GoalItem {
    const goals = this.getGoals();
    const newGoal: GoalItem = { ...goal, id: generateUniqueId('goal') };
    setStored('goals', [...goals, newGoal]);
    if (currentUserId) {
      syncUpsertGoal(newGoal, currentUserId);
    }
    return newGoal;
  },
  updateGoal(id: string, updates: Partial<GoalItem>): void {
    const goals = this.getGoals().map(g => {
      if (g.id === id) {
        const merged = { ...g, ...updates };
        if (merged.progressPercent >= 100) {
          merged.status = 'Completed';
        }
        return merged;
      }
      return g;
    });
    setStored('goals', goals);
    const g = goals.find(it => it.id === id);
    if (g && currentUserId) {
      syncUpsertGoal(g, currentUserId);
    }
  },
  deleteGoal(id: string): void {
    const goals = this.getGoals().filter(g => g.id !== id);
    setStored('goals', goals);
    if (currentUserId) {
      syncDeleteGoal(id, currentUserId);
    }
  },

  // 13. Backlog
  getBacklog(): BacklogItem[] {
    return getStored<BacklogItem[]>('backlog', DEFAULT_BACKLOG);
  },
  addBacklogItem(item: Omit<BacklogItem, 'id' | 'createdAt'>): BacklogItem {
    const backlog = this.getBacklog();
    const newItem: BacklogItem = {
      ...item,
      id: generateUniqueId('backlog'),
      createdAt: getSystemDateString()
    };
    setStored('backlog', [newItem, ...backlog]);
    if (currentUserId) {
      syncUpsertBacklog(newItem, currentUserId);
    }
    return newItem;
  },
  updateBacklogItem(id: string, updates: Partial<BacklogItem>): void {
    const backlog = this.getBacklog().map(b => b.id === id ? { ...b, ...updates } : b);
    setStored('backlog', backlog);
    const b = backlog.find(it => it.id === id);
    if (b && currentUserId) {
      syncUpsertBacklog(b, currentUserId);
    }
  },
  deleteBacklogItem(id: string): void {
    const backlog = this.getBacklog().filter(b => b.id !== id);
    setStored('backlog', backlog);
    if (currentUserId) {
      syncDeleteBacklog(id, currentUserId);
    }
  },
  addBacklog(item: Omit<BacklogItem, 'id' | 'createdAt'>): BacklogItem {
    return this.addBacklogItem(item);
  },
  deleteBacklog(id: string): void {
    const item = this.getBacklog().find(b => b.id === id);
    if (item?.originalTaskId) {
      this.deleteTodayTask(item.originalTaskId);
    }
    this.deleteBacklogItem(id);
  },
  clearBacklog(id: string): void {
    const item = this.getBacklog().find(b => b.id === id);
    if (item?.originalTaskId) {
      this.updateTodayTask(item.originalTaskId, { completed: true });
    }
    this.updateBacklogItem(id, { cleared: true, status: 'Resolved' });
  },
  moveBacklogToToday(backlogId: string): void {
    const today = getSystemDateString();
    const item = this.getBacklog().find(b => b.id === backlogId);
    if (!item) return;

    if (item.originalTaskId) {
      this.updateTodayTask(item.originalTaskId, {
        date: today,
        completed: false
      });
    } else {
      this.addTodayTask({
        date: today,
        title: item.topic || item.task || 'Backlog Task',
        durationHours: 1.5,
        category: 'GS',
        completed: false,
        notes: item.notes || item.reason,
        priority: item.priority
      });
    }

    this.deleteBacklogItem(backlogId);
  },
  rescheduleBacklog(backlogId: string, newDate: string): void {
    const item = this.getBacklog().find(b => b.id === backlogId);
    if (!item) return;

    if (item.originalTaskId) {
      this.updateTodayTask(item.originalTaskId, {
        date: newDate
      });
    }

    const today = getSystemDateString();
    if (newDate >= today) {
      this.deleteBacklogItem(backlogId);
    } else {
      this.updateBacklogItem(backlogId, { plannedDate: newDate });
    }
  },

  // 14. Roadmap
  getRoadmap(): RoadmapPhase[] {
    const raw = getStored<RoadmapPhase[]>('roadmap', DEFAULT_ROADMAP_PHASES);
    if (!Array.isArray(raw) || raw.length === 0) {
      return DEFAULT_ROADMAP_PHASES;
    }
    return raw.map((phase, idx) => {
      const def = DEFAULT_ROADMAP_PHASES[idx] || DEFAULT_ROADMAP_PHASES.find(p => p.year === phase.year);
      return {
        ...def,
        ...phase,
        id: phase.id || def?.id || `phase-${phase.year}`,
        title: phase.title || def?.title || phase.phaseName,
        focus: phase.focus || def?.focus || phase.subtitle,
        status: phase.status || def?.status || (phase.isCurrent ? 'ACTIVE' : 'PLANNED'),
        milestones: Array.isArray(phase.milestones) ? phase.milestones : (def?.milestones || []),
        goals: phase.goals || def?.goals || (Array.isArray(phase.milestones) ? phase.milestones.map(m => m.title) : []),
        keyBooks: phase.keyBooks || def?.keyBooks || [],
        focusPoints: phase.focusPoints || def?.focusPoints || []
      };
    });
  },
  updateRoadmapGoal(phaseIdOrYear: string | number, goalIndex: number, _completed?: boolean): void {
    const roadmap = this.getRoadmap();
    const phase = roadmap.find(p => p.id === phaseIdOrYear || p.year === Number(phaseIdOrYear));
    if (phase && phase.milestones && phase.milestones[goalIndex]) {
      this.toggleMilestone(phase.year, phase.milestones[goalIndex].id);
    }
  },
  updateRoadmapPhase(year: number, updates: Partial<RoadmapPhase>): void {
    const roadmap = this.getRoadmap().map(r => r.year === year ? { ...r, ...updates } : r);
    setStored('roadmap', roadmap);
  },
  toggleMilestone(year: number, milestoneId: string): void {
    const roadmap = this.getRoadmap().map(r => {
      if (r.year === year) {
        const currentMilestones = r.milestones || [];
        const milestones = currentMilestones.map(m => m.id === milestoneId ? { ...m, completed: !m.completed } : m);
        const completedCount = milestones.filter(m => m.completed).length;
        const progressPercent = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;
        return { ...r, milestones, progressPercent };
      }
      return r;
    });
    setStored('roadmap', roadmap);
  },

  // 15. Calendar Events
  getCalendarEvents(): CalendarEvent[] {
    return getStored<CalendarEvent[]>('calendar_events', [
      {
        id: 'cal-1',
        title: 'PW UPSC Live Class — History',
        date: '2026-09-16',
        startTime: '19:00',
        endTime: '20:30',
        category: 'PW Class',
        description: 'Modern Indian History Live Lecture',
        status: 'Scheduled'
      },
      {
        id: 'cal-2',
        title: 'PW UPSC Sectional Test #02 (Polity)',
        date: '2026-09-20',
        startTime: '10:00',
        endTime: '12:00',
        category: 'Test',
        description: '50 MCQs Sectional Mock on Fundamental Rights & DPSP',
        status: 'Scheduled'
      },
      {
        id: 'cal-3',
        title: 'Weekly Revision & Error Log Review',
        date: '2026-09-21',
        startTime: '06:00',
        endTime: '09:00',
        category: 'Revision',
        description: 'Consolidation of weekly handwritten notes and missed MCQs',
        status: 'Scheduled'
      }
    ]);
  },
  addCalendarEvent(event: Omit<CalendarEvent, 'id'>): CalendarEvent {
    const events = this.getCalendarEvents();
    const newEvent: CalendarEvent = { ...event, id: generateUniqueId('cal') };
    const updated = [...events, newEvent];
    setStored('calendar_events', updated);
    if (currentUserId) {
      syncUpsertCalendarEvent(newEvent, currentUserId);
    }
    return newEvent;
  },
  deleteCalendarEvent(id: string): void {
    const events = this.getCalendarEvents().filter(e => e.id !== id);
    setStored('calendar_events', events);
    if (currentUserId) {
      syncDeleteCalendarEvent(id, currentUserId);
    }
  },

  // 16. Reviews
  getDailyReviews(): DailyReview[] {
    return getStored<DailyReview[]>('daily_reviews', []);
  },
  saveDailyReview(review: Omit<DailyReview, 'id' | 'submittedAt'>): DailyReview {
    const reviews = this.getDailyReviews();
    const newRev: DailyReview = {
      ...review,
      id: generateUniqueId('drev'),
      submittedAt: new Date().toISOString()
    };
    setStored('daily_reviews', [newRev, ...reviews.filter(r => r.date !== review.date)]);
    return newRev;
  },

  // 17. Calculated Metrics
  getMetrics() {
    const profile = this.getProfile();
    const mode = getEffectiveMode(profile);
    const today = getSystemDateString();
    const entries = this.getStudyEntries();
    const tasks = this.getTodayTasks();
    const backlog = this.getBacklog();
    const pyqs = this.getPYQs();
    const mcqs = this.getMCQs();
    const tests = this.getTests();
    const answers = this.getAnswers();

    // Target hours based on mode
    const targetHours = mode === 'FULL-TIME UPSC' ? profile.dailyTargetFullTimeHours : profile.dailyTargetJobHours;

    // Today's Study Hours
    const todayStudyHours = this.getDailyStudyHours(today);

    // Weekly Study Hours (last 7 days ending today)
    const last7Days = getConsistencyDateRange(7);
    const weeklyStudyHours = Math.round(last7Days.reduce((sum, d) => sum + this.getDailyStudyHours(d.dateStr), 0) * 10) / 10;

    // Monthly Study Hours (current month)
    const currentMonthPrefix = today.slice(0, 7);
    const monthlyEntries = entries.filter(e => e.date.startsWith(currentMonthPrefix));
    const monthlyStudyHours = Math.round(monthlyEntries.reduce((sum, e) => sum + (e.durationHours || 0), 0) * 10) / 10;

    // Total Study Hours
    const totalStudyHours = Math.round(entries.reduce((sum, e) => sum + (e.durationHours || 0), 0) * 10) / 10;

    // Daily Tasks Completed
    const todayTasksList = tasks.filter(t => t.date === today);
    const tasksCompleted = todayTasksList.filter(t => t.completed).length;
    const tasksTotal = todayTasksList.length;

    // Backlog count (pending)
    const pendingBacklogCount = backlog.filter(b => b.status === 'Pending').length;

    // Streak calculation
    let streak = 0;
    const dateSet = new Set(entries.map(e => e.date));
    const cur = new Date(today);
    while (true) {
      const dStr = cur.toISOString().split('T')[0];
      if (dateSet.has(dStr)) {
        streak++;
        cur.setDate(cur.getDate() - 1);
      } else {
        // If today has no entry yet, check yesterday to continue streak
        if (streak === 0 && dStr === today) {
          cur.setDate(cur.getDate() - 1);
          continue;
        }
        break;
      }
    }

    return {
      todayStudyHours,
      targetHours,
      weeklyStudyHours,
      monthlyStudyHours,
      totalStudyHours,
      tasksCompleted,
      completedTasks: tasksCompleted,
      tasksTotal,
      totalTasks: tasksTotal,
      pendingBacklog: pendingBacklogCount,
      pendingBacklogCount,
      streak,
      totalPyqsAttempted: pyqs.length,
      totalMcqsAttempted: mcqs.reduce((s, m) => s + (m.totalQuestions || 0), 0),
      totalTestsTaken: tests.length,
      totalAnswersWritten: answers.length,
      targetAchievementPercent: targetHours > 0 ? Math.min(100, Math.round((todayStudyHours / targetHours) * 100)) : 0
    };
  },

  // Export / Backup all data
  exportAllData(): string {
    const payload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      profile: this.getProfile(),
      schedule: this.getSchedule(),
      todayTasks: this.getAllTasks(),
      studyEntries: this.getStudyEntries(),
      subjects: this.getSubjects(),
      books: this.getBooks(),
      pyqs: this.getPYQs(),
      mcqs: this.getMCQs(),
      tests: this.getTests(),
      answers: this.getAnswers(),
      diaryEntries: this.getDiaryEntries(),
      goals: this.getGoals(),
      backlog: this.getBacklog(),
      roadmap: this.getRoadmap(),
      calendarEvents: this.getCalendarEvents()
    };
    return JSON.stringify(payload, null, 2);
  },
  exportDataJSON(): string {
    return this.exportAllData();
  },

  // Import / Restore all data
  importAllData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.profile) setStored('profile', data.profile);
      if (data.schedule) setStored('schedule', data.schedule);
      if (data.todayTasks) setStored('today_tasks', data.todayTasks);
      if (data.studyEntries) setStored('study_entries', data.studyEntries);
      if (data.subjects) setStored('subjects', data.subjects);
      if (data.books) setStored('books', data.books);
      if (data.pyqs) setStored('pyqs', data.pyqs);
      if (data.mcqs) setStored('mcqs', data.mcqs);
      if (data.tests) setStored('tests', data.tests);
      if (data.answers) setStored('answers', data.answers);
      if (data.diaryEntries) setStored('diary_entries', data.diaryEntries);
      if (data.goals) setStored('goals', data.goals);
      if (data.backlog) setStored('backlog', data.backlog);
      if (data.roadmap) setStored('roadmap', data.roadmap);
      if (data.calendarEvents) setStored('calendar_events', data.calendarEvents);
      notify();
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  },
  importDataJSON(jsonString: string): boolean {
    return this.importAllData(jsonString);
  },

  // Reset to initial demo state
  resetAll(): void {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    notify();
  }
};
