import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Clock,
  Award,
  Sparkles
} from 'lucide-react';
import { store, getSystemDateString } from '../lib/storage';
import { AnswerWritingItem } from '../types';

export const AnswerWritingView: React.FC = () => {
  const answers = store.getAnswerWriting() || [];
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [date, setDate] = useState(getSystemDateString());
  const [paper, setPaper] = useState('GS-2 (Polity & Governance)');
  const [question, setQuestion] = useState('');
  const [wordCount, setWordCount] = useState('240');
  const [timeTakenMinutes, setTimeTakenMinutes] = useState('9');
  const [score, setScore] = useState('6.5');
  const [maxScore, setMaxScore] = useState('10');
  const [feedback, setFeedback] = useState('');
  const [keyPointsIncluded, setKeyPointsIncluded] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    store.addAnswerWriting({
      date,
      paper,
      question: question.trim(),
      wordCount: parseInt(wordCount) || 200,
      timeTakenMinutes: parseInt(timeTakenMinutes) || 9,
      score: parseFloat(score) || 6,
      maxScore: parseFloat(maxScore) || 10,
      feedback: feedback.trim() || undefined,
      keyPointsIncluded: keyPointsIncluded.trim() ? keyPointsIncluded.split(',').map(s => s.trim()) : undefined
    });

    setQuestion('');
    setFeedback('');
    setKeyPointsIncluded('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this answer evaluation?')) {
      store.deleteAnswerWriting(id);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">UPSC Mains Art of Expression</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            MAINS ANSWER WRITING
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Recording speed, structure, dimensions, keyword usage, diagrams, and evaluation scores
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Log Written Answer
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white rounded-3xl p-6 border-2 border-indigo-500 shadow-xl space-y-4 animate-in fade-in duration-150">
          <h3 className="text-sm font-extrabold text-indigo-950 uppercase tracking-wide">
            Record Daily Mains Answer
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Paper</label>
              <select
                value={paper}
                onChange={(e) => setPaper(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none bg-white"
              >
                <option value="GS-1 (History, Society, Geo)">GS-1 (History, Society, Geo)</option>
                <option value="GS-2 (Polity & Governance)">GS-2 (Polity & Governance)</option>
                <option value="GS-3 (Economy, Env, S&T)">GS-3 (Economy, Env, S&T)</option>
                <option value="GS-4 (Ethics & Case Studies)">GS-4 (Ethics & Case Studies)</option>
                <option value="Essay Paper">Essay Paper</option>
                <option value="Optional Paper 1">Optional Paper 1</option>
                <option value="Optional Paper 2">Optional Paper 2</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Time Taken (Minutes)</label>
              <input
                type="number"
                value={timeTakenMinutes}
                onChange={(e) => setTimeTakenMinutes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Question</label>
            <textarea
              rows={2}
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. 'The fundamental right to privacy is not absolute.' Discuss in light of landmark judicial pronouncements."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Word Count</label>
              <input
                type="number"
                value={wordCount}
                onChange={(e) => setWordCount(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Self/Mentor Score</label>
              <input
                type="number"
                step="0.5"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum Marks</label>
              <input
                type="number"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Key Points Included (Comma-separated)</label>
            <input
              type="text"
              value={keyPointsIncluded}
              onChange={(e) => setKeyPointsIncluded(e.target.value)}
              placeholder="e.g. Puttaswamy Judgment 2017, Proportionality test, Article 21, Digital Personal Data Protection Act 2023"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Feedback & Areas to Polish</label>
            <textarea
              rows={2}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g. Introduction was crisp. Conclusion needs a more forward-looking administrative solution."
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
              Save Answer
            </button>
          </div>
        </form>
      )}

      {/* Answers List */}
      <div className="space-y-4">
        {(answers || []).map((a) => (
          <div
            key={a.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {a.paper}
                </span>
                <span className="text-xs font-mono text-slate-400 font-semibold">
                  {a.date}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl font-mono">
                  {a.score} / {a.maxScore}
                </span>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-sm font-extrabold text-slate-900 leading-relaxed mt-2">
              {a.question}
            </h3>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
              <span>Words: <strong className="text-slate-800">{a.wordCount}</strong></span>
              <span>•</span>
              <span>Time: <strong className="text-slate-800">{a.timeTakenMinutes} mins</strong></span>
            </div>

            {Array.isArray(a.keyPointsIncluded) && a.keyPointsIncluded.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {a.keyPointsIncluded.map((kp, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700"
                  >
                    ✓ {kp}
                  </span>
                ))}
              </div>
            )}

            {a.feedback && (
              <div className="mt-3 p-3 bg-amber-50/50 border border-amber-200/70 rounded-2xl text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-amber-900 block text-[10px] uppercase">Ravi's Review & Feedback:</span>
                {a.feedback}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
