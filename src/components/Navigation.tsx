import React from 'react';
import { Calendar, ListTodo, Timer, ChartLine, Settings } from 'lucide-react';

export type ActiveTab = 'today' | 'tasks' | 'focus' | 'history' | 'settings';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'today' as ActiveTab, icon: Calendar, label: 'Today' },
    { id: 'tasks' as ActiveTab, icon: ListTodo, label: 'Tasks' },
    { id: 'focus' as ActiveTab, icon: Timer, label: 'Focus' },
    { id: 'history' as ActiveTab, icon: ChartLine, label: 'History' },
    { id: 'settings' as ActiveTab, icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-4">
      <nav className="floating-nav flex items-center justify-around py-3 px-2 transition-all duration-300">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-label={tab.label}
              className={`relative p-3 rounded-full transition-all duration-300 flex items-center justify-center ${
                isActive
                  ? 'text-[#475A61] bg-[#E2DEC3] scale-110 shadow-sm'
                  : 'text-[#68828C] hover:text-[#475A61] hover:bg-black/5'
              }`}
            >
              <Icon className="w-6 h-6 stroke-[1.8]" />
              {isActive && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 bg-[#475A61] rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
