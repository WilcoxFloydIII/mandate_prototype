import { Bell } from 'lucide-react';
import { adminActivityLog, getUserById, getClassInstanceById, getCourseUnitById, courseUnits } from '../../data/mockData';
import { useSessionStore } from '../../store/useSessionStore';

export function AlertsPanel() {
  const hodId = useSessionStore((s) => s.currentUserId);
  const hod = getUserById(hodId)!;
  const deptCourseIds = new Set(courseUnits.filter((c) => c.departmentId === hod.departmentId).map((c) => c.id));

  const alerts = adminActivityLog.filter((log) => {
    if (log.actionType !== 'lecturer_absent') return false;
    const courseUnitId = (log.metadata as { courseUnitId?: string }).courseUnitId;
    return courseUnitId ? deptCourseIds.has(courseUnitId) : false;
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Alerts</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Lecturer-absence flags for your department, newest first.</p>
      <div className="mt-5 rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <ul className="divide-y divide-zinc-50 dark:divide-zinc-800">
          {alerts.map((log) => {
            const meta = log.metadata as { lecturerId?: string; courseUnitId?: string };
            const lecturer = meta.lecturerId ? getUserById(meta.lecturerId) : null;
            const course = meta.courseUnitId ? getCourseUnitById(meta.courseUnitId) : null;
            const instance = log.targetId ? getClassInstanceById(log.targetId) : null;
            return (
              <li key={log.id} className="flex items-start gap-3 px-5 py-3.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                  <Bell className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-zinc-900 dark:text-white">
                    <span className="font-medium">{lecturer?.fullName}</span> — no attendance record for {course?.code}
                    {instance && `, ${new Date(instance.classStartAt).toLocaleString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' })}`}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">{new Date(log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                </div>
              </li>
            );
          })}
          {alerts.length === 0 && <li className="px-5 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">No active alerts.</li>}
        </ul>
      </div>
    </div>
  );
}
