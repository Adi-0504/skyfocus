import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { FocusSession } from '../types/database';

interface FocusContextType {
  mode: 'work' | 'break';
  setMode: (mode: 'work' | 'break') => void;
  workDuration: number; // in seconds
  breakDuration: number; // in seconds
  setWorkDuration: (secs: number) => void;
  setBreakDuration: (secs: number) => void;
  timeLeft: number;
  isRunning: boolean;
  selectedTaskId: string | null;
  setSelectedTaskId: (taskId: string | null) => void;
  focusSessions: FocusSession[];
  
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  completeSession: () => Promise<void>;
  fetchFocusSessions: () => Promise<void>;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [workDuration, setWorkDuration] = useState<number>(1500); // 25 min
  const [breakDuration, setBreakDuration] = useState<number>(300); // 5 min
  const [timeLeft, setTimeLeft] = useState<number>(1500);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const startTimeRef = useRef<string | null>(null);

  // Sync initial timer duration when mode or settings change while idle
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(mode === 'work' ? workDuration : breakDuration);
    }
  }, [mode, workDuration, breakDuration]);

  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      completeSession();
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (user) {
      fetchFocusSessions();
    } else {
      setFocusSessions([]);
    }
  }, [user]);

  const fetchFocusSessions = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('focus_sessions')
        .select(`
          *,
          task:tasks(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setFocusSessions(data as FocusSession[]);
      }
    } catch (err) {
      console.error('Failed to fetch focus sessions:', err);
    }
  };

  const startTimer = () => {
    if (!startTimeRef.current) {
      startTimeRef.current = new Date().toISOString();
    }
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    startTimeRef.current = null;
    setTimeLeft(mode === 'work' ? workDuration : breakDuration);
  };

  const completeSession = async () => {
    setIsRunning(false);
    const endedAt = new Date().toISOString();
    const startedAt = startTimeRef.current || new Date(Date.now() - (workDuration - timeLeft) * 1000).toISOString();
    const actualDuration = mode === 'work' ? workDuration - timeLeft : breakDuration - timeLeft;

    if (user && actualDuration > 10 && mode === 'work') {
      try {
        const { data, error } = await supabase
          .from('focus_sessions')
          .insert({
            user_id: user.id,
            task_id: selectedTaskId,
            duration: actualDuration,
            started_at: startedAt,
            ended_at: endedAt,
            completed: timeLeft === 0,
          })
          .select(`
            *,
            task:tasks(*)
          `)
          .single();

        if (!error && data) {
          setFocusSessions((prev) => [data as FocusSession, ...prev]);
        }
      } catch (err) {
        console.error('Failed to record focus session:', err);
      }
    }

    // Switch mode
    if (mode === 'work') {
      setMode('break');
      setTimeLeft(breakDuration);
    } else {
      setMode('work');
      setTimeLeft(workDuration);
    }
    startTimeRef.current = null;
  };

  return (
    <FocusContext.Provider
      value={{
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
        fetchFocusSessions,
      }}
    >
      {children}
    </FocusContext.Provider>
  );
};

export const useFocus = () => {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
};
