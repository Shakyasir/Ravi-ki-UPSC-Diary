import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Clock,
  BookOpen,
  Map,
  Layers,
  Library,
  HelpCircle,
  FileCheck2,
  FileText,
  Target,
  AlertOctagon,
  BookMarked,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  Award
} from 'lucide-react';
import { store } from '../lib/storage';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
}) => {
  const metrics = store.getMetrics();
  const profile = store.getProfile();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'mission', label: "Today's Mission", icon: CheckSquare, badge: `${metrics.completedTasks}/${metrics.totalTasks}` },
    { id: 'schedule', label: 'Daily Schedule', icon: Clock },
    { id: 'register', label: 'Study Register', icon: BookOpen },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'roadmap', label: 'UPSC 2029 Roadmap', icon: Map, highlight: true },
    { id: 'subjects', label: 'Subjects', icon: Layers },
    { id: 'books', label: 'Books & Resources', icon: Library },
    { id: 'pyqs', label: 'PYQ Tracker', icon: FileCheck2 },
    { id: 'mcqs', label: 'MCQ Practice', icon: HelpCircle },
    { id: 'tests', label: 'Tests & Mocks', icon: Award },
    { id: 'answers', label: 'Answer Writing', icon: FileText },
    { id: 'goals', label: 'My Goals', icon: Target },
    { id: 'backlog', label: 'Backlog', icon: AlertOctagon, badge: metrics.pendingBacklog > 0 ? `${metrics.pendingBacklog}` : undefined, badgeColor: 'bg-rose-500 text-white' },
    { id: 'diary', label: 'Daily Diary', icon: BookMarked },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative z-20 bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out border-r border-slate-800 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      } shrink-0`}
      id="app-sidebar"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold shadow-md ring-1 ring-white/20">
              R
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-sm block font-['Plus_Jakarta_Sans']">
                Ravi Ki UPSC Diary
              </span>
              <span className="text-[10px] text-indigo-300 font-medium tracking-wider uppercase block">
                Mission 2029 • LBSNAA
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="w-full flex justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold shadow-md">
              R
            </div>
          </div>
        )}

        {/* Collapse toggle button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200 group-hover:scale-110'
                }`}
              />
              {!collapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}

              {/* Badges */}
              {!collapsed && item.badge && (
                <span
                  className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.badgeColor || (isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-300')
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Collapsed Badge indicator */}
              {collapsed && item.badge && (
                <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Daily Study Goal Mini Widget */}
      {!collapsed && (
        <div className="p-3.5 m-3 rounded-2xl bg-slate-800/90 border border-slate-700/60 shadow-inner">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-slate-400 font-medium">Daily Target</span>
            <span className="text-white font-bold">{metrics.todayStudyHours} / {metrics.targetHours}h</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${metrics.targetAchievementPercent}%` }}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <Flame className="w-3 h-3 fill-amber-400" /> {metrics.streak}d streak
            </span>
            <span className="text-indigo-300 font-medium">{metrics.targetAchievementPercent}% complete</span>
          </div>
        </div>
      )}
    </aside>
  );
};
