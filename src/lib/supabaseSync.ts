import { getSupabase } from './supabaseClient';
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
} from '../types';

export interface SyncStatus {
  isSyncing: boolean;
  isMigrating: boolean;
  lastSyncTime: string | null;
  error: string | null;
  migrationSuccessMessage: string | null;
  migrationErrorMessage: string | null;
}

let syncStatus: SyncStatus = {
  isSyncing: false,
  isMigrating: false,
  lastSyncTime: null,
  error: null,
  migrationSuccessMessage: null,
  migrationErrorMessage: null,
};

type SyncListener = (status: SyncStatus) => void;
const syncListeners = new Set<SyncListener>();

export function subscribeToSyncStatus(listener: SyncListener) {
  syncListeners.add(listener);
  listener(syncStatus);
  return () => {
    syncListeners.delete(listener);
  };
}

function updateSyncStatus(updates: Partial<SyncStatus>) {
  syncStatus = { ...syncStatus, ...updates };
  syncListeners.forEach((fn) => fn(syncStatus));
}

// -------------------------------------------------------------
// Data Fetcher: Loads all personal UPSC data from Supabase tables
// -------------------------------------------------------------
export async function fetchUserDataFromSupabase(userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return null;

  updateSyncStatus({ isSyncing: true, error: null });

  try {
    const [
      profileRes,
      scheduleRes,
      tasksRes,
      studyRes,
      subjectsRes,
      booksRes,
      pyqRes,
      mcqRes,
      testRes,
      answersRes,
      diaryRes,
      goalsRes,
      backlogRes,
      calendarRes,
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('daily_schedule').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      supabase.from('today_tasks').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      supabase.from('study_entries').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('subjects').select('*').eq('user_id', userId),
      supabase.from('books').select('*').eq('user_id', userId),
      supabase.from('pyq_entries').select('*').eq('user_id', userId).order('year', { ascending: false }),
      supabase.from('mcq_entries').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('test_entries').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('answer_writing').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('diary_entries').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('goals').select('*').eq('user_id', userId),
      supabase.from('backlog').select('*').eq('user_id', userId),
      supabase.from('calendar_events').select('*').eq('user_id', userId),
    ]);

    // Format Profile
    let profile: Partial<UserProfile> | null = null;
    if (profileRes.data) {
      const p = profileRes.data;
      profile = {
        name: p.name || 'Ravi',
        displayName: p.display_name || 'IAS Ravi Ji',
        role: p.role || 'UPSC 2029 Aspirant',
        mission: p.mission || 'First Attempt Preparation',
        tagline: p.tagline || 'चलो कुछ ऐसा कर जाएँ, कि नाम हमारा मिसाल बन जाए।',
        targetYear: p.target_year || 2029,
        firstAttemptYear: p.first_attempt_year || 2029,
        jobEndDate: p.job_end_date || '2026-12-31',
        fullTimeStartDate: p.full_time_start_date || '2027-01-01',
        dailyTargetJobHours: Number(p.daily_target_job_hours) || 5.5,
        dailyTargetFullTimeHours: Number(p.daily_target_fulltime_hours) || 12.0,
        sleepTargetHours: Number(p.sleep_target_hours) || 6.0,
        optionalSubject: p.optional_subject || 'Political Science & International Relations (PSIR)',
        profilePhoto: p.profile_photo || null,
        manualModeOverride: p.manual_mode_override || 'AUTO',
        pwClassTiming: p.pw_class_timing || '19:00 - 22:30',
      };
    }

    // Format Schedule
    const schedule: ScheduleItem[] | null = scheduleRes.data
      ? scheduleRes.data.map((s) => ({
          id: s.id,
          dayOfWeek: s.day_of_week,
          startTime: s.start_time,
          endTime: s.end_time,
          title: s.title,
          durationHours: Number(s.duration_hours) || 1,
          category: s.category,
          isStudy: s.is_study ?? true,
          completed: s.completed ?? false,
          mode: s.mode || 'JOB + UPSC',
          notes: s.notes || undefined,
        }))
      : null;

    // Format Tasks
    const todayTasks: TodayTask[] | null = tasksRes.data
      ? tasksRes.data.map((t) => ({
          id: t.id,
          date: t.date,
          title: t.title,
          durationHours: Number(t.duration_hours) || 1,
          category: t.category,
          completed: t.completed ?? false,
          order: t.order_num || 0,
          notes: t.notes || undefined,
        }))
      : null;

    // Format Study Entries
    const studyEntries: StudyEntry[] | null = studyRes.data
      ? studyRes.data.map((e) => ({
          id: e.id,
          date: e.date,
          subject: e.subject,
          topic: e.topic,
          studyType: e.study_type,
          startTime: e.start_time || '00:00',
          endTime: e.end_time || '00:00',
          durationHours: Number(e.duration_hours) || 0,
          source: e.source || '',
          book: e.book || undefined,
          lecture: e.lecture || undefined,
          revision: e.revision ?? false,
          mcqCount: e.mcq_count || 0,
          pyqCount: e.pyq_count || 0,
          answerWritingCount: e.answer_writing_count || 0,
          testCount: e.test_count || 0,
          status: e.status || 'Completed',
          difficulty: e.difficulty || 'Moderate',
          notes: e.notes || '',
          createdAt: e.created_at || new Date().toISOString(),
        }))
      : null;

    // Format Subjects
    const subjects: SubjectItem[] | null = subjectsRes.data
      ? subjectsRes.data.map((sub) => ({
          id: sub.id,
          name: sub.name,
          paper: sub.paper || undefined,
          category: sub.category,
          studyHours: Number(sub.study_hours) || 0,
          totalTopics: sub.total_topics || 0,
          completedTopics: sub.completed_topics || 0,
          revisionCount: sub.revision_count || 0,
          pyqCount: sub.pyq_count || 0,
          mcqCount: sub.mcq_count || 0,
          testCount: sub.test_count || 0,
          color: sub.color || '#4F46E5',
          description: sub.description || undefined,
        }))
      : null;

    // Format Books
    const books: BookItem[] | null = booksRes.data
      ? booksRes.data.map((b) => ({
          id: b.id,
          name: b.name,
          subject: b.subject,
          author: b.author || '',
          type: b.type || 'Standard Book',
          totalPages: b.total_pages || 100,
          completedPages: b.completed_pages || 0,
          progressPercent: Number(b.progress_percent) || 0,
          status: b.status || 'Reading',
          notes: b.notes || undefined,
        }))
      : null;

    // Format PYQs
    const pyqs: PYQItem[] | null = pyqRes.data
      ? pyqRes.data.map((p) => ({
          id: p.id,
          year: p.year,
          exam: p.exam,
          paper: p.paper || undefined,
          subject: p.subject,
          topic: p.topic,
          question: p.question,
          attempted: p.attempted ?? true,
          correct: p.correct ?? true,
          status: p.status || 'Solved',
          explanation: p.explanation || undefined,
          revisionRequired: p.revision_required ?? false,
          createdAt: p.created_at || undefined,
        }))
      : null;

    // Format MCQs
    const mcqs: MCQEntry[] | null = mcqRes.data
      ? mcqRes.data.map((m) => ({
          id: m.id,
          date: m.date,
          subject: m.subject,
          topic: m.topic,
          totalQuestions: m.total_questions || 0,
          correct: m.correct || 0,
          wrong: m.wrong || 0,
          skipped: m.skipped || 0,
          accuracy: Number(m.accuracy) || 0,
          source: m.source || '',
          notes: m.notes || undefined,
        }))
      : null;

    // Format Tests
    const tests: TestEntry[] | null = testRes.data
      ? testRes.data.map((t) => ({
          id: t.id,
          testName: t.test_name,
          date: t.date,
          subject: t.subject,
          testType: t.test_type || 'Sectional',
          totalQuestions: t.total_questions || 100,
          attempted: t.attempted || 0,
          correct: t.correct || 0,
          wrong: t.wrong || 0,
          score: Number(t.score) || 0,
          maxScore: Number(t.max_score) || 200,
          percentage: Number(t.percentage) || 0,
          timeTakenMinutes: t.time_taken_minutes || 120,
          mistakes: t.mistakes || undefined,
          improvementNotes: t.improvement_notes || undefined,
        }))
      : null;

    // Format Answers
    const answers: AnswerWritingEntry[] | null = answersRes.data
      ? answersRes.data.map((a) => ({
          id: a.id,
          date: a.date,
          question: a.question,
          subject: a.subject || '',
          topic: a.topic || '',
          wordLimit: a.word_limit || 250,
          wordsWritten: a.words_written || 0,
          timeTakenMinutes: Number(a.time_taken_minutes) || 9,
          selfScore: Number(a.self_score) || 0,
          maxScore: Number(a.max_score) || 15,
          modelAnswerReviewed: a.model_answer_reviewed ?? false,
          improvementNotes: a.improvement_notes || undefined,
        }))
      : null;

    // Format Diary
    const diaryEntries: DiaryEntry[] | null = diaryRes.data
      ? diaryRes.data.map((d) => ({
          id: d.id,
          date: d.date,
          whatILearned: d.what_i_learned || '',
          whatICompleted: d.what_i_completed || '',
          mistakesMade: d.mistakes_made || '',
          howToImproveTomorrow: d.how_to_improve_tomorrow || '',
          biggestAchievement: d.biggest_achievement || '',
          todaysLesson: d.todays_lesson || '',
          mood: d.mood || 'Determined',
          overallRating: d.overall_rating || 5,
          createdAt: d.created_at || undefined,
          updatedAt: d.updated_at || undefined,
        }))
      : null;

    // Format Goals
    const goals: GoalItem[] | null = goalsRes.data
      ? goalsRes.data.map((g) => ({
          id: g.id,
          title: g.title,
          category: g.category,
          deadline: g.deadline || '',
          progressPercent: Number(g.progress_percent) || 0,
          status: g.status || 'In Progress',
          notes: g.notes || undefined,
        }))
      : null;

    // Format Backlog
    const backlog: BacklogItem[] | null = backlogRes.data
      ? backlogRes.data.map((b) => ({
          id: b.id,
          task: b.task,
          category: b.category,
          priority: b.priority || 'Medium',
          deadline: b.deadline || undefined,
          status: b.status || 'Pending',
          notes: b.notes || undefined,
        }))
      : null;

    // Format Calendar Events
    const calendarEvents: CalendarEvent[] | null = calendarRes.data
      ? calendarRes.data.map((c) => ({
          id: c.id,
          title: c.title,
          date: c.date,
          startTime: c.start_time || '06:00',
          endTime: c.end_time || '07:30',
          category: c.category || 'Study',
          description: c.description || '',
          status: c.status || 'Scheduled',
        }))
      : null;

    updateSyncStatus({
      isSyncing: false,
      lastSyncTime: new Date().toLocaleTimeString(),
      error: null,
    });

    return {
      profile,
      schedule,
      todayTasks,
      studyEntries,
      subjects,
      books,
      pyqs,
      mcqs,
      tests,
      answers,
      diaryEntries,
      goals,
      backlog,
      calendarEvents,
    };
  } catch (err: any) {
    console.error('Error fetching Supabase data:', err);
    updateSyncStatus({
      isSyncing: false,
      error: err.message || 'Failed to sync with Supabase',
    });
    return null;
  }
}

