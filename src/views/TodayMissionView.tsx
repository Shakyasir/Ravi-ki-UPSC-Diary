import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Clock, 
  Sparkles, 
  CheckCheck,
  Flame,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { store, getSystemDateString } from '../lib/storage';
import { TodayTask, StudyCategory } from '../types';

interface TodayMissionViewProps {
  onNavigate: (tab: string) => void;
}

export const TodayMissionView: React.FC<TodayMissionViewProps> = ({ onNavigate }) => {
  const tasks = store.getTodayTasks() || [];
  const metrics = store.getMetrics();
  const profile = store.getProfile();

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('1.5');
  const [category, setCategory] = useState<StudyCategory>('GS');
  const [notes, setNotes] = useState('');

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const allCompleted = totalCount > 0 && completedCount === totalCount;
  const totalHours = tasks.reduce((sum, t) => sum + t.durationHours, 0);
  const completedHours = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.durationHours, 0);

  const handleToggle = (id: string) => {
    store.toggleTask(id);
    const updated = store.getTodayTasks();
    if (updated.every(t => t.completed)) {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    store.addTodayTask({
      date: getSystemDateString(),
      title: title.trim(),
      durationHours: parseFloat(duration) || 1.0,
      category,
      completed: false,
      notes: notes.trim() || undefined
    });
    setTitle('');
    setNotes('');
    setIsAdding(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    store.deleteTodayTask(id);
  };

  const handleLogCompletedToRegister = () => {
    const completedTasks = tasks.filter(t => t.completed);
    if (completedTasks.length === 0) {
      alert('No completed tasks to log yet!');
      return;
    }
    const today = getSystemDateString();
    let count = 0;
    completedTasks.forEach(t => {
      store.addStudyEntry({
        date: today,
        subject: t.category === 'PW Class' ? 'PhysicsWallah UPSC Batch' : t.category === 'Current Affairs' ? 'Current Affairs & Editorials' : 'Indian Polity & Constitution',
        topic: t.title,
        studyType: t.category,
        startTime: '06:00',
        endTime: '07:30',
        durationHours: t.durationHours,
        source: 'Daily Mission Checklist',
        revision: false,
        mcqCount: 0,
        pyqCount: 0,
        answerWritingCount: 0,
        testCount: 0,
        status: 'Completed',
        difficulty: 'Moderate',
        notes: t.notes || 'Automatically logged from completed mission checklist.'
      });
      count++;
    });
    alert(`Successfully synced ${count} sessions to UPSC Study Register!`);
    onNavigate('register');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Mission Mode Command</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            TODAY'S MISSION
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Today's Progress: <strong className="text-slate-900">{completedCount} / {totalCount}</strong> ({completedHours} of {totalHours} hrs completed)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Mission Task
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
        <div className="flex justify-between text-xs font-bold text-slate-700">
          <span>Target Completion</span>
          <span>{totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              allCompleted ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* All Tasks Completed Hero Notice */}
      {allCompleted && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-indigo-500/10 border-2 border-amber-400 text-center shadow-md animate-in zoom-in-95">
          <span className="text-3xl mb-2 block">🔥</span>
          <h3 className="text-xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            Today’s mission complete, IAS RAVI. 🔥
          </h3>
          <p className="text-xs text-slate-600 max-w-lg mx-auto mt-1">
            All 5.5 hours conquered with immaculate discipline. Each completed session cements your future position in the civil services.
          </p>
          <div className="mt-4">
            <button
              onClick={handleLogCompletedToRegister}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Sync Completed Tasks to Study Register
            </button>
          </div>
        </div>
      )}

      {/* Add Task Form */}
      {isAdding && (
        <form onSubmit={handleAddTask} className="bg-white rounded-3xl p-5 border border-indigo-200 shadow-md space-y-3 animate-in fade-in duration-150">
          <h4 className="text-xs font-bold text-indigo-900 uppercase">Create New Mission Objective</h4>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. GS Deep Study — Indian Economy Fiscal Policy & Budgeting"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Hours)</label>
              <input
                type="number"
                step="0.25"
                min="0.25"
                max="10"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
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
                <option value="Revision">Active Revision</option>
                <option value="MCQ">MCQ Practice</option>
                <option value="PYQ">PYQ Drills</option>
                <option value="Answer Writing">Answer Writing</option>
                <option value="Diary">Diary + Planning</option>
                <option value="Optional">Optional</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Optional Notes / Target</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Solve 20 questions from chapter review"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              Save Mission Task
            </button>
          </div>
        </form>
      )}

      {/* Checklist Tasks List */}
      <div className="space-y-3">
        {(tasks || []).map((task, index) => (
          <div
            key={task.id}
            onClick={() => handleToggle(task.id)}
            className={`p-4 sm:p-5 rounded-3xl border transition-all flex items-center justify-between gap-4 cursor-pointer group select-none ${
              task.completed
                ? 'bg-slate-50 border-slate-200 text-slate-500'
                : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <button
                type="button"
                className="mt-0.5 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0"
              >
                {task.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                ) : (
                  <Circle className="w-6 h-6 text-slate-300 group-hover:text-indigo-400" />
                )}
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    Slot #{index + 1}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    {task.category}
                  </span>
                </div>
                <p className={`text-sm font-bold mt-1 ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                  {task.title}
                </p>
                {task.notes && (
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{task.notes}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-sm font-extrabold text-slate-900 block font-mono">
                  {task.durationHours} hr
                </span>
                <span className={`text-[10px] font-semibold ${task.completed ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {task.completed ? 'Completed' : 'Pending'}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => handleDelete(task.id, e)}
                className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Footer */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-slate-600 font-medium">
          Once finished, update your official Study Register with detailed topic metrics.
        </span>
        <button
          onClick={() => onNavigate('register')}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-xs transition-colors shrink-0"
        >
          <BookOpen className="w-4 h-4" />
          Go to UPSC Study Register
        </button>
      </div>
    </div>
  );
};
