import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { X, Plus, Trash2, Calendar, Clock, Tag as TagIcon, List, Bell, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTasks } from '../context/TaskContext';
import { Task, Priority, RepeatType } from '../types/database';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskToEdit }) => {
  const { t } = useTranslation();
  const { lists, createTask, updateTask, deleteTask, toggleSubtask, createSubtask, deleteSubtask } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [listId, setListId] = useState<string>('');
  
  // Subtasks & Tags draft
  const [subtasksInput, setSubtasksInput] = useState<string[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [tagsInput, setTagsInput] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  
  // Reminder draft
  const [reminderTime, setReminderTime] = useState('');
  const [repeatType, setRepeatType] = useState<RepeatType>('none');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const sheetRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isOpen || !sheetRef.current) return;
    gsap.fromTo(sheetRef.current, { y: 32, autoAlpha: 0 }, {
      y: 0,
      autoAlpha: 1,
      duration: 0.35,
      ease: 'power3.out',
      overwrite: true,
    });
  }, [isOpen]);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority || 'medium');
      setDueDate(taskToEdit.due_date || '');
      setDueTime(taskToEdit.due_time || '');
      setListId(taskToEdit.list_id || '');
      setSubtasksInput([]);
      setTagsInput(taskToEdit.tags?.map((t) => t.name) || []);
      setReminderTime(taskToEdit.reminders?.[0]?.reminder_time ? taskToEdit.reminders[0].reminder_time.slice(0, 16) : '');
      setRepeatType(taskToEdit.reminders?.[0]?.repeat_type || 'none');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setDueTime('');
      setListId('');
      setSubtasksInput([]);
      setTagsInput([]);
      setReminderTime('');
      setRepeatType('none');
    }
    setErrorMsg('');
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddDraftSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    if (taskToEdit) {
      createSubtask(taskToEdit.id, newSubtaskTitle.trim());
    } else {
      setSubtasksInput((prev) => [...prev, newSubtaskTitle.trim()]);
    }
    setNewSubtaskTitle('');
  };

  const handleRemoveDraftSubtask = (index: number) => {
    setSubtasksInput((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = newTagInput.trim();
      if (val && !tagsInput.includes(val)) {
        setTagsInput((prev) => [...prev, val]);
        setNewTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagsInput((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg(t('task_modal.title_label') + ' is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (taskToEdit) {
          const updated = await updateTask(
            taskToEdit.id,
          {
            title: title.trim(),
            description: description.trim() || null,
            priority,
            due_date: dueDate || null,
            due_time: dueTime || null,
            list_id: listId || null,
            },
            undefined,
            tagsInput,
            reminderTime ? new Date(reminderTime).toISOString() : '',
            repeatType
          );
          if (!updated) throw new Error('Failed to update task.');
        } else {
          const created = await createTask(
          {
            title: title.trim(),
            description: description.trim() || null,
            priority,
            due_date: dueDate || null,
            due_time: dueTime || null,
            list_id: listId || null,
          },
            subtasksInput,
            tagsInput,
            reminderTime ? new Date(reminderTime).toISOString() : undefined,
            repeatType
          );
          if (!created) throw new Error('Failed to create task.');
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (taskToEdit && window.confirm(t('task_modal.delete') + '?')) {
      await deleteTask(taskToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4 transition-all">
      <div
        ref={sheetRef}
        className="w-full max-w-lg sky-sheet sm:rounded-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#475A61]/10 sticky top-0 bg-[#F1EEDC] z-10">
          <h2 className="text-xl font-bold text-[#475A61]">
            {taskToEdit ? t('task_modal.edit_title') : t('task_modal.create_title')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 text-[#475A61] transition"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 flex-1 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-100 text-red-700 rounded-xl flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#68828C] uppercase tracking-wider mb-1">
              {t('task_modal.title_label')} *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('task_modal.title_placeholder')}
              className="w-full sky-input px-4 py-3 text-base font-medium"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#68828C] uppercase tracking-wider mb-1">
              {t('task_modal.desc_label')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('task_modal.desc_placeholder')}
              rows={2}
              className="w-full sky-input px-4 py-2.5 text-sm resize-none"
            />
          </div>

          {/* Priority & List Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#68828C] uppercase tracking-wider mb-1">
                {t('task_modal.priority')}
              </label>
              <div className="flex gap-1 bg-black/5 p-1 rounded-xl">
                {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                      priority === p
                        ? p === 'high'
                          ? 'bg-rose-500 text-white shadow-xs'
                          : p === 'medium'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-emerald-600 text-white shadow-xs'
                        : 'text-[#475A61] hover:bg-black/5'
                    }`}
                  >
                    {t(`tasks.priority_${p}`)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#68828C] uppercase tracking-wider mb-1 flex items-center gap-1">
                <List className="w-3.5 h-3.5" />
                {t('task_modal.list')}
              </label>
              <select
                value={listId}
                onChange={(e) => setListId(e.target.value)}
                className="w-full sky-input px-3 py-2 text-sm font-medium"
              >
                <option value="">{t('tasks.default_list')}</option>
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#68828C] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {t('task_modal.due_date')}
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full sky-input px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#68828C] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {t('task_modal.due_time')}
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full sky-input px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-xs font-semibold text-[#68828C] uppercase tracking-wider mb-1 flex items-center gap-1">
              <Bell className="w-3.5 h-3.5" />
              {t('task_modal.reminder')}
            </label>
            <input
              type="datetime-local"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full sky-input px-3 py-2 text-sm"
            />
            <select
              value={repeatType}
              onChange={(e) => setRepeatType(e.target.value as RepeatType)}
              className="w-full sky-input px-3 py-2 text-sm mt-2"
            >
              <option value="none">{t('task_modal.repeat_none')}</option>
              <option value="daily">{t('task_modal.repeat_daily')}</option>
              <option value="weekly">{t('task_modal.repeat_weekly')}</option>
              <option value="monthly">{t('task_modal.repeat_monthly')}</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-[#68828C] uppercase tracking-wider mb-1 flex items-center gap-1">
              <TagIcon className="w-3.5 h-3.5" />
              {t('task_modal.tags')}
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tagsInput.map((tg) => (
                <span
                  key={tg}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#475A61]/15 text-[#475A61] rounded-full text-xs font-medium"
                >
                  #{tg}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tg)}
                    className="hover:text-red-600 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder={t('task_modal.tag_placeholder')}
              className="w-full sky-input px-3 py-2 text-sm"
            />
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-xs font-semibold text-[#68828C] uppercase tracking-wider mb-1">
              {t('task_modal.subtasks')}
            </label>

            {/* Existing database subtasks for edit mode */}
            {taskToEdit?.subtasks && taskToEdit.subtasks.length > 0 && (
              <div className="space-y-1.5 mb-2">
                {taskToEdit.subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between bg-black/5 px-3 py-2 rounded-xl text-sm"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="checkbox"
                        checked={st.is_completed}
                        onChange={() => toggleSubtask(st.id, st.is_completed)}
                        className="rounded-md text-[#475A61] focus:ring-0"
                      />
                      <span className={st.is_completed ? 'line-through text-gray-400' : 'text-[#475A61]'}>
                        {st.title}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteSubtask(st.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Draft subtasks for new tasks */}
            {!taskToEdit && subtasksInput.length > 0 && (
              <div className="space-y-1.5 mb-2">
                {subtasksInput.map((st, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-black/5 px-3 py-2 rounded-xl text-sm"
                  >
                    <span className="text-[#475A61]">{st}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDraftSubtask(idx)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDraftSubtask();
                  }
                }}
                placeholder={t('task_modal.add_subtask')}
                className="flex-1 sky-input px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={handleAddDraftSubtask}
                className="sky-button-secondary px-3 py-2 text-sm flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-between gap-3 border-t border-[#475A61]/10">
            {taskToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-sm font-semibold transition"
              >
                {t('task_modal.delete')}
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="sky-button-secondary px-5 py-2.5 text-sm"
              >
                {t('task_modal.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="sky-button-primary px-6 py-2.5 text-sm"
              >
                {isSubmitting ? t('common.loading') : t('task_modal.save')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
