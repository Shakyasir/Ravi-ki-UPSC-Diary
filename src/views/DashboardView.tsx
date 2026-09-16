import React, { useState } from 'react';
import {
  Flame,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  Calendar,
  AlertOctagon,
  ChevronRight,
  Plus,
  Compass,
  Rocket,
  Award,
  TrendingUp,
  BarChart2,
  BookMarked
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  store, 
  getEffectiveMode, 
  getDaysUntilFullTime, 
  getSystemDateString 
} from '../lib/storage';
import { RaviAvatar } from '../components/RaviAvatar';
import { TodayTask, ScheduleItem, StudyEntry } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const profile = store.getProfile();
  const metrics = store.getMetrics();
  const mode = getEffectiveMode(profile);
  const daysUntilFullTime = getDaysUntilFullTime(profile);
  const todayTasks = store.getTodayTasks();
  const schedule = store.getSchedule();
  const studyEntries = store.getStudyEntries().slice(0, 3);
  const diaryEntry = store.getDiaryEntryByDate(getSystemDateString());

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  const handleToggleTask = (id: string) => {
    const isNowDone = store.toggleTask(id);
    const updatedTasks = store.getTodayTasks();
    const allCompleted = updatedTasks.every(t => t.completed);

    if (allCompleted) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }
    }
  };

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    store.addTodayTask({
      date: getSystemDateString(),
      title: newTaskTitle.trim(),
      durationHours: 1.0,
      category: 'GS',
      completed: false
    });
    setNewTaskTitle('');
    setShowAddTask(false);
  };

  const allTasksDone = todayTasks.length > 0 && todayTasks.every(t => t.completed);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200" id="dashboard-first-screen">
      {/* 1. Profile Hero Card */}
      <section className="relative overflow-hidden bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-100/50 via-purple-50/30 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Left: Ravi's Uploaded Pixar Portrait */}
          <div className="shrink-0 flex flex-col items-center">
            <RaviAvatar size="hero" allowUpload showBadge />
            <span className="mt-2 text-[11px] text-slate-400 font-medium hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => onNavigate('settings')}>
              Hover to change photo
            </span>
          </div>

          {/* Right: Personal Identity & Mission Status */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-2">
              <span className="px-3 py-1 text-xs font-extrabold uppercase tracking-wider rounded-full bg-slate-900 text-white shadow-xs">
                {profile.displayName}
              </span>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                {profile.role}
              </span>
              <span className={`px-3 py-1 text-xs font-bold rounded-full border shadow-2xs ${
                mode === 'FULL-TIME UPSC'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-900 border-amber-300'
              }`}>
                {mode === 'FULL-TIME UPSC' ? '🚀 FULL-TIME UPSC MODE' : '💼 JOB + UPSC MODE'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans'] tracking-tight">
              Mission: {profile.mission}
            </h2>

            {/* Elegant Hindi Tagline */}
            <blockquote className="mt-2 text-sm sm:text-base text-slate-700 font-medium italic border-l-3 border-indigo-500 pl-3 py-0.5 bg-indigo-50/40 rounded-r-xl max-w-2xl">
              “{profile.tagline}”
            </blockquote>

            {/* Quick Micro Status Bar */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Target: <strong className="text-slate-900">{metrics.targetHours} hrs/day</strong></span>
              </div>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5 font-medium">
                <Rocket className="w-4 h-4 text-amber-600" />
                <span>Job Phase Ends: <strong className="text-slate-900">{profile.jobEndDate}</strong></span>
              </div>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Optional: <strong className="text-slate-900">{profile.optionalSubject}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Top Statistics Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3" id="stat-cards-grid">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Target</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{metrics.targetHours} <span className="text-xs font-semibold text-slate-500">hrs</span></p>
          <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">{mode === 'FULL-TIME UPSC' ? 'Full-Time' : 'Job Mode'}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Study</p>
          <p className="text-xl font-extrabold text-indigo-600 mt-1">{metrics.todayStudyHours} <span className="text-xs font-semibold text-slate-500">hrs</span></p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">{metrics.targetAchievementPercent}% achieved</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weekly Study</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{metrics.weeklyStudyHours} <span className="text-xs font-semibold text-slate-500">hrs</span></p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Last 7 days</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Study Streak</p>
          <p className="text-xl font-extrabold text-amber-600 mt-1 flex items-center gap-1">
            {metrics.streak} <span className="text-xs font-semibold text-slate-500">days</span>
          </p>
          <p className="text-[10px] text-amber-700 font-medium mt-0.5">Keep unbroken 🔥</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Tasks</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{metrics.completedTasks} / {metrics.totalTasks}</p>
          <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">{allTasksDone ? 'All Done! ✓' : 'In Progress'}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Backlog</p>
          <p className={`text-xl font-extrabold mt-1 ${metrics.pendingBacklog > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {metrics.pendingBacklog}
          </p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5 cursor-pointer hover:underline" onClick={() => onNavigate('backlog')}>Clear topics →</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">UPSC Target</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{profile.targetYear}</p>
          <p className="text-[10px] text-purple-600 font-semibold mt-0.5">1st Attempt</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200/80 shadow-2xs">
          <p className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">Job Phase Ends</p>
          <p className="text-xl font-extrabold text-indigo-950 mt-1">31 DEC</p>
          <p className="text-[10px] text-indigo-700 font-semibold mt-0.5">{daysUntilFullTime} days left</p>
        </div>
      </section>

      {/* 3. Main Operational Split: Today's Mission (Checklist) & Today's Schedule (Timeline) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Today's Mission Checklist */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider font-['Plus_Jakarta_Sans']">
                  TODAY'S MISSION
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Today's Progress: <strong className="text-slate-900">{metrics.completedTasks} / {metrics.totalTasks}</strong> tasks completed
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddTask(!showAddTask)}
                className="px-2.5 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Task
              </button>
              <button
                type="button"
                onClick={() => onNavigate('mission')}
                className="text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors p-1"
                title="Full Mission View"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                allTasksDone ? 'bg-emerald-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${metrics.totalTasks > 0 ? (metrics.completedTasks / metrics.totalTasks) * 100 : 0}%` }}
            />
          </div>

          {/* Celebration Banner when all tasks complete */}
          {allTasksDone && (
            <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-amber-50 via-emerald-50 to-indigo-50 border border-amber-200/80 text-center animate-in fade-in zoom-in-95 duration-200">
              <p className="text-sm font-extrabold text-slate-900 flex items-center justify-center gap-2">
                <span>🔥</span> Today’s mission complete, IAS RAVI. 🔥
              </p>
              <p className="text-xs text-slate-600 mt-0.5">5.5 hours mastered. You are one step closer to LBSNAA.</p>
            </div>
          )}

          {/* Add Task Quick Form */}
          {showAddTask && (
            <form onSubmit={handleAddNewTask} className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter study task or revision topic..."
                className="flex-1 px-3 py-1.5 text-xs bg-white rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Save
              </button>
            </form>
          )}

          {/* Task Checklist Items */}
          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-96">
            {(todayTasks || []).map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                  task.completed
                    ? 'bg-slate-50/70 border-slate-200/60 opacity-80'
                    : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    type="button"
                    className="mt-0.5 text-slate-400 group-hover:text-indigo-600 transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {task.title}
                    </p>
                    {task.notes && (
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{task.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                    {task.durationHours} hr
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700">
                    {task.category}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Daily Study Target: <strong>{metrics.targetHours} hrs</strong></span>
            <button
              onClick={() => onNavigate('register')}
              className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Log into Study Register <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column (5 cols): Today's Schedule Timeline */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider font-['Plus_Jakarta_Sans']">
                TODAY'S SCHEDULE
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {mode === 'FULL-TIME UPSC' ? 'Full-Time Timetable (12h)' : 'Job + UPSC Timetable (5.5h)'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('schedule')}
              className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-xl transition-colors"
            >
              Edit Timetable
            </button>
          </div>

          {/* Timeline Slots */}
          <div className="space-y-2 flex-1 overflow-y-auto max-h-96 pr-1 divide-y divide-slate-100">
            {(schedule || []).map((item) => (
              <div key={item.id} className="pt-2 first:pt-0 flex items-start gap-3 group">
                <div className="w-20 text-[11px] font-mono font-bold text-slate-500 shrink-0 pt-0.5">
                  {item.startTime} - {item.endTime}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-xs font-bold truncate ${item.isStudy ? 'text-slate-900' : 'text-slate-600'}`}>
                      {item.title}
                    </p>
                    {item.isStudy && (
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded shrink-0">
                        {item.durationHours}h
                      </span>
                    )}
                  </div>
                  {item.notes && (
                    <p className="text-[10px] text-slate-400 truncate">{item.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-500">
              Discipline is choosing between what you want now and what you want most.
            </span>
          </div>
        </div>
      </div>

      {/* 4. Milestone Countdown Card: 1 JANUARY 2027 FULL-TIME UPSC MODE */}
      <section className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-400 text-slate-900">
                MILESTONE
              </span>
              <span className="text-xs text-indigo-200 font-semibold">
                Job Phase Ends • Full-Time Preparation Begins
              </span>
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight text-white font-['Plus_Jakarta_Sans']">
              1 JANUARY 2027 — FULL-TIME UPSC MODE 🚀
            </h3>
            <div className="mt-2 flex items-center gap-3 text-xs text-slate-300">
              <span className="px-2 py-1 bg-slate-800 rounded-lg">Current: <strong>JOB + UPSC</strong></span>
              <span>→</span>
              <span className="px-2 py-1 bg-indigo-600 text-white rounded-lg font-bold">1 JAN 2027</span>
              <span>→</span>
              <span className="px-2 py-1 bg-emerald-700 text-white rounded-lg font-bold">FULL-TIME UPSC (12h/day)</span>
            </div>
          </div>

          <div className="text-center bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shrink-0">
            <p className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight">
              {daysUntilFullTime}
            </p>
            <p className="text-xs font-semibold text-slate-200 uppercase tracking-wider mt-0.5">
              Days Remaining
            </p>
          </div>
        </div>
      </section>

      {/* 5. UPSC 2029 Roadmap Preview (2026 -> 2027 -> 2028 -> 2029) */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider font-['Plus_Jakarta_Sans']">
              UPSC 2029 MISSION ROADMAP
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">4-Year Systematic Progression from Foundation to LBSNAA</p>
          </div>
          <button
            onClick={() => onNavigate('roadmap')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            Explore Interactive Roadmap <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl border-2 border-indigo-600 bg-indigo-50/40 relative shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-lg font-extrabold text-indigo-950">2026</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-600 text-white rounded-full">ACTIVE</span>
            </div>
            <h4 className="text-xs font-extrabold text-indigo-900 uppercase">FOUNDATION</h4>
            <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
              NCERT basics, GS understanding, Current Affairs habit, PW Foundation, 5.5h daily discipline with job.
            </p>
            <div className="mt-3 pt-2 border-t border-indigo-200/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">Progress</span>
              <span className="font-bold text-indigo-700">68%</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-lg font-extrabold text-slate-800">2027</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">Next Year</span>
            </div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase">CORE GS + NCERT + STANDARD BOOKS</h4>
            <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
              Full-time 12h/day mode, Laxmikanth, Spectrum, Ramesh Singh, PSIR optional, basic answer writing.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Progress</span>
              <span className="font-bold text-slate-400">0%</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-lg font-extrabold text-slate-800">2028</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">Upcoming</span>
            </div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase">ADVANCED + ANSWER WRITING + TESTS</h4>
            <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
              Full test series, Mains answer writing drills, Essay, CSAT mastery, rigorous 3x revision.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Progress</span>
              <span className="font-bold text-slate-400">0%</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-amber-300 bg-amber-50/30 shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-lg font-extrabold text-amber-950">2029</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500 text-white rounded-full">VICTORY</span>
            </div>
            <h4 className="text-xs font-extrabold text-amber-900 uppercase">ATTEMPT & TRIUMPH</h4>
            <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
              Prelims clearance, Mains execution, Interview board, Final Rank in Top 50. Entering LBSNAA.
            </p>
            <div className="mt-3 pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
              <span className="text-amber-800 font-medium">Goal</span>
              <span className="font-bold text-amber-900">AIR Top 50</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Recent Study Register Entries & Daily Diary Quick Glance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Study Entries (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider font-['Plus_Jakarta_Sans']">
                RECENT STUDY REGISTER
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Latest recorded preparation sessions</p>
            </div>
            <button
              onClick={() => onNavigate('register')}
              className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-xl transition-colors"
            >
              + Log Entry
            </button>
          </div>

          <div className="space-y-2.5">
            {(studyEntries || []).map((e) => (
              <div key={e.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase bg-indigo-50 px-2 py-0.5 rounded">
                    {e.subject}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-900">{e.durationHours}h</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                      {e.status} ✓
                    </span>
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-800 mt-1.5">{e.topic}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{e.date} • Source: {e.source} {e.mcqCount > 0 ? `• ${e.mcqCount} MCQs` : ''}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Diary Snapshot (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider font-['Plus_Jakarta_Sans']">
                  RAVI'S DAILY DIARY
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Private daily reflections & lessons</p>
              </div>
              <button
                onClick={() => onNavigate('diary')}
                className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-xl transition-colors"
              >
                Open Diary
              </button>
            </div>

            {diaryEntry ? (
              <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">आज का lesson:</span>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{diaryEntry.mood}</span>
                </div>
                <p className="text-xs text-slate-700 font-hindi leading-relaxed">
                  “{diaryEntry.todaysLesson}”
                </p>
                <div className="pt-2 border-t border-amber-200/50">
                  <span className="text-[11px] font-bold text-slate-600">आज की सबसे बड़ी उपलब्धि:</span>
                  <p className="text-xs text-slate-700 font-hindi mt-0.5">{diaryEntry.biggestAchievement}</p>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <BookMarked className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No diary entry written for today yet.</p>
                <p className="text-[11px] text-slate-400 mt-1">Take 5 minutes before bed to review today's lessons.</p>
                <button
                  onClick={() => onNavigate('diary')}
                  className="mt-3 px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-xl shadow-xs"
                >
                  Write Today's Diary Entry
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Overall Preparation Streak: <strong>{metrics.streak} Days</strong></span>
            <span className="text-amber-600 font-bold">Stay Consistent</span>
          </div>
        </div>
      </div>
    </div>
  );
};
