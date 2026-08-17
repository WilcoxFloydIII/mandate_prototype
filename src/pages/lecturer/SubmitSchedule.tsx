import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { useScheduleStore } from '../../store/useScheduleStore';
import { getUserById, getCourseUnitsForLecturer, getCourseUnitById } from '../../data/mockData';
import { ScheduleFormOverlay } from '../../components/shared/ScheduleFormOverlay';

const WEEKDAY_LABELS: Record<number, string> = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri' };

const STATUS_CLASSES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  approved: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  rejected: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
};

export function SubmitSchedule() {
  const navigate = useNavigate();
  const userId = useSessionStore((s) => s.currentUserId);
  const lecturer = getUserById(userId)!;
  const courses = getCourseUnitsForLecturer(lecturer.id);
  const submissions = useScheduleStore((s) => s.submissions);
  const submit = useScheduleStore((s) => s.submit);
  const [showForm, setShowForm] = useState(false);

  const ownSubmissions = useMemo(
    () => submissions.filter((s) => s.submittedBy === lecturer.id).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()),
    [submissions, lecturer.id]
  );

  return (
    <div className="px-4 py-4">
      <button
        type="button"
        onClick={() => navigate('/lecturer/home')}
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 dark:text-zinc-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Home
      </button>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Schedule Submission</h1>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white dark:bg-white dark:text-zinc-900"
        >
          <Plus className="h-3.5 w-3.5" />
          New
        </button>
      </div>

      {ownSubmissions.length === 0 ? (
        <p className="rounded-2xl border border-zinc-200 bg-white px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          No schedule submissions yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {ownSubmissions.map((s) => {
            const course = getCourseUnitById(s.courseUnitId);
            return (
              <li key={s.id} className="rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{course?.code ?? 'Course'}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${STATUS_CLASSES[s.approvalStatus]}`}>
                    {s.approvalStatus}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {s.dayOfWeek.map((d) => WEEKDAY_LABELS[d]).join('/')} · {String(s.startHour).padStart(2, '0')}:00–{String(s.endHour).padStart(2, '0')}:00 · {s.venueName}
                </p>
                {s.approvalStatus === 'rejected' && s.rejectionReason && (
                  <p className="mt-1.5 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11px] text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">{s.rejectionReason}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {showForm && (
        <ScheduleFormOverlay
          courses={courses}
          lecturers={[lecturer]}
          submitLabel="Submit for approval"
          helperText="Routes to your HOD's approval queue — same trail as any other schedule change."
          onClose={() => setShowForm(false)}
          onSubmit={(input) => {
            submit(input, lecturer.id, false);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}
