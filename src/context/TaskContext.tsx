import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Task, TaskList, Tag, Subtask, Priority, TaskStatus, RepeatType } from '../types/database';
import { useAuth } from './AuthContext';

interface TaskContextType {
  tasks: Task[];
  lists: TaskList[];
  tags: Tag[];
  loading: boolean;
  error: string | null;
  activeListId: string | null;
  setActiveListId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: TaskStatus | 'all';
  setStatusFilter: (status: TaskStatus | 'all') => void;
  priorityFilter: Priority | 'all';
  setPriorityFilter: (priority: Priority | 'all') => void;
  selectedTagId: string | null;
  setSelectedTagId: (tagId: string | null) => void;
  sortBy: 'created_at' | 'due_date' | 'priority';
  setSortBy: (sort: 'created_at' | 'due_date' | 'priority') => void;
  
  // Actions
  fetchTasks: () => Promise<void>;
  createTask: (taskData: Partial<Task>, subtasksData?: string[], tagsData?: string[], reminderTime?: string, repeatType?: RepeatType) => Promise<Task | null>;
  updateTask: (taskId: string, updates: Partial<Task>, subtasksData?: Subtask[], tagsData?: string[], reminderTime?: string, repeatType?: RepeatType) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
  toggleTaskCompletion: (taskId: string) => Promise<boolean>;
  
