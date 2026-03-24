export function getDaysUntilDue(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDueDate(dueDate: string): { text: string; isOverdue: boolean; isSeverelyOverdue: boolean; isDueToday: boolean } {
  const days = getDaysUntilDue(dueDate);

  if (days === 0) {
    return { text: 'Due Today', isOverdue: false, isSeverelyOverdue: false, isDueToday: true };
  }

  if (days < -7) {
    return { text: `${Math.abs(days)} days overdue`, isOverdue: true, isSeverelyOverdue: true, isDueToday: false };
  }

  if (days < 0) {
    return { text: formatDateShort(dueDate), isOverdue: true, isSeverelyOverdue: false, isDueToday: false };
  }

  return { text: formatDateShort(dueDate), isOverdue: false, isSeverelyOverdue: false, isDueToday: false };
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getMonthDates(year: number, month: number): Date[] {
  const days = getDaysInMonth(year, month);
  const dates: Date[] = [];
  for (let d = 1; d <= days; d++) {
    dates.push(new Date(year, month, d));
  }
  return dates;
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}
