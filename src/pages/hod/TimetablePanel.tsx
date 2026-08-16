import { useMemo, useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { useScheduleStore } from '../../store/useScheduleStore';
import { getUserById, getDepartmentById, getCourseUnitsForDepartment, getCourseUnitById, getLecturersForDepartment } from '../../data/mockData';
import { TimetableGrid, type TimetableBlock } from '../../components/shared/TimetableGrid';
import { ScheduleFormOverlay } from '../../components/shared/ScheduleFormOverlay';

const REASON_MIN = 20;
const WEEKDAY_LABELS: Record<number, string> = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri' };

export function TimetablePanel() {
  const userId = useSessionStore((s) => s.currentUserId);
  const hod = getUserById(userId)!;
  const department = getDepartmentById(hod.departmentId!)!;
  const departmentCourses = getCourseUnitsForDepartment(department.id);
  const departmentLecturers = getLecturersForDepartment(department.id);
  const courseIds = useMemo(() => new Set(departmentCourses.map((c) => c.id)), [departmentCourses]);

  const submissions = useScheduleStore((s) => s.submissions);
  const approve = useScheduleStore((s) => s.approve);
  const reject = useScheduleStore((s) => s.reject);
  const submit = useScheduleStore((s) => s.submit);

  const deptSubmissions = useMemo(() => submissions.filter((s) => courseIds.has(s.courseUnitId)), [submissions, courseIds]);
  const approved = deptSubmissions.filter((s) => s.approvalStatus === 'approved');
  const pending = deptSubmissions.filter((s) => s.approvalStatus === 'pending');
  const rejected = deptSubmissions
    .filter((s) => s.approvalStatus === 'rejected')
    .sort((a, b) => new Date(b.approvedAt ?? b.submittedAt).getTime() - new Date(a.approvedAt ?? a.submittedAt).getTime())
    .slice(0, 5);

  const blocks: TimetableBlock[] = approved.map((s) => {
    const course = getCourseUnitById(s.courseUnitId)!;
    const lecturer = getUserById(s.lecturerId);
    return {
      id: s.id,
      dayOfWeek: s.dayOfWeek,
      startHour: s.startHour,
      endHour: s.endHour,
      title: course.code,
      subtitle: `${lecturer?.fullName.replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.)\s+/, '') ?? ''} · ${s.venueName}`,
    };
  });

  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  function handleReject() {
    if (!rejectTarget || reason.trim().length < REASON_MIN) return;
    reject(rejectTarget, hod.id, reason.trim());
    setRejectTarget(null);
    setReason('');
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{department.name}</p>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Timetable Management</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Weekly grid plus the department's schedule-approval queue.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          Propose class
        </button>
      </div>

      <TimetableGrid blocks={blocks} />

      <div className="mt-8">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
          Awaiting approval
          {pending.length > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">{pending.length}</span>
          )}
        </p>
        {pending.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-8 text-center text-sm text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            No pending schedule submissions.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <ul className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {pending.map((s) => {
                const course = getCourseUnitById(s.courseUnitId)!;
                const lecturer = getUserById(s.lecturerId);
                return (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                        {course.code} · {course.title}
                      </p>
                      <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                        {lecturer?.fullName} · {s.dayOfWeek.map((d) => WEEKDAY_LABELS[d]).join('/')} · {String(s.startHour).padStart(2, '0')}:00–
                        {String(s.endHour).padStart(2, '0')}:00 · {s.venueName}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => approve(s.id, hod.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectTarget(s.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {rejected.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">Recently rejected</p>
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <ul className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {rejected.map((s) => {
                const course = getCourseUnitById(s.courseUnitId)!;
                return (
                  <li key={s.id} className="px-5 py-3.5">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{course.code}</p>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{s.rejectionReason}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-zinc-900">
            <p className="mb-1 text-sm font-semibold text-zinc-900 dark:text-white">Reject schedule submission</p>
            <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">A documented reason is required — minimum {REASON_MIN} characters.</p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Explain why this submission is being rejected…"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-600"
            />
            <p className={`mt-1 text-right text-xs ${reason.trim().length >= REASON_MIN ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-600'}`}>
              {reason.trim().length}/{REASON_MIN}
            </p>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setRejectTarget(null);
                  setReason('');
                }}
                className="rounded-xl border border-zinc-200 px-3.5 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={reason.trim().length < REASON_MIN}
                className="rounded-xl bg-rose-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Confirm rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <ScheduleFormOverlay
          courses={departmentCourses}
          lecturers={departmentLecturers}
          submitLabel="Submit for approval"
          helperText="Submitted as pending — routes through the usual department approval trail, same as a lecturer submission."
          onClose={() => setShowAddForm(false)}
          onSubmit={(input) => {
            submit(input, hod.id, false);
            setShowAddForm(false);
          }}
        />
      )}
    </div>
  );
}