// -------------------------------------------------------------
// Safe Data Migration: Migrates local UPSC data to Supabase
// -------------------------------------------------------------
export async function migrateLocalDataToSupabase(
  userId: string,
  localData: {
    profile: UserProfile;
    schedule: ScheduleItem[];
    todayTasks: TodayTask[];
    studyEntries: StudyEntry[];
    subjects: SubjectItem[];
    books: BookItem[];
    pyqs: PYQItem[];
    mcqs: MCQEntry[];
    tests: TestEntry[];
    answers: AnswerWritingEntry[];
    diaryEntries: DiaryEntry[];
    goals: GoalItem[];
    backlog: BacklogItem[];
    calendarEvents: CalendarEvent[];
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase || !userId) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  updateSyncStatus({
    isMigrating: true,
    migrationErrorMessage: null,
    migrationSuccessMessage: null,
  });

  try {
    // 1. Profile
    const p = localData.profile;
    await supabase.from('profiles').upsert(
      {
        user_id: userId,
        name: p.name || 'Ravi',
        display_name: 'IAS Ravi Ji',
        role: p.role || 'UPSC 2029 Aspirant',
        mission: p.mission || 'First Attempt Preparation',
        tagline: p.tagline || 'चलो कुछ ऐसा कर जाएँ, कि नाम हमारा मिसाल बन जाए।',
        target_year: p.targetYear || 2029,
        first_attempt_year: p.firstAttemptYear || 2029,
        job_end_date: p.jobEndDate || '2026-12-31',
        full_time_start_date: p.fullTimeStartDate || '2027-01-01',
        daily_target_job_hours: p.dailyTargetJobHours || 5.5,
        daily_target_fulltime_hours: p.dailyTargetFullTimeHours || 12.0,
        sleep_target_hours: p.sleepTargetHours || 6.0,
        optional_subject: p.optionalSubject || 'Political Science & International Relations (PSIR)',
        profile_photo: p.profilePhoto,
        manual_mode_override: p.manualModeOverride || 'AUTO',
        pw_class_timing: p.pwClassTiming || '19:00 - 22:30',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    // 2. Schedule
    if (localData.schedule.length > 0) {
      const scheduleRows = localData.schedule.map((s) => ({
        id: s.id,
        user_id: userId,
        day_of_week: s.dayOfWeek,
        start_time: s.startTime,
        end_time: s.endTime,
        title: s.title,
        duration_hours: s.durationHours,
        category: s.category,
        is_study: s.isStudy,
        completed: s.completed,
        mode: s.mode,
        notes: s.notes || null,
      }));
      await supabase.from('daily_schedule').upsert(scheduleRows, { onConflict: 'id' });
    }

    // 3. Today Tasks
    if (localData.todayTasks.length > 0) {
      const taskRows = localData.todayTasks.map((t) => ({
        id: t.id,
        user_id: userId,
        date: t.date,
        title: t.title,
        duration_hours: t.durationHours,
        category: t.category,
        completed: t.completed,
        order_num: t.order,
        notes: t.notes || null,
      }));
      await supabase.from('today_tasks').upsert(taskRows, { onConflict: 'id' });
    }

    // 4. Study Entries
    if (localData.studyEntries.length > 0) {
      const studyRows = localData.studyEntries.map((e) => ({
        id: e.id,
        user_id: userId,
        date: e.date,
        subject: e.subject,
        topic: e.topic,
        study_type: e.studyType,
        start_time: e.startTime,
        end_time: e.endTime,
        duration_hours: e.durationHours,
        source: e.source,
        book: e.book || null,
        lecture: e.lecture || null,
        revision: e.revision,
        mcq_count: e.mcqCount || 0,
        pyq_count: e.pyqCount || 0,
        answer_writing_count: e.answerWritingCount || 0,
        test_count: e.testCount || 0,
        status: e.status,
        difficulty: e.difficulty,
        notes: e.notes || null,
      }));
      await supabase.from('study_entries').upsert(studyRows, { onConflict: 'id' });
    }

    // 5. Subjects
    if (localData.subjects.length > 0) {
      const subjectRows = localData.subjects.map((sub) => ({
        id: sub.id,
        user_id: userId,
        name: sub.name,
        paper: sub.paper || null,
        category: sub.category,
        study_hours: sub.studyHours,
        total_topics: sub.totalTopics,
        completed_topics: sub.completedTopics,
        revision_count: sub.revisionCount,
        pyq_count: sub.pyqCount,
        mcq_count: sub.mcqCount,
        test_count: sub.testCount,
        color: sub.color,
        description: sub.description || null,
      }));
      await supabase.from('subjects').upsert(subjectRows, { onConflict: 'id' });
    }

    // 6. Books
    if (localData.books.length > 0) {
      const bookRows = localData.books.map((b) => ({
        id: b.id,
        user_id: userId,
        name: b.name,
        subject: b.subject,
        author: b.author || null,
        type: b.type,
        total_pages: b.totalPages,
        completed_pages: b.completedPages || 0,
        progress_percent: b.progressPercent,
        status: b.status,
        notes: b.notes || null,
      }));
      await supabase.from('books').upsert(bookRows, { onConflict: 'id' });
    }

    // 7. PYQs
    if (localData.pyqs.length > 0) {
      const pyqRows = localData.pyqs.map((p) => ({
        id: p.id,
        user_id: userId,
        year: p.year,
        exam: p.exam,
        paper: p.paper || null,
        subject: p.subject,
        topic: p.topic,
        question: p.question,
        attempted: p.attempted,
        correct: p.correct,
        status: p.status,
        explanation: p.explanation || null,
        revision_required: p.revisionRequired,
      }));
      await supabase.from('pyq_entries').upsert(pyqRows, { onConflict: 'id' });
    }

    // 8. MCQs
    if (localData.mcqs.length > 0) {
      const mcqRows = localData.mcqs.map((m) => ({
        id: m.id,
        user_id: userId,
        date: m.date,
        subject: m.subject,
        topic: m.topic,
        total_questions: m.totalQuestions,
        correct: m.correct,
        wrong: m.wrong || 0,
        skipped: m.skipped || 0,
        accuracy: m.accuracy,
        source: m.source,
        notes: m.notes || null,
      }));
      await supabase.from('mcq_entries').upsert(mcqRows, { onConflict: 'id' });
    }

    // 9. Tests
    if (localData.tests.length > 0) {
      const testRows = localData.tests.map((t) => ({
        id: t.id,
        user_id: userId,
        test_name: t.testName,
        date: t.date,
        subject: t.subject,
        test_type: t.testType,
        total_questions: t.totalQuestions,
        attempted: t.attempted,
        correct: t.correct,
        wrong: t.wrong,
        score: t.score,
        max_score: t.maxScore,
        percentage: t.percentage,
        time_taken_minutes: t.timeTakenMinutes,
        mistakes: t.mistakes || null,
        improvement_notes: t.improvementNotes || null,
      }));
      await supabase.from('test_entries').upsert(testRows, { onConflict: 'id' });
    }

    // 10. Answer Writing
    if (localData.answers.length > 0) {
      const answerRows = localData.answers.map((a) => ({
        id: a.id,
        user_id: userId,
        date: a.date,
        question: a.question,
        subject: a.subject || null,
        topic: a.topic || null,
        word_limit: a.wordLimit,
        words_written: a.wordsWritten,
        time_taken_minutes: a.timeTakenMinutes,
        self_score: a.selfScore,
        max_score: a.maxScore,
        model_answer_reviewed: a.modelAnswerReviewed,
        improvement_notes: a.improvementNotes || null,
      }));
      await supabase.from('answer_writing').upsert(answerRows, { onConflict: 'id' });
    }

    // 11. Diary
    if (localData.diaryEntries.length > 0) {
      const diaryRows = localData.diaryEntries.map((d) => ({
        id: d.id,
        user_id: userId,
        date: d.date,
        what_i_learned: d.whatILearned,
        what_i_completed: d.whatICompleted,
        mistakes_made: d.mistakesMade || null,
        how_to_improve_tomorrow: d.howToImproveTomorrow || null,
        biggest_achievement: d.biggestAchievement || null,
        todays_lesson: d.todaysLesson || null,
        mood: d.mood,
        overall_rating: d.overallRating,
      }));
      await supabase.from('diary_entries').upsert(diaryRows, { onConflict: 'id' });
    }

    // 12. Goals
    if (localData.goals.length > 0) {
      const goalRows = localData.goals.map((g) => ({
        id: g.id,
        user_id: userId,
        title: g.title,
        category: g.category,
        deadline: g.deadline || null,
        progress_percent: g.progressPercent,
        status: g.status,
        notes: g.notes || null,
      }));
      await supabase.from('goals').upsert(goalRows, { onConflict: 'id' });
    }

    // 13. Backlog
    if (localData.backlog.length > 0) {
      const backlogRows = localData.backlog.map((b) => ({
        id: b.id,
        user_id: userId,
        task: b.task,
        category: b.category || 'Pending Topic',
        priority: b.priority,
        deadline: b.deadline || null,
        status: b.status,
        notes: b.notes || null,
      }));
      await supabase.from('backlog').upsert(backlogRows, { onConflict: 'id' });
    }

    // 14. Calendar Events
    if (localData.calendarEvents.length > 0) {
      const calRows = localData.calendarEvents.map((c) => ({
        id: c.id,
        user_id: userId,
        title: c.title,
        date: c.date,
        start_time: c.startTime,
        end_time: c.endTime,
        category: c.category,
        description: c.description || null,
        status: c.status,
      }));
      await supabase.from('calendar_events').upsert(calRows, { onConflict: 'id' });
    }

    updateSyncStatus({
      isMigrating: false,
      migrationSuccessMessage: 'Your existing study data has been successfully uploaded to Supabase Cloud!',
      lastSyncTime: new Date().toLocaleTimeString(),
    });

    return { success: true };
  } catch (err: any) {
    console.error('Migration error:', err);
    updateSyncStatus({
      isMigrating: false,
      migrationErrorMessage:
        'Your existing data could not be migrated yet. Your current data has been preserved.',
    });
    return {
      success: false,
      error: 'Your existing data could not be migrated yet. Your current data has been preserved.',
    };
  }
}

// -------------------------------------------------------------
// Individual Entity Cloud Mutators (Immediate Async Sync)
// -------------------------------------------------------------

export async function syncUpsertProfile(profile: UserProfile, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  try {
    await supabase.from('profiles').upsert(
      {
        user_id: userId,
        name: profile.name || 'Ravi',
        display_name: 'IAS Ravi Ji',
        role: profile.role,
        mission: profile.mission,
        tagline: profile.tagline,
        target_year: profile.targetYear,
        first_attempt_year: profile.firstAttemptYear,
        job_end_date: profile.jobEndDate,
        full_time_start_date: profile.fullTimeStartDate,
        daily_target_job_hours: profile.dailyTargetJobHours,
        daily_target_fulltime_hours: profile.dailyTargetFullTimeHours,
        sleep_target_hours: profile.sleepTargetHours,
        optional_subject: profile.optionalSubject,
        profile_photo: profile.profilePhoto,
        manual_mode_override: profile.manualModeOverride,
        pw_class_timing: profile.pwClassTiming,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  } catch (e) {
    console.error('Failed to sync profile to Supabase:', e);
  }
}

export async function syncUpsertStudyEntry(entry: StudyEntry, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  try {
    await supabase.from('study_entries').upsert(
      {
        id: entry.id,
        user_id: userId,
        date: entry.date,
        subject: entry.subject,
        topic: entry.topic,
        study_type: entry.studyType,
        start_time: entry.startTime,
        end_time: entry.endTime,
        duration_hours: entry.durationHours,
        source: entry.source,
        book: entry.book || null,
        lecture: entry.lecture || null,
        revision: entry.revision,
        mcq_count: entry.mcqCount,
        pyq_count: entry.pyqCount,
        answer_writing_count: entry.answerWritingCount,
        test_count: entry.testCount,
        status: entry.status,
        difficulty: entry.difficulty,
        notes: entry.notes || null,
      },
      { onConflict: 'id' }
    );
  } catch (e) {
    console.error('Failed to sync study entry to Supabase:', e);
  }
}

export async function syncDeleteStudyEntry(id: string, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  try {
    await supabase.from('study_entries').delete().eq('id', id).eq('user_id', userId);
  } catch (e) {
    console.error('Failed to delete study entry from Supabase:', e);
  }
}

export async function syncUpsertScheduleItem(item: ScheduleItem, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  try {
    await supabase.from('daily_schedule').upsert(
      {
        id: item.id,
        user_id: userId,
        day_of_week: item.dayOfWeek,
        start_time: item.startTime,
        end_time: item.endTime,
        title: item.title,
        duration_hours: item.durationHours,
        category: item.category,
        is_study: item.isStudy,
        completed: item.completed,
        mode: item.mode,
        notes: item.notes || null,
      },
      { onConflict: 'id' }
    );
  } catch (e) {
    console.error('Failed to sync schedule item to Supabase:', e);
  }
}

export async function syncDeleteScheduleItem(id: string, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  try {
    await supabase.from('daily_schedule').delete().eq('id', id).eq('user_id', userId);
  } catch (e) {
    console.error('Failed to delete schedule item from Supabase:', e);
  }
}

export async function syncUpsertTask(task: TodayTask, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  try {
    await supabase.from('today_tasks').upsert(
      {
        id: task.id,
        user_id: userId,
        date: task.date,
        title: task.title,
        duration_hours: task.durationHours,
        category: task.category,
        completed: task.completed,
        order_num: task.order,
        notes: task.notes || null,
      },
      { onConflict: 'id' }
    );
  } catch (e) {
    console.error('Failed to sync today task to Supabase:', e);
  }
}

export async function syncDeleteTask(id: string, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  try {
    await supabase.from('today_tasks').delete().eq('id', id).eq('user_id', userId);
  } catch (e) {
    console.error('Failed to delete task from Supabase:', e);
  }
}

export async function syncUpsertSubject(subject: SubjectItem, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  try {
    await supabase.from('subjects').upsert(
      {
        id: subject.id,
        user_id: userId,
        name: subject.name,
        paper: subject.paper || null,
        category: subject.category,
        study_hours: subject.studyHours,
        total_topics: subject.totalTopics,
        completed_topics: subject.completedTopics,
        revision_count: subject.revisionCount,
        pyq_count: subject.pyqCount,
        mcq_count: subject.mcqCount,
        test_count: subject.testCount,
        color: subject.color,
        description: subject.description || null,
      },
      { onConflict: 'id' }
    );
  } catch (e) {
    console.error('Failed to sync subject to Supabase:', e);
  }
}

export async function syncDeleteSubject(id: string, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  try {
    await supabase.from('subjects').delete().eq('id', id).eq('user_id', userId);
  } catch (e) {
    console.error('Failed to delete subject from Supabase:', e);
  }
}

export async function syncUpsertBook(book: BookItem, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  try {
    await supabase.from('books').upsert(
      {
        id: book.id,
        user_id: userId,
        name: book.name,
        subject: book.subject,
        author: book.author || null,
        type: book.type,
        total_pages: book.totalPages,
        completed_pages: book.completedPages || 0,
        progress_percent: book.progressPercent,
        status: book.status,
        notes: book.notes || null,
      },
      { onConflict: 'id' }
    );
  } catch (e) {
    console.error('Failed to sync book to Supabase:', e);
  }
}

export async function syncDeleteBook(id: string, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  try {
    await supabase.from('books').delete().eq('id', id).eq('user_id', userId);
  } catch (e) {
    console.error('Failed to delete book from Supabase:', e);
  }
}

export async function syncUpsertPYQ(pyq: PYQItem, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  try {
    await supabase.from('pyq_entries').upsert(
      {
        id: pyq.id,
        user_id: userId,
        year: pyq.year,
        exam: pyq.exam,
        paper: pyq.paper || null,
        subject: pyq.subject,
        topic: pyq.topic,
        question: pyq.question,
        attempted: pyq.attempted,
        correct: pyq.correct,
        status: pyq.status,
        explanation: pyq.explanation || null,
        revision_required: pyq.revisionRequired,
      },
      { onConflict: 'id' }
    );
  } catch (e) {
    console.error('Failed to sync PYQ to Supabase:', e);
  }
}

export async function syncDeletePYQ(id: string, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  try {
    await supabase.from('pyq_entries').delete().eq('id', id).eq('user_id', userId);
  } catch (e) {
    console.error('Failed to delete PYQ from Supabase:', e);
  }
}

export async function syncUpsertMCQ(mcq: MCQEntry, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  try {
    await supabase.from('mcq_entries').upsert(
      {
        id: mcq.id,
        user_id: userId,
        date: mcq.date,
        subject: mcq.subject,
        topic: mcq.topic,
        total_questions: mcq.totalQuestions,
        correct: mcq.correct,
        wrong: mcq.wrong || 0,
        skipped: mcq.skipped || 0,
        accuracy: mcq.accuracy,
        source: mcq.source,
        notes: mcq.notes || null,
      },
      { onConflict: 'id' }
    );
  } catch (e) {
    console.error('Failed to sync MCQ to Supabase:', e);
  }
}

export async function syncDeleteMCQ(id: string, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  try {
    await supabase.from('mcq_entries').delete().eq('id', id).eq('user_id', userId);
  } catch (e) {
    console.error('Failed to delete MCQ from Supabase:', e);
  }
}

export async function syncUpsertTest(test: TestEntry, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  try {
    await supabase.from('test_entries').upsert(
      {
        id: test.id,
        user_id: userId,
        test_name: test.testName,
        date: test.date,
        subject: test.subject,
        test_type: test.testType,
        total_questions: test.totalQuestions,
        attempted: test.attempted,
        correct: test.correct,
        wrong: test.wrong,
        score: test.score,
        max_score: test.maxScore,
        percentage: test.percentage,
        time_taken_minutes: test.timeTakenMinutes,
        mistakes: test.mistakes || null,
        improvement_notes: test.improvementNotes || null,
      },
      { onConflict: 'id' }
    );
  } catch (e) {
    console.error('Failed to sync test to Supabase:', e);
  }
}

export async function syncDeleteTest(id: string, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  try {
    await supabase.from('test_entries').delete().eq('id', id).eq('user_id', userId);
  } catch (e) {
    console.error('Failed to delete test from Supabase:', e);
  }
}

export async function syncUpsertAnswer(answer: AnswerWritingEntry, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  try {
    await supabase.from('answer_writing').upsert(
      {
        id: answer.id,
        user_id: userId,
        date: answer.date,
        question: answer.question,
        subject: answer.subject || null,
        topic: answer.topic || null,
        word_limit: answer.wordLimit,
        words_written: answer.wordsWritten,
        time_taken_minutes: answer.timeTakenMinutes,
        self_score: answer.selfScore,
        max_score: answer.maxScore,
        model_answer_reviewed: answer.modelAnswerReviewed,
        improvement_notes: answer.improvementNotes || null,
      },
      { onConflict: 'id' }
    );
  } catch (e) {
    console.error('Failed to sync answer writing to Supabase:', e);
  }
}

export async function syncDeleteAnswer(id: string, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  try {
    await supabase.from('answer_writing').delete().eq('id', id).eq('user_id', userId);
  } catch (e) {
    console.error('Failed to delete answer from Supabase:', e);
  }
}

export async function syncUpsertDiary(diary: DiaryEntry, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  try {
    await supabase.from('diary_entries').upsert(
      {
        id: diary.id,
        user_id: userId,
        date: diary.date,
        what_i_learned: diary.whatILearned,
        what_i_completed: diary.whatICompleted,
        mistakes_made: diary.mistakesMade || null,
        how_to_improve_tomorrow: diary.howToImproveTomorrow || null,
        biggest_achievement: diary.biggestAchievement || null,
        todays_lesson: diary.todaysLesson || null,
        mood: diary.mood,
        overall_rating: diary.overallRating,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
  } catch (e) {
    console.error('Failed to sync diary to Supabase:', e);
  }
}

export async function syncDeleteDiary(id: string, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  try {
    await supabase.from('diary_entries').delete().eq('id', id).eq('user_id', userId);
  } catch (e) {
    console.error('Failed to delete diary entry from Supabase:', e);
  }
}

export async function syncUpsertGoal(goal: GoalItem, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  try {
    await supabase.from('goals').upsert(
      {
        id: goal.id,
        user_id: userId,
        title: goal.title,
        category: goal.category,
        deadline: goal.deadline || null,
        progress_percent: goal.progressPercent,
        status: goal.status,
        notes: goal.notes || null,
      },
      { onConflict: 'id' }
    );
  } catch (e) {
    console.error('Failed to sync goal to Supabase:', e);
  }
}

export async function syncDeleteGoal(id: string, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  try {
    await supabase.from('goals').delete().eq('id', id).eq('user_id', userId);
  } catch (e) {
    console.error('Failed to delete goal from Supabase:', e);
  }
}

export async function syncUpsertBacklog(item: BacklogItem, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  try {
    await supabase.from('backlog').upsert(
      {
        id: item.id,
        user_id: userId,
        task: item.task,
        category: item.category || 'Pending Topic',
        priority: item.priority,
        deadline: item.deadline || null,
        status: item.status,
        notes: item.notes || null,
      },
      { onConflict: 'id' }
    );
  } catch (e) {
    console.error('Failed to sync backlog item to Supabase:', e);
  }
}

export async function syncDeleteBacklog(id: string, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  try {
    await supabase.from('backlog').delete().eq('id', id).eq('user_id', userId);
  } catch (e) {
    console.error('Failed to delete backlog item from Supabase:', e);
  }
}

export async function syncUpsertCalendarEvent(event: CalendarEvent, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  try {
    await supabase.from('calendar_events').upsert(
      {
        id: event.id,
        user_id: userId,
        title: event.title,
        date: event.date,
        start_time: event.startTime,
        end_time: event.endTime,
        category: event.category,
        description: event.description || null,
        status: event.status,
      },
      { onConflict: 'id' }
    );
  } catch (e) {
    console.error('Failed to sync calendar event to Supabase:', e);
  }
}

export async function syncDeleteCalendarEvent(id: string, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  try {
    await supabase.from('calendar_events').delete().eq('id', id).eq('user_id', userId);
  } catch (e) {
    console.error('Failed to delete calendar event from Supabase:', e);
  }
}
