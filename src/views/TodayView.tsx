import React, { useMemo, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { Task, Priority } from '../types/database';

interface TodayViewProps {
  onOpenTaskModal: (task?: Task) => void;
}

const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const { t } = useTranslation();
  const cls =
    priority === 'high'
      ? 'badge-high'
      : priority === 'medium'
      ? 'badge-medium'
      : 'badge-low';
  return (
    <span className={`${cls} px-2 py-0.5 rounded-full font-bold uppercase text-[10px] tracking-wide`}>
      {t(`tasks.priority_${priority}`)}
    </span>
  );
};

const SkeletonCard = () => (
  <div className="sky-card p-4 flex items-center gap-3">
    <div className="skeleton w-6 h-6 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="skeleton h-3.5 rounded w-3/4" />
      <div className="skeleton h-2.5 rounded w-1/3" />
    </div>
  </div>
);

export const TodayView: React.FC<TodayViewProps> = ({ onOpenTaskModal }) => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { tasks, toggleTaskCompletion, loading } = useTasks();

  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const formattedDisplayDate = useMemo(
    () => format(new Date(), 'EEEE, MMMM d'),
    []
  );

  const todayTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (task.due_date) return task.due_date === todayStr;
        return task.created_at.slice(0, 10) === todayStr;
      })
      .sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        const pOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
        return pOrder[a.priority] - pOrder[b.priority];
      });
  }, [tasks, todayStr]);

  const completedCount = useMemo(
    () => todayTasks.filter((t) => t.status === 'completed').length,
    [todayTasks]
  );
  const totalCount = todayTasks.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('today.greeting_morning');
    if (hour < 18) return t('today.greeting_afternoon');
    return t('today.greeting_evening');
  }, [t]);

  const handleToggle = useCallback(
    (taskId: string) => toggleTaskCompletion(taskId),
    [toggleTaskCompletion]
  );

  return (
    <div className="min-h-screen sky-bg pb-36 pt-6 px-4 max-w-lg mx-auto fade-in">
      {/* Header Card */}
      <div className="sky-card p-5 mb-5 relative overflow-hidden">
        {/* Decorative background blob */}
        <div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
          style={{ background: '#475A61' }}
        />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#68828C] mb-1.5">
              <CalendarIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{formattedDisplayDate}</span>
            </div>
            <h1 className="text-2xl font-bold text-[#475A61] leading-tight">
              {greeting},
              <br />
              <span className="text-[#2C5364]">
                {profile?.display_name || 'Friend'}
              </span>{' '}
              👋
            </h1>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#E2DEC3] text-[#475A61] flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-inner ml-3">
            {profile?.display_name
              ? profile.display_name.charAt(0).toUpperCase()
              : 'S'}
          </div>
        </div>

        {/* Progress Section */}
        <div className="mt-5 pt-4 border-t border-[#475A61]/10 flex items-center gap-4">
          {/* Progress Ring */}
          <div className="relative w-14 h-14 flex-shrink-0 flex items-center justify-center">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 44 44"
            >
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke="rgba(71,90,97,0.12)"
                strokeWidth="4"
              />
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke="#475A61"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 18}`}
                strokeDashoffset={`${2 * Math.PI * 18 * (1 - progressPercent / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <span className="absolute text-[11px] font-bold text-[#475A61]">
              {progressPercent}%
            </span>
          </div>

          {/* Progress Text & Bar */}
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-[#475A61] mb-1">
              {t('today.progress_title')}
            </h2>
            <p className="text-[11px] text-[#68828C] mb-2">
              {t('today.tasks_completed', {
                completed: completedCount,
                total: totalCount,
              })}
            </p>
            <div className="w-full h-2 bg-black/8 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#475A61] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-base font-bold text-white/90 tracking-wide">
          {t('today.today_tasks')}
          {!loading && (
            <span className="ml-1.5 text-white/50 font-medium text-sm">
              ({todayTasks.length})
            </span>
          )}
        </h2>
        <button
          onClick={() => onOpenTaskModal()}
          aria-label="Add Task"
          className="bg-[#F1EEDC] text-[#475A61] w-9 h-9 rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : todayTasks.length === 0 ? (
        /* Empty State */
        <div className="sky-card p-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-[#E2DEC3] flex items-center justify-center mb-4 text-[#475A61]">
            <Sparkles className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="text-base font-bold text-[#475A61] mb-1.5">
            {t('today.no_tasks')}
          </h3>
          <p className="text-xs text-[#68828C] max-w-xs leading-relaxed mb-6">
            {t('today.add_task_prompt')}
          </p>
          <button
            onClick={() => onOpenTaskModal()}
            className="sky-button-primary px-6 py-2.5 text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('tasks.new_task')}</span>
          </button>
        </div>
      ) : (
        /* Task Cards */
        <div className="space-y-2.5">
          {todayTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            return (
              <div
                key={task.id}
                className={`sky-card sky-card-hover px-4 py-3.5 flex items-center gap-3 ${
                  isCompleted ? 'opacity-60' : ''
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleToggle(task.id)}
                  aria-label={isCompleted ? 'Mark pending' : 'Mark complete'}
                  className="flex-shrink-0 p-0.5 hover:scale-110 active:scale-90 transition-transform"
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 fill-[#475A61] text-[#F1EEDC] check-pop" />
                  ) : (
                    <Circle className="w-6 h-6 text-[#475A61]/40 stroke-[1.8]" />
                  )}
                </button>

                {/* Content */}
                <div
                  onClick={() => onOpenTaskModal(task)}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <p
                    className={`text-sm font-semibold text-[#475A61] truncate leading-snug ${
                      isCompleted ? 'line-through text-[#475A61]/50' : ''
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {task.due_time && (
                      <span className="flex items-center gap-0.5 text-[11px] text-[#68828C]">
                        <Clock className="w-3 h-3" />
                        {task.due_time.slice(0, 5)}
                      </span>
                    )}
                    <PriorityBadge priority={task.priority} />
                    {task.subtasks && task.subtasks.length > 0 && (
                      <span className="text-[11px] text-[#68828C]">
                        {task.subtasks.filter((s) => s.is_completed).length}/
                        {task.subtasks.length} sub
                      </span>
                    )}
                  </div>
                </div>

                {/* Chevron */}
                <button
                  onClick={() => onOpenTaskModal(task)}
                  className="flex-shrink-0 text-[#475A61]/25 hover:text-[#475A61]/50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