  // Lists & Subtasks
  createTaskList: (name: string, icon?: string, color?: string) => Promise<TaskList | null>;
  renameTaskList: (listId: string, name: string) => Promise<boolean>;
  deleteTaskList: (listId: string) => Promise<boolean>;
  toggleSubtask: (subtaskId: string, currentCompleted: boolean) => Promise<boolean>;
  createSubtask: (taskId: string, title: string) => Promise<Subtask | null>;
  deleteSubtask: (subtaskId: string) => Promise<boolean>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<TaskList[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Sorting state
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'created_at' | 'due_date' | 'priority'>('created_at');

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchLists();
      fetchTags();
    } else {
      setTasks([]);
      setLists([]);
      setTags([]);
      setLoading(false);
    }
  }, [user]);

  const fetchLists = async () => {
    if (!user || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('task_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true });

      if (!error && data) {
        setLists(data as TaskList[]);
      } else if (error) {
        setError(error.message);
      }
    } catch (err: any) {
      console.error('Failed to fetch lists:', err);
      setError(err.message || 'Failed to load lists.');
    }
  };

  const fetchTags = async () => {
    if (!user || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (!error && data) {
        setTags(data as Tag[]);
      } else if (error) {
        setError(error.message);
      }
    } catch (err: any) {
      console.error('Failed to fetch tags:', err);
      setError(err.message || 'Failed to load tags.');
    }
  };

  const fetchTasks = async () => {
    if (!user || !supabase) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch tasks with subtasks, tags, and reminders
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          subtasks(*),
          task_tags(
            tag:tags(*)
          ),
          reminders(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        setError(error.message);
      } else if (data) {
        const formattedTasks: Task[] = data.map((item: any) => ({
          ...item,
          tags: item.task_tags ? item.task_tags.map((tt: any) => tt.tag).filter(Boolean) : [],
        }));
        setTasks(formattedTasks);
      }
    } catch (err: any) {
      console.error('Failed to fetch tasks:', err);
      setError(err.message || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (
    taskData: Partial<Task>,
    subtasksData: string[] = [],
    tagsData: string[] = [],
    reminderTime?: string,
    repeatType: RepeatType = 'none'
  ): Promise<Task | null> => {
    if (!user || !supabase) {
      setError('Supabase 尚未設定或使用者尚未登入。');
      return null;
    }

    let createdTaskId: string | null = null;
    try {
      const newTask = {
        user_id: user.id,
        title: taskData.title || 'Untitled Task',
        description: taskData.description || null,
        priority: taskData.priority || 'medium',
        status: 'pending' as TaskStatus,
        due_date: taskData.due_date || null,
        due_time: taskData.due_time || null,
        list_id: taskData.list_id || activeListId || null,
      };

      const { data: insertedTask, error: taskError } = await supabase
        .from('tasks')
        .insert(newTask)
        .select()
        .single();

      if (taskError || !insertedTask) {
        setError(taskError?.message || '任務建立失敗。');
        return null;
      }

      createdTaskId = insertedTask.id;

      // Insert subtasks if any
      let createdSubtasks: Subtask[] = [];
      if (subtasksData.length > 0) {
        const subtasksToInsert = subtasksData.map((title, index) => ({
          task_id: createdTaskId,
          title,
          is_completed: false,
          position: index,
        }));
        const { data: subData, error: subError } = await supabase
          .from('subtasks')
          .insert(subtasksToInsert)
          .select();
        if (subError) throw subError;
        if (subData) createdSubtasks = subData as Subtask[];
      }

      // Insert tags
      let createdTags: Tag[] = [];
      if (tagsData.length > 0) {
        for (const tagName of tagsData) {
          // Find or create tag
          let tagObj = tags.find((t) => t.name.toLowerCase() === tagName.toLowerCase());
          if (!tagObj) {
            const { data: newTag, error: tagError } = await supabase
              .from('tags')
              .insert({ user_id: user.id, name: tagName })
              .select()
              .single();
            if (tagError) throw tagError;
            if (newTag) {
              tagObj = newTag as Tag;
              setTags((prev) => [...prev, tagObj!]);
            }
          }

          if (tagObj) {
            createdTags.push(tagObj);
            const { error: taskTagError } = await supabase.from('task_tags').insert({
              task_id: createdTaskId,
              tag_id: tagObj.id,
            });
            if (taskTagError) throw taskTagError;
          }
        }
      }

      // Insert Reminder if specified
      if (reminderTime) {
        const { error: reminderError } = await supabase.from('reminders').insert({
          task_id: createdTaskId,
          user_id: user.id,
          reminder_time: reminderTime,
          repeat_type: repeatType,
          enabled: true,
        });
        if (reminderError) throw reminderError;
      }

      const fullTask: Task = {
        ...(insertedTask as Task),
        subtasks: createdSubtasks,
        tags: createdTags,
      };

      setTasks((prev) => [fullTask, ...prev]);
      return fullTask;
    } catch (err: any) {
      if (createdTaskId && supabase) {
        await supabase.from('tasks').delete().eq('id', createdTaskId).eq('user_id', user.id);
      }
      setError(err.message || '任務建立失敗。');
      return null;
    }
  };

  const updateTask = async (
    taskId: string,
    updates: Partial<Task>,
    _subtasksData?: Subtask[],
    _tagsData?: string[],
    _reminderTime?: string,
    _repeatType: RepeatType = 'none'
  ): Promise<boolean> => {
    if (!user || !supabase) {
      setError('Supabase 尚未設定或使用者尚未登入。');
      return false;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating task:', error);
        setError(error.message);
        return false;
      }

      if (_subtasksData) {
        const { error: deleteSubtasksError } = await supabase.from('subtasks').delete().eq('task_id', taskId);
        if (deleteSubtasksError) throw deleteSubtasksError;
        if (_subtasksData.length > 0) {
          const { error: insertSubtasksError } = await supabase.from('subtasks').insert(
            _subtasksData.map((subtask, index) => ({
              task_id: taskId,
              title: subtask.title,
              is_completed: subtask.is_completed,
              position: index,
            }))
          );
          if (insertSubtasksError) throw insertSubtasksError;
        }
      }

      if (_tagsData) {
        const { error: deleteTaskTagsError } = await supabase.from('task_tags').delete().eq('task_id', taskId);
        if (deleteTaskTagsError) throw deleteTaskTagsError;
        for (const tagName of _tagsData) {
          let tag = tags.find((item) => item.name.toLowerCase() === tagName.toLowerCase());
          if (!tag) {
            const { data, error: tagError } = await supabase.from('tags').insert({ user_id: user.id, name: tagName }).select().single();
            if (tagError) throw tagError;
            tag = data as Tag;
            setTags((prev) => [...prev, tag!]);
          }
          const { error: taskTagError } = await supabase.from('task_tags').insert({ task_id: taskId, tag_id: tag.id });
          if (taskTagError) throw taskTagError;
        }
      }

      if (_reminderTime !== undefined) {
        const { error: deleteReminderError } = await supabase.from('reminders').delete().eq('task_id', taskId).eq('user_id', user.id);
        if (deleteReminderError) throw deleteReminderError;
        if (_reminderTime) {
          const { error: reminderError } = await supabase.from('reminders').insert({
            task_id: taskId,
            user_id: user.id,
            reminder_time: _reminderTime,
            repeat_type: _repeatType,
            enabled: true,
          });
          if (reminderError) throw reminderError;
        }
      }

      await fetchTasks();
      return true;
    } catch (err: any) {
      console.error('Failed to update task:', err);
      setError(err.message || '任務更新失敗。');
      return false;
    }
  };

  const deleteTask = async (taskId: string): Promise<boolean> => {
    if (!user || !supabase) return false;
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting task:', error);
        setError(error.message);
        return false;
      }

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      return true;
    } catch (err) {
      console.error('Failed to delete task:', err);
      return false;
    }
  };

  const toggleTaskCompletion = async (taskId: string): Promise<boolean> => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return false;

    const newStatus: TaskStatus = targetTask.status === 'completed' ? 'pending' : 'completed';
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;

    return await updateTask(taskId, {
      status: newStatus,
      completed_at: completedAt,
    });
  };

  const createTaskList = async (name: string, icon?: string, color?: string): Promise<TaskList | null> => {
    if (!user || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('task_lists')
        .insert({
          user_id: user.id,
          name,
          icon,
          color,
          position: lists.length,
        })
        .select()
        .single();

      if (error || !data) return null;

      const newList = data as TaskList;
      setLists((prev) => [...prev, newList]);
      return newList;
    } catch (err) {
      console.error('Failed to create list:', err);
      return null;
    }
  };

  const deleteTaskList = async (listId: string): Promise<boolean> => {
    if (!user || !supabase) return false;
    try {
      const { error } = await supabase
        .from('task_lists')
        .delete()
        .eq('id', listId)
        .eq('user_id', user.id);

      if (error) {
        setError(error.message);
        return false;
      }

      setLists((prev) => prev.filter((l) => l.id !== listId));
      if (activeListId === listId) setActiveListId(null);
      return true;
    } catch (err) {
      console.error('Failed to delete list:', err);
      return false;
    }
  };

  const renameTaskList = async (listId: string, name: string): Promise<boolean> => {
    if (!user || !supabase || !name.trim()) return false;
    try {
      const { data, error: updateError } = await supabase
        .from('task_lists')
        .update({ name: name.trim(), updated_at: new Date().toISOString() })
        .eq('id', listId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError || !data) {
        setError(updateError?.message || 'Failed to rename list.');
        return false;
      }

      setLists((prev) => prev.map((list) => list.id === listId ? data as TaskList : list));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to rename list.');
      return false;
    }
  };

  const toggleSubtask = async (subtaskId: string, currentCompleted: boolean): Promise<boolean> => {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('subtasks')
        .update({ is_completed: !currentCompleted })
        .eq('id', subtaskId);

      if (error) return false;

      setTasks((prev) =>
        prev.map((t) => ({
          ...t,
          subtasks: t.subtasks?.map((st) =>
            st.id === subtaskId ? { ...st, is_completed: !currentCompleted } : st
          ),
        }))
      );
      return true;
    } catch (err) {
      console.error('Failed to toggle subtask:', err);
      return false;
    }
  };

  const createSubtask = async (taskId: string, title: string): Promise<Subtask | null> => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('subtasks')
        .insert({
          task_id: taskId,
          title,
          is_completed: false,
          position: 0,
        })
        .select()
        .single();

      if (error || !data) return null;

      const newSub = data as Subtask;
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, subtasks: [...(t.subtasks || []), newSub] } : t
        )
      );
      return newSub;
    } catch (err) {
      console.error('Failed to create subtask:', err);
      return null;
    }
  };

  const deleteSubtask = async (subtaskId: string): Promise<boolean> => {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('subtasks').delete().eq('id', subtaskId);
      if (error) return false;

      setTasks((prev) =>
        prev.map((t) => ({
          ...t,
          subtasks: t.subtasks?.filter((st) => st.id !== subtaskId),
        }))
      );
      return true;
    } catch (err) {
      console.error('Failed to delete subtask:', err);
      return false;
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        lists,
        tags,
        loading,
        error,
        activeListId,
        setActiveListId,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        priorityFilter,
        setPriorityFilter,
        selectedTagId,
        setSelectedTagId,
        sortBy,
        setSortBy,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        createTaskList,
        renameTaskList,
        deleteTaskList,
        toggleSubtask,
        createSubtask,
        deleteSubtask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
