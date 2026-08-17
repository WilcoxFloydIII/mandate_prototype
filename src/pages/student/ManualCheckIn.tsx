import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { useAttendanceStore } from '../../store/useAttendanceStore';
import { getUserById, getClassInstanceById, getCourseUnitById, getTodayClassInstancesForStudent } from '../../data/mockData';
import { verificationStatusLabel } from '../../lib/formatters';

export function ManualCheckIn() {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId?: string }>();
  const userId = useSessionStore((s) => s.currentUserId);
  const student = getUserById(userId)!;
  const addRecord = useAttendanceStore((s) => s.addRecord);
  const [justSubmitted, setJustSubmitted] = useState(false);

  const instance = useMemo(() => {
    if (classId) return getClassInstanceById(classId);
    const today = getTodayClassInstancesForStudent(student.id);
    return today.find((ci) => ci.status === 'active' || ci.status === 'scheduled') ?? today[0];
  }, [classId, student.id]);

  const course = instance ? getCourseUnitById(instance.courseUnitId) : undefined;

  const existingRecord = useAttendanceStore((s) => (instance ? s.records.find((r) => r.classInstanceId === instance.id && r.userId === student.id) : undefined));
  const submitted = justSubmitted || Boolean(existingRecord);

  function handleSubmit() {
    if (!instance || existingRecord) return;
    addRecord({
      id: `ar-manual-${crypto.randomUUID()}`,
      clientEventId: `ce-manual-${crypto.randomUUID()}`,
      classInstanceId: instance.id,
      userId: student.id,
      userRoleAtEvent: 'student',
      institutionId: student.institutionId,
      presenceMethod: 'manual_student',
      verificationStatus: 'unverified',
      scanDepth: null,
      scannedViaUserId: null,
      faceLivenessConfirmed: false,
      eventTimestamp: new Date().toISOString(),
    });
    setJustSubmitted(true);
  }

  if (!instance || !course) {
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
        <p className="rounded-2xl border border-zinc-200 bg-white px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          No open class window right now.
        </p>
      </div>
    );
  }

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

      {!submitted ? (
        <div className="flex flex-col items-center px-2 py-6 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            <AlertTriangle className="h-7 w-7" />
          </span>
          <h1 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-white">Mark My Attendance</h1>
          <p className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {course.code} · {course.title}
          </p>
          <p className="mb-5 text-xs text-zinc-500 dark:text-zinc-400">{instance.venueName}</p>
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-left text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
            This generates an <strong>Unverified</strong> record, routed to your lecturer for confirmation — use only if the QR/Face ID check-in isn't working.
          </div>
          <button type="button" onClick={handleSubmit} className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900">
            Mark My Attendance
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center px-2 py-10 text-center">
          <CheckCircle2 className="mb-4 h-14 w-14 text-amber-500" />
          <h1 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-white">
            {existingRecord ? `Already recorded — ${verificationStatusLabel(existingRecord.verificationStatus)}` : 'Submitted — Unverified'}
          </h1>
          <p className="mb-6 max-w-[240px] text-sm text-zinc-500 dark:text-zinc-400">
            {course.code} is recorded as {existingRecord ? verificationStatusLabel(existingRecord.verificationStatus) : 'Unverified'} and routed to your lecturer for
            confirmation.
          </p>
          <button
            type="button"
            onClick={() => navigate('/student/home')}
            className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
          >
            Back to Home
          </button>
        </div>
      )}
    </div>
  );
}
