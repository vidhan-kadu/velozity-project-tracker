import React, { createContext, useContext, useReducer, useMemo, useCallback, ReactNode } from 'react';
import { Task, FilterState, ViewType, SortState, SimulatedUser, Status, PRIORITY_ORDER } from '../types';
import { generateTasks, SIMULATED_USERS } from '../data/seedData';

/* ─── State ─── */
export interface AppState {
  tasks: Task[];
  filters: FilterState;
  activeView: ViewType;
  sort: SortState;
  simulatedUsers: SimulatedUser[];
}

const initialFilters: FilterState = {
  statuses: [],
  priorities: [],
  assignees: [],
  dueDateFrom: '',
  dueDateTo: '',
};

function createInitialState(): AppState {
  return {
    tasks: generateTasks(500),
    filters: initialFilters,
    activeView: 'kanban',
    sort: { field: 'dueDate', direction: 'asc' },
    simulatedUsers: SIMULATED_USERS.map(u => ({ ...u })),
  };
}

/* ─── Actions ─── */
type Action =
  | { type: 'UPDATE_TASK_STATUS'; payload: { taskId: string; newStatus: Status } }
  | { type: 'SET_FILTERS'; payload: Partial<FilterState> }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_VIEW'; payload: ViewType }
  | { type: 'SET_SORT'; payload: SortState }
  | { type: 'UPDATE_SIMULATED_USERS'; payload: SimulatedUser[] }
  | { type: 'REORDER_TASK'; payload: { taskId: string; newStatus: Status; targetIndex: number } };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'UPDATE_TASK_STATUS':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.taskId
            ? { ...t, status: action.payload.newStatus }
            : t
        ),
      };
    case 'REORDER_TASK': {
      const { taskId, newStatus, targetIndex } = action.payload;
      const updatedTasks = state.tasks.map(t =>
        t.id === taskId ? { ...t, status: newStatus } : t
      );
      // Move task to the correct index within its new status column
      const task = updatedTasks.find(t => t.id === taskId)!;
      const otherTasks = updatedTasks.filter(t => t.id !== taskId);
      const columnTasks = otherTasks.filter(t => t.status === newStatus);
      const nonColumnTasks = otherTasks.filter(t => t.status !== newStatus);
      const clampedIndex = Math.min(targetIndex, columnTasks.length);
      columnTasks.splice(clampedIndex, 0, task);
      return { ...state, tasks: [...nonColumnTasks, ...columnTasks] };
    }
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    case 'CLEAR_FILTERS':
      return { ...state, filters: initialFilters };
    case 'SET_VIEW':
      return { ...state, activeView: action.payload };
    case 'SET_SORT':
      return { ...state, sort: action.payload };
    case 'UPDATE_SIMULATED_USERS':
      return { ...state, simulatedUsers: action.payload };
    default:
      return state;
  }
}

/* ─── Context ─── */
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  filteredTasks: Task[];
  tasksByStatus: Record<Status, Task[]>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined as any, createInitialState);

  const filteredTasks = useMemo(() => {
    let result = state.tasks;
    const f = state.filters;

    if (f.statuses.length > 0) {
      result = result.filter(t => f.statuses.includes(t.status));
    }
    if (f.priorities.length > 0) {
      result = result.filter(t => f.priorities.includes(t.priority));
    }
    if (f.assignees.length > 0) {
      result = result.filter(t => f.assignees.includes(t.assignee.id));
    }
    if (f.dueDateFrom) {
      result = result.filter(t => t.dueDate >= f.dueDateFrom);
    }
    if (f.dueDateTo) {
      result = result.filter(t => t.dueDate <= f.dueDateTo);
    }

    return result;
  }, [state.tasks, state.filters]);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<Status, Task[]> = {
      'todo': [],
      'in-progress': [],
      'in-review': [],
      'done': [],
    };
    filteredTasks.forEach(t => {
      grouped[t.status].push(t);
    });
    return grouped;
  }, [filteredTasks]);

  const value = useMemo(() => ({
    state,
    dispatch,
    filteredTasks,
    tasksByStatus,
  }), [state, dispatch, filteredTasks, tasksByStatus]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

export function useSortedTasks(tasks: Task[], sort: SortState): Task[] {
  return useMemo(() => {
    const sorted = [...tasks];
    const dir = sort.direction === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      switch (sort.field) {
        case 'title':
          return dir * a.title.localeCompare(b.title);
        case 'priority':
          return dir * (PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
        case 'dueDate':
          return dir * (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        default:
          return 0;
      }
    });
    return sorted;
  }, [tasks, sort]);
}
