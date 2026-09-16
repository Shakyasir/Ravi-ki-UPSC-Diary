import React, { useState } from 'react';
import {
  BookMarked,
  Plus,
  Search,
  Calendar,
  Sparkles,
  Smile,
  Trash2,
  Edit2,
  Heart,
  Save,
  Check
} from 'lucide-react';
import { store, getSystemDateString } from '../lib/storage';
import { DiaryEntry } from '../types';

export const DailyDiaryView: React.FC = () => {
  const diaryEntries = store.getDiaryEntries() || [];
  const [selectedDate, setSelectedDate] = useState<string>(getSystemDateString());
  const [searchQuery, setSearchQuery] = useState('');

  // Current entry for the selected date
  const currentEntry = store.getDiaryEntryByDate(selectedDate);

  // Form states (prefilled with current entry if available)
  const [whatIStudied, setWhatIStudied] = useState(currentEntry?.whatIStudied || '5.5 hours. Polity Article 19-22, PW Indian Geography lecture, and The Hindu editorial on judicial appointments.');
  const [whatICompleted, setWhatICompleted] = useState(currentEntry?.whatICompleted || 'Completed notes for Fundamental Rights part 2; solved 20 MCQs.');
  const [whatWentWell, setWhatWentWell] = useState(currentEntry?.whatWentWell || 'Woke up at 5:00 AM on the first alarm without hitting snooze.');
  const [whatCouldBeImproved, setWhatCouldBeImproved] = useState(currentEntry?.whatCouldBeImproved || 'Need to reduce phone screen time during office lunch break.');
  const [todaysLesson, setTodaysLesson] = useState(currentEntry?.todaysLesson || 'नौकरी के साथ UPSC निकालना मुश्किल जरूर है, पर नामुमकिन नहीं। आज के 5.5 घंटे मुझे मेरी मंजिल के और करीब ले गए।');
  const [biggestAchievement, setBiggestAchievement] = useState(currentEntry?.biggestAchievement || '85% accuracy in today’s PW Daily Practice Sheet.');
  const [mood, setMood] = useState(currentEntry?.mood || 'Motivated');
  const [thoughtsAndFeelings, setThoughtsAndFeelings] = useState(currentEntry?.thoughtsAndFeelings || 'LBSNAA ki tasveer desk par lagi hai. Koi thakan mehsoos nahi ho rahi.');
  const [tomorrowsPlan, setTomorrowsPlan] = useState(currentEntry?.tomorrowsPlan || 'Polity Article 23-30 + PW Recorded lecture + 1 Mains answer on Sedition law.');
  const [quoteForToday, setQuoteForToday] = useState(currentEntry?.quoteForToday || '“चलो कुछ ऐसा कर जाएँ, कि नाम हमारा मिसाल बन जाए।”');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // When selected date changes, load that entry
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    const ent = store.getDiaryEntryByDate(date);
    if (ent) {
      setWhatIStudied(ent.whatIStudied || ent.whatILearned || '');
      setWhatICompleted(ent.whatICompleted || '');
      setWhatWentWell(ent.whatWentWell || '');
      setWhatCouldBeImproved(ent.whatCouldBeImproved || ent.howToImproveTomorrow || '');
      setTodaysLesson(ent.todaysLesson || '');
      setBiggestAchievement(ent.biggestAchievement || '');
      setMood(ent.mood || 'Focused');
      setThoughtsAndFeelings(ent.thoughtsAndFeelings || '');
      setTomorrowsPlan(ent.tomorrowsPlan || '');
      setQuoteForToday(ent.quoteForToday || '“चलो कुछ ऐसा कर जाएँ, कि नाम हमारा मिसाल बन जाए।”');
    } else {
      // Clear for new entry
      setWhatIStudied('');
      setWhatICompleted('');
      setWhatWentWell('');
      setWhatCouldBeImproved('');
      setTodaysLesson('');
      setBiggestAchievement('');
      setMood('Focused');
      setThoughtsAndFeelings('');
      setTomorrowsPlan('');
      setQuoteForToday('“चलो कुछ ऐसा कर जाएँ, कि नाम हमारा मिसाल बन जाए।”');
    }
  };

  const handleSaveDiary = (e: React.FormEvent) => {
    e.preventDefault();
    store.saveDiaryEntry({
      date: selectedDate,
      whatILearned: whatIStudied || todaysLesson || '',
      whatIStudied: whatIStudied || '',
      whatICompleted: whatICompleted || '',
      whatWentWell: whatWentWell || '',
      whatCouldBeImproved: whatCouldBeImproved || '',
      todaysLesson: todaysLesson || '',
      biggestAchievement: biggestAchievement || '',
      mood: mood || 'Focused',
      thoughtsAndFeelings: thoughtsAndFeelings || '',
      tomorrowsPlan: tomorrowsPlan || '',
      quoteForToday: quoteForToday || ''
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this diary reflection?')) {
      store.deleteDiaryEntry(id);
    }
  };

  const filteredHistory = (diaryEntries || []).filter(d =>
    ((d.todaysLesson || '') + '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    ((d.whatILearned || '') + '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    ((d.date || '') + '').includes(searchQuery || '')
  );

  const moodOptions = ['Motivated', 'Focused', 'Tired', 'Anxious', 'Peaceful', 'Unstoppable'];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Ravi's Private Sanctum</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            RAVI KI UPSC DIARY
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Private daily honest reflections, lessons learned, emotional resilience, and tomorrow’s blueprint
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleSelectDate(e.target.value)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Diary Entry Editor (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <form onSubmit={handleSaveDiary} className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Journaling for</span>
                <h3 className="text-lg font-extrabold text-slate-900 font-mono">
                  {selectedDate}
                </h3>
              </div>

              {/* Mood Selector Pills */}
              <div className="flex flex-wrap gap-1.5">
                {moodOptions.map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      mood === m
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Hindi Lesson Box */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
              <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                आज का Lesson (Today's Key Wisdom)
              </label>
              <textarea
                rows={2}
                value={todaysLesson || ''}
                onChange={(e) => setTodaysLesson(e.target.value)}
                placeholder="आज दिन भर की पढ़ाई और अनुभव से मैंने क्या सीखा..."
                className="w-full p-3 text-xs sm:text-sm font-hindi bg-white rounded-xl border border-amber-200 outline-none leading-relaxed text-slate-800"
              />
            </div>

            {/* Biggest Achievement */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                आज की सबसे बड़ी उपलब्धि (Today's Biggest Achievement)
              </label>
              <input
                type="text"
                value={biggestAchievement || ''}
                onChange={(e) => setBiggestAchievement(e.target.value)}
                placeholder="e.g. 5.5 hours complete, solved 25 MCQs without distraction"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">What Went Well</label>
                <textarea
                  rows={2}
                  value={whatWentWell || ''}
                  onChange={(e) => setWhatWentWell(e.target.value)}
                  placeholder="e.g. Sharp morning 5:30 slot focus"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">What Could Be Improved</label>
                <textarea
                  rows={2}
                  value={whatCouldBeImproved || ''}
                  onChange={(e) => setWhatCouldBeImproved(e.target.value)}
                  placeholder="e.g. Don't scroll social media before sleeping"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Ravi's Private Thoughts, Feelings & Inner Monologue
              </label>
              <textarea
                rows={3}
                value={thoughtsAndFeelings || ''}
                onChange={(e) => setThoughtsAndFeelings(e.target.value)}
                placeholder="Write your raw, honest thoughts here. How are you feeling about your progress and the 2029 target?"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Tomorrow's Battle Plan (कल का लक्ष्य)
              </label>
              <input
                type="text"
                value={tomorrowsPlan || ''}
                onChange={(e) => setTomorrowsPlan(e.target.value)}
                placeholder="e.g. Complete DPSP, attend PW Live Class at 7 PM"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Tagline / Guiding Quote for Today
              </label>
              <input
                type="text"
                value={quoteForToday || ''}
                onChange={(e) => setQuoteForToday(e.target.value)}
                placeholder="“चलो कुछ ऐसा कर जाएँ, कि नाम हमारा मिसाल बन जाए।”"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-hindi italic text-slate-700"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {savedSuccess ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-4 h-4" /> Entry Saved to Storage!
                  </span>
                ) : (
                  'Entries autosave to localStorage & Supabase'
                )}
              </span>

              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save Today's Diary Entry
              </button>
            </div>
          </form>
        </div>

        {/* Past Reflections Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Diary Archive & History
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Read your past journey</p>
            </div>

            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reflections..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 outline-none"
              />
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {(filteredHistory || []).map((d) => (
                <div
                  key={d.id}
                  onClick={() => handleSelectDate(d.date)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedDate === d.date
                      ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 font-mono">{d.date}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {d.mood}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-hindi mt-1 line-clamp-2">
                    {d.todaysLesson || d.whatILearned}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 italic">
              "Words written in determination become reality in action."
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
