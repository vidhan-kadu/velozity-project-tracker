import React, { useState, useMemo, memo } from 'react';
import { Task, Status, STATUS_LABELS, SimulatedUser } from '../../types';
import { TaskCard } from './TaskCard';
import { EmptyState } from '../shared/EmptyState';

const INITIAL_VISIBLE = 5;
const LOAD_MORE_COUNT = 10;

interface KanbanColumnProps {
  status: Status;
  tasks: Task[];
  isDragOver: boolean;
  isDragging: boolean;
  placeholderHeight: number;
  dragTaskId: string | null;
  sourceStatus?: Status | null;
  onPointerDown: (e: React.PointerEvent, taskId: string, status: Status, card: HTMLElement, index: number) => void;
  usersByTask: Map<string, SimulatedUser[]>;
}

const STATUS_ACCENT: Record<Status, string> = {
  'todo': '#64748b',
  'in-progress': '#3b82f6',
  'in-review': '#f59e0b',
  'done': '#22c55e',
};

export const KanbanColumn = memo(function KanbanColumn({ status, tasks, isDragOver, isDragging, placeholderHeight, dragTaskId, sourceStatus, onPointerDown, usersByTask }: KanbanColumnProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const visibleTasks = useMemo(
    () => tasks.slice(0, visibleCount),
    [tasks, visibleCount]
  );

  const hasMore = tasks.length > visibleCount;

  return (
    <div
      data-column-status={status}
      className={`flex flex-col rounded-2xl transition-all duration-200 min-w-[280px] flex-1 ${
        isDragOver
          ? 'bg-indigo-900/20 ring-2 ring-indigo-500/30'
          : 'bg-slate-800/30'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/30">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_ACCENT[status] }} />
          <h3 className="text-sm font-semibold text-slate-300">{STATUS_LABELS[status]}</h3>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-700/40 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Cards Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[200px] max-h-[calc(100vh-260px)]">
        {tasks.length === 0 && !isDragOver ? (
          <EmptyState
            title="No tasks"
            description={`No tasks in ${STATUS_LABELS[status]}`}
            icon="kanban"
          />
        ) : (
          <>
            {visibleTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                isDragTarget={false}
                onPointerDown={onPointerDown}
                collaborators={usersByTask.get(task.id) || []}
              />
            ))}

            {/* Load More Button */}
            {hasMore && (
              <button
                onClick={() => setVisibleCount(prev => prev + LOAD_MORE_COUNT)}
                className="w-full py-2 text-[11px] font-medium text-slate-400 hover:text-slate-200 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                Show more ({tasks.length - visibleCount} remaining)
              </button>
            )}
            
            {/* Drop Zone Placeholder */}
            {isDragOver && isDragging && sourceStatus !== status && (
              <div
                className="rounded-xl border-2 border-dashed border-indigo-500/50 bg-indigo-500/10 animate-fade-in flex items-center justify-center"
                style={{ height: placeholderHeight }}
              >
                <span className="text-[10px] text-indigo-400 font-medium">Drop here</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});
