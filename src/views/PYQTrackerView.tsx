import React, { useState } from 'react';
import {
  FileCheck2,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Filter
} from 'lucide-react';
import { store } from '../lib/storage';
import { PYQItem } from '../types';

export const PYQTrackerView: React.FC = () => {
  const pyqs = store.getPYQs() || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExam, setSelectedExam] = useState('all');
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [year, setYear] = useState('2024');
  const [exam, setExam] = useState<'Prelims' | 'Mains'>('Prelims');
  const [paper, setPaper] = useState('GS Paper 1');
  const [subject, setSubject] = useState('Indian Polity');
  const [topic, setTopic] = useState('');
  const [question, setQuestion] = useState('');
  const [status, setStatus] = useState<'Solved' | 'Attempted' | 'Unsolved' | 'Mastered'>('Solved');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Moderate' | 'Hard'>('Moderate');
  const [solutionNotes, setSolutionNotes] = useState('');

  const filtered = pyqs.filter(p => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch = !q ||
      ((p.question || '') + '').toLowerCase().includes(q) ||
      ((p.topic || '') + '').toLowerCase().includes(q) ||
      ((p.subject || '') + '').toLowerCase().includes(q);
    const matchesExam = selectedExam === 'all' || p.exam === selectedExam;
    return matchesSearch && matchesExam;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    store.addPYQ({
      year: parseInt(year) || 2024,
      exam,
      paper,
      subject,
      topic: topic.trim() || 'General',
      question: question.trim(),
      status,
      difficulty,
      solutionNotes: solutionNotes.trim() || undefined
    });

    setQuestion('');
    setTopic('');
    setSolutionNotes('');
    setIsAdding(false);
  };

  const handleToggleStatus = (id: string) => {
    const item = pyqs.find(p => p.id === id);
    if (item) {
      const nextStatus = item.status === 'Solved' ? 'Mastered' : item.status === 'Mastered' ? 'Attempted' : 'Solved';
      store.updatePYQ(id, { status: nextStatus });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this PYQ record?')) {
      store.deletePYQ(id);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">UPSC PYQ Repository (2013-2025)</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            PREVIOUS YEARS QUESTIONS (PYQ)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Mastering genuine UPSC pattern, recurring themes, and answer nuances
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Log Solved PYQ
        </button>
      </div>

      {/* Add PYQ Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white rounded-3xl p-6 border-2 border-indigo-500 shadow-xl space-y-4 animate-in fade-in duration-150">
          <h3 className="text-sm font-extrabold text-indigo-950 uppercase tracking-wide">
            Record Solved PYQ
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Type</label>
              <select
                value={exam}
                onChange={(e) => setExam(e.target.value as 'Prelims' | 'Mains')}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none bg-white"
              >
                <option value="Prelims">Prelims</option>
                <option value="Mains">Mains</option>
              </select>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Fundamental Rights"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Question Text</label>
            <textarea
              rows={3}
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Paste UPSC official question here..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Solution Notes / Model Dimensions</label>
            <textarea
              rows={2}
              value={solutionNotes}
              onChange={(e) => setSolutionNotes(e.target.value)}
              placeholder="Key concepts tested, trap options, landmark judgments..."
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
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
            >
              Save PYQ Record
            </button>
          </div>
        </form>
      )}

      {/* PYQ List */}
      <div className="space-y-3">
        {(filtered || []).map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-mono">
                  UPSC {p.year}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {p.exam} • {p.paper}
                </span>
                <span className="text-xs font-bold text-slate-600">
                  {p.subject} ({p.topic})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleStatus(p.id)}
                  className={`text-xs font-extrabold px-3 py-1 rounded-xl cursor-pointer ${
                    p.status === 'Mastered'
                      ? 'bg-purple-100 text-purple-800'
                      : p.status === 'Solved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {p.status} ✓
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs font-bold text-slate-900 leading-relaxed mt-2">
              {p.question}
            </p>

            {p.solutionNotes && (
              <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800 block mb-0.5">Ravi's Analysis & Model Notes:</span>
                {p.solutionNotes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
