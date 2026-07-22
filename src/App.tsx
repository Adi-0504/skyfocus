import React, { useState } from 'react';
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
import './lib/i18n';

const MainAppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');
  
  // Task Modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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
          {activeTab === 'today' && <TodayView onOpenTaskModal={handleOpenTaskModal} />}
          {activeTab === 'tasks' && <TasksView onOpenTaskModal={handleOpenTaskModal} />}
          {activeTab === 'focus' && <FocusView />}
          {activeTab === 'history' && <HistoryView />}
          {activeTab === 'settings' && <SettingsView />}

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
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
};

export default App;
