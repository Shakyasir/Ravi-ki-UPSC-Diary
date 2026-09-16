import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Rocket
} from 'lucide-react';
import { store, getDaysUntilFullTime, getProfile } from '../lib/storage';

export const AnalyticsView: React.FC = () => {
  const profile = store.getProfile();
  const metrics = store.getMetrics();
  const studyEntries = store.getStudyEntries() || [];
  const subjects = store.getSubjects() || [];
  const mcqs = store.getMCQs() || [];
  const daysUntilFullTime = getDaysUntilFullTime(profile);

  const [timeRange, setTimeRange] = useState<'7' | '14' | '30'>('7');

  // Daily study hours simulation for the last 7 days ending 2026-09-16
  const past7DaysData = [
    { day: 'Thu', date: '10 Sep', hours: 5.5, target: 5.5 },
    { day: 'Fri', date: '11 Sep', hours: 6.0, target: 5.5 },
    { day: 'Sat', date: '12 Sep', hours: 7.0, target: 5.5 },
    { day: 'Sun', date: '13 Sep', hours: 8.0, target: 5.5 },
    { day: 'Mon', date: '14 Sep', hours: 5.5, target: 5.5 },
    { day: 'Tue', date: '15 Sep', hours: 5.5, target: 5.5 },
    { day: 'Wed', date: '16 Sep', hours: metrics.todayStudyHours || 5.5, target: 5.5 },
  ];

  const maxDailyHour = 10;

  // Subject distribution
  const subjectHours = (subjects || []).map(s => ({
    name: s.name.replace('Indian ', '').replace(' & Constitution', ''),
    hours: s.studyHours,
    color: s.color || '#4f46e5'
  })).sort((a, b) => b.hours - a.hours).slice(0, 6);

  const totalSubjectHours = subjectHours.reduce((sum, s) => sum + s.hours, 0) || 1;

  // Study Category Breakdown
  const categoryStats = [
    { label: 'GS Deep Study', hours: 58, percent: 34, color: 'bg-indigo-600' },
    { label: 'PW Lectures', hours: 44, percent: 26, color: 'bg-blue-500' },
    { label: 'Standard Books', hours: 32, percent: 19, color: 'bg-purple-600' },
    { label: 'Current Affairs', hours: 18, percent: 11, color: 'bg-amber-500' },
    { label: 'MCQs & PYQs', hours: 12, percent: 7, color: 'bg-emerald-500' },
    { label: 'Answer Writing', hours: 6, percent: 3, color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Preparation Intelligence</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            ANALYTICS & PERFORMANCE METRICS
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quantitative analysis of study discipline, subject distribution, accuracy rates, and full-time transition readiness
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setTimeRange('7')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeRange === '7' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('14')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeRange === '14' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            Last 14 Days
          </button>
          <button
            onClick={() => setTimeRange('30')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeRange === '30' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Weekly Hours</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {metrics.weeklyStudyHours} <span className="text-xs font-bold text-slate-500">hrs</span>
          </p>
          <p className="text-xs text-emerald-600 font-bold mt-1">
            +8.5% vs previous week
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Current Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">
            {metrics.streak} <span className="text-xs font-bold text-slate-500">days</span>
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Zero missed days in Sep
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">MCQ Accuracy</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            82.4%
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Across 145 practice MCQs
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Full-Time Mode</span>
            <Rocket className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-indigo-950 mt-2">
            {daysUntilFullTime} <span className="text-xs font-bold text-slate-500">days left</span>
          </p>
          <p className="text-xs text-indigo-600 font-bold mt-1">
            1 Jan 2027 transition
          </p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Study Hours Visual Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider font-['Plus_Jakarta_Sans']">
                  DAILY STUDY CONSISTENCY (HOURS)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Target: 5.5 hours/day (Job + UPSC)</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                100% Target Met
              </span>
            </div>

            {/* High-Fidelity Responsive Bar Chart */}
            <div className="h-60 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-100">
              {past7DaysData.map((d, i) => {
                const heightPercent = Math.min(100, (d.hours / maxDailyHour) * 100);
                const isAboveTarget = d.hours >= d.target;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                    {/* Tooltip on hover */}
                    <span className="text-[10px] font-black text-indigo-700 mb-1 opacity-80 group-hover:opacity-100 font-mono">
                      {d.hours}h
                    </span>
                    <div className="w-full max-w-[36px] bg-slate-100 rounded-t-xl h-full flex items-end overflow-hidden p-0.5">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          isAboveTarget ? 'bg-gradient-to-t from-indigo-600 to-indigo-500' : 'bg-amber-400'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 mt-2">{d.day}</span>
                    <span className="text-[9px] text-slate-400 font-mono">{d.date}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Average Daily Hours: <strong>6.2 hrs/day</strong></span>
            <span className="text-emerald-600 font-bold">Consistently exceeding baseline</span>
          </div>
        </div>

        {/* Subject Breakdown Progress Bars (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider font-['Plus_Jakarta_Sans']">
                SUBJECT-WISE HOURS
              </h3>
              <span className="text-xs text-slate-400">Total Hours</span>
            </div>

            <div className="space-y-3.5">
              {(subjectHours || []).map((sub, idx) => {
                const pct = Math.round((sub.hours / totalSubjectHours) * 100);
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-800">{sub.name}</span>
                      <span className="font-extrabold text-slate-900 font-mono">{sub.hours}h ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct * 2}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Core Focus: <strong>Polity & Modern History</strong></span>
            <span className="text-indigo-600 font-bold">In Foundation Sync</span>
          </div>
        </div>
      </div>

      {/* Study Category Distribution */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider font-['Plus_Jakarta_Sans'] mb-4">
          PREPARATION COMPOSITION (HOURS BY STUDY TYPE)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categoryStats.map((cat, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                <span className="text-xs font-bold text-slate-700 truncate">{cat.label}</span>
              </div>
              <p className="text-xl font-black text-slate-900 font-mono">{cat.hours} <span className="text-xs font-bold text-slate-400">hrs</span></p>
              <p className="text-[11px] text-indigo-600 font-bold mt-0.5">{cat.percent}% of total</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
