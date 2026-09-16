import React, { useState } from 'react';
import {
  Map,
  CheckCircle2,
  Circle,
  Sparkles,
  Rocket,
  Flame,
  Calendar,
  Award,
  BookOpen,
  ChevronRight,
  TrendingUp,
  Target
} from 'lucide-react';
import { store, getDaysUntilFullTime, getProfile } from '../lib/storage';
import { RoadmapPhase } from '../types';

export const RoadmapView: React.FC = () => {
  const profile = store.getProfile();
  const phases = store.getRoadmap();
  const daysUntilFullTime = getDaysUntilFullTime(profile);

  // Approximate days to UPSC 2029 Prelims (May 2029)
  const daysToPrelims2029 = 980; // ~980 days from Sep 2026

  const [selectedPhaseId, setSelectedPhaseId] = useState<string>(phases[0]?.id || String(phases[0]?.year) || 'phase-2026');
  const activePhase = phases.find(p => (p.id && p.id === selectedPhaseId) || String(p.year) === selectedPhaseId) || phases[0];

  const handleToggleGoal = (phaseId: string, goalIndex: number) => {
    store.updateRoadmapGoal(phaseId, goalIndex);
  };

  const deliverables = activePhase?.milestones && Array.isArray(activePhase.milestones) && activePhase.milestones.length > 0
    ? activePhase.milestones
    : (Array.isArray(activePhase?.goals) ? activePhase.goals : []).map((g, idx) => ({ id: `m-${idx}`, title: g, completed: false }));

  const keyBooks = Array.isArray(activePhase?.keyBooks) ? activePhase.keyBooks : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-lg">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-indigo-500/20 via-purple-500/10 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-widest bg-amber-400 text-slate-900">
                STRATEGIC MASTERPLAN
              </span>
              <span className="text-xs text-indigo-300 font-semibold">
                UPSC Civil Services Examination 2029
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans']">
              UPSC 2029 ROADMAP • MISSION LBSNAA
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl mt-2 leading-relaxed">
              A meticulously engineered 4-year journey structured to transform consistent daily discipline into a top rank on your first attempt.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
              <p className="text-2xl font-black text-amber-400 font-mono">{daysUntilFullTime}</p>
              <p className="text-[10px] font-bold text-slate-300 uppercase">Days to Full-Time</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
              <p className="text-2xl font-black text-indigo-300 font-mono">{daysToPrelims2029}</p>
              <p className="text-[10px] font-bold text-slate-300 uppercase">Days to UPSC 2029</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Phase Timeline Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(phases || []).map((phase) => {
          const isSelected = selectedPhaseId === phase.id || selectedPhaseId === String(phase.year);
          const phaseStatus = phase.status || (phase.isCurrent ? 'ACTIVE' : 'PLANNED');
          const phaseTitle = phase.title || phase.phaseName;
          const phaseFocus = phase.focus || phase.subtitle;

          return (
            <div
              key={phase.id || phase.year}
              onClick={() => setSelectedPhaseId(phase.id || String(phase.year))}
              className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-50/70 border-indigo-600 shadow-md scale-[1.02]'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    {phase.year}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    phaseStatus === 'ACTIVE'
                      ? 'bg-indigo-600 text-white animate-pulse'
                      : phaseStatus === 'COMPLETED'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {phaseStatus}
                  </span>
                </div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight line-clamp-1">
                  {phaseTitle}
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  {phaseFocus}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/80">
                <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                  <span>Progress</span>
                  <span className="text-indigo-600 font-black">{phase.progressPercent || 0}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${phase.progressPercent || 0}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Phase In-Depth Details Card */}
      {activePhase && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Phase {activePhase.year} Breakdown
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-600">{activePhase.timeframe || `Year ${activePhase.year}`}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">
                {activePhase.title || activePhase.phaseName}: {activePhase.focus || activePhase.subtitle}
              </h3>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-500 block">Daily Target in this Phase:</span>
              <span className="text-base font-black text-indigo-600">
                {activePhase.year === 2026 ? '5.5 hrs (Job + UPSC)' : '12.0 hrs (Full-Time Mode)'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Deliverables & Goals Checklist */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                Key Deliverables & Objectives ({(deliverables || []).filter(d => d.completed).length}/{(deliverables || []).length})
              </h4>
              <div className="space-y-2">
                {(deliverables || []).map((item, idx) => {
                  const isCompleted = item.completed;
                  return (
                    <div
                      key={item.id || idx}
                      onClick={() => handleToggleGoal(activePhase.id || String(activePhase.year), idx)}
                      className={`p-3.5 rounded-2xl border transition-colors flex items-start gap-3 cursor-pointer group select-none ${
                        isCompleted
                          ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950'
                          : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 text-slate-800'
                      }`}
                    >
                      <button type="button" className="mt-0.5 shrink-0">
                        <CheckCircle2 className={`w-4 h-4 transition-colors ${isCompleted ? 'text-emerald-600' : 'text-slate-300 group-hover:text-indigo-600'}`} />
                      </button>
                      <span className={`text-xs font-bold leading-relaxed ${isCompleted ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                        {item.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommended Books & Primary Focus for this phase */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  Primary Literature & Resources for {activePhase.year}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(keyBooks || []).length > 0 ? (
                    (keyBooks || []).map((book, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-900 border border-purple-200"
                      >
                        📖 {book}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">Core NCERTs and Standard Syllabus References</span>
                  )}
                </div>
              </div>

              {/* Strategic Insights */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80">
                <h5 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Ravi's Strategic Directive for {activePhase.year}:
                </h5>
                <p className="text-xs text-slate-700 mt-1.5 leading-relaxed font-hindi">
                  {activePhase.year === 2026 && "नौकरी के साथ हर दिन 5.5 घंटे की तपस्या नींव मजबूत करेगी। 31 दिसंबर तक NCERT और PW बैच को शत-प्रतिशत पूरा करना है।"}
                  {activePhase.year === 2027 && "1 जनवरी 2027 से पूर्णकालिक तैयारी शुरू होगी। प्रतिदिन 12 घंटे का अनुशासन और मानक पुस्तकों का गहन अध्ययन आवश्यक है।"}
                  {activePhase.year === 2028 && "मुख्य परीक्षा की उत्तर-लेखन शैली और निरंतर मॉक टेस्ट से अपनी गलतियों को शून्य तक ले जाना है।"}
                  {activePhase.year === 2029 && "आत्मविश्वास, संयम और ज्ञान के साथ परीक्षा भवन में प्रवेश और टॉप 50 में अपना नाम दर्ज कराना।"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
