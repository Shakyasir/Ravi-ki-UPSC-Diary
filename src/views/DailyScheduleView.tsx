import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Sparkles,
  Calendar,
  Copy,
  CheckCircle,
  Briefcase,
  Rocket,
  Check
} from 'lucide-react';
import { store, getEffectiveMode } from '../lib/storage';
import { ScheduleItem, StudyCategory, PreparationMode } from '../types';

export const DailyScheduleView: React.FC = () => {
  const profile = store.getProfile();
  const currentMode = getEffectiveMode(profile);
  const [selectedMode, setSelectedMode] = useState<PreparationMode>(currentMode);
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const schedule = store.getSchedule() || [];

  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [startTime, setStartTime] = useState('05:30');
  const [endTime, setEndTime] = useState('07:00');
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('1.5');
  const [category, setCategory] = useState<StudyCategory>('GS');
  const [isStudy, setIsStudy] = useState(true);
  const [notes, setNotes] = useState('');

  // Filter schedule based on selected day & mode
  const filteredSchedule = schedule.filter(item => {
    const matchesDay = selectedDay === 'all' || item.dayOfWeek === 'all' || item.dayOfWeek === selectedDay;
    const matchesMode = item.mode === 'BOTH' || item.mode === selectedMode;
    return matchesDay && matchesMode;
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const totalStudyHours = filteredSchedule
    .filter(i => i.isStudy)
    .reduce((sum, i) => sum + i.durationHours, 0);

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingItem) {
      store.updateScheduleItem(editingItem.id, {
        startTime,
        endTime,
        title: title.trim(),
        durationHours: parseFloat(duration) || 1.0,
        category,
        isStudy,
        notes: notes.trim() || undefined,
        mode: selectedMode,
        dayOfWeek: selectedDay as any
      });
      setEditingItem(null);
    } else {
      store.addScheduleItem({
        startTime,
        endTime,
        title: title.trim(),
        durationHours: parseFloat(duration) || 1.0,
        category,
        isStudy,
        completed: false,
        notes: notes.trim() || undefined,
        mode: selectedMode,
        dayOfWeek: selectedDay as any
      });
      setIsAdding(false);
    }

    // Reset fields
    setTitle('');
    setNotes('');
  };

  const handleStartEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    setStartTime(item.startTime);
    setEndTime(item.endTime);
    setTitle(item.title);
    setDuration(String(item.durationHours));
    setCategory(item.category);
    setIsStudy(item.isStudy);
    setNotes(item.notes || '');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this timetable slot?')) {
      store.deleteScheduleItem(id);
    }
  };

  const handleReset = () => {
    if (window.confirm(`Reset ${selectedMode} timetable to official UPSC 2029 default?`)) {
      store.resetScheduleToDefault(selectedMode);
    }
  };

  const daysList = [
    { id: 'all', label: 'All Days' },
    { id: 'mon', label: 'Mon' },
    { id: 'tue', label: 'Tue' },
    { id: 'wed', label: 'Wed' },
    { id: 'thu', label: 'Thu' },
    { id: 'fri', label: 'Fri' },
    { id: 'sat', label: 'Sat' },
    { id: 'sun', label: 'Sun' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header & Mode Switcher */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Dynamic Timetable Engine</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            DAILY TIMETABLE & ROUTINE
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Total Study Target in this schedule: <strong className="text-indigo-600 text-sm font-black">{totalStudyHours} HOURS</strong>
          </p>
        </div>

        {/* Mode Selector Toggle */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setSelectedMode('JOB + UPSC')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedMode === 'JOB + UPSC'
                ? 'bg-white text-amber-900 shadow-xs border border-amber-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-amber-600" />
            JOB + UPSC (5.5h)
          </button>

          <button
            type="button"
            onClick={() => setSelectedMode('FULL-TIME UPSC')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedMode === 'FULL-TIME UPSC'
                ? 'bg-white text-emerald-900 shadow-xs border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Rocket className="w-3.5 h-3.5 text-emerald-600" />
            FULL-TIME UPSC (12h)
          </button>
        </div>
      </div>

      {/* Days Filter Pills & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-wider">Day:</span>
          {daysList.map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDay(d.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedDay === d.id
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Reset to default template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={() => { setIsAdding(true); setEditingItem(null); }}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Slot
          </button>
        </div>
      </div>

      {/* Add / Edit Form Modal/Card */}
      {(isAdding || editingItem) && (
        <form onSubmit={handleSaveItem} className="bg-white rounded-3xl p-6 border-2 border-indigo-500 shadow-xl space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-indigo-950 uppercase tracking-wide">
              {editingItem ? 'Edit Timetable Slot' : 'Add New Timetable Slot'}
            </h3>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              {selectedMode}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Study Duration (Hours)</label>
              <input
                type="number"
                step="0.25"
                min="0"
                max="12"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Activity Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 📖 GS Deep Study or 🎓 PW Live Class"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as StudyCategory)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-white"
              >
                <option value="GS">GS Deep Study</option>
                <option value="Current Affairs">Current Affairs</option>
                <option value="PW Class">PW Class (Live / Recorded)</option>
                <option value="NCERT">NCERT Reading</option>
                <option value="Standard Book">Standard Book</option>
                <option value="Revision">Revision</option>
                <option value="MCQ">MCQ Practice</option>
                <option value="PYQ">PYQs</option>
                <option value="Answer Writing">Answer Writing</option>
                <option value="Diary">Diary + Planning</option>
                <option value="Routine">Routine / Breakfast / Fresh</option>
                <option value="Job">Job / Office Hours</option>
                <option value="Break">Break / Lunch / Rest</option>
                <option value="Sleep">Sleep</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isStudy}
                  onChange={(e) => setIsStudy(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                Count this slot toward Daily Study Target (5.5 hrs)
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Instructions</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. High focus slot; phone on Do Not Disturb"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => { setIsAdding(false); setEditingItem(null); }}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md cursor-pointer"
            >
              {editingItem ? 'Save Changes' : 'Add Slot'}
            </button>
          </div>
        </form>
      )}

      {/* Timetable List Display */}
      <div className="space-y-3">
        {(filteredSchedule || []).map((item, idx) => (
          <div
            key={item.id}
            className={`p-4 sm:p-5 rounded-3xl border transition-all flex items-center justify-between gap-4 ${
              item.isStudy
                ? 'bg-white border-indigo-200/80 shadow-xs hover:border-indigo-400'
                : 'bg-slate-50/70 border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex items-start gap-4 min-w-0">
              {/* Time Slot Box */}
              <div className="w-24 sm:w-28 text-center p-2 rounded-2xl bg-slate-100 border border-slate-200 shrink-0">
                <span className="text-xs font-extrabold text-slate-900 font-mono block">
                  {item.startTime}
                </span>
                <span className="text-[10px] text-slate-400 block">to</span>
                <span className="text-xs font-extrabold text-slate-900 font-mono block">
                  {item.endTime}
                </span>
              </div>

              {/* Description & Category */}
              <div className="min-w-0 pt-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.isStudy ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {item.category}
                  </span>
                  {item.isStudy && (
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      Study: {item.durationHours} hr
                    </span>
                  )}
                  {item.dayOfWeek !== 'all' && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full uppercase">
                      {item.dayOfWeek}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900 mt-1">
                  {item.title}
                </h4>

                {item.notes && (
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {item.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Actions: Edit & Delete */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => handleStartEdit(item)}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                title="Edit slot"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Delete slot"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
