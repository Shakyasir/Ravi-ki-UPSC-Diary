import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  BookMarked,
  Plus
} from 'lucide-react';
import { store, getSystemDateString, getEffectiveMode } from '../lib/storage';

interface CalendarViewProps {
  onNavigate: (tab: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onNavigate }) => {
  const profile = store.getProfile();
  const studyEntries = store.getStudyEntries() || [];
  const diaryEntries = store.getDiaryEntries() || [];

  // Current calendar view state: September 2026 (matching system date 2026-09-16)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 8 is September (0-indexed)
  const [selectedDate, setSelectedDate] = useState<string>(getSystemDateString());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Day breakdown
  const selectedDayEntries = studyEntries.filter(e => e.date === selectedDate);
  const selectedDayHours = selectedDayEntries.reduce((sum, e) => sum + e.durationHours, 0);
  const selectedDayDiary = diaryEntries.find(d => d.date === selectedDate);

  // Intensity checker
  const getDayMetrics = (day: number) => {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${currentYear}-${monthStr}-${dayStr}`;

    const entriesForDay = studyEntries.filter(e => e.date === dateStr);
    const hours = entriesForDay.reduce((sum, e) => sum + e.durationHours, 0);
    const target = 5.5; // baseline

    let status = 'future';
    const isToday = dateStr === getSystemDateString();
    const isPast = dateStr <= getSystemDateString();

    if (isPast) {
      if (hours >= target) {
        status = 'target-met';
      } else if (hours > 0) {
        status = 'partial';
      } else {
        status = 'missed';
      }
    }

    return { dateStr, hours, status, isToday, hasDiary: diaryEntries.some(d => d.date === dateStr) };
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Calendar Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Visual Consistency Matrix</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            CALENDAR & STUDY LOG
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Click any day to view complete preparation timeline, hours, and diary reflections
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white rounded-xl text-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 text-xs font-extrabold text-slate-900">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white rounded-xl text-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar on Left (7 cols), Selected Day Breakdown on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 gap-2 mb-3 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <span key={d} className="text-[11px] font-extrabold text-slate-400 uppercase">
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank leading days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`blank-${i}`} className="h-14 rounded-2xl bg-slate-50/50 border border-transparent" />
            ))}

            {/* Days of Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const { dateStr, hours, status, isToday, hasDiary } = getDayMetrics(day);
              const isSelected = selectedDate === dateStr;

              let bgClass = 'bg-white border-slate-200 text-slate-800';
              if (status === 'target-met') bgClass = 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold';
              else if (status === 'partial') bgClass = 'bg-amber-50 border-amber-300 text-amber-950';
              else if (status === 'missed') bgClass = 'bg-rose-50/70 border-rose-200 text-rose-950';

              if (isSelected) bgClass += ' ring-2 ring-indigo-600 shadow-md';

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-14 p-1.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none ${bgClass}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isToday ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center' : ''}`}>
                      {day}
                    </span>
                    {hasDiary && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Has Diary Entry" />
                    )}
                  </div>
                  {hours > 0 ? (
                    <span className="text-[10px] font-extrabold text-right block">
                      {hours}h
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-300 text-right block">-</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-500" />
              <span>Target Met (≥5.5h)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-400" />
              <span>Partial Study (&lt;5.5h)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-400" />
              <span>Zero / Missed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Diary Written</span>
            </div>
          </div>
        </div>

        {/* Selected Day Details (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Day Breakdown</span>
                <h3 className="text-base font-extrabold text-slate-900 font-mono">
                  {selectedDate}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-xl text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                {selectedDayHours} Hours Logged
              </span>
            </div>

            {/* Sessions on this day */}
            <div className="space-y-2 mb-4">
              <span className="text-xs font-bold text-slate-700 block">Study Sessions:</span>
              {selectedDayEntries.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400">
                  No study sessions recorded for this date.
                </div>
              ) : (
                (selectedDayEntries || []).map((e, idx) => (
                  <div key={`${e.id || 'entry'}-${idx}`} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-700 uppercase">{e.subject}</span>
                      <span className="text-xs font-extrabold text-slate-900 font-mono">{e.durationHours}h</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{e.topic}</p>
                    <p className="text-[10px] text-slate-500">{e.studyType} • {e.source}</p>
                  </div>
                ))
              )}
            </div>

            {/* Diary for this day */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Diary Reflection:</span>
              {selectedDayDiary ? (
                <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/70 text-xs">
                  <p className="font-hindi text-slate-800 leading-relaxed italic">
                    “{selectedDayDiary.todaysLesson}”
                  </p>
                  <p className="text-[11px] text-amber-800 font-medium mt-1">
                    Mood: {selectedDayDiary.mood}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400">
                  No diary reflection logged for this date.
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
            <button
              onClick={() => onNavigate('register')}
              className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs text-center"
            >
              + Log Study
            </button>
            <button
              onClick={() => onNavigate('diary')}
              className="flex-1 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-center"
            >
              Write Diary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
