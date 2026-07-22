import React, { useState, useMemo } from 'react';
import { Search, Plus, CheckCircle2, Circle, Clock, Tag as TagIcon, ListFilter, ArrowUpDown, Trash2, FolderPlus, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTasks } from '../context/TaskContext';
import { Task, Priority, TaskStatus } from '../types/database';

interface TasksViewProps {
  onOpenTaskModal: (task?: Task) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ onOpenTaskModal }) => {
  const { t } = useTranslation();
  const {
    tasks,
    lists,
    tags,
    loading,
    error,
    fetchTasks,
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
    toggleTaskCompletion,
    createTaskList,
    renameTaskList,
    deleteTaskList,
  } = useTasks();

  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState('');

  // Handle new list creation
  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    await createTaskList(newListName.trim());
    setNewListName('');
    setIsCreatingList(false);
  };

  // Filter and Sort Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // List Filter
        if (activeListId !== null && task.list_id !== activeListId) {
          return false;
        }

        // Status Filter
        if (statusFilter !== 'all' && task.status !== statusFilter) {
          return false;
        }

        // Priority Filter
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
          return false;
        }

        // Tag Filter
        if (selectedTagId !== null) {
          const hasTag = task.tags?.some((tg) => tg.id === selectedTagId);
          if (!hasTag) return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchDesc = task.description?.toLowerCase().includes(q);
          const matchTag = task.tags?.some((tg) => tg.name.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchTag) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'due_date') {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return a.due_date.localeCompare(b.due_date);
        }
        if (sortBy === 'priority') {
          const pOrder: Record<Priority, number> = { high: 1, medium: 2, low: 3 };
          return pOrder[a.priority] - pOrder[b.priority];
        }
        // Default created_at
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [tasks, activeListId, statusFilter, priorityFilter, selectedTagId, searchQuery, sortBy]);

  return (
    <div className="min-h-screen sky-bg pb-32 pt-6 px-4 max-w-lg mx-auto fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h1 className="text-2xl font-bold text-white tracking-wide">
          {t('tasks.title')}
        </h1>
        <button
          onClick={() => setIsCreatingList(!isCreatingList)}
          className="sky-button-secondary bg-[#F1EEDC]/20 text-white hover:bg-[#F1EEDC]/30 p-2 rounded-xl text-xs flex items-center gap-1 font-semibold"
        >
          <FolderPlus className="w-4 h-4" />
          <span>{t('tasks.add_list')}</span>
        </button>
      </div>

      {/* New List Inline Input */}
      {isCreatingList && (
        <form onSubmit={handleCreateList} className="sky-card p-3 mb-4 flex gap-2">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="List name (e.g. Work, Personal)..."
            className="flex-1 sky-input px-3 py-1.5 text-sm"
            autoFocus
          />
          <button type="submit" className="sky-button-primary px-4 py-1.5 text-xs">
            {t('common.confirm')}
          </button>
        </form>
      )}

      {/* Search Input Bar */}
      {error && (
        <div className="sky-card p-4 mb-4 flex items-center justify-between gap-3 text-sm">
          <span className="text-[#475A61]">{t('common.error_title')}</span>
          <button type="button" onClick={fetchTasks} className="sky-button-secondary px-3 py-1.5 text-xs">
            {t('common.retry')}
          </button>
        </div>
      )}

      <div className="relative mb-4">
        <Search className="w-5 h-5 absolute left-3.5 top-3 text-[#68828C]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('tasks.search_placeholder')}
          className="w-full sky-card pl-11 pr-4 py-2.5 text-sm outline-none shadow-md"
        />
      </div>

      {/* Lists Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
        <button
          onClick={() => setActiveListId(null)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            activeListId === null
              ? 'bg-[#F1EEDC] text-[#475A61] shadow-md scale-105'
              : 'bg-[#F1EEDC]/20 text-white hover:bg-[#F1EEDC]/30'
          }`}
        >
          {t('tasks.all_lists')}
        </button>
        {lists.map((l) => (
          <div key={l.id} className="relative group flex items-center">
            <button
              onClick={() => setActiveListId(l.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeListId === l.id
                  ? 'bg-[#F1EEDC] text-[#475A61] shadow-md scale-105'
                  : 'bg-[#F1EEDC]/20 text-white hover:bg-[#F1EEDC]/30'
              }`}
            >
              {l.name}
            </button>
            {activeListId === l.id && (
              <div className="flex items-center">
                <button
                  onClick={() => {
                    const nextName = window.prompt(t('tasks.rename_list_prompt'), l.name);
                    if (nextName) void renameTaskList(l.id, nextName);
                  }}
                  className="ml-1 p-1 text-white/70 hover:text-white"
                  title={t('tasks.rename_list')}
                  aria-label={t('tasks.rename_list')}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteTaskList(l.id)}
                  className="ml-1 p-1 text-rose-300 hover:text-rose-100"
                  title={t('tasks.delete_list')}
                  aria-label={t('tasks.delete_list')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Filter Options Bar */}
      <div className="sky-card p-3 mb-4 space-y-2 text-xs">
        {/* Status Filter */}
        <div className="flex items-center justify-between gap-2 border-b border-[#475A61]/10 pb-2">
          <div className="flex items-center gap-1 font-bold text-[#475A61]">
            <ListFilter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <div className="flex gap-1">
            {(['all', 'pending', 'completed'] as (TaskStatus | 'all')[]).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition ${
                  statusFilter === st
                    ? 'bg-[#475A61] text-[#F1EEDC]'
                    : 'text-[#68828C] hover:bg-black/5'
                }`}
              >
                {t(`tasks.filter_${st}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Priority & Sorting Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 font-bold text-[#475A61]">
            <span>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="bg-transparent font-medium text-[#475A61] outline-none cursor-pointer"
            >
              <option value="all">{t('tasks.priority_all')}</option>
              <option value="high">{t('tasks.priority_high')}</option>
              <option value="medium">{t('tasks.priority_medium')}</option>
              <option value="low">{t('tasks.priority_low')}</option>
            </select>
          </div>

          <div className="flex items-center gap-1 font-bold text-[#475A61]">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-medium text-[#475A61] outline-none cursor-pointer"
            >
              <option value="created_at">{t('tasks.sort_created')}</option>
              <option value="due_date">{t('tasks.sort_due')}</option>
              <option value="priority">{t('tasks.sort_priority')}</option>
            </select>
          </div>
        </div>

        {/* Tags Row */}
        {tags.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
            <span className="text-[#68828C] font-semibold flex items-center gap-0.5">
              <TagIcon className="w-3 h-3" />
            </span>
            <button
              onClick={() => setSelectedTagId(null)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition ${
                selectedTagId === null ? 'bg-[#475A61] text-[#F1EEDC]' : 'bg-black/5 text-[#475A61]'
              }`}
            >
              {t('tasks.filter_all')}
            </button>
            {tags.map((tg) => (
              <button
                key={tg.id}
                onClick={() => setSelectedTagId(selectedTagId === tg.id ? null : tg.id)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition ${
                  selectedTagId === tg.id
                    ? 'bg-[#475A61] text-[#F1EEDC]'
                    : 'bg-black/5 text-[#475A61]'
                }`}
              >
                #{tg.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Task Items List */}
      {loading ? (
        <div className="sky-card p-8 text-center text-[#68828C] animate-pulse">
          {t('common.loading')}
        </div>
      ) : filteredTasks.length === 0 ? (
        /* Empty State */
        <div className="sky-card p-10 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-black/5 flex items-center justify-center mb-3 text-[#475A61]">
            <Search className="w-7 h-7 stroke-[1.5]" />
          </div>
          <h3 className="text-base font-bold text-[#475A61] mb-1">
            {t('tasks.empty_title')}
          </h3>
          <p className="text-xs text-[#68828C]">
            {t('tasks.empty_desc')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const completedSubtasks = task.subtasks?.filter((st) => st.is_completed).length || 0;
            const totalSubtasks = task.subtasks?.length || 0;

            return (
              <div
                key={task.id}
                className={`sky-card p-4 transition-all duration-200 hover:shadow-lg flex items-start justify-between gap-3 ${
                  isCompleted ? 'opacity-70 bg-[#F1EEDC]/80' : ''
                }`}
              >
                <button
                  onClick={() => toggleTaskCompletion(task.id)}
                  className="mt-0.5 p-1 text-[#475A61] hover:scale-110 active:scale-90 transition-all flex-shrink-0"
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 fill-[#475A61] text-[#F1EEDC]" />
                  ) : (
                    <Circle className="w-6 h-6 stroke-[1.8]" />
                  )}
                </button>

                <div
                  onClick={() => onOpenTaskModal(task)}
                  className="flex-1 cursor-pointer min-w-0"
                >
                  <h3
                    className={`text-base font-semibold text-[#475A61] truncate ${
                      isCompleted ? 'line-through text-gray-500' : ''
                    }`}
                  >
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="text-xs text-[#68828C] line-clamp-1 mt-0.5">
                      {task.description}
                    </p>
                  )}

                  {/* Badges & Info */}
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-[#68828C]">
                    {task.due_date && (
                      <span className="flex items-center gap-1 bg-black/5 px-2 py-0.5 rounded-md">
                        <Clock className="w-3 h-3" />
                        {task.due_date} {task.due_time ? task.due_time.slice(0, 5) : ''}
                      </span>
                    )}

                    {totalSubtasks > 0 && (
                      <span className="bg-black/5 px-2 py-0.5 rounded-md font-medium text-[11px]">
                        {t('tasks.subtasks_progress', { completed: completedSubtasks, total: totalSubtasks })}
                      </span>
                    )}

                    <span
                      className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        task.priority === 'high'
                          ? 'bg-rose-100 text-rose-700'
                          : task.priority === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {t(`tasks.priority_${task.priority}`)}
                    </span>

                    {task.tags?.map((tg) => (
                      <span key={tg.id} className="text-[#475A61] font-semibold text-[11px]">
                        #{tg.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => onOpenTaskModal()}
        aria-label="Create Task"
        className="fixed bottom-24 right-6 z-40 w-14 h-14 sky-card bg-[#F1EEDC] text-[#475A61] rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-2 border-white/20"
      >
        <Plus className="w-7 h-7 stroke-[2.2]" />
      </button>
    </div>
  );
};
