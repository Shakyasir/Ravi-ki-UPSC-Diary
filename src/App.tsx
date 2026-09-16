import React, { useState, useEffect } from 'react';
import { store } from './lib/storage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AuthModal } from './components/AuthModal';

// Views
import { DashboardView } from './views/DashboardView';
import { TodayMissionView } from './views/TodayMissionView';
import { DailyScheduleView } from './views/DailyScheduleView';
import { StudyRegisterView } from './views/StudyRegisterView';
import { CalendarView } from './views/CalendarView';
import { RoadmapView } from './views/RoadmapView';
import { SubjectsView } from './views/SubjectsView';
import { BooksView } from './views/BooksView';
import { PYQTrackerView } from './views/PYQTrackerView';
import { MCQTrackerView } from './views/MCQTrackerView';
import { TestsTrackerView } from './views/TestsTrackerView';
import { AnswerWritingView } from './views/AnswerWritingView';
import { GoalsView } from './views/GoalsView';
import { BacklogView } from './views/BacklogView';
import { DailyDiaryView } from './views/DailyDiaryView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';

// Mobile Bottom Nav Icons
import { 
  LayoutDashboard, 
  CheckSquare, 
  Clock, 
  BookMarked, 
  Menu,
  X
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Subscribe to storage changes for instant re-render across views
  const [, setTick] = useState(0);
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setTick(t => t + 1);
    });
    return () => unsubscribe();
  }, []);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-['Plus_Jakarta_Sans'] antialiased selection:bg-indigo-500 selection:text-white">
      {/* Desktop & Tablet Sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleNavigate}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          <div className="relative z-10 w-72 max-w-[85%] bg-slate-900 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <span className="font-bold text-white text-sm">Ravi Ki UPSC Diary</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar
                activeTab={activeTab}
                onSelectTab={handleNavigate}
                collapsed={false}
                onToggleCollapse={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Top Header */}
        <Header
          onOpenSearch={() => setSearchModalOpen(true)}
          onOpenAuth={() => setAuthModalOpen(true)}
          onNavigate={handleNavigate}
        />

        {/* View Switcher Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardView onNavigate={handleNavigate} />}
          {activeTab === 'mission' && <TodayMissionView onNavigate={handleNavigate} />}
          {activeTab === 'schedule' && <DailyScheduleView />}
          {activeTab === 'register' && <StudyRegisterView />}
          {activeTab === 'calendar' && <CalendarView onNavigate={handleNavigate} />}
          {activeTab === 'roadmap' && <RoadmapView />}
          {activeTab === 'subjects' && <SubjectsView />}
          {activeTab === 'books' && <BooksView />}
          {activeTab === 'pyqs' && <PYQTrackerView />}
          {activeTab === 'mcqs' && <MCQTrackerView />}
          {activeTab === 'tests' && <TestsTrackerView />}
          {activeTab === 'answers' && <AnswerWritingView />}
          {activeTab === 'goals' && <GoalsView />}
          {activeTab === 'backlog' && <BacklogView />}
          {activeTab === 'diary' && <DailyDiaryView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Quick-Access Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => handleNavigate('dashboard')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold ${
            activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => handleNavigate('mission')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold ${
            activeTab === 'mission' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Mission</span>
        </button>

        <button
          onClick={() => handleNavigate('schedule')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold ${
            activeTab === 'schedule' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Schedule</span>
        </button>

        <button
          onClick={() => handleNavigate('diary')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold ${
            activeTab === 'diary' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookMarked className="w-4 h-4" />
          <span>Diary</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold text-slate-500 hover:text-slate-900"
        >
          <Menu className="w-4 h-4" />
          <span>More</span>
        </button>
      </nav>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onNavigate={handleNavigate}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
