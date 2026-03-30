export type Priority = "critical" | "high" | "medium" | "low";
export type Status = "todo" | "in-progress" | "in-review" | "done";

export interface User {
  id: string;
  name: string;
  color: string;
  initials: string;
}

export interface Task {
  id: string;
  title: string;
  assignee: User;
  priority: Priority;
  status: Status;
  startDate: string | null;
  dueDate: string;
}

export interface FilterState {
  statuses: Status[];
  priorities: Priority[];
  assignees: string[];
  dueDateFrom: string;
  dueDateTo: string;
}

export type ViewType = "kanban" | "list" | "timeline";

export type SortField = "title" | "priority" | "dueDate";
export type SortDirection = "asc" | "desc";

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

export interface SimulatedUser {
  id: string;
  name: string;
  color: string;
  initials: string;
  currentTaskId: string | null;
}

export const STATUS_LABELS: Record<Status, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  "in-review": "In Review",
  done: "Done",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

export const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const STATUSES: Status[] = ["todo", "in-progress", "in-review", "done"];
export const PRIORITIES: Priority[] = ["critical", "high", "medium", "low"];
