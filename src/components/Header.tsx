import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Settings as SettingsIcon, 
  Flame, 
  Calendar as CalendarIcon,
  Sparkles,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Clock,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { store, getSystemDateString, getEffectiveMode, getDaysUntilFullTime } from '../lib/storage';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { RaviAvatar } from './RaviAvatar';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  onNavigate: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onOpenAuth, onNavigate }) => {
  const profile = store.getProfile();
  const metrics = store.getMetrics();
  const mode = getEffectiveMode(profile);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const isCloudConnected = isSupabaseConfigured();

  // Dynamic greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = profile.displayName || 'IAS RAVI';
    if (hour >= 4 && hour < 12) {
      return `Good Morning, ${name} 👋`;
    } else if (hour >= 12 && hour < 17) {
      return `Good Afternoon, ${name} 👋`;
    } else if (hour >= 17 && hour < 21) {
      return `Good Evening, ${name} 👋`;
    } else {
      return `Good Night, ${name} 🌙`;
    }
  };

  // Format today's date in full Indian/Standard format
  const getFormattedDate = () => {
    const dateStr = getSystemDateString();
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Dynamic Notifications
  const daysUntilFullTime = getDaysUntilFullTime(profile);
  const notifications = [
    {
      id: 'notif-countdown',
      title: 'Full-Time UPSC Countdown',
      desc: `${daysUntilFullTime} days remaining until 1 Jan 2027 transition!`,
      icon: Flame,
      color: 'text-amber-500 bg-amber-50',
      time: 'Milestone'
    },
    {
      id: 'notif-backlog',
      title: 'Pending Backlog Items',
      desc: `${metrics.pendingBacklog} pending high-priority topics need clearance.`,
      icon: AlertTriangle,
      color: 'text-rose-500 bg-rose-50',
      time: 'Urgent'
    },
    {
      id: 'notif-test',
      title: 'Upcoming Sectional Mock',
      desc: 'PW Polity Sectional Mock scheduled for this Sunday.',
      icon: CalendarIcon,
      color: 'text-indigo-500 bg-indigo-50',
      time: 'In 4 days'
    }
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#profile-dropdown-container')) {
        setProfileDropdownOpen(false);
      }
      if (!target.closest('#notifications-container')) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left Side: Dynamic Greeting, Date, Tagline */}
        <div className="flex items-center gap-3.5">
          <div className="md:hidden">
            <RaviAvatar size="sm" showBadge />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans']">
                {getGreeting()}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-xs">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                UPSC 2029 • Mission Mode
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                mode === 'FULL-TIME UPSC' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {mode === 'FULL-TIME UPSC' ? '🚀 FULL-TIME UPSC' : '💼 JOB + UPSC'}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-medium">
              <span>{getFormattedDate()}</span>
              <span>•</span>
              <p className="italic text-slate-700 font-hindi font-medium tracking-wide">
                “{profile.tagline}”
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Global Search, Quick Stats, Notifications & Profile Avatar */}
        <div className="flex items-center justify-between md:justify-end gap-2.5">
          {/* Quick Streak Pill */}
          <div 
            onClick={() => onNavigate('analytics')} 
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/70 text-amber-900 text-xs font-bold cursor-pointer hover:shadow-xs transition-all"
            title="Current Study Streak"
          >
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
            <span>{metrics.streak} Day Streak</span>
          </div>

          {/* Search Trigger Button */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors cursor-pointer border border-slate-200/60"
            title="Global Search (Ctrl + K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden lg:inline">Search records, notes, PYQs...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white text-slate-500 rounded border border-slate-200 shadow-2xs">⌘K</kbd>
          </button>

          {/* Notifications Trigger & Dropdown */}
          <div className="relative" id="notifications-container">
            <button
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white"></span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Mission Alerts & Reminders</span>
                  <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">3 Active</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {notifications.map((n) => {
                    const Icon = n.icon;
                    return (
                      <div key={n.id} className="p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3">
                        <div className={`p-2 rounded-xl ${n.color} shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                            <span className="text-[10px] font-medium text-slate-400">{n.time}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-2 px-4 border-t border-slate-100 text-center">
                  <button
                    onClick={() => { setNotificationsOpen(false); onNavigate('backlog'); }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    View All Backlog & Targets →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" id="profile-dropdown-container">
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-2xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 cursor-pointer"
            >
              <RaviAvatar size="sm" showBadge />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                  {profile.displayName || 'IAS RAVI'}
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <div className="text-[10px] text-slate-500 font-medium leading-none">
                  {profile.role}
                </div>
              </div>
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{profile.displayName}</p>
                  <p className="text-[11px] text-slate-500">{profile.mission}</p>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-indigo-700 bg-indigo-50/70 p-1.5 rounded-lg">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="truncate">Target: UPSC {profile.targetYear}</span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => { setProfileDropdownOpen(false); onNavigate('settings'); }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <SettingsIcon className="w-4 h-4 text-slate-500" />
                    Preparation & Timetable Settings
                  </button>
                  <button
                    onClick={() => { setProfileDropdownOpen(false); onOpenAuth(); }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <Cloud className={`w-4 h-4 ${isCloudConnected ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <span>Supabase Cloud Sync</span>
                    {isCloudConnected && (
                      <span className="ml-auto text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">Active</span>
                    )}
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      if (window.confirm('Reset all local data back to initial UPSC 2029 configuration?')) {
                        store.resetAll();
                        window.location.reload();
                      }
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2.5"
                  >
                    <LogOut className="w-4 h-4" />
                    Reset to Default Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
