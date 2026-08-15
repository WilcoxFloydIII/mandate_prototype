import { useMemo, useState } from 'react';
import { ClipboardEdit } from 'lucide-react';
import { useAttendanceStore } from '../../store/useAttendanceStore';
import { useSessionStore } from '../../store/useSessionStore';
import { getUserById, getClassInstanceById, getCourseUnitById, courseUnits } from '../../data/mockData';
import { StatusPill } from '../../components/shared/StatusPill';
import { CorrectionModal } from './CorrectionModal';
import type { AttendanceRecord } from '../../types';

export function CorrectionsPanel() {
  const hodId = useSessionStore((s) => s.currentUserId);
  const hod = getUserById(hodId)!;
  const records = useAttendanceStore((s) => s.records);
  const corrections = useAttendanceStore((s) => s.corrections);
  const [active, setActive] = useState<AttendanceRecord | null>(null);

  const deptCourseIds = useMemo(() => new Set(courseUnits.filter((c) => c.departmentId === hod.departmentId).map((c) => c.id)), [hod.departmentId]);

  const needsReview = useMemo(
    () =>
      records
        .filter((r) => {
          const instance = getClassInstanceById(r.classInstanceId);
          return instance && deptCourseIds.has(instance.courseUnitId) && (r.verificationStatus === 'unverified' || r.verificationStatus === 'disputed');
        })
        .sort((a, b) => new Date(b.eventTimestamp).getTime() - new Date(a.eventTimestamp).getTime()),
    [records, deptCourseIds]
  );

  const originalRecordIds = new Set(records.filter((r) => {
    const instance = getClassInstanceById(r.classInstanceId);
    return instance && deptCourseIds.has(instance.courseUnitId);
  }).map((r) => r.id));

  const deptCorrections = corrections.filter((c) => c.correctedBy === hod.id || (c.originalRecordId && originalRecordIds.has(c.originalRecordId))).slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Corrections</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Review unverified and disputed records, or override with a documented reason.</p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">Needs review ({needsReview.length})</p>
        </div>
        <ul className="divide-y divide-zinc-50 dark:divide-zinc-800">
          {needsReview.map((r) => {
            const student = getUserById(r.userId);
            const instance = getClassInstanceById(r.classInstanceId);
            const course = instance ? getCourseUnitById(instance.courseUnitId) : undefined;
            if (!student || !instance || !course) return null;
            return (
              <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{student.fullName}</p>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {course.code} · {new Date(instance.classStartAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusPill status={r.verificationStatus === 'disputed' ? 'disputed' : 'unverified'} />
                  <button
                    onClick={() => setActive(r)}
                    className="flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    <ClipboardEdit className="h-3.5 w-3.5" /> Review
                  </button>
                </div>
              </li>
            );
          })}
          {needsReview.length === 0 && <li className="px-5 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">Nothing needs review right now.</li>}
        </ul>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">Correction history</p>
        </div>
        <ul className="divide-y divide-zinc-50 dark:divide-zinc-800">
          {deptCorrections.map((c) => {
            const by = getUserById(c.correctedBy);
            return (
              <li key={c.id} className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">{c.correctionType.replace(/_/g, ' → ')}</p>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">{new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {by?.fullName} · {c.documentedReason}
                </p>
              </li>
            );
          })}
          {deptCorrections.length === 0 && <li className="px-5 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">No corrections logged yet.</li>}
        </ul>
      </div>

      <CorrectionModal record={active} hod={hod} onClose={() => setActive(null)} />
    </div>
  );
}
