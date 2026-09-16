import React, { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  BookOpen,
  Edit2,
  Trash2,
  X,
  Sparkles,
  Check,
  RotateCcw,
  Tag,
  HelpCircle,
  FileCheck2,
  Award,
  Filter
} from 'lucide-react';
import { store, subscribeToStore } from '../lib/storage';
import { SubjectItem } from '../types';

const POPULAR_OPTIONALS = [
  'PSIR (Political Science & International Relations)',
  'Sociology',
  'Geography',
  'History',
  'Public Administration',
  'Anthropology',
  'Philosophy',
  'Economics',
  'Law',
  'Hindi Literature',
  'Commerce & Accountancy',
  'Agriculture',
  'Mathematics'
];

const PRESET_PAPERS = [
  'GS-1',
  'GS-2',
  'GS-3',
  'GS-4',
  'Prelims GS',
  'CSAT',
  'Essay',
  'Optional Paper 1',
  'Optional Paper 2',
  'Optional (Paper 1 & 2)',
  'Language / Compulsory',
  'General'
];

const PRESET_COLORS = [
  { label: 'Indigo', value: '#4F46E5', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  { label: 'Amber', value: '#D97706', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  { label: 'Emerald', value: '#059669', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  { label: 'Purple', value: '#9333EA', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  { label: 'Rose', value: '#E11D48', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  { label: 'Cyan', value: '#0891B2', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  { label: 'Blue', value: '#2563EB', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  { label: 'Orange', value: '#EA580C', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' }
];

export const SubjectsView: React.FC = () => {
  const [subjects, setSubjects] = useState<SubjectItem[]>(() => store.getSubjects() || []);
  const [profile, setProfile] = useState(() => store.getProfile());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaper, setSelectedPaper] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'GS' | 'Optional' | 'Other'>('all');
  const [notification, setNotification] = useState<string | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChangingOptionalModal, setIsChangingOptionalModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formPaper, setFormPaper] = useState('GS-1');
  const [formCategory, setFormCategory] = useState<'GS' | 'Optional' | 'Other'>('GS');
  const [formDescription, setFormDescription] = useState('');
  const [formTotalTopics, setFormTotalTopics] = useState<number>(40);
  const [formCompletedTopics, setFormCompletedTopics] = useState<number>(0);
  const [formStudyHours, setFormStudyHours] = useState<number>(0);
  const [formRevisionCount, setFormRevisionCount] = useState<number>(0);
  const [formPyqCount, setFormPyqCount] = useState<number>(0);
  const [formMcqCount, setFormMcqCount] = useState<number>(0);
  const [formTestCount, setFormTestCount] = useState<number>(0);
  const [formColor, setFormColor] = useState('#4F46E5');

  // Quick Change Optional state
  const [customOptionalInput, setCustomOptionalInput] = useState('');

  // Subscribe to storage changes
  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      setSubjects(store.getSubjects() || []);
      setProfile(store.getProfile());
    });
    return unsubscribe;
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredSubjects = (subjects || []).filter(s => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch = !q ||
      ((s.name || '') + '').toLowerCase().includes(q) ||
      Boolean(s.description && s.description.toLowerCase().includes(q)) ||
      Boolean(s.paper && s.paper.toLowerCase().includes(q));

    const matchesPaper = selectedPaper === 'all' || Boolean(s.paper && s.paper.toLowerCase().includes(selectedPaper.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;

    return matchesSearch && matchesPaper && matchesCategory;
  });

  const totalStudyHours = Math.round(subjects.reduce((sum, s) => sum + (s.studyHours || 0), 0) * 10) / 10;
  const totalCompletedTopics = subjects.reduce((sum, s) => sum + (s.completedTopics || 0), 0);
  const totalAllTopics = subjects.reduce((sum, s) => sum + (s.totalTopics || 0), 0);
  const overallSubjectProgress = totalAllTopics > 0 ? Math.round((totalCompletedTopics / totalAllTopics) * 100) : 0;

  // Find optional subject if configured
  const optionalSubjectItem = subjects.find(s => s.category === 'Optional') || subjects.find(s => s.id === 'sub-optional');

  // Open Edit Modal
  const handleOpenEdit = (subject: SubjectItem) => {
    setEditingSubject(subject);
    setFormName(subject.name || '');
    setFormPaper(subject.paper || 'GS-1');
    setFormCategory(subject.category || 'GS');
    setFormDescription(subject.description || '');
    setFormTotalTopics(subject.totalTopics ?? 40);
    setFormCompletedTopics(subject.completedTopics ?? 0);
    setFormStudyHours(subject.studyHours ?? 0);
    setFormRevisionCount(subject.revisionCount ?? 0);
    setFormPyqCount(subject.pyqCount ?? 0);
    setFormMcqCount(subject.mcqCount ?? 0);
    setFormTestCount(subject.testCount ?? 0);
    setFormColor(subject.color || '#4F46E5');
    setIsModalOpen(true);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingSubject(null);
    setFormName('');
    setFormPaper('GS-1');
    setFormCategory('GS');
    setFormDescription('');
    setFormTotalTopics(40);
    setFormCompletedTopics(0);
    setFormStudyHours(0);
    setFormRevisionCount(0);
    setFormPyqCount(0);
    setFormMcqCount(0);
    setFormTestCount(0);
    setFormColor('#4F46E5');
    setIsModalOpen(true);
  };

  // Save Subject
  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const totalTopicsSafe = Math.max(1, formTotalTopics || 1);
    const completedTopicsSafe = Math.max(0, Math.min(totalTopicsSafe, formCompletedTopics || 0));
    const progressPercent = Math.round((completedTopicsSafe / totalTopicsSafe) * 100);

    const subjectData = {
      name: formName.trim(),
      paper: formPaper,
      category: formCategory,
      description: formDescription.trim(),
      totalTopics: totalTopicsSafe,
      completedTopics: completedTopicsSafe,
      progressPercent,
      studyHours: Math.max(0, formStudyHours || 0),
      revisionCount: Math.max(0, formRevisionCount || 0),
      pyqCount: Math.max(0, formPyqCount || 0),
      mcqCount: Math.max(0, formMcqCount || 0),
      testCount: Math.max(0, formTestCount || 0),
      color: formColor || '#4F46E5'
    };

    if (editingSubject) {
      store.updateSubject(editingSubject.id, subjectData);

      // If updating the Optional subject, keep profile.optionalSubject synced
      if (formCategory === 'Optional' || editingSubject.category === 'Optional' || editingSubject.id === 'sub-optional') {
        const cleanOptionalName = formName.replace(/\s*Optional.*$/i, '').trim();
        store.updateProfile({ optionalSubject: cleanOptionalName });
      }

      showToast(`“${formName}” successfully updated!`);
    } else {
      store.addSubject(subjectData);

      if (formCategory === 'Optional') {
        const cleanOptionalName = formName.replace(/\s*Optional.*$/i, '').trim();
        store.updateProfile({ optionalSubject: cleanOptionalName });
      }

      showToast(`New subject “${formName}” added to syllabus!`);
    }

    setIsModalOpen(false);
  };

  // Delete Subject
  const handleDeleteSubject = (id: string, name: string) => {
    if (subjects.length <= 1) {
      alert('You cannot delete the last remaining subject.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${name}" from your syllabus?`)) {
      store.deleteSubject(id);
      showToast(`Deleted "${name}"`);
    }
  };

  // Quick increment/decrement topics
  const handleUpdateTopicCount = (subjectId: string, delta: number) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (subject) {
      const total = Math.max(1, subject.totalTopics);
      const newCompleted = Math.max(0, Math.min(total, (subject.completedTopics || 0) + delta));
      const newPercent = Math.round((newCompleted / total) * 100);
      store.updateSubject(subjectId, {
        completedTopics: newCompleted,
        progressPercent: newPercent
      });
    }
  };

  // One-click switch Optional Subject
  const handleSelectPopularOptional = (chosenOptional: string) => {
    const cleanName = chosenOptional.split(' (')[0];
    const fullName = `${cleanName} Optional (Paper 1 & 2)`;

    if (optionalSubjectItem) {
      store.updateSubject(optionalSubjectItem.id, {
        name: fullName,
        description: `UPSC Optional Subject: ${chosenOptional} (Paper 1 & Paper 2 complete syllabus coverage)`
      });
    } else {
      store.addSubject({
        name: fullName,
        category: 'Optional',
        paper: 'Optional (Paper 1 & 2)',
        totalTopics: 50,
        completedTopics: 0,
        progressPercent: 0,
        studyHours: 0,
        revisionCount: 0,
        pyqCount: 0,
        mcqCount: 0,
        testCount: 0,
        color: '#9333EA',
        description: `UPSC Optional Subject: ${chosenOptional} (Paper 1 & Paper 2)`
      });
    }

    store.updateProfile({ optionalSubject: cleanName });
    setIsChangingOptionalModal(false);
    showToast(`Optional subject changed to ${cleanName}!`);
  };

  // Custom optional apply
  const handleApplyCustomOptional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customOptionalInput.trim()) return;
    const cleanName = customOptionalInput.trim();
    const fullName = `${cleanName} Optional (Paper 1 & 2)`;

    if (optionalSubjectItem) {
      store.updateSubject(optionalSubjectItem.id, {
        name: fullName,
        description: `UPSC Optional Subject: ${cleanName} (Paper 1 & Paper 2)`
      });
    } else {
      store.addSubject({
        name: fullName,
        category: 'Optional',
        paper: 'Optional (Paper 1 & 2)',
        totalTopics: 50,
        completedTopics: 0,
        progressPercent: 0,
        studyHours: 0,
        revisionCount: 0,
        pyqCount: 0,
        mcqCount: 0,
        testCount: 0,
        color: '#9333EA',
        description: `UPSC Optional Subject: ${cleanName} (Paper 1 & Paper 2)`
      });
    }

    store.updateProfile({ optionalSubject: cleanName });
    setCustomOptionalInput('');
    setIsChangingOptionalModal(false);
    showToast(`Optional subject changed to ${cleanName}!`);
  };

  // Reset to default UPSC modules
  const handleResetSubjects = () => {
    if (window.confirm('Reset all subjects to the standard UPSC CSE 2029 syllabus modules? Any custom subjects will be replaced with defaults.')) {
      store.resetSubjectsToDefault();
      showToast('Reset subjects to standard UPSC modules.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200" id="subjects-section">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold border border-slate-700 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header & Main Controls */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">UPSC Syllabus Architecture</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            SUBJECTS TRACKER & EDIT COMMAND
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Total logged study: <strong className="text-slate-900">{totalStudyHours} hours</strong> • Overall syllabus completion: <strong className="text-indigo-600">{overallSubjectProgress}%</strong> across {subjects.length} modules
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            id="btn-add-subject"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </button>

          <button
            type="button"
            id="btn-change-optional-quick"
            onClick={() => setIsChangingOptionalModal(true)}
            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Switch or change your UPSC Optional Subject"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            Change Optional ({profile.optionalSubject || 'Optional'})
          </button>

          <button
            type="button"
            onClick={handleResetSubjects}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Reset to default UPSC subjects"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Optional Subject Quick Status Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-400/20 text-purple-200 border border-purple-300/30">
              500 MARKS MAINS DECIDER
            </span>
            <span className="text-xs text-purple-200/80 font-medium">UPSC CSE 2029</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black tracking-tight">
            Active Optional: <span className="text-purple-300 font-extrabold">{profile.optionalSubject || (optionalSubjectItem?.name || 'PSIR')}</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            {optionalSubjectItem?.description || 'Deep thematic coverage across Paper 1 (Political Theory & Indian Govt) and Paper 2 (Comparative Politics & International Relations).'}
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-white/10 text-right">
            <span className="text-[10px] text-purple-200 block uppercase font-bold tracking-wider">Logged</span>
            <span className="text-sm font-extrabold text-white">{optionalSubjectItem?.studyHours || 0} hrs</span>
          </div>
          <button
            type="button"
            onClick={() => setIsChangingOptionalModal(true)}
            className="px-4 py-2.5 bg-white hover:bg-purple-50 text-purple-900 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-purple-700" />
            Switch Optional
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="subject-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subjects by name, paper, or syllabus topics..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Paper Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Paper:</span>
          </div>
          <select
            value={selectedPaper}
            onChange={(e) => setSelectedPaper(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 outline-none bg-white text-slate-700 font-medium cursor-pointer"
          >
            <option value="all">All Papers</option>
            <option value="Prelims">Prelims GS</option>
            <option value="CSAT">CSAT</option>
            <option value="GS-1">GS-1 (History & Geo)</option>
            <option value="GS-2">GS-2 (Polity & IR)</option>
            <option value="GS-3">GS-3 (Economy & Environment)</option>
            <option value="GS-4">GS-4 (Ethics)</option>
            <option value="Optional">Optional Papers</option>
            <option value="Essay">Essay</option>
          </select>

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['all', 'GS', 'Optional', 'Other'] as const).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(filteredSubjects || []).map((s) => {
          const progress = s.progressPercent ?? (s.totalTopics > 0 ? Math.round(((s.completedTopics || 0) / s.totalTopics) * 100) : 0);
          const colorObj = PRESET_COLORS.find(c => c.value === s.color) || PRESET_COLORS[0];

          return (
            <div
              key={s.id}
              id={`subject-card-${s.id}`}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative"
            >
              <div>
                {/* Top badges & actions */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${colorObj.bg} ${colorObj.text} ${colorObj.border}`}
                    >
                      {s.paper || s.category}
                    </span>
                    {s.category === 'Optional' && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                        Optional
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(s)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit this subject"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubject(s.id, s.name)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subject Title */}
                <h3 className="text-base font-extrabold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                  {s.name}
                </h3>

                {/* Description */}
                {s.description && (
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2" title={s.description}>
                    {s.description}
                  </p>
                )}

                {/* Quantitative Stats Grid */}
                <div className="grid grid-cols-4 gap-1.5 mt-3.5 py-2.5 px-2 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Hours</span>
                    <span className="text-xs font-black text-slate-800 font-mono">{s.studyHours || 0}h</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Revisions</span>
                    <span className="text-xs font-black text-slate-800 font-mono">{s.revisionCount || 0}x</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">PYQs</span>
                    <span className="text-xs font-black text-slate-800 font-mono">{s.pyqCount || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">MCQs</span>
                    <span className="text-xs font-black text-slate-800 font-mono">{s.mcqCount || 0}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Progress Section */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-600">
                    Topics Completed: <strong className="text-slate-900">{s.completedTopics || 0}</strong> / {s.totalTopics || 0}
                  </span>
                  <span className="font-black text-indigo-600 font-mono">{progress}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-3">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: s.color || '#4F46E5'
                    }}
                  />
                </div>

                {/* Quick Topic Adjuster */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[11px] text-slate-400 font-medium">Adjust topics:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleUpdateTopicCount(s.id, -1)}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                      title="Decrease completed topic by 1"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateTopicCount(s.id, 1)}
                      className="w-7 h-7 rounded-lg bg-indigo-50 hover:bg-indigo-100 font-bold text-indigo-700 flex items-center justify-center transition-colors cursor-pointer"
                      title="Increase completed topic by 1"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(s)}
                      className="ml-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors cursor-pointer"
                    >
                      Edit All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSubjects.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-extrabold text-slate-700">No subjects found matching your filters</h4>
          <p className="text-xs text-slate-400 mt-1">Try resetting the search query or paper filter, or add a new subject.</p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            + Add New Subject
          </button>
        </div>
      )}

      {/* FULL EDIT / ADD SUBJECT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 block">
                  {editingSubject ? 'Edit Subject Architecture' : 'Create New Subject'}
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {editingSubject ? `Edit: ${editingSubject.name}` : 'Add Subject to UPSC Syllabus'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-4 text-xs">
              {/* Subject Name */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Subject / Module Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Indian Polity & Constitution, Sociology Optional..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-900"
                />
              </div>

              {/* Paper & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Paper / Module</label>
                  <select
                    value={formPaper}
                    onChange={(e) => setFormPaper(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none bg-white text-slate-800 font-medium"
                  >
                    {PRESET_PAPERS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none bg-white text-slate-800 font-medium"
                  >
                    <option value="GS">General Studies (GS)</option>
                    <option value="Optional">Optional Subject</option>
                    <option value="Other">Other (CSAT, Essay, Language)</option>
                  </select>
                </div>
              </div>

              {/* Description / Syllabus Coverage */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">Syllabus Focus / Topics Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Fundamental Rights, DPSP, Parliament, Judiciary & Constitutional Bodies..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500 leading-relaxed text-slate-800"
                />
              </div>

              {/* Topics & Study Hours */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Total Topics</label>
                  <input
                    type="number"
                    min="1"
                    value={formTotalTopics}
                    onChange={(e) => setFormTotalTopics(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Completed Topics</label>
                  <input
                    type="number"
                    min="0"
                    max={formTotalTopics}
                    value={formCompletedTopics}
                    onChange={(e) => setFormCompletedTopics(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-bold text-slate-800 mb-1">Study Hours Logged</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formStudyHours}
                    onChange={(e) => setFormStudyHours(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
                  />
                </div>
              </div>

              {/* Metrics Counters (Revisions, PYQs, MCQs, Tests) */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Practice & Milestone Metrics
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Revisions</label>
                    <input
                      type="number"
                      min="0"
                      value={formRevisionCount}
                      onChange={(e) => setFormRevisionCount(parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">PYQs Solved</label>
                    <input
                      type="number"
                      min="0"
                      value={formPyqCount}
                      onChange={(e) => setFormPyqCount(parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">MCQs Practiced</label>
                    <input
                      type="number"
                      min="0"
                      value={formMcqCount}
                      onChange={(e) => setFormMcqCount(parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Mock Tests</label>
                    <input
                      type="number"
                      min="0"
                      value={formTestCount}
                      onChange={(e) => setFormTestCount(parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Accent Color Selection */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Theme Badge Color</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setFormColor(c.value)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                        formColor === c.value ? 'ring-2 ring-offset-2 ring-indigo-600 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    >
                      {formColor === c.value && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  {editingSubject ? 'Save Changes' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK SWITCH OPTIONAL SUBJECT MODAL */}
      {isChangingOptionalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 block">
                  UPSC Optional Subject Selection
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Change Your Optional Subject
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsChangingOptionalModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Select your desired optional subject below or type a custom one. This will update your optional subject in your syllabus tracker, dashboard, and preparation profile.
            </p>

            {/* Popular Options Grid */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold text-slate-700 block">
                Popular UPSC Optionals (Click to select immediately):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 scrollbar-thin">
                {POPULAR_OPTIONALS.map(opt => {
                  const cleanName = opt.split(' (')[0];
                  const isCurrent = profile.optionalSubject === cleanName;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectPopularOptional(opt)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        isCurrent
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-purple-50 text-slate-800 border-slate-200 hover:border-purple-300'
                      }`}
                    >
                      <span className="truncate mr-2">{opt}</span>
                      {isCurrent && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Optional Form */}
            <form onSubmit={handleApplyCustomOptional} className="pt-3 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Or Enter Any Custom Optional Subject:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customOptionalInput}
                  onChange={(e) => setCustomOptionalInput(e.target.value)}
                  placeholder="e.g. Zoology, Sanskrit Literature, Medical Science..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer shrink-0"
                >
                  Apply
                </button>
              </div>
            </form>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsChangingOptionalModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
