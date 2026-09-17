import React, { useState, useEffect } from 'react';
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
  BookOpen,
  Pencil,
  Calendar,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { store, getSystemDateString, getTomorrowDateString } from '../lib/storage';
import { TodayTask, StudyCategory } from '../types';
import { TomorrowPlanningModal } from '../components/TomorrowPlanningModal';

interface TodayMissionViewProps {
  onNavigate: (tab: string) => void;
}

export const TodayMissionView: React.FC<TodayMissionViewProps> = ({ onNavigate }) => {
  // Subscribe to store updates for real-time reactivity
  const [, setTick] = useState(0);
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setTick(t => t + 1);
    });
    return () => unsubscribe();
  }, []);

  const todayStr = getSystemDateString();
  const tomorrowStr = getTomorrowDateString(todayStr);

  const tasks = store.getTodayTasks() || [];
  const tomorrowTasks = store.getTodayTasks(tomorrowStr) || [];
  const tomorrowHours = tomorrowTasks.reduce((sum, t) => sum + (t.durationHours || 0), 0);

  const metrics = store.getMetrics();
  const profile = store.getProfile();

  // Tomorrow Planning modal state
  const [showTomorrowModal, setShowTomorrowModal] = useState(false);

  // Add Task Form state
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('1.5');
  const [category, setCategory] = useState<StudyCategory>('GS');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [notes, setNotes] = useState('');

  // Edit Task state
  const [editingTask, setEditingTask] = useState<TodayTask | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDuration, setEditDuration] = useState('1.5');
  const [editCategory, setEditCategory] = useState<StudyCategory>('GS');
  const [editSubject, setEditSubject] = useState('');
  const [editPriority, setEditPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [editNotes, setEditNotes] = useState('');

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const allCompleted = totalCount > 0 && completedCount === totalCount;
  const totalHours = tasks.reduce((sum, t) => sum + (t.durationHours || 0), 0);
  const completedHours = tasks.filter(t => t.completed).reduce((sum, t) => sum + (t.durationHours || 0), 0);

  const formattedDate = (() => {
    try {
      const parts = todayStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return new Intl.DateTimeFormat('en-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).format(d);
      }
    } catch (e) {}
    return todayStr;
  })();

  const formattedTomorrowDate = (() => {
    try {
      const parts = tomorrowStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return new Intl.DateTimeFormat('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).format(d);
      }
    } catch (e) {}
    return tomorrowStr;
  })();

  const handleToggle = (id: string) => {
    store.toggleTask(id);
    const updated = store.getTodayTasks();
    if (updated.length > 0 && updated.every(t => t.completed)) {
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
      date: todayStr,
      title: title.trim(),
      durationHours: parseFloat(duration) || 1.0,
      category,
      completed: false,
      subject: subject.trim() || undefined,
      priority,
      notes: notes.trim() || undefined
    });
    setTitle('');
    setSubject('');
    setNotes('');
    setIsAdding(false);
  };

  const handleStartEdit = (task: TodayTask, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDuration(String(task.durationHours || 1.5));
    setEditCategory(task.category || 'GS');
    setEditSubject(task.subject || '');
    setEditPriority(task.priority || 'High');
    setEditNotes(task.notes || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim()) return;
    store.updateTodayTask(editingTask.id, {
      title: editTitle.trim(),
      durationHours: parseFloat(editDuration) || 1.0,
      category: editCategory,
      subject: editSubject.trim() || undefined,
      priority: editPriority,
      notes: editNotes.trim() || undefined
    });
    setEditingTask(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this mission task?')) {
      store.deleteTodayTask(id);
    }
  };

  const handleLogCompletedToRegister = () => {
    const completedTasks = tasks.filter(t => t.completed);
    if (completedTasks.length === 0) {
      alert('No completed tasks to log yet!');
      return;
    }
    const today = getSystemDateString();
    const existingEntries = store.getStudyEntries();
    let addedCount = 0;

    completedTasks.forEach(t => {
      // Prevent duplicate study register records
      const alreadyExists = existingEntries.some(
        e => e.date === today && e.topic.trim().toLowerCase() === t.title.trim().toLowerCase()
      );
      if (!alreadyExists) {
        store.addStudyEntry({
          date: today,
          subject: t.subject || (t.category === 'PW Class' ? 'PhysicsWallah UPSC Batch' : t.category === 'Current Affairs' ? 'Current Affairs & Editorials' : 'Indian Polity & Constitution'),
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
        addedCount++;
      }
    });

    if (addedCount > 0) {
      alert(`Successfully synced ${addedCount} sessions to UPSC Study Register!`);
    } else {
      alert('All completed tasks for today are already recorded in the Study Register. No duplicates created.');
    }
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
            <span className="text-xs text-slate-400 font-mono">•</span>
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              {formattedDate}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            TODAY'S MISSION
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Today's Progress: <strong className="text-slate-900">{completedCount} / {totalCount}</strong> tasks completed ({completedHours} of {totalHours} hrs)
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Mission Task
          </button>
          <button
            type="button"
            onClick={() => setShowTomorrowModal(true)}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            Plan Tomorrow
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

      {/* Tomorrow Planning Preview Card */}
      <div className="bg-gradient-to-r from-purple-50/70 via-indigo-50/40 to-slate-50 rounded-2xl p-4 border border-indigo-100/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black text-purple-900 uppercase tracking-wider">TOMORROW'S MISSION</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-bold text-slate-800">{formattedTomorrowDate}</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] font-bold text-indigo-600">
                {tomorrowTasks.length} {tomorrowTasks.length === 1 ? 'Task' : 'Tasks'} Planned ({tomorrowHours} hrs)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {tomorrowTasks.length > 0 
                ? 'Tasks planned here will automatically activate as Today’s Mission tomorrow morning.' 
                : 'Stay one step ahead by organizing tomorrow’s slots in advance.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowTomorrowModal(true)}
          className="px-3.5 py-1.5 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Pencil className="w-3.5 h-3.5" />
          {tomorrowTasks.length > 0 ? 'View / Edit' : 'Plan Tomorrow'}
        </button>
      </div>

      {/* All Tasks Completed Hero Notice */}
      {allCompleted && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-indigo-500/10 border-2 border-amber-400 text-center shadow-md animate-in zoom-in-95">
          <span className="text-3xl mb-2 block">🔥</span>
          <h3 className="text-xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            Today’s mission complete, IAS RAVI. 🔥
          </h3>
          <p className="text-xs text-slate-600 max-w-lg mx-auto mt-1">
            All daily objectives conquered with immaculate discipline. Each completed session cements your future position in the civil services.
          </p>
          <div className="mt-4">
            <button
              onClick={handleLogCompletedToRegister}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title *</label>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'High' | 'Medium' | 'Low')}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-white"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject (Optional)</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Indian Polity & Governance"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target / Notes (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Solve 20 questions from chapter review"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
            >
              Save Mission Task
            </button>
          </div>
        </form>
      )}

      {/* Edit Task Form Modal/Inline */}
      {editingTask && (
        <form onSubmit={handleSaveEdit} className="bg-white rounded-3xl p-5 border-2 border-indigo-500 shadow-xl space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-xs font-bold text-indigo-900 uppercase flex items-center gap-1.5">
              <Pencil className="w-3.5 h-3.5 text-indigo-600" />
              Edit Today's Mission Task
            </h4>
            <button
              type="button"
              onClick={() => setEditingTask(null)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Hours)</label>
              <input
                type="number"
                step="0.25"
                min="0.25"
                max="10"
                value={editDuration}
                onChange={(e) => setEditDuration(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as StudyCategory)}
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
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as 'High' | 'Medium' | 'Low')}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-white"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject (Optional)</label>
              <input
                type="text"
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                placeholder="e.g. Indian Polity"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target / Notes (Optional)</label>
              <input
                type="text"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="e.g. Solve 20 questions"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditingTask(null)}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* Checklist Tasks List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center font-bold text-lg">
              ✨
            </div>
            <h4 className="text-sm font-bold text-slate-900">Fresh Slate for {formattedDate}</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No mission tasks recorded for today yet. Add your first objective above to start with Slot #1.
            </p>
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add First Task (Slot #1)
            </button>
          </div>
        ) : (
          tasks.map((task, index) => (
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      Slot #{index + 1}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {task.category}
                    </span>
                    {task.priority && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        task.priority === 'High' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {task.priority} Priority
                      </span>
                    )}
                    {task.subject && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        • {task.subject}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm font-bold mt-1 ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {task.title}
                  </p>
                  {task.notes && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{task.notes}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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
                  onClick={(e) => handleStartEdit(task, e)}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                  title="Edit task"
                >
                  <Pencil className="w-4 h-4" />
                </button>
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
          ))
        )}
      </div>

      {/* Quick Action Footer */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-slate-600 font-medium">
          Once finished, sync completed tasks or record your study logs into the official Study Register.
        </span>
        <button
          onClick={() => onNavigate('register')}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          Go to UPSC Study Register
        </button>
      </div>

      {/* Tomorrow Advance Planning Modal */}
      <TomorrowPlanningModal
        isOpen={showTomorrowModal}
        onClose={() => setShowTomorrowModal(false)}
        todayStr={todayStr}
        tomorrowStr={tomorrowStr}
      />
    </div>
  );
};
