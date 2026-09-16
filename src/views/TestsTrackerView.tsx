import React, { useState } from 'react';
import {
  Award,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { store, getSystemDateString } from '../lib/storage';
import { TestItem } from '../types';

export const TestsTrackerView: React.FC = () => {
  const tests = store.getTests() || [];
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [testName, setTestName] = useState('');
  const [testType, setTestType] = useState<'Sectional' | 'Full Length' | 'CSAT' | 'Mains Mock'>('Sectional');
  const [subject, setSubject] = useState('Indian Polity');
  const [date, setDate] = useState(getSystemDateString());
  const [score, setScore] = useState('142');
  const [maxScore, setMaxScore] = useState('200');
  const [accuracy, setAccuracy] = useState('78');
  const [rank, setRank] = useState('142 / 4,800');
  const [weakAreas, setWeakAreas] = useState('');
  const [analysisNotes, setAnalysisNotes] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim()) return;

    const sc = parseFloat(score) || 0;
    const mx = parseFloat(maxScore) || 200;
    const pct = Math.round((sc / mx) * 100);

    store.addTest({
      testName: testName.trim(),
      testType,
      subject,
      date,
      score: sc,
      maxScore: mx,
      accuracy: parseFloat(accuracy) || 75,
      rank: rank.trim() || undefined,
      weakAreas: weakAreas.trim() || undefined,
      analysisNotes: analysisNotes.trim() || undefined
    });

    setTestName('');
    setWeakAreas('');
    setAnalysisNotes('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this mock test report?')) {
      store.deleteTest(id);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Test Series & Evaluation Engine</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            TESTS & MOCKS TRACKER
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track sectional benchmarks, full-length simulations, cut-off comparisons, and error journals
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Log Test Result
        </button>
      </div>

      {/* Add Test Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white rounded-3xl p-6 border-2 border-indigo-500 shadow-xl space-y-4 animate-in fade-in duration-150">
          <h3 className="text-sm font-extrabold text-indigo-950 uppercase tracking-wide">
            Record Mock Test Performance
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Test Name</label>
              <input
                type="text"
                required
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="e.g. PW Polity Sectional Mock 01"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Test Type</label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none bg-white"
              >
                <option value="Sectional">Sectional Mock</option>
                <option value="Full Length">Full Length Mock (GS Paper 1)</option>
                <option value="CSAT">CSAT Aptitude</option>
                <option value="Mains Mock">Mains Mock Test</option>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Score Obtained</label>
              <input
                type="number"
                step="0.5"
                required
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum Marks</label>
              <input
                type="number"
                required
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rank (optional)</label>
              <input
                type="text"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                placeholder="e.g. 142 / 4,800"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Weak Areas / Error Journal</label>
            <input
              type="text"
              value={weakAreas}
              onChange={(e) => setWeakAreas(e.target.value)}
              placeholder="e.g. Silly mistakes in Article 356 vs 352"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Analysis & Takeaway</label>
            <textarea
              rows={2}
              value={analysisNotes}
              onChange={(e) => setAnalysisNotes(e.target.value)}
              placeholder="e.g. Time management was good. Need to be more patient on multiple-statement questions."
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
              Save Test Report
            </button>
          </div>
        </form>
      )}

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(tests || []).map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {t.testType}
                </span>
                <span className="text-xs font-mono text-slate-400 font-semibold">
                  {t.date}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                {t.testName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{t.subject}</p>

              {/* Score Bar */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Score Obtained</span>
                  <p className="text-2xl font-black text-slate-900 font-mono">
                    {t.score} <span className="text-xs font-semibold text-slate-500">/ {t.maxScore}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Percentage</span>
                  <p className="text-2xl font-black text-indigo-600 font-mono">
                    {t.percentage}%
                  </p>
                </div>
              </div>

              {t.rank && (
                <p className="text-xs font-bold text-slate-700 mt-3 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" /> Rank: {t.rank}
                </p>
              )}

              {t.weakAreas && (
                <div className="mt-2.5 p-2.5 bg-rose-50/60 border border-rose-200/70 rounded-xl text-xs text-rose-800">
                  <span className="font-bold block text-[10px] uppercase">Weak Areas:</span>
                  {t.weakAreas}
                </div>
              )}

              {t.analysisNotes && (
                <p className="text-xs text-slate-600 italic mt-2.5 leading-relaxed">
                  “{t.analysisNotes}”
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => handleDelete(t.id)}
                className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition-colors"
                title="Delete Test Report"
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
