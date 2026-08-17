import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Bell, CalendarClock, ShieldCheck } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { getUserById, getNotificationsForUser } from '../../data/mockData';
import type { NotificationCategory } from '../../types';

const CATEGORY_ICON: Record<NotificationCategory, typeof Bell> = {
  attendance: AlertTriangle,
  timetable: CalendarClock,
  correction: ShieldCheck,
  system: Bell,
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function NotificationsPanel() {
  const navigate = useNavigate();
  const userId = useSessionStore((s) => s.currentUserId);
  const student = getUserById(userId)!;
  const items = getNotificationsForUser(student.id);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  return (
    <div className="px-4 py-4">
      <button
        type="button"
        onClick={() => navigate('/student/home')}
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 dark:text-zinc-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Home
      </button>
      <h1 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-white">Notifications</h1>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-zinc-200 bg-white px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          You're all caught up.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => {
            const Icon = CATEGORY_ICON[item.category];
            const isRead = item.read || readIds.has(item.id);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setReadIds((prev) => new Set(prev).add(item.id))}
                  className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left shadow-sm transition-colors ${
                    isRead ? 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900' : 'border-zinc-900/10 bg-zinc-50 dark:border-white/10 dark:bg-zinc-800/60'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      isRead ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500' : 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`truncate text-sm font-semibold ${isRead ? 'text-zinc-600 dark:text-zinc-300' : 'text-zinc-900 dark:text-white'}`}>{item.title}</p>
                      {!isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-zinc-900 dark:bg-white" />}
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{item.body}</p>
                    <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-600">{timeAgo(item.createdAt)}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
