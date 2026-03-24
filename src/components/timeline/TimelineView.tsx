import React, { useMemo, useRef } from 'react';
import { useAppContext } from '../../store/AppContext';
import { Task, PRIORITY_COLORS } from '../../types';
import { getMonthDates, isSameDay } from '../../utils/dateUtils';

const DAY_WIDTH = 44;
const ROW_HEIGHT = 36;
const HEADER_HEIGHT = 48;
const LABEL_WIDTH = 200;

export function TimelineView() {
  const { filteredTasks } = useAppContext();
  const scrollRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => new Date(), []);
  const dates = useMemo(() => getMonthDates(today.getFullYear(), today.getMonth()), [today]);

  const todayIndex = useMemo(
    () => dates.findIndex(d => isSameDay(d, today)),
    [dates, today]
  );

  // Only show tasks that have a due date overlapping the current month
  const timelineTasks = useMemo(() => {
    const monthStart = dates[0];
    const monthEnd = dates[dates.length - 1];

    return filteredTasks.filter(task => {
      const due = new Date(task.dueDate);
      const start = task.startDate ? new Date(task.startDate) : due;
      return start <= monthEnd && due >= monthStart;
    });
  }, [filteredTasks, dates]);

  const getBarPosition = (task: Task) => {
    const monthStart = dates[0];
    const monthEnd = dates[dates.length - 1];
    const due = new Date(task.dueDate);
    const start = task.startDate ? new Date(task.startDate) : due;

    const effectiveStart = start < monthStart ? monthStart : start;
    const effectiveEnd = due > monthEnd ? monthEnd : due;

    const startDay = Math.max(0, Math.floor((effectiveStart.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)));
    const endDay = Math.min(dates.length - 1, Math.floor((effectiveEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)));

    const isPoint = !task.startDate || startDay === endDay;

    return {
      left: startDay * DAY_WIDTH,
      width: isPoint ? DAY_WIDTH : (endDay - startDay + 1) * DAY_WIDTH,
      isPoint,
    };
  };

  const gridWidth = dates.length * DAY_WIDTH;

  return (
    <div className="flex flex-col h-full bg-slate-800/20 rounded-2xl overflow-hidden border border-slate-700/30">
      {/* Scrollable container */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <div className="flex" style={{ minWidth: LABEL_WIDTH + gridWidth }}>
          {/* Left: Task name labels (sticky) */}
          <div className="sticky left-0 z-20 bg-slate-900/95 backdrop-blur-sm border-r border-slate-700/30 shrink-0" style={{ width: LABEL_WIDTH }}>
            {/* Header spacer */}
            <div className="flex items-center px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/30"
              style={{ height: HEADER_HEIGHT }}>
              Task Name
            </div>
            {/* Task name rows */}
            {timelineTasks.map(task => (
              <div
                key={task.id}
                className="flex items-center px-3 border-b border-slate-700/10 hover:bg-slate-700/20 transition-colors"
                style={{ height: ROW_HEIGHT }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PRIORITY_COLORS[task.priority] }} />
                  <span className="text-[11px] text-slate-300 truncate">{task.title}</span>
                </div>
              </div>
            ))}
            {timelineTasks.length === 0 && (
              <div className="flex items-center justify-center py-16 text-slate-500 text-xs">
                No tasks this month
              </div>
            )}
          </div>

          {/* Right: Timeline grid */}
          <div className="flex-1">
            <div style={{ width: gridWidth }}>
              {/* Day headers */}
              <div className="flex sticky top-0 z-10 bg-slate-800/90 backdrop-blur-sm border-b border-slate-700/30"
                style={{ height: HEADER_HEIGHT }}>
                {dates.map((date, i) => {
                  const isToday = isSameDay(date, today);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  return (
                    <div
                      key={i}
                      className={`flex flex-col items-center justify-center shrink-0 text-[10px] ${
                        isToday
                          ? 'bg-indigo-500/20 text-indigo-300 font-bold'
                          : isWeekend
                          ? 'text-slate-600'
                          : 'text-slate-400'
                      }`}
                      style={{ width: DAY_WIDTH }}
                    >
                      <span className="uppercase">{date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}</span>
                      <span className={`text-sm font-semibold ${isToday ? 'text-indigo-300' : ''}`}>{date.getDate()}</span>
                    </div>
                  );
                })}
              </div>

              {/* Grid + Tasks area */}
              <div className="relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex pointer-events-none">
                  {dates.map((date, i) => {
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    return (
                      <div
                        key={i}
                        className={`shrink-0 border-r ${
                          isWeekend ? 'border-slate-700/30 bg-slate-800/20' : 'border-slate-700/10'
                        }`}
                        style={{ width: DAY_WIDTH, height: timelineTasks.length * ROW_HEIGHT || 200 }}
                      />
                    );
                  })}
                </div>

                {/* Today marker */}
                {todayIndex >= 0 && (
                  <div
                    className="absolute top-0 w-0.5 bg-red-500 z-10 pointer-events-none"
                    style={{
                      left: todayIndex * DAY_WIDTH + DAY_WIDTH / 2,
                      height: timelineTasks.length * ROW_HEIGHT || 200,
                    }}
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-500 border-2 border-slate-900" />
                  </div>
                )}

                {/* Task bars */}
                {timelineTasks.map((task) => {
                  const pos = getBarPosition(task);
                  const barColor = PRIORITY_COLORS[task.priority];

                  return (
                    <div
                      key={task.id}
                      className="relative border-b border-slate-700/10"
                      style={{ height: ROW_HEIGHT }}
                    >
                      {pos.isPoint ? (
                        /* Single-day marker — diamond shape */
                        <div
                          className="absolute flex items-center justify-center"
                          style={{
                            left: pos.left + DAY_WIDTH / 2 - 6,
                            top: ROW_HEIGHT / 2 - 6,
                            width: 12,
                            height: 12,
                          }}
                        >
                          <div
                            className="w-3 h-3 rotate-45 rounded-[2px] shadow-sm"
                            style={{ backgroundColor: barColor }}
                          />
                        </div>
                      ) : (
                        /* Duration bar */
                        <div
                          className="absolute rounded-md overflow-hidden transition-all hover:brightness-125 cursor-default"
                          style={{
                            left: pos.left + 2,
                            width: Math.max(pos.width - 4, 8),
                            top: 6,
                            height: ROW_HEIGHT - 12,
                            backgroundColor: barColor + 'bb',
                            borderLeft: `3px solid ${barColor}`,
                          }}
                          title={`${task.title}\n${task.startDate || task.dueDate} → ${task.dueDate}`}
                        >
                          {pos.width > DAY_WIDTH * 2.5 && (
                            <div className="flex items-center h-full px-2">
                              <span className="text-[10px] font-medium text-white truncate">
                                {task.title}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-slate-800/50 border-t border-slate-700/30 flex items-center justify-between text-xs text-slate-500 shrink-0">
        <span>{today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rotate-45 rounded-[1px] bg-slate-400" />
            <span>Single day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-2 rounded-sm bg-slate-400" />
            <span>Duration</span>
          </div>
          <span>·</span>
          <span>{timelineTasks.length} tasks in view</span>
        </div>
      </div>
    </div>
  );
}
