import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Calendar, 
  X, 
  Clock, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { store } from '../lib/storage';
import { TodayTask, StudyCategory } from '../types';

interface TomorrowPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  todayStr: string;
  tomorrowStr: string;
}

export const TomorrowPlanningModal: React.FC<TomorrowPlanningModalProps> = ({
  isOpen,
  onClose,
  todayStr,
  tomorrowStr
}) => {
  // Listen to store updates for live synchronization
  const [, setTick] = useState(0);
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setTick(t => t + 1);
    });
    return () => unsubscribe();
  }, []);

  // Form states for adding tomorrow's task
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('1.5');
  const [category, setCategory] = useState<StudyCategory>('GS');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [notes, setNotes] = useState('');

  // Form states for editing tomorrow's task
  const [editingTask, setEditingTask] = useState<TodayTask | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDuration, setEditDuration] = useState('1.5');
  const [editCategory, setEditCategory] = useState<StudyCategory>('GS');
  const [editSubject, setEditSubject] = useState('');
  const [editPriority, setEditPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [editNotes, setEditNotes] = useState('');

  if (!isOpen) return null;

  // Retrieve tomorrow's tasks specifically for tomorrowStr
  const tomorrowTasks = store.getTodayTasks(tomorrowStr) || [];
  const totalPlannedHours = tomorrowTasks.reduce((sum, t) => sum + (t.durationHours || 0), 0);

  // Format tomorrow date nicely (e.g. 18 September 2026)
  const formattedDate = (() => {
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

  const formattedDateWithWeekday = (() => {
    try {
      const parts = tomorrowStr.split('-');
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
    return tomorrowStr;
  })();

  const handleAddTomorrowTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Automatically saves task with date = tomorrowStr
    // and slot number starting from Slot #1 for that date
    store.addTodayTask({
      date: tomorrowStr,
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

  const handleDeleteTomorrowTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this planned tomorrow task?')) {
      store.deleteTodayTask(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-indigo-50/40 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
              <span className="text-[11px] font-extrabold text-purple-700 uppercase tracking-wider">
                ADVANCE PLANNING MODE
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-500">
                {formattedDateWithWeekday}
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 font-['Plus_Jakarta_Sans'] tracking-tight">
              TOMORROW'S MISSION
            </h2>
            <div className="text-base font-extrabold text-indigo-700 mt-0.5">
              {formattedDate}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Plan tomorrow's objectives in advance. These tasks are saved for {formattedDate} and will automatically become your active Today's Mission when the date arrives.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action / Stats Subheader */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-700">Planned Objectives:</span>
            <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
              {tomorrowTasks.length} {tomorrowTasks.length === 1 ? 'Task' : 'Tasks'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-semibold text-slate-600">{totalPlannedHours} hrs total</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsAdding(!isAdding);
              setEditingTask(null);
            }}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Tomorrow Task
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Add Tomorrow Task Form */}
          {isAdding && (
            <form onSubmit={handleAddTomorrowTask} className="bg-indigo-50/50 rounded-3xl p-5 border-2 border-indigo-200 shadow-sm space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-1 border-b border-indigo-100">
                <h4 className="text-xs font-bold text-indigo-900 uppercase flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-indigo-600" />
                  Plan New Objective for Tomorrow ({formattedDate})
                </h4>
                <span className="text-[11px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                  Will be Slot #{tomorrowTasks.length + 1}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. GS Deep Study — Indian Polity Fundamental Rights"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-indigo-500"
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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-indigo-500"
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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target / Notes (Optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Complete lecture notes & 15 MCQs"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-indigo-100">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer transition-colors"
                >
                  Save Tomorrow Task
                </button>
              </div>
            </form>
          )}

          {/* Edit Tomorrow Task Form */}
          {editingTask && (
            <form onSubmit={handleSaveEdit} className="bg-white rounded-3xl p-5 border-2 border-purple-500 shadow-xl space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-xs font-bold text-purple-900 uppercase flex items-center gap-1.5">
                  <Pencil className="w-3.5 h-3.5 text-purple-600" />
                  Edit Tomorrow's Task
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
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-purple-500"
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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as StudyCategory)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-white"
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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-white"
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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target / Notes (Optional)</label>
                  <input
                    type="text"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="e.g. Solve 20 questions"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-purple-500"
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
                  className="px-4 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* Tomorrow's Task List */}
          <div className="space-y-3">
            {tomorrowTasks.length === 0 ? (
              <div className="p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100/60 text-indigo-600 mx-auto flex items-center justify-center font-bold text-lg">
                  <Calendar className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  No tasks planned for {formattedDate} yet
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Start planning your tomorrow today to ensure a disciplined, zero-procrastination morning. Click below to add your first objective as Slot #1.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAdding(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add First Task (Slot #1)
                </button>
              </div>
            ) : (
              tomorrowTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="p-4 sm:p-5 rounded-3xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all flex items-center justify-between gap-4 select-none"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="mt-0.5 text-indigo-600 shrink-0">
                      <div className="w-6 h-6 rounded-full border-2 border-indigo-300 flex items-center justify-center text-[10px] font-black text-indigo-700 bg-indigo-50">
                        {index + 1}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                          Slot #{index + 1}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
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
                      <p className="text-sm font-bold mt-1 text-slate-900">
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
                      <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        Planned
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
                      onClick={(e) => handleDeleteTomorrowTask(task.id, e)}
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
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              Saved with date <strong>{tomorrowStr}</strong>. These tasks will automatically appear in <strong>TODAY'S MISSION</strong> when {formattedDate} arrives.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            Done Planning
          </button>
        </div>
      </div>
    </div>
  );
};
