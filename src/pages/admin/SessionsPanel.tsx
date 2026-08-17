import { useState } from 'react';
import { AlertTriangle, CalendarRange, Lock, ShieldCheck } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { useAttendanceStore } from '../../store/useAttendanceStore';
import { academicSession, currentSemester, getUserById, getInstitutionSnapshot } from '../../data/mockData';
import { KPICard } from '../../components/shared/KPICard';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function SessionsPanel() {
  const userId = useSessionStore((s) => s.currentUserId);
  const admin = getUserById(userId)!;
  const snapshot = getInstitutionSnapshot();

  const locked = useAttendanceStore((s) => s.examEligibilityLocked);
  const lockedAt = useAttendanceStore((s) => s.examEligibilityLockedAt);
  const lockedBy = useAttendanceStore((s) => s.examEligibilityLockedBy);
  const lockExamEligibility = useAttendanceStore((s) => s.lockExamEligibility);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const lockedByUser = lockedBy ? getUserById(lockedBy) : undefined;

  function handleConfirmLock() {
    lockExamEligibility(admin.id);
    setConfirmOpen(false);
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Institution Console</p>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Sessions</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Academic session lifecycle and exam eligibility freeze.</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            <CalendarRange className="h-3.5 w-3.5" />
            Academic Session
          </p>
          <p className="text-lg font-semibold text-zinc-900 dark:text-white">{academicSession.name}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {formatDate(academicSession.startDate)} – {formatDate(academicSession.endDate)}
          </p>
          {academicSession.isCurrent && (
            <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              Current
            </span>
          )}
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            <CalendarRange className="h-3.5 w-3.5" />
            Semester
          </p>
          <p className="text-lg font-semibold text-zinc-900 dark:text-white">{currentSemester.name}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {formatDate(currentSemester.startDate)} – {formatDate(currentSemester.endDate)}
          </p>
          {currentSemester.isCurrent && (
            <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              Current
            </span>
          )}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <KPICard label="Classes today" value={snapshot.classesToday} icon={CalendarRange} tone="neutral" />
        <KPICard
          label="Institution attendance"
          value={`${snapshot.avgAttendancePct}%`}
          icon={ShieldCheck}
          tone={snapshot.avgAttendancePct >= 75 ? 'good' : 'warn'}
          hint="75% NUC threshold"
        />
      </div>

      <div
        className={`rounded-2xl border p-6 shadow-sm ${
          locked ? 'border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900' : 'border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10'
        }`}
      >
        <div className="flex items-start gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              locked ? 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
            }`}
          >
            <Lock className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Exam Eligibility Lock</p>
            {locked ? (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                Locked by {lockedByUser?.fullName ?? 'System Administrator'} on {lockedAt ? formatDate(lockedAt) : '—'}. Attendance summaries for {currentSemester.name}{' '}
                are frozen for exam eligibility determination.
              </p>
            ) : (
              <>
                <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                  Freezes every student's attendance threshold summary for {currentSemester.name}, locking in exam eligibility status institution-wide.
                </p>
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-500"
                >
                  <Lock className="h-4 w-4" />
                  Lock Exam Eligibility
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-zinc-900">
            <div className="mb-3 flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">Lock exam eligibility?</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  Locking will freeze all attendance summaries for exam eligibility. <strong>This cannot be undone.</strong>
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-xl border border-zinc-200 px-3.5 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLock}
                className="rounded-xl bg-rose-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-rose-500"
              >
                Lock permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
