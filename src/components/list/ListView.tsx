import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useAppContext, useSortedTasks } from '../../store/AppContext';
import { SortField, SortDirection, Status, STATUS_LABELS, PRIORITY_COLORS } from '../../types';
import { formatDueDate } from '../../utils/dateUtils';
import { useVirtualScroll } from '../../hooks/useVirtualScroll';
import { Avatar } from '../shared/Avatar';
import { PriorityBadge } from '../shared/PriorityBadge';
import { Dropdown } from '../shared/Dropdown';
import { EmptyState } from '../shared/EmptyState';
import { useCollaboration } from '../../hooks/useCollaboration';
import { AvatarStack } from '../shared/Avatar';

const ROW_HEIGHT = 52;

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));

export function ListView() {
  const { state, dispatch, filteredTasks } = useAppContext();
  const sortedTasks = useSortedTasks(filteredTasks, state.sort);
  const { usersByTask } = useCollaboration();
  const [containerHeight, setContainerHeight] = useState(600);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const { visibleRange, totalHeight, offsetY, onScroll } = useVirtualScroll({
    totalItems: sortedTasks.length,
    itemHeight: ROW_HEIGHT,
    containerHeight,
    buffer: 5,
  });

  const visibleTasks = useMemo(() => {
    return sortedTasks.slice(visibleRange.start, visibleRange.end + 1);
  }, [sortedTasks, visibleRange]);

  const toggleSort = useCallback((field: SortField) => {
    dispatch({
      type: 'SET_SORT',
      payload: {
        field,
        direction: state.sort.field === field && state.sort.direction === 'asc' ? 'desc' : 'asc',
      },
    });
  }, [state.sort, dispatch]);

  const SortIcon = ({ field }: { field: SortField }) => {
    const isActive = state.sort.field === field;
    return (
      <span className={`inline-flex ml-1 ${isActive ? 'text-indigo-400' : 'text-slate-600'}`}>
        {isActive && state.sort.direction === 'asc' ? '↑' : isActive ? '↓' : '↕'}
      </span>
    );
  };

  if (sortedTasks.length === 0) {
    return (
      <EmptyState
        title="No tasks found"
        description="No tasks match your current filters. Try adjusting or clearing them."
        icon="filter"
        action={{
          label: 'Clear filters',
          onClick: () => dispatch({ type: 'CLEAR_FILTERS' }),
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-800/20 rounded-2xl overflow-hidden border border-slate-700/30">
      {/* Table Header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-700/30 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <button onClick={() => toggleSort('title')} className="text-left hover:text-slate-200 transition-colors flex items-center">
          Task <SortIcon field="title" />
        </button>
        <span>Assignee</span>
        <button onClick={() => toggleSort('priority')} className="text-left hover:text-slate-200 transition-colors flex items-center">
          Priority <SortIcon field="priority" />
        </button>
        <button onClick={() => toggleSort('dueDate')} className="text-left hover:text-slate-200 transition-colors flex items-center">
          Due Date <SortIcon field="dueDate" />
        </button>
        <span>Status</span>
        <span className="text-center">Viewers</span>
      </div>

      {/* Virtual Scrolling Container */}
      <div
        ref={(el) => { containerRef.current = el; }}
        className="flex-1 overflow-y-auto"
        onScroll={onScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleTasks.map((task) => {
              const due = formatDueDate(task.dueDate);
              const collabs = usersByTask.get(task.id) || [];
              return (
                <div
                  key={task.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-2 px-4 items-center border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors"
                  style={{ height: ROW_HEIGHT }}
                >
                  <div className="text-sm text-slate-200 truncate">{task.title}</div>
                  <div className="flex items-center gap-2">
                    <Avatar initials={task.assignee.initials} color={task.assignee.color} size="sm" />
                    <span className="text-xs text-slate-400 truncate">{task.assignee.name.split(' ')[0]}</span>
                  </div>
                  <div><PriorityBadge priority={task.priority} /></div>
                  <div className={`text-xs font-medium ${
                    due.isDueToday ? 'text-amber-400' :
                    due.isOverdue ? 'text-red-400' :
                    'text-slate-400'
                  }`}>
                    {due.text}
                  </div>
                  <div>
                    <Dropdown
                      options={STATUS_OPTIONS}
                      value={task.status}
                      onChange={(val) => dispatch({
                        type: 'UPDATE_TASK_STATUS',
                        payload: { taskId: task.id, newStatus: val as Status },
                      })}
                      className="w-[130px]"
                    />
                  </div>
                  <div className="flex justify-center">
                    {collabs.length > 0 && <AvatarStack users={collabs} maxShow={2} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-slate-800/50 border-t border-slate-700/30 text-xs text-slate-500">
        Showing {sortedTasks.length} tasks
      </div>
    </div>
  );
}
