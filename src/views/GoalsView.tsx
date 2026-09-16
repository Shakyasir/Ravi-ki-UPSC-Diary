import React, { useState } from 'react';
import {
  Target,
  Plus,
  CheckCircle2,
  Trash2,
  Clock,
  Calendar,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { store } from '../lib/storage';
import { GoalItem, GoalCategory } from '../types';

export const GoalsView: React.FC = () => {
  const goals = store.getGoals() || [];
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalCategory>('Monthly');
  const [targetValue, setTargetValue] = useState('Finish 15 chapters');
  const [currentValue, setCurrentValue] = useState('10 chapters');
  const [progressPercent, setProgressPercent] = useState('65');
  const [deadline, setDeadline] = useState('2026-09-30');

  const filteredGoals = (goals || []).filter(g => selectedCategory === 'all' || g.category === selectedCategory);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    store.addGoal({
      title: title.trim(),
      category,
      targetValue: targetValue.trim(),
      currentValue: currentValue.trim(),
      progressPercent: parseInt(progressPercent) || 0,
      deadline,
      status: parseInt(progressPercent) >= 100 ? 'Completed' : 'In Progress'
    });

    setTitle('');
    setIsAdding(false);
  };

  const handleUpdateProgress = (goalId: string, delta: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      const newPct = Math.max(0, Math.min(100, goal.progressPercent + delta));
      store.updateGoal(goalId, {
        progressPercent: newPct,
        status: newPct >= 100 ? 'Completed' : 'In Progress'
      });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this goal?')) {
      store.deleteGoal(id);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Strategic Milestones</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            UPSC 2029 GOALS COMMAND
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Weekly targets, monthly syllabus quotas, yearly stages, and the ultimate 2029 victory
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Goal
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {['all', 'Weekly', 'Monthly', 'Quarterly', 'Yearly', '2029 Ultimate'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat === 'all' ? 'All Goals' : cat}
          </button>
        ))}
      </div>

      {/* Add Goal Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white rounded-3xl p-6 border-2 border-indigo-500 shadow-xl space-y-4 animate-in fade-in duration-150">
          <h3 className="text-sm font-extrabold text-indigo-950 uppercase tracking-wide">
            Define Target Milestone
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Goal Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Complete NCERT Class 11 & 12 Political Science"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GoalCategory)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none bg-white"
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
                <option value="2029 Ultimate">2029 Ultimate</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Value</label>
              <input
                type="text"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Progress</label>
              <input
                type="text"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
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
              Save Milestone
            </button>
          </div>
        </form>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(filteredGoals || []).map((g) => (
          <div
            key={g.id}
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {g.category}
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  g.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {g.status}
                </span>
              </div>

              <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                {g.title}
              </h3>

              <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                <p>Status: <strong className="text-slate-800">{g.currentValue}</strong> / {g.targetValue}</p>
                <p>Deadline: <strong className="text-indigo-600 font-mono">{g.deadline}</strong></p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                <span className="text-slate-500">Progress</span>
                <span className="text-indigo-600 font-black">{g.progressPercent}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-3">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${g.progressPercent}%` }}
                />
              </div>

              {/* Increment Buttons */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleUpdateProgress(g.id, 10)}
                    className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 font-bold text-[10px] text-indigo-700"
                  >
                    +10%
                  </button>
                  <button
                    onClick={() => handleUpdateProgress(g.id, 25)}
                    className="px-2 py-1 rounded-lg bg-indigo-100 hover:bg-indigo-200 font-bold text-[10px] text-indigo-800"
                  >
                    +25%
                  </button>
                  {g.progressPercent < 100 && (
                    <button
                      onClick={() => handleUpdateProgress(g.id, 100)}
                      className="px-2 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 font-bold text-[10px] text-emerald-800"
                    >
                      Done ✓
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(g.id)}
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
