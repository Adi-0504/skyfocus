import React, { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { FocusProvider } from './context/FocusContext';
import { Navigation, ActiveTab } from './components/Navigation';
import { TaskModal } from './components/TaskModal';
import { LoginView } from './views/LoginView';
import { TodayView } from './views/TodayView';
import { TasksView } from './views/TasksView';
import { FocusView } from './views/FocusView';
import { HistoryView } from './views/HistoryView';
import { SettingsView } from './views/SettingsView';
import { Task } from './types/database';
import { supabaseConfigError } from './lib/supabase';
import './lib/i18n';

const MainAppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');
  
  // Task Modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!pageRef.current) return;
    gsap.fromTo(pageRef.current, { autoAlpha: 0, y: 10 }, {
      autoAlpha: 1,
      y: 0,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: true,
    });
  }, [activeTab]);

  const handleOpenTaskModal = (task?: Task) => {
    setEditingTask(task || null);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen sky-bg flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-widest uppercase opacity-80">Skyfocus</p>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <TaskProvider>
      <FocusProvider>
        <div className="min-h-screen sky-bg relative font-sans text-skytext select-none">
          {/* Main View Renderer */}
          <div ref={pageRef}>
            {activeTab === 'today' && <TodayView onOpenTaskModal={handleOpenTaskModal} />}
            {activeTab === 'tasks' && <TasksView onOpenTaskModal={handleOpenTaskModal} />}
            {activeTab === 'focus' && <FocusView />}
            {activeTab === 'history' && <HistoryView />}
            {activeTab === 'settings' && <SettingsView />}
          </div>

          {/* Floating Bottom Navigation */}
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Task Modal / Sheet */}
          <TaskModal
            isOpen={isTaskModalOpen}
            onClose={handleCloseTaskModal}
            taskToEdit={editingTask}
          />
        </div>
      </FocusProvider>
    </TaskProvider>
  );
};

export const App: React.FC = () => {
  if (supabaseConfigError) {
    return (
      <div className="min-h-screen sky-bg flex items-center justify-center p-6">
        <div className="sky-card w-full max-w-md p-6 text-center">
          <h1 className="text-xl font-bold text-[#475A61] mb-2">Skyfocus 設定錯誤</h1>
          <p className="text-sm text-[#68828C] leading-relaxed mb-5">
            {supabaseConfigError} 請設定環境變數後重新整理頁面。
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="sky-button-primary px-5 py-2.5 text-sm"
          >
            重新整理
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
};

export default App;
