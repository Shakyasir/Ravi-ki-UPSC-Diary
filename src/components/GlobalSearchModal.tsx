import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  X, 
  BookOpen, 
  Library, 
  Layers, 
  Target, 
  BookMarked, 
  FileCheck2, 
  HelpCircle, 
  Award, 
  CheckSquare,
  ArrowRight
} from 'lucide-react';
import { store } from '../lib/storage';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener (Cmd/Ctrl + K and Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const results: Array<{
      category: string;
      title: string;
      subtitle: string;
      tab: string;
      icon: any;
    }> = [];

    // 1. Study Entries
    (store.getStudyEntries() || []).forEach(e => {
      const subj = ((e.subject || '') + '').toLowerCase();
      const top = ((e.topic || '') + '').toLowerCase();
      const nts = ((e.notes || '') + '').toLowerCase();
      if (subj.includes(q) || top.includes(q) || nts.includes(q)) {
        results.push({
          category: 'Study Register',
          title: `${e.subject || 'GS'} — ${e.topic || 'General'}`,
          subtitle: `${e.date || ''} • ${e.durationHours || 0}h • ${e.studyType || 'GS'}`,
          tab: 'register',
          icon: BookOpen
        });
      }
    });

    // 2. Books
    (store.getBooks() || []).forEach(b => {
      const nm = ((b.name || '') + '').toLowerCase();
      const subj = ((b.subject || '') + '').toLowerCase();
      const auth = ((b.author || '') + '').toLowerCase();
      if (nm.includes(q) || subj.includes(q) || auth.includes(q)) {
        results.push({
          category: 'Books & Resources',
          title: b.name || 'Untitled Resource',
          subtitle: `${b.author || 'Author'} • ${b.subject || 'GS'} (${b.progressPercent || 0}% read)`,
          tab: 'books',
          icon: Library
        });
      }
    });

    // 3. Subjects
    (store.getSubjects() || []).forEach(s => {
      const nm = ((s.name || '') + '').toLowerCase();
      const desc = ((s.description || '') + '').toLowerCase();
      if (nm.includes(q) || desc.includes(q)) {
        results.push({
          category: 'Subjects',
          title: s.name || 'Subject',
          subtitle: `${s.studyHours || 0}h studied • ${s.completedTopics || 0}/${s.totalTopics || 0} topics`,
          tab: 'subjects',
          icon: Layers
        });
      }
    });

    // 4. Goals
    (store.getGoals() || []).forEach(g => {
      const tit = ((g.title || '') + '').toLowerCase();
      const cat = ((g.category || '') + '').toLowerCase();
      if (tit.includes(q) || cat.includes(q)) {
        results.push({
          category: 'Goals',
          title: g.title || 'Goal',
          subtitle: `Deadline: ${g.deadline || 'Pending'} • ${g.progressPercent || 0}% completed (${g.status || 'Active'})`,
          tab: 'goals',
          icon: Target
        });
      }
    });

    // 5. Diary
    (store.getDiaryEntries() || []).forEach(d => {
      const learned = ((d.whatILearned || '') + '').toLowerCase();
      const completed = ((d.whatICompleted || '') + '').toLowerCase();
      const lesson = ((d.todaysLesson || '') + '').toLowerCase();
      const ach = ((d.biggestAchievement || '') + '').toLowerCase();
      if (learned.includes(q) || completed.includes(q) || lesson.includes(q) || ach.includes(q)) {
        results.push({
          category: 'Daily Diary',
          title: `Diary Entry: ${d.date || 'Today'}`,
          subtitle: d.todaysLesson || (d.whatILearned ? d.whatILearned.slice(0, 70) : ''),
          tab: 'diary',
          icon: BookMarked
        });
      }
    });

    // 6. PYQs
    (store.getPYQs() || []).forEach(p => {
      const qn = ((p.question || '') + '').toLowerCase();
      const top = ((p.topic || '') + '').toLowerCase();
      const subj = ((p.subject || '') + '').toLowerCase();
      if (qn.includes(q) || top.includes(q) || subj.includes(q)) {
        results.push({
          category: 'PYQ Tracker',
          title: `UPSC ${p.year || 2024} (${p.exam || 'Prelims'}) — ${p.topic || 'General'}`,
          subtitle: (p.question || '').slice(0, 90) + '...',
          tab: 'pyqs',
          icon: FileCheck2
        });
      }
    });

    // 7. MCQs
    (store.getMCQs() || []).forEach(m => {
      const top = ((m.topic || '') + '').toLowerCase();
      const subj = ((m.subject || '') + '').toLowerCase();
      if (top.includes(q) || subj.includes(q)) {
        results.push({
          category: 'MCQ Practice',
          title: `${m.subject || 'GS'} — ${m.topic || 'General'}`,
          subtitle: `${m.date || ''} • ${m.correct || 0}/${m.totalQuestions || 0} Correct (${m.accuracy || 0}%)`,
          tab: 'mcqs',
          icon: HelpCircle
        });
      }
    });

    // 8. Tests
    (store.getTests() || []).forEach(t => {
      const tn = ((t.testName || '') + '').toLowerCase();
      const subj = ((t.subject || '') + '').toLowerCase();
      if (tn.includes(q) || subj.includes(q)) {
        results.push({
          category: 'Tests & Mocks',
          title: t.testName || 'Test',
          subtitle: `${t.date || ''} • Score: ${t.score || 0}/${t.maxScore || 100} (${t.percentage || 0}%)`,
          tab: 'tests',
          icon: Award
        });
      }
    });

    // 9. Tasks
    (store.getTodayTasks() || []).forEach(t => {
      const tit = ((t.title || '') + '').toLowerCase();
      if (tit.includes(q)) {
        results.push({
          category: "Today's Mission",
          title: t.title || 'Task',
          subtitle: `${t.durationHours || 0}h • ${t.completed ? 'Completed ✓' : 'Pending'}`,
          tab: 'mission',
          icon: CheckSquare
        });
      }
    });

    return results.slice(0, 15);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 gap-3">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search study logs, books, subjects, goals, diary, PYQs, tests..."
            className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400 font-medium"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 rounded-lg"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-60" />
              Type keywords like "Polity", "Laxmikanth", "PW Class", "PYQ 2023", or Hindi diary reflections...
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No matching records found for "<span className="font-semibold text-slate-700">{query}</span>"
            </div>
          ) : (
            searchResults.map((res, i) => {
              const Icon = res.icon;
              return (
                <div
                  key={i}
                  onClick={() => {
                    onNavigate(res.tab);
                    onClose();
                  }}
                  className="p-3 hover:bg-indigo-50/60 rounded-xl cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-indigo-100 text-slate-600 group-hover:text-indigo-600 transition-colors mt-0.5 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-1.5 py-0.5 rounded">
                          {res.category}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 truncate mt-0.5">{res.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">{res.subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors shrink-0 ml-3" />
                </div>
              );
            })
          )}
        </div>

        {/* Footer Quick Tips */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">Enter</kbd> to jump</span>
          <span>Searching 9 interconnected preparation modules</span>
        </div>
      </div>
    </div>
  );
};
