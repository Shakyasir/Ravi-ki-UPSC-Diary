import React, { useState } from 'react';
import {
  AlertOctagon,
  Plus,
  CheckCircle2,
  Trash2,
  Calendar,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { store, getSystemDateString } from '../lib/storage';
import { BacklogItem } from '../types';

export const BacklogView: React.FC = () => {
  const items = store.getBacklog() || [];
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [subject, setSubject] = useState('Indian Polity');
  const [topic, setTopic] = useState('');
  const [reason, setReason] = useState('Office project deadline overflow');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [plannedDate, setPlannedDate] = useState('2026-09-20');

  const pendingItems = (items || []).filter(i => !i.cleared);
  const clearedItems = (items || []).filter(i => i.cleared);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    store.addBacklog({
      subject,
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
            Pending clearance: <strong className="text-rose-600 font-bold">{pendingItems.length} topics</strong> • Never leave gaps in the foundation
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
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md"
            >
              Add to Backlog
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
          (pendingItems || []).map((item) => (
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
                  <span className="text-[11px] font-bold text-indigo-700">
                    {item.subject || item.category || 'General GS'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Planned: {item.plannedDate || item.deadline || 'Pending'}
                  </span>
                </div>

                <h4 className="text-sm font-extrabold text-slate-900">
                  {item.topic || item.task || 'Untitled Task'}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reason: <span className="italic">{item.reason || item.notes || 'Scheduled revision/catchup'}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggleClear(item.id)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Cleared
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg"
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
            {(clearedItems || []).map((item) => (
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
                  className="p-1 text-slate-300 hover:text-rose-600 rounded"
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
