import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Clock,
  Database,
  Download,
  Upload,
  RotateCcw,
  Camera,
  Check,
  Sparkles,
  Cloud,
  ShieldCheck
} from 'lucide-react';
import { store, getEffectiveMode } from '../lib/storage';
import { RaviAvatar } from '../components/RaviAvatar';
import { getSupabaseConfig, updateSupabaseCredentials, isSupabaseConfigured } from '../lib/supabaseClient';

export const SettingsView: React.FC = () => {
  const profile = store.getProfile();
  const currentMode = getEffectiveMode(profile);

  // Form states
  const [displayName, setDisplayName] = useState(profile.displayName || 'Ravi');
  const [fullName, setFullName] = useState(profile.fullName || 'Ravi Kumar');
  const [mission, setMission] = useState(profile.mission || 'UPSC CSE 2029');
  const [tagline, setTagline] = useState(profile.tagline || '');
  const [targetYear, setTargetYear] = useState(profile.targetYear || 2029);
  const [optionalSubject, setOptionalSubject] = useState(profile.optionalSubject || '');
  const [jobEndDate, setJobEndDate] = useState(profile.jobEndDate || '2026-12-31');
  const [fullTimeStartDate, setFullTimeStartDate] = useState(profile.fullTimeStartDate || '2027-01-01');
  const [jobModeTargetHours, setJobModeTargetHours] = useState(profile.jobModeTargetHours ?? 5.5);
  const [fullTimeTargetHours, setFullTimeTargetHours] = useState(profile.fullTimeTargetHours ?? 12);
  const [currentModeSelection, setCurrentModeSelection] = useState(profile.currentMode || 'JOB + UPSC');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Cloud Config
  const cloudConfig = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(cloudConfig.url || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(cloudConfig.anonKey || '');
  const isCloudConnected = isSupabaseConfigured();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateProfile({
      displayName: displayName.trim(),
      fullName: fullName.trim(),
      mission: mission.trim(),
      tagline: tagline.trim(),
      targetYear: parseInt(String(targetYear)) || 2029,
      optionalSubject: optionalSubject.trim(),
      jobEndDate,
      fullTimeStartDate,
      jobModeTargetHours: parseFloat(String(jobModeTargetHours)) || 5.5,
      fullTimeTargetHours: parseFloat(String(fullTimeTargetHours)) || 12,
      currentMode: currentModeSelection
    });

    // Also sync optional subject name in subjects list if present
    const optSubject = store.getSubjects().find(s => s.category === 'Optional' || s.id === 'sub-optional');
    if (optSubject && optionalSubject.trim()) {
      store.updateSubject(optSubject.id, {
        name: `${optionalSubject.trim()} Optional (Paper 1 & 2)`,
        description: `UPSC Optional Subject: ${optionalSubject.trim()} (Paper 1 & Paper 2)`
      });
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSaveCloud = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupabaseCredentials(supabaseUrl.trim(), supabaseAnonKey.trim());
    alert('Supabase credentials saved successfully!');
  };

  const handleExportJSON = () => {
    const data = store.exportDataJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ravi_Ki_UPSC_Diary_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const ok = store.importDataJSON(content);
          if (ok) {
            alert('Data restored successfully! The page will now reload.');
            window.location.reload();
          } else {
            alert('Invalid backup JSON file.');
          }
        } catch (err) {
          alert('Error importing data backup.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetAll = () => {
    if (window.confirm('WARNING: Reset all progress, timetable, and study entries back to the official default UPSC 2029 initial state?')) {
      store.resetAll();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">System Configuration</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
          SETTINGS & PREFERENCES
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal identity, study modes, timetable baselines, cloud database, and local backups
        </p>
      </div>

      {/* Profile Section */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <User className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Ravi's Aspirant Profile</h3>
            <p className="text-xs text-slate-500">Core personal identity and mission parameters</p>
          </div>
        </div>

        {/* Avatar and Portrait Upload */}
        <div className="flex items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <RaviAvatar size="lg" allowUpload showBadge />
          <div>
            <h4 className="text-xs font-bold text-slate-900">Official Aspirant Portrait</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Click the photo or hover to upload custom picture from your device.
            </p>
            {profile.profilePhoto && (
              <button
                type="button"
                onClick={() => store.updateProfile({ profilePhoto: undefined })}
                className="mt-2 text-xs text-rose-600 hover:underline font-semibold"
              >
                Reset to Pixar Vector Portrait
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Display Callout Name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mission Statement</label>
            <input
              type="text"
              required
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Optional Subject</label>
            <input
              type="text"
              value={optionalSubject}
              onChange={(e) => setOptionalSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Personal Guiding Hindi Tagline</label>
          <input
            type="text"
            required
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-hindi"
          />
        </div>

        {/* Preparation Modes & Milestone Dates */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Preparation Mode & Timetable Targets
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Active Mode</label>
              <select
                value={currentModeSelection}
                onChange={(e) => setCurrentModeSelection(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none bg-white font-bold"
              >
                <option value="JOB + UPSC">💼 JOB + UPSC</option>
                <option value="FULL-TIME UPSC">🚀 FULL-TIME UPSC</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Mode Daily Target (Hrs)</label>
              <input
                type="number"
                step="0.5"
                value={jobModeTargetHours ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? ('' as any) : parseFloat(e.target.value);
                  setJobModeTargetHours(val);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full-Time Target (Hrs)</label>
              <input
                type="number"
                step="0.5"
                value={fullTimeTargetHours ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? ('' as any) : parseFloat(e.target.value);
                  setFullTimeTargetHours(val);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Phase End Date</label>
              <input
                type="date"
                value={jobEndDate}
                onChange={(e) => setJobEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full-Time Preparation Start Date</label>
              <input
                type="date"
                value={fullTimeStartDate}
                onChange={(e) => setFullTimeStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {savedSuccess && (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Preferences Updated!
              </span>
            )}
          </span>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Save Profile Settings
          </button>
        </div>
      </form>

      {/* Cloud Sync Configuration */}
      <form onSubmit={handleSaveCloud} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Cloud className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Supabase Cloud Synchronization</h3>
              <p className="text-xs text-slate-500">Real-time multi-device cloud database backup</p>
            </div>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            isCloudConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
          }`}>
            {isCloudConnected ? 'Cloud Active' : 'Local Only'}
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Supabase Project URL</label>
          <input
            type="url"
            value={supabaseUrl}
            onChange={(e) => setSupabaseUrl(e.target.value)}
            placeholder="https://xyzcompany.supabase.co"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Supabase Anon Public API Key</label>
          <input
            type="text"
            value={supabaseAnonKey}
            onChange={(e) => setSupabaseAnonKey(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Save Cloud Credentials
          </button>
        </div>
      </form>

      {/* Data Backup & Restore */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <Database className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Data Management & Backup</h3>
            <p className="text-xs text-slate-500">Export your journal to JSON, restore from file, or reset defaults</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportJSON}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            Export Full Diary (JSON)
          </button>

          <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-slate-600" />
            Import / Restore JSON
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleResetAll}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors ml-auto cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-rose-600" />
            Reset All Data to Default
          </button>
        </div>
      </div>
    </div>
  );
};
