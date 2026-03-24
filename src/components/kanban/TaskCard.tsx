import React, { useRef, useCallback, memo } from 'react';
import { Task, Status, PRIORITY_COLORS, SimulatedUser } from '../../types';
import { Avatar, AvatarStack } from '../shared/Avatar';
import { PriorityBadge } from '../shared/PriorityBadge';
import { formatDueDate } from '../../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  index: number;
  isDragTarget: boolean;
  onPointerDown: (e: React.PointerEvent, taskId: string, status: Status, card: HTMLElement, index: number) => void;
  collaborators?: SimulatedUser[];
}

export const TaskCard = memo(function TaskCard({ task, index, isDragTarget, onPointerDown, collaborators = [] }: TaskCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const due = formatDueDate(task.dueDate);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (cardRef.current) {
      onPointerDown(e, task.id, task.status, cardRef.current, index);
    }
  }, [task.id, task.status, index, onPointerDown]);

  return (
    <div
      ref={cardRef}
      className={`group bg-slate-800/80 border border-slate-700/50 rounded-xl p-3.5 cursor-grab active:cursor-grabbing
        hover:border-slate-600/70 hover:bg-slate-800 touch-none select-none
        ${isDragTarget ? 'ring-2 ring-indigo-500/50 bg-indigo-900/20' : ''}`}
      onPointerDown={handlePointerDown}
      style={{ borderLeft: `3px solid ${PRIORITY_COLORS[task.priority]}` }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-slate-200 leading-tight line-clamp-2">{task.title}</h4>
        {collaborators.length > 0 && (
          <AvatarStack users={collaborators} maxShow={2} />
        )}
      </div>

      <div className="flex items-center gap-2 mb-2.5">
        <PriorityBadge priority={task.priority} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar initials={task.assignee.initials} color={task.assignee.color} size="sm" />
          <span className="text-[11px] text-slate-400">{task.assignee.name.split(' ')[0]}</span>
        </div>
        <span className={`text-[11px] font-medium flex items-center gap-1 ${
          due.isDueToday ? 'text-amber-400' :
          due.isOverdue ? 'text-red-400' :
          'text-slate-500'
        }`}>
          {(due.isOverdue || due.isDueToday) && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {due.text}
        </span>
      </div>
    </div>
  );
});
