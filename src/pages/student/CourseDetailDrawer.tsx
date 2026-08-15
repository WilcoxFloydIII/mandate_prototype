import { Drawer } from '../../components/shared/Drawer';
import { useAttendanceStore } from '../../store/useAttendanceStore';
import { getClassInstanceById, getThresholdSummariesForStudent } from '../../data/mockData';
import { StatusPill, type Status } from '../../components/shared/StatusPill';
import type { AttendanceRecord, ClassInstance, CourseUnit, PresenceMethod, User } from '../../types';

const METHOD_LABEL: Record<PresenceMethod, string> = {
  qr_chain_verified: 'Automatic',
  manual_student: 'Manual',
  lecturer_marked: 'Forwarded to lecturer',
  degraded_manual_entry: 'Roll call (system unavailable)',
  admin_corrected: 'Corrected by admin',
};

function pillStatus(verificationStatus: string): Status {
  if (verificationStatus === 'verified' || verificationStatus === 'confirmed') return 'verified';
  if (verificationStatus === 'disputed') return 'disputed';
  if (verificationStatus === 'rejected') return 'rejected';
  return 'unverified';
}

export function CourseDetailDrawer({ open, onClose, student, course }: { open: boolean; onClose: () => void; student: User; course: CourseUnit | null }) {
  const records = useAttendanceStore((s) => s.records);
  const summary = course ? getThresholdSummariesForStudent(student.id).find((s) => s.courseUnitId === course.id) : undefined;

  const sessions = course
    ? records
        .filter((r) => r.userId === student.id)
        .map((r) => ({ record: r, instance: getClassInstanceById(r.classInstanceId) }))
        .filter((x): x is { record: AttendanceRecord; instance: ClassInstance } => !!x.instance && x.instance.courseUnitId === course.id)
        .sort((a, b) => new Date(b.record.eventTimestamp).getTime() - new Date(a.record.eventTimestamp).getTime())
    : [];

  return (
    <Drawer open={open} onClose={onClose} title={course?.code} subtitle={course?.title}>
      {course && (
        <>
          {summary && (
            <div className="mb-5 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-zinc-800">
                <p className="text-lg font-semibold text-zinc-900 dark:text-white">{summary.attendancePct}%</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Current</p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-zinc-800">
                <p className="text-lg font-semibold text-zinc-900 dark:text-white">{summary.thresholdPct}%</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Threshold</p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-zinc-800">
                <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                  {summary.attendedClasses}/{summary.totalClasses}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Attended</p>
              </div>
            </div>
          )}
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Session history</p>
          <ul className="space-y-2">
            {sessions.map(({ record, instance }) => (
              <li key={record.id} className="flex items-center justify-between gap-2 rounded-xl bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                    {new Date(instance.classStartAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {instance.venueName} · {METHOD_LABEL[record.presenceMethod]}
                  </p>
                </div>
                <StatusPill status={pillStatus(record.verificationStatus)} />
              </li>
            ))}
            {sessions.length === 0 && <p className="text-sm text-zinc-500 dark:text-zinc-400">No sessions recorded yet.</p>}
          </ul>
        </>
      )}
    </Drawer>
  );
}
