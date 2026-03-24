import { Task, User, Priority, Status } from '../types';

export const USERS: User[] = [
  { id: 'u1', name: 'Alice Johnson', color: '#6366f1', initials: 'AJ' },
  { id: 'u2', name: 'Bob Smith', color: '#ec4899', initials: 'BS' },
  { id: 'u3', name: 'Carol Davis', color: '#14b8a6', initials: 'CD' },
  { id: 'u4', name: 'Dan Wilson', color: '#f97316', initials: 'DW' },
  { id: 'u5', name: 'Eva Martinez', color: '#8b5cf6', initials: 'EM' },
  { id: 'u6', name: 'Frank Lee', color: '#06b6d4', initials: 'FL' },
];

export const SIMULATED_USERS = [
  { id: 'sim1', name: 'Grace Kim', color: '#f43f5e', initials: 'GK', currentTaskId: null },
  { id: 'sim2', name: 'Henry Park', color: '#10b981', initials: 'HP', currentTaskId: null },
  { id: 'sim3', name: 'Iris Chen', color: '#a855f7', initials: 'IC', currentTaskId: null },
];

const TASK_PREFIXES = [
  'Implement', 'Design', 'Fix', 'Update', 'Refactor', 'Test', 'Review',
  'Optimize', 'Build', 'Deploy', 'Configure', 'Migrate', 'Document',
  'Research', 'Integrate', 'Debug', 'Analyze', 'Create', 'Setup', 'Improve',
];

const TASK_SUBJECTS = [
  'user authentication flow', 'dashboard analytics', 'payment gateway',
  'notification system', 'search functionality', 'user profile page',
  'API rate limiting', 'database schema', 'CI/CD pipeline',
  'responsive layout', 'dark mode toggle', 'file upload component',
  'error handling middleware', 'caching layer', 'email templates',
  'unit test coverage', 'performance metrics', 'accessibility audit',
  'data export feature', 'onboarding wizard', 'settings panel',
  'role-based permissions', 'audit logging', 'webhook integration',
  'mobile navigation', 'form validation', 'chart components',
  'real-time updates', 'batch processing', 'API documentation',
  'security headers', 'image optimization', 'locale support',
  'keyboard shortcuts', 'drag-and-drop editor', 'version history',
  'comment system', 'tagging system', 'archive feature',
  'bulk actions toolbar', 'status page', 'health check endpoint',
  'SSO integration', 'two-factor auth', 'session management',
  'backup strategy', 'load balancer config', 'monitoring alerts',
  'feature flags', 'A/B testing framework',
];

const PRIORITIES: Priority[] = ['critical', 'high', 'medium', 'low'];
const STATUSES: Status[] = ['todo', 'in-progress', 'in-review', 'done'];

// Pre-compute date strings to avoid creating Date objects in the loop
function generateDateStrings(count: number): { dueDates: string[]; startDates: (string | null)[] } {
  const now = Date.now();
  const DAY = 86400000;
  const pastStart = now - 30 * DAY;
  const range = 75 * DAY; // -30 to +45 days

  const dueDates: string[] = [];
  const startDates: (string | null)[] = [];

  for (let i = 0; i < count; i++) {
    const dueMs = pastStart + Math.random() * range;
    const d = new Date(dueMs);
    const dueStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    dueDates.push(dueStr);

    if (Math.random() > 0.15) {
      const startMs = dueMs - (Math.random() * 14 + 1) * DAY;
      const s = new Date(startMs);
      startDates.push(`${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, '0')}-${String(s.getDate()).padStart(2, '0')}`);
    } else {
      startDates.push(null);
    }
  }

  return { dueDates, startDates };
}

export function generateTasks(count: number = 500): Task[] {
  const { dueDates, startDates } = generateDateStrings(count);
  const tasks: Task[] = new Array(count);
  const prefixLen = TASK_PREFIXES.length;
  const subjectLen = TASK_SUBJECTS.length;
  const userLen = USERS.length;

  for (let i = 0; i < count; i++) {
    tasks[i] = {
      id: `task-${i + 1}`,
      title: `${TASK_PREFIXES[i % prefixLen]} ${TASK_SUBJECTS[i % subjectLen]}`,
      assignee: USERS[i % userLen],
      priority: PRIORITIES[i & 3],
      status: STATUSES[i & 3],
      startDate: startDates[i],
      dueDate: dueDates[i],
    };
  }

  return tasks;
}
