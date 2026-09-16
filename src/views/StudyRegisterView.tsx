import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import { store, getSystemDateString } from '../lib/storage';
import { StudyEntry, StudyCategory, StudyStatus, DifficultyLevel } from '../types';

export const StudyRegisterView: React.FC = () => {
  const entries = store.getStudyEntries();
  const subjects = store.getSubjects();

  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Form states
  const [date, setDate] = useState(getSystemDateString());
  const [subject, setSubject] = useState(subjects[0]?.name || 'Indian Polity & Constitution');
  const [topic, setTopic] = useState('');
  const [studyType, setStudyType] = useState<StudyCategory>('GS');
  const [startTime, setStartTime] = useState('05:30');
  const [endTime, setEndTime] = useState('07:00');
  const [durationHours, setDurationHours] = useState('1.5');
  const [source, setSource] = useState('M. Laxmikanth (7th Edition)');
  const [revision, setRevision] = useState(false);
  const [mcqCount, setMcqCount] = useState('0');
  const [pyqCount, setPyqCount] = useState('0');
  const [answerWritingCount, setAnswerWritingCount] = useState('0');
  const [testCount, setTestCount] = useState('0');
  const [status, setStatus] = useState<StudyStatus>('Completed');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Moderate');
  const [notes, setNotes] = useState('');

  // Filtering
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const q = (searchQuery || '').toLowerCase();
      const matchesSearch = !q ||
        ((e.topic || '') + '').toLowerCase().includes(q) ||
        ((e.subject || '') + '').toLowerCase().includes(q) ||
        Boolean(e.notes && e.notes.toLowerCase().includes(q));

      const matchesSubject = selectedSubject === 'all' || e.subject === selectedSubject;
      const matchesType = selectedType === 'all' || e.studyType === selectedType;

      return matchesSearch && matchesSubject && matchesType;
    });
  }, [entries, searchQuery, selectedSubject, selectedType]);

  const totalFilteredHours = filteredEntries.reduce((sum, e) => sum + e.durationHours, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    store.addStudyEntry({
      date,
      subject,
      topic: topic.trim(),
      studyType,
      startTime,
      endTime,
      durationHours: parseFloat(durationHours) || 1.0,
      source: source.trim(),
      revision,
      mcqCount: parseInt(mcqCount) || 0,
      pyqCount: parseInt(pyqCount) || 0,
      answerWritingCount: parseInt(answerWritingCount) || 0,
      testCount: parseInt(testCount) || 0,
      status,
      difficulty,
      notes: notes.trim() || undefined
    });

    setTopic('');
    setNotes('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this study register entry?')) {
      store.deleteStudyEntry(id);
    }
  };

  const exportCSV = () => {
    const headers = ['Date,Subject,Topic,Category,Hours,Source,MCQs,PYQs,Status,Notes'];
    const rows = filteredEntries.map(e =>
      `"${e.date}","${e.subject}","${e.topic.replace(/"/g, '""')}","${e.studyType}",${e.durationHours},"${e.source}",${e.mcqCount},${e.pyqCount},"${e.status}","${(e.notes || '').replace(/"/g, '""')}"`
    );
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UPSC_2029_Study_Register_${getSystemDateString()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Official Daily Study Tracker</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            STUDY REGISTER
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Total logged preparation: <strong className="text-slate-900">{totalFilteredHours} hours</strong> across {filteredEntries.length} sessions
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Log Study Session
          </button>
        </div>
      </div>

      {/* Log Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border-2 border-indigo-500 shadow-xl space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-indigo-950 uppercase tracking-wide">
              Log Official Study Session
            </h3>
            <span className="text-xs text-slate-500">All fields record directly to persistent storage</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-white"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
                <option value="Current Affairs & Editorials">Current Affairs & Editorials</option>
                <option value="PhysicsWallah UPSC Batch">PhysicsWallah UPSC Batch</option>
                <option value="CSAT Aptitude & Comprehension">CSAT Aptitude & Comprehension</option>
                <option value="Essay & Ethics Case Studies">Essay & Ethics Case Studies</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Study Category</label>
              <select
                value={studyType}
                onChange={(e) => setStudyType(e.target.value as StudyCategory)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-white"
              >
                <option value="GS">GS Deep Study</option>
                <option value="Current Affairs">Current Affairs</option>
                <option value="PW Class">PW Class</option>
                <option value="NCERT">NCERT</option>
                <option value="Standard Book">Standard Book</option>
                <option value="Revision">Active Revision</option>
                <option value="MCQ">MCQ Practice</option>
                <option value="PYQ">PYQ Analysis</option>
                <option value="Answer Writing">Answer Writing</option>
                <option value="Optional">Optional</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Topic / Chapter / Lecture Name</label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Fundamental Rights (Article 19 to 22) - Freedom & Personal Liberty"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Hours)</label>
              <input
                type="number"
                step="0.25"
                min="0.25"
                max="12"
                required
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Source / Book / Faculty</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. Laxmikanth Ch 7"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StudyStatus)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-white"
              >
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Needs Revision">Needs Revision</option>
                <option value="Incomplete">Incomplete</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-white"
              >
                <option value="Easy">Easy</option>
                <option value="Moderate">Moderate</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">MCQs Solved</label>
              <input
                type="number"
                min="0"
                value={mcqCount}
                onChange={(e) => setMcqCount(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">PYQs Solved</label>
              <input
                type="number"
                min="0"
                value={pyqCount}
                onChange={(e) => setPyqCount(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Answers Written</label>
              <input
                type="number"
                min="0"
                value={answerWritingCount}
                onChange={(e) => setAnswerWritingCount(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              />
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 text-xs font-bold text-indigo-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={revision}
                  onChange={(e) => setRevision(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                Was Active Revision
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Key Takeaway / Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Mastered reasonable restrictions under Art 19(2). Need to practice Mains 2021 question on sedition."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
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
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md cursor-pointer"
            >
              Save to Study Register
            </button>
          </div>
        </form>
      )}

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topic or notes..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white outline-none"
          >
            <option value="all">All Subjects</option>
            {(subjects || []).map(s => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white outline-none"
          >
            <option value="all">All Types</option>
            <option value="GS">GS</option>
            <option value="PW Class">PW Class</option>
            <option value="NCERT">NCERT</option>
            <option value="Standard Book">Standard Book</option>
            <option value="Revision">Revision</option>
          </select>
        </div>
      </div>

      {/* Entries Table / List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Subject & Topic</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Hours</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4 text-center">MCQ/PYQ</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {(filteredEntries || []).map((e, idx) => (
                <tr key={`${e.id || 'entry'}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-600 font-medium whitespace-nowrap">
                    {e.date}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="font-extrabold text-slate-900">{e.topic}</p>
                    <p className="text-[11px] text-indigo-700 font-semibold mt-0.5">{e.subject}</p>
                    {e.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-0.5 truncate">{e.notes}</p>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                      {e.studyType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-slate-900 font-mono">
                    {e.durationHours}h
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                    {e.source}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-600 font-mono text-[11px]">
                    {e.mcqCount > 0 && <span className="mr-1 text-emerald-700 font-bold">{e.mcqCount}M</span>}
                    {e.pyqCount > 0 && <span className="text-purple-700 font-bold">{e.pyqCount}P</span>}
                    {e.mcqCount === 0 && e.pyqCount === 0 && '-'}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      e.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
