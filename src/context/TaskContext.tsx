import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Task, TaskList, Tag, Subtask, Priority, TaskStatus } from '../types/database';
import { useAuth } from './AuthContext';

interface TaskContextType {
  tasks: Task[];
  lists: TaskList[];
  tags: Tag[];
  loading: boolean;
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
  createTask: (taskData: Partial<Task>, subtasksData?: string[], tagsData?: string[], reminderTime?: string) => Promise<Task | null>;
  updateTask: (taskId: string, updates: Partial<Task>, subtasksData?: Subtask[], tagsData?: string[], reminderTime?: string) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
  toggleTaskCompletion: (taskId: string) => Promise<boolean>;
  
  // Lists & Subtasks
  createTaskList: (name: string, icon?: string, color?: string) => Promise<TaskList | null>;
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
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('task_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true });

      if (!error && data) {
        setLists(data as TaskList[]);
      }
    } catch (err) {
      console.error('Failed to fetch lists:', err);
    }
  };

  const fetchTags = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (!error && data) {
        setTags(data as Tag[]);
      }
    } catch (err) {
      console.error('Failed to fetch tags:', err);
    }
  };

  const fetchTasks = async () => {
    if (!user) return;
    setLoading(true);
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
      } else if (data) {
        const formattedTasks: Task[] = data.map((item: any) => ({
          ...item,
          tags: item.task_tags ? item.task_tags.map((tt: any) => tt.tag).filter(Boolean) : [],
        }));
        setTasks(formattedTasks);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (
    taskData: Partial<Task>,
    subtasksData: string[] = [],
    tagsData: string[] = [],
    reminderTime?: string
  ): Promise<Task | null> => {
    if (!user) return null;

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
        console.warn('Supabase task insert failed, using local task:', taskError);
        const fallbackTask: Task = {
          id: 'task-' + Date.now(),
          user_id: user.id,
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          status: newTask.status,
          due_date: newTask.due_date,
          due_time: newTask.due_time,
          list_id: newTask.list_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          subtasks: subtasksData.map((title, i) => ({
            id: 'sub-' + i + '-' + Date.now(),
            task_id: 'task-' + Date.now(),
            title,
            is_completed: false,
            position: i,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })),
          tags: tagsData.map((tName) => ({
            id: 'tag-' + tName,
            user_id: user.id,
            name: tName,
            created_at: new Date().toISOString(),
          })),
        };
        setTasks((prev) => [fallbackTask, ...prev]);
        return fallbackTask;
      }

      const createdTaskId = insertedTask.id;

      // Insert subtasks if any
      let createdSubtasks: Subtask[] = [];
      if (subtasksData.length > 0) {
        const subtasksToInsert = subtasksData.map((title, index) => ({
          task_id: createdTaskId,
          title,
          is_completed: false,
          position: index,
        }));
        const { data: subData } = await supabase
          .from('subtasks')
          .insert(subtasksToInsert)
          .select();
        if (subData) createdSubtasks = subData as Subtask[];
      }

      // Insert tags
      let createdTags: Tag[] = [];
      if (tagsData.length > 0) {
        for (const tagName of tagsData) {
          // Find or create tag
          let tagObj = tags.find((t) => t.name.toLowerCase() === tagName.toLowerCase());
          if (!tagObj) {
            const { data: newTag } = await supabase
              .from('tags')
              .insert({ user_id: user.id, name: tagName })
              .select()
              .single();
            if (newTag) {
              tagObj = newTag as Tag;
              setTags((prev) => [...prev, tagObj!]);
            }
          }

          if (tagObj) {
            createdTags.push(tagObj);
            await supabase.from('task_tags').insert({
              task_id: createdTaskId,
              tag_id: tagObj.id,
            });
          }
        }
      }

      // Insert Reminder if specified
      if (reminderTime) {
        await supabase.from('reminders').insert({
          task_id: createdTaskId,
          user_id: user.id,
          reminder_time: reminderTime,
          repeat_type: 'none',
          enabled: true,
        });
      }

      const fullTask: Task = {
        ...(insertedTask as Task),
        subtasks: createdSubtasks,
        tags: createdTags,
      };

      setTasks((prev) => [fullTask, ...prev]);
      return fullTask;
    } catch (err) {
      console.warn('Failed to create task in Supabase, using local fallback:', err);
      const fallbackTask: Task = {
        id: 'task-' + Date.now(),
        user_id: user.id,
        title: taskData.title || 'Untitled Task',
        description: taskData.description || null,
        priority: taskData.priority || 'medium',
        status: 'pending' as TaskStatus,
        due_date: taskData.due_date || null,
        due_time: taskData.due_time || null,
        list_id: taskData.list_id || activeListId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subtasks: subtasksData.map((title, i) => ({
          id: 'sub-' + i + '-' + Date.now(),
          task_id: 'task-' + Date.now(),
          title,
          is_completed: false,
          position: i,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
        tags: tagsData.map((tName) => ({
          id: 'tag-' + tName,
          user_id: user.id,
          name: tName,
          created_at: new Date().toISOString(),
        })),
      };
      setTasks((prev) => [fallbackTask, ...prev]);
      return fallbackTask;
    }
  };

  const updateTask = async (
    taskId: string,
    updates: Partial<Task>,
    _subtasksData?: Subtask[],
    _tagsData?: string[],
    _reminderTime?: string
  ): Promise<boolean> => {
    if (!user) return false;

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
        return false;
      }

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
      );
      return true;
    } catch (err) {
      console.error('Failed to update task:', err);
      return false;
    }
  };

  const deleteTask = async (taskId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting task:', error);
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
    if (!user) return null;
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
    if (!user) return false;
    try {
      const { error } = await supabase
        .from('task_lists')
        .delete()
        .eq('id', listId)
        .eq('user_id', user.id);

      if (error) return false;

      setLists((prev) => prev.filter((l) => l.id !== listId));
      if (activeListId === listId) setActiveListId(null);
      return true;
    } catch (err) {
      console.error('Failed to delete list:', err);
      return false;
    }
  };

  const toggleSubtask = async (subtaskId: string, currentCompleted: boolean): Promise<boolean> => {
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
