import React, { useState, useMemo, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCheck,
  Flame,
  Minus,
  Plus,
  ListTodo,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFocus } from '../context/FocusContext';
import { useTasks } from '../context/TaskContext';

export const FocusView: React.FC = () => {
  const { t } = useTranslation();
  const { tasks } = useTasks();
  const {
    mode,
    setMode,
    workDuration,
    breakDuration,
    setWorkDuration,
    setBreakDuration,
    timeLeft,
    isRunning,
    selectedTaskId,
    setSelectedTaskId,
    focusSessions,
    startTimer,
    pauseTimer,
    resetTimer,
    completeSession,
  } = useFocus();

  const [showDurationEditor, setShowDurationEditor] = useState(false);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalSecs = mode === 'work' ? workDuration : breakDuration;
  const progressPercent = totalSecs > 0
    ? Math.round(((totalSecs - timeLeft) / totalSecs) * 100)
    : 0;

  const circumference = 2 * Math.PI * 44;

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const todaySessions = useMemo(
    () => focusSessions.filter((s) => s.created_at.slice(0, 10) === todayStr && s.completed),
    [focusSessions, todayStr]
  );
  const totalFocusMinutesToday = useMemo(() => {
    const total = todaySessions.reduce((acc, curr) => acc + curr.duration, 0);
    return Math.round(total / 60);
  }, [todaySessions]);

  const pendingTasks = useMemo(
    () => tasks.filter((t) => t.status === 'pending'),
    [tasks]
  );

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId),
    [tasks, selectedTaskId]
  );

  const adjustDuration = useCallback(
    (type: 'work' | 'break', delta: number) => {
      if (isRunning) return;
      if (type === 'work') {
        const next = Math.max(5 * 60, Math.min(90 * 60, workDuration + delta * 60));
        setWorkDuration(next);
      } else {
        const next = Math.max(1 * 60, Math.min(30 * 60, breakDuration + delta * 60));
        setBreakDuration(next);
      }
    },
    [isRunning, workDuration, breakDuration, setWorkDuration, setBreakDuration]
  );

  return (
    <div className="min-h-screen sky-bg pb-36 pt-6 px-4 max-w-lg mx-auto fade-in">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-white tracking-wide mb-0.5">
          {t('focus.title')}
        </h1>
        <p className="text-xs text-white/60 font-medium">{t('focus.subtitle')}</p>
      </div>

      {/* Mode Switcher */}
      <div className="sky-card p-1 flex gap-1 mb-5 max-w-xs mx-auto">
        {(['work', 'break'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { if (!isRunning) setMode(m); }}
            disabled={isRunning}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              mode === m
                ? 'bg-[#475A61] text-[#F1EEDC] shadow-sm'
                : 'text-[#68828C] hover:text-[#475A61]'
            } ${isRunning ? 'cursor-not-allowed' : ''}`}
          >
            {m === 'work' ? t('focus.work_session') : t('focus.break_session')}
          </button>
        ))}
      </div>

      {/* Main Timer Circle */}
      <div className="relative w-60 h-60 sm:w-68 sm:h-68 mx-auto my-4 flex items-center justify-center">
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Track */}
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke="rgba(241, 238, 220, 0.15)"
            strokeWidth="5"
          />
          {/* Progress */}
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke={mode === 'work' ? '#F1EEDC' : '#A7C5B5'}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progressPercent / 100)}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s ease' }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
          <span className="text-[52px] font-black text-[#F1EEDC] leading-none tracking-tighter drop-shadow-sm">
            {formatTime(timeLeft)}
          </span>
          <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] mt-2">
            {mode === 'work' ? t('focus.work_session') : t('focus.break_session')}
          </span>
          {isRunning && (
            <span className="mt-1.5 w-2 h-2 rounded-full bg-[#F1EEDC]/70 animate-pulse" />
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-5 my-5">
        <button
          onClick={resetTimer}
          aria-label="Reset"
          className="w-12 h-12 sky-card rounded-full flex items-center justify-center text-[#475A61] hover:scale-105 active:scale-95 transition-transform"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Main Play/Pause */}
        <button
          onClick={isRunning ? pauseTimer : startTimer}
          className="h-16 px-9 bg-[#F1EEDC] text-[#475A61] rounded-2xl font-black text-lg shadow-xl hover:scale-105 active:scale-95 transition-transform flex items-center gap-2.5"
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-[#475A61]" />
              <span>{t('focus.pause')}</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-[#475A61]" />
              <span>{t('focus.start')}</span>
            </>
          )}
        </button>

        <button
          onClick={completeSession}
          aria-label="Complete"
          className="w-12 h-12 sky-card rounded-full flex items-center justify-center text-[#475A61] hover:scale-105 active:scale-95 transition-transform"
        >
          <CheckCheck className="w-5 h-5 stroke-[2]" />
        </button>
      </div>

      {/* Duration Editor Toggle */}
      <div className="max-w-sm mx-auto mb-4">
        <button
          onClick={() => setShowDurationEditor((v) => !v)}
          disabled={isRunning}
          className={`w-full sky-button-secondary py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-1.5 rounded-xl ${
            isRunning ? 'opacity-40 cursor-not-allowed' : ''
          }`}
        >
          <span>
            {t('focus.work_session')}: {Math.round(workDuration / 60)}m ·{' '}
            {t('focus.break_session')}: {Math.round(breakDuration / 60)}m
          </span>
        </button>

        {showDurationEditor && !isRunning && (
          <div className="sky-card p-4 mt-2 space-y-3 fade-in">
            {/* Work Duration */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#475A61]">
                {t('focus.work_session')}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustDuration('work', -5)}
                  className="w-8 h-8 sky-button-secondary rounded-full flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-[#475A61] w-10 text-center">
                  {Math.round(workDuration / 60)}m
                </span>
                <button
                  onClick={() => adjustDuration('work', 5)}
                  className="w-8 h-8 sky-button-secondary rounded-full flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Break Duration */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#475A61]">
                {t('focus.break_session')}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustDuration('break', -1)}
                  className="w-8 h-8 sky-button-secondary rounded-full flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-[#475A61] w-10 text-center">
                  {Math.round(breakDuration / 60)}m
                </span>
                <button
                  onClick={() => adjustDuration('break', 1)}
                  className="w-8 h-8 sky-button-secondary rounded-full flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Task Selector */}
      <div className="sky-card p-4 mb-4">
        <label className="block text-[10px] font-bold text-[#68828C] uppercase tracking-[0.15em] mb-2 flex items-center gap-1">
          <ListTodo className="w-3.5 h-3.5" />
          {t('focus.select_task')}
        </label>
        <select
          value={selectedTaskId || ''}
          onChange={(e) => setSelectedTaskId(e.target.value || null)}
          className="w-full sky-input px-3 py-2.5 text-sm font-medium"
        >
          <option value="">{t('focus.no_task_selected')}</option>
          {pendingTasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
        </select>
        {selectedTask && (
          <p className="text-[11px] text-[#68828C] mt-1.5 pl-1 truncate">
            🎯 {selectedTask.title}
          </p>
        )}
      </div>

      {/* Stats Card */}
      <div className="sky-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-xs font-bold text-[#475A61]">
              {t('focus.completed_sessions_today', { count: todaySessions.length })}
            </p>
            <p className="text-[11px] text-[#68828C]">
              {t('focus.total_duration', { minutes: totalFocusMinutesToday })}
            </p>
          </div>
        </div>
        <div className="text-2xl font-black text-[#475A61]">
          {todaySessions.length}
        </div>
      </div>
    </div>
  );
};
