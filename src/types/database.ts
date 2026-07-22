export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed';
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly';
export type Language = 'zh-TW' | 'en' | 'ja';

export interface Profile {
  id: string;
  display_name: string;
  avatar_url?: string | null;
  language: Language;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface TaskList {
  id: string;
  user_id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  list_id?: string | null;
  title: string;
  description?: string | null;
  priority: Priority;
  status: TaskStatus;
  due_date?: string | null;
  due_time?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  subtasks?: Subtask[];
  tags?: Tag[];
  reminders?: Reminder[];
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface TaskTag {
  id: string;
  task_id: string;
  tag_id: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  task_id: string;
  user_id: string;
  reminder_time: string;
  repeat_type: RepeatType;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface PushSubscriptionData {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

export interface FocusSession {
  id: string;
  user_id: string;
  task_id?: string | null;
  duration: number; // in seconds
  started_at: string;
  ended_at: string;
  completed: boolean;
  created_at: string;
  task?: Task;
}
