import React, { useState } from 'react';
import {
  AlertOctagon,
  Plus,
  CheckCircle2,
  Trash2,
  Calendar,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  Pencil,
  X
} from 'lucide-react';
import { store, getSystemDateString } from '../lib/storage';
import { BacklogItem } from '../types';

export const BacklogView: React.FC = () => {
  const items = store.getBacklog() || [];
  const [isAdding, setIsAdding] = useState(false);

  // Form states for manual backlog entry
  const [subject, setSubject] = useState('Indian Polity');
  const [topic, setTopic] = useState('');
  const [reason, setReason] = useState('Office project deadline overflow');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [plannedDate, setPlannedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });

  // Edit item state
  const [editingItem, setEditingItem] = useState<BacklogItem | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editTopic, setEditTopic] = useState('');
  const [editReason, setEditReason] = useState('');
  const [editPriority, setEditPriority] = useState<'High' | 'Medium' | 'Low'>('High');

  // Reschedule item state
  const [reschedulingItem, setReschedulingItem] = useState<BacklogItem | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState(() => getSystemDateString());

  const pendingItems = (items || []).filter(i => !i.cleared);
  const clearedItems = (items || []).filter(i => i.cleared);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    store.addBacklog({
      subject: subject.trim(),
      topic: topic.trim(),
      reason: reason.trim(),
      priority,
      missedDate: getSystemDateString(),
      plannedDate,
      cleared: false
    });

    setTopic('');
    setReason('');
    setIsAdding(false);
  };

  const handleToggleClear = (id: string) => {
    store.clearBacklog(id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this backlog entry?')) {
      store.deleteBacklog(id);
    }
  };

  const handleMoveToToday = (id: string) => {
    store.moveBacklogToToday(id);
    alert('Task moved to Today’s Mission!');
  };

  const handleStartEdit = (item: BacklogItem) => {
    setEditingItem(item);
    setEditSubject(item.subject || '');
    setEditTopic(item.topic || item.task || '');
    setEditReason(item.reason || item.notes || '');
    setEditPriority(item.priority || 'High');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editTopic.trim()) return;

    store.updateBacklogItem(editingItem.id, {
      subject: editSubject.trim(),
      topic: editTopic.trim(),
      task: editTopic.trim(),
      reason: editReason.trim(),
      priority: editPriority
    });

    if (editingItem.originalTaskId) {
      store.updateTodayTask(editingItem.originalTaskId, {
        title: editTopic.trim(),
        subject: editSubject.trim() || undefined,
        priority: editPriority,
        notes: editReason.trim() || undefined
      });
    }

    setEditingItem(null);
  };

  const handleStartReschedule = (item: BacklogItem) => {
    setReschedulingItem(item);
    setNewRescheduleDate(item.plannedDate || getSystemDateString());
  };

  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingItem || !newRescheduleDate) return;

    store.rescheduleBacklog(reschedulingItem.id, newRescheduleDate);
    const today = getSystemDateString();
    if (newRescheduleDate === today) {
      alert(`Task rescheduled for Today! It has been moved to Today’s Mission.`);
    } else {
      alert(`Task rescheduled to ${newRescheduleDate}. It will appear in Today’s Mission on that date.`);
    }
    setReschedulingItem(null);
  };

  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return new Intl.DateTimeFormat('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }).format(d);
      }
    } catch (e) {}
    return dateStr;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Mission Deficiency Shield</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            BACKLOG RECOVERY COMMAND
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pending clearance: <strong className="text-rose-600 font-bold">{pendingItems.length} topics</strong> • Missed tasks automatically roll over here
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Backlog Item
        </button>
      </div>

      {/* Add Backlog Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white rounded-3xl p-6 border-2 border-rose-500 shadow-xl space-y-4 animate-in fade-in duration-150">
          <h3 className="text-sm font-extrabold text-rose-950 uppercase tracking-wide">
            Record Missed / Delayed Topic
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none bg-white"
              >
                <option value="High">High (Prelims/Mains core)</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Planned Clearance Date</label>
              <input
                type="date"
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Topic Name</label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Emergency Provisions (Articles 352, 356, 360)"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Delay</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Late work shift / fatigue / health"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md cursor-pointer"
            >
              Add to Backlog
            </button>
          </div>
        </form>
      )}

      {/* Edit Backlog Item Modal */}
      {editingItem && (
        <form onSubmit={handleSaveEdit} className="bg-white rounded-3xl p-6 border-2 border-indigo-500 shadow-xl space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-indigo-950 uppercase tracking-wide flex items-center gap-2">
              <Pencil className="w-4 h-4 text-indigo-600" />
              Edit Backlog Task
            </h3>
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none bg-white focus:border-indigo-500"
              >
                <option value="High">High (Prelims/Mains core)</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Topic Name *</label>
            <input
              type="text"
              required
              value={editTopic}
              onChange={(e) => setEditTopic(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Notes</label>
            <input
              type="text"
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* Reschedule Modal */}
      {reschedulingItem && (
        <form onSubmit={handleSaveReschedule} className="bg-white rounded-3xl p-6 border-2 border-amber-500 shadow-xl space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-amber-950 uppercase tracking-wide flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              Reschedule Missed Task
            </h3>
            <button
              type="button"
              onClick={() => setReschedulingItem(null)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600">
            Rescheduling: <strong className="text-slate-900">{reschedulingItem.topic || reschedulingItem.task}</strong>
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select New Target Date</label>
            <input
              type="date"
              required
              value={newRescheduleDate}
              onChange={(e) => setNewRescheduleDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              If set to Today, it immediately shifts into Today's Mission. If set to a future date, it will appear in Today's Mission on that calendar date.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setReschedulingItem(null)}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md cursor-pointer"
            >
              Confirm Reschedule
            </button>
          </div>
        </form>
      )}

      {/* Pending Items List */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          Pending Clearance ({pendingItems.length})
        </h3>

        {pendingItems.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
            🎉 Clean slate! No pending backlog items recorded.
          </div>
        ) : (
          pendingItems.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-white border border-rose-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    item.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.priority} Priority
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    Missed / Overdue
                  </span>
                  <span className="text-[11px] font-bold text-indigo-700">
                    {item.subject || item.category || 'General GS'}
                  </span>
                  {item.missedDate && (
                    <span className="text-xs text-slate-400 font-mono">
                      Original Date: {formatDateDisplay(item.missedDate)}
                    </span>
                  )}
                  {item.plannedDate && item.plannedDate !== item.missedDate && (
                    <span className="text-xs text-amber-600 font-mono">
                      • Rescheduled: {formatDateDisplay(item.plannedDate)}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-extrabold text-slate-900">
                  {item.topic || item.task || 'Untitled Task'}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reason: <span className="italic">{item.reason || item.notes || 'Incomplete from scheduled mission'}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                <button
                  type="button"
                  onClick={() => handleMoveToToday(item.id)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                  title="Move to Today's Mission"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Move to Today
                </button>
                <button
                  type="button"
                  onClick={() => handleStartReschedule(item)}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  title="Reschedule task to a different date"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  Reschedule
                </button>
                <button
                  type="button"
                  onClick={() => handleStartEdit(item)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                  title="Edit task"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleClear(item.id)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                  title="Mark as completed/cleared"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cleared Backlog History */}
      {clearedItems.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-slate-200">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
            Cleared Backlog Archive ({clearedItems.length})
          </h3>
          <div className="space-y-2">
            {clearedItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between opacity-75 text-xs"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-800 line-through">{item.topic || item.task}</span>
                  <span className="text-slate-400">({item.subject || item.category || 'General GS'})</span>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1 text-slate-300 hover:text-rose-600 rounded cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
