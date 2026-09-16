import React, { useState } from 'react';
import {
  HelpCircle,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  TrendingUp
} from 'lucide-react';
import { store, getSystemDateString } from '../lib/storage';
import { MCQPractice } from '../types';

export const MCQTrackerView: React.FC = () => {
  const mcqs = store.getMCQs() || [];
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [date, setDate] = useState(getSystemDateString());
  const [subject, setSubject] = useState('Indian Polity');
  const [topic, setTopic] = useState('');
  const [totalQuestions, setTotalQuestions] = useState('20');
  const [correct, setCorrect] = useState('17');
  const [source, setSource] = useState('PW Daily Practice Sheet');
  const [weakAreas, setWeakAreas] = useState('');
  const [notes, setNotes] = useState('');

  const filtered = mcqs.filter(m => {
    const q = (searchQuery || '').toLowerCase();
    return !q ||
      ((m.topic || '') + '').toLowerCase().includes(q) ||
      ((m.subject || '') + '').toLowerCase().includes(q);
  });

  const totalAttempted = mcqs.reduce((s, m) => s + m.totalQuestions, 0);
  const totalCorrect = mcqs.reduce((s, m) => s + m.correct, 0);
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    const tot = parseInt(totalQuestions) || 1;
    const corr = Math.min(tot, parseInt(correct) || 0);
    const inc = Math.max(0, tot - corr);
    const acc = Math.round((corr / tot) * 100);

    store.addMCQ({
      date,
      subject,
      topic: topic.trim(),
      totalQuestions: tot,
      correct: corr,
      incorrect: inc,
      source: source.trim(),
      weakAreas: weakAreas.trim() || undefined,
      notes: notes.trim() || undefined
    });

    setTopic('');
    setWeakAreas('');
    setNotes('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this MCQ practice entry?')) {
      store.deleteMCQ(id);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Prelims Accuracy Engine</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            MCQ PRACTICE TRACKER
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Total MCQs Practiced: <strong className="text-slate-900">{totalAttempted}</strong> • Overall Accuracy: <strong className="text-emerald-600">{overallAccuracy}%</strong>
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Log MCQ Session
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white rounded-3xl p-6 border-2 border-indigo-500 shadow-xl space-y-4 animate-in fade-in duration-150">
          <h3 className="text-sm font-extrabold text-indigo-950 uppercase tracking-wide">
            Record MCQ Practice Session
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
              />
            </div>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Questions</label>
              <input
                type="number"
                min="1"
                required
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Correct Questions</label>
              <input
                type="number"
                min="0"
                required
                value={correct}
                onChange={(e) => setCorrect(e.target.value)}
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
              placeholder="e.g. Directive Principles & Fundamental Duties"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Source / Test Series</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. PW Test Series or Vision Abhyaas"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Identified Weak Areas</label>
              <input
                type="text"
                value={weakAreas}
                onChange={(e) => setWeakAreas(e.target.value)}
                placeholder="e.g. Got confused on Gandhian vs Socialist principles"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
              />
            </div>
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
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
            >
              Save MCQ Record
            </button>
          </div>
        </form>
      )}

      {/* MCQs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(filtered || []).map((m) => (
          <div
            key={m.id}
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {m.subject}
                </span>
                <span className="text-xs font-mono text-slate-400 font-medium">
                  {m.date}
                </span>
              </div>

              <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                {m.topic}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Source: {m.source}</p>

              {m.weakAreas && (
                <div className="mt-2.5 p-2.5 bg-rose-50/70 border border-rose-200 rounded-xl text-xs text-rose-800">
                  <span className="font-bold block text-[10px] uppercase">Weak Area Identified:</span>
                  {m.weakAreas}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {m.correct} Correct
                </span>
                <span className="flex items-center gap-1 text-rose-600 font-bold">
                  <XCircle className="w-3.5 h-3.5" /> {m.incorrect} Wrong
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-extrabold text-indigo-600 font-mono">
                  {m.accuracy}%
                </span>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="p-1 text-slate-300 hover:text-rose-600 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
