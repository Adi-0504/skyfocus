import React, { useState, useMemo } from 'react';
import { CheckCircle2, Timer, Calendar, History as HistoryIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useTasks } from '../context/TaskContext';
import { useFocus } from '../context/FocusContext';

export const HistoryView: React.FC = () => {
  const { t } = useTranslation();
  const { tasks } = useTasks();
  const { focusSessions } = useFocus();

  const [activeTab, setActiveTab] = useState<'tasks' | 'focus'>('tasks');

  // Filter completed tasks sorted by completed_at
  const completedTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status === 'completed')
      .sort((a, b) => {
        const timeA = a.completed_at ? new Date(a.completed_at).getTime() : 0;
        const timeB = b.completed_at ? new Date(b.completed_at).getTime() : 0;
        return timeB - timeA;
      });
  }, [tasks]);

  return (
    <div className="min-h-screen sky-bg pb-32 pt-6 px-4 max-w-lg mx-auto fade-in">
      {/* Top Header */}
      <div className="mb-6 px-1">
        <h1 className="text-2xl font-bold text-white tracking-wide mb-1">
          {t('history.title')}
        </h1>
      </div>

      {/* Tabs */}
      <div className="sky-card p-1 flex gap-1 mb-6">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'tasks' ? 'bg-[#475A61] text-[#F1EEDC] shadow-sm' : 'text-[#68828C]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{t('history.completed_tasks')} ({completedTasks.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('focus')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'focus' ? 'bg-[#475A61] text-[#F1EEDC] shadow-sm' : 'text-[#68828C]'
          }`}
        >
          <Timer className="w-4 h-4" />
          <span>{t('history.focus_records')} ({focusSessions.length})</span>
        </button>
      </div>

      {/* Completed Tasks List */}
      {activeTab === 'tasks' && (
        completedTasks.length === 0 ? (
          <div className="sky-card p-10 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-black/5 flex items-center justify-center mb-3 text-[#475A61]">
              <HistoryIcon className="w-7 h-7 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-[#475A61] mb-1">
              {t('history.no_history')}
            </h3>
            <p className="text-xs text-[#68828C]">
              {t('history.no_history_desc')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <div key={task.id} className="sky-card p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <CheckCircle2 className="w-5 h-5 fill-[#475A61] text-[#F1EEDC] flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[#475A61] truncate line-through">
                      {task.title}
                    </h3>
                    {task.completed_at && (
                      <span className="text-[11px] text-[#68828C] flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(task.completed_at), 'yyyy-MM-dd HH:mm')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Focus Sessions List */}
      {activeTab === 'focus' && (
        focusSessions.length === 0 ? (
          <div className="sky-card p-10 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-black/5 flex items-center justify-center mb-3 text-[#475A61]">
              <Timer className="w-7 h-7 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-[#475A61] mb-1">
              {t('history.no_history')}
            </h3>
            <p className="text-xs text-[#68828C]">
              {t('history.no_history_desc')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {focusSessions.map((session) => (
              <div key={session.id} className="sky-card p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center text-[#475A61] flex-shrink-0">
                    <Timer className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[#475A61] truncate">
                      {session.task?.title || t('focus.no_task_selected')}
                    </h3>
                    <span className="text-[11px] text-[#68828C] flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(session.started_at), 'yyyy-MM-dd HH:mm')}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-bold text-[#475A61]">
                    {Math.round(session.duration / 60)} {t('history.minutes')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
