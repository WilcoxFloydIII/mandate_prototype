import { Drawer } from '../../components/shared/Drawer';
import { useAttendanceStore } from '../../store/useAttendanceStore';
import { calculateCourseStats, type SessionStatus } from '../../data/mockData';
import { StatusPill, type Status } from '../../components/shared/StatusPill';
import type { CourseUnit, PresenceMethod, User } from '../../types';

const METHOD_LABEL: Record<PresenceMethod, string> = {
  qr_chain_verified: 'Automatic',
  manual_student: 'Manual',
  lecturer_marked: 'Forwarded to lecturer',
  degraded_manual_entry: 'Roll call (system unavailable)',
  admin_corrected: 'Corrected by admin',
};

function pillStatus(status: SessionStatus): Status | null {
  if (status === 'verified') return 'verified';
  if (status === 'disputed') return 'disputed';
  if (status === 'rejected') return 'rejected';
  if (status === 'unverified') return 'unverified';
  return null; // 'absent' has no attendance record, so no method/StatusPill mapping applies
}

export function CourseDetailDrawer({ open, onClose, student, course }: { open: boolean; onClose: () => void; student: User; course: CourseUnit | null }) {
  const records = useAttendanceStore((s) => s.records);

  // calculateCourseStats is the single source of truth: it derives totalClasses from
  // every completed/active class instance for the course (not just from records that
  // happen to exist), so the metric cards above and the session list below are always
  // 1:1 — the list length always equals totalClasses.
  const stats = course ? calculateCourseStats(student.id, course.id, records) : null;

  return (
    <Drawer open={open} onClose={onClose} title={course?.code} subtitle={course?.title}>
      {course && stats && (
        <>
          <div className="mb-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-zinc-800">
              <p className="text-lg font-semibold text-zinc-900 dark:text-white">{stats.attendancePct}%</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Current</p>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-zinc-800">
              <p className="text-lg font-semibold text-zinc-900 dark:text-white">{stats.thresholdPct}%</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Threshold</p>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-zinc-800">
              <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                {stats.attendedClasses}/{stats.totalClasses}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Attended</p>
            </div>
          </div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Session history</p>
          <ul className="space-y-2">
            {stats.sessions.map(({ instance, record, status }) => {
              const pill = pillStatus(status);
              return (
                <li key={instance.id} className="flex items-center justify-between gap-2 rounded-xl bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                      {new Date(instance.classStartAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {instance.venueName}
                      {record && ` · ${METHOD_LABEL[record.presenceMethod]}`}
                    </p>
                  </div>
                  {pill ? (
                    <StatusPill status={pill} />
                  ) : (
                    <span className="shrink-0 rounded-full border border-rose-200 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:border-rose-500/40 dark:text-rose-400">
                      Absent
                    </span>
                  )}
                </li>
              );
            })}
            {stats.sessions.length === 0 && <p className="text-sm text-zinc-500 dark:text-zinc-400">No sessions recorded yet.</p>}
          </ul>
        </>
      )}
    </Drawer>
  );
}
