import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, ChevronRight, Users2 } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import {
  getUserById,
  getCourseUnitsForLecturer,
  getCourseUnitById,
  getCourseComplianceSnapshot,
  getEnrolledStudents,
  getThresholdSummariesForStudent,
  getClassInstancesForCourse,
  getAttendanceRecordsForClassInstance,
  getDepartmentById,
} from '../../data/mockData';
import { Drawer } from '../../components/shared/Drawer';
import { StatusPill, type Status } from '../../components/shared/StatusPill';
import type { User, AttendanceThresholdSummary, ClassInstance, AttendanceRecord, PresenceMethod } from '../../types';

const METHOD_LABEL: Record<PresenceMethod, string> = {
  qr_chain_verified: 'Automatic (QR + Face)',
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

export function CoursesPanel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get('id');
  const userId = useSessionStore((s) => s.currentUserId);
  const lecturer = getUserById(userId)!;
  const courses = getCourseUnitsForLecturer(lecturer.id);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

  const selectedCourse = selectedId ? getCourseUnitById(selectedId) : undefined;

  if (selectedId && selectedCourse) {
    return (
      <CourseRosterView
        course={selectedCourse}
        onBack={() => navigate('/lecturer/courses')}
        selectedStudent={selectedStudent}
        onSelectStudent={setSelectedStudent}
        onCloseStudent={() => setSelectedStudent(null)}
      />
    );
  }

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
      <h1 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-white">My Courses</h1>

      {courses.length === 0 ? (
        <p className="rounded-2xl border border-zinc-200 bg-white px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          No courses assigned this semester.
        </p>
      ) : (
        <ul className="space-y-3">
          {courses.map((course) => {
            const snapshot = getCourseComplianceSnapshot(course.id);
            const coLecturers = course.lecturerIds
              .filter((id) => id !== lecturer.id)
              .map((id) => getUserById(id))
              .filter((u): u is NonNullable<typeof u> => Boolean(u));
            return (
              <li key={course.id}>
                <Link
                  to={`/lecturer/courses?id=${course.id}`}
                  className="block rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/70"
                  aria-label={`View ${course.code} roster`}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{course.code}</p>
                      <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{course.title}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        snapshot.avgAttendancePct >= 75
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                      }`}
                    >
                      {snapshot.avgAttendancePct}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>
                      {snapshot.enrolledCount} enrolled · {snapshot.atRiskCount} at risk
                    </span>
                    {coLecturers.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Users2 className="h-3 w-3" />
                        with {coLecturers.map((u) => u.fullName.split(' ').slice(-1)[0]).join(', ')}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function CourseRosterView({
  course,
  onBack,
  selectedStudent,
  onSelectStudent,
  onCloseStudent,
}: {
  course: NonNullable<ReturnType<typeof getCourseUnitById>>;
  onBack: () => void;
  selectedStudent: User | null;
  onSelectStudent: (student: User) => void;
  onCloseStudent: () => void;
}) {
  const roster = useMemo(() => getEnrolledStudents(course.id), [course.id]);

  const rosterWithSummary = useMemo(
    () =>
      roster.map((student) => {
        const summary = getThresholdSummariesForStudent(student.id).find((s) => s.courseUnitId === course.id);
        return { student, summary };
      }),
    [roster, course.id]
  );

  return (
    <div className="px-4 py-4">
      <button
        type="button"
        onClick={onBack}
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 dark:text-zinc-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Courses
      </button>

      <div className="mb-4">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">{course.code}</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{course.title}</p>
      </div>

      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
        Enrolled students ({rosterWithSummary.length})
      </p>

      {rosterWithSummary.length === 0 ? (
        <p className="rounded-2xl border border-zinc-200 bg-white px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          No students enrolled yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {rosterWithSummary.map(({ student, summary }) => {
            const isAtRisk = summary ? !summary.isEligible || summary.attendancePct < summary.thresholdPct : false;
            return (
              <li key={student.id}>
                <button
                  type="button"
                  onClick={() => onSelectStudent(student)}
                  aria-label={`View ${student.fullName} attendance breakdown for ${course.code}`}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-left shadow-sm transition-colors hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/70"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: student.avatarColor }}
                    >
                      {student.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{student.fullName}</p>
                      <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{student.institutionalId}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {isAtRisk && (
                      <span className="flex items-center gap-1 rounded-full border border-amber-300 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:border-amber-500/50 dark:text-amber-400">
                        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                        At-Risk
                      </span>
                    )}
                    <span className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-white">
                      {summary ? `${summary.attendancePct}%` : '—'}
                    </span>
                    <ChevronRight className="h-4 w-4 text-zinc-300 dark:text-zinc-600" aria-hidden="true" />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <StudentCourseDrawer open={!!selectedStudent} onClose={onCloseStudent} student={selectedStudent} course={course} />
    </div>
  );
}

function StudentCourseDrawer({
  open,
  onClose,
  student,
  course,
}: {
  open: boolean;
  onClose: () => void;
  student: User | null;
  course: NonNullable<ReturnType<typeof getCourseUnitById>>;
}) {
  const summary: AttendanceThresholdSummary | undefined = student
    ? getThresholdSummariesForStudent(student.id).find((s) => s.courseUnitId === course.id)
    : undefined;

  const department = student?.departmentId ? getDepartmentById(student.departmentId) : undefined;

  const sessions = useMemo(() => {
    if (!student) return [];
    const instances = getClassInstancesForCourse(course.id);
    return instances
      .map((instance) => {
        const records = getAttendanceRecordsForClassInstance(instance.id).filter((r) => r.userId === student.id);
        return { instance, record: records[0] as AttendanceRecord | undefined };
      })
      .filter(({ instance }: { instance: ClassInstance }) => instance.status === 'completed' || instance.status === 'active')
      .sort((a, b) => new Date(b.instance.classStartAt).getTime() - new Date(a.instance.classStartAt).getTime());
  }, [student, course.id]);

  const isAtRisk = summary ? !summary.isEligible || summary.attendancePct < summary.thresholdPct : false;

  return (
    <Drawer open={open} onClose={onClose} title={student?.fullName} subtitle={student ? `${student.institutionalId} · ${course.code}` : undefined}>
      {student && (
        <div>
          <div className="rounded-2xl bg-zinc-950 px-4 pb-5 pt-4 text-white">
            <div className="flex items-center gap-3">
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white ring-2 ring-white/10"
                style={{ backgroundColor: student.avatarColor }}
              >
                {student.initials}
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold">{student.fullName}</h2>
                <p className="truncate text-xs text-zinc-400">
                  {student.institutionalId} · {student.level}L{department ? ` · ${department.shortName}` : ''}
                </p>
              </div>
            </div>

            {summary && (
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                <div className="rounded-xl bg-white/5 p-3 text-center">
                  <p className="text-lg font-semibold tabular-nums">{summary.attendancePct}%</p>
                  <p className="mt-0.5 text-[10px] leading-tight text-zinc-400">of {summary.thresholdPct}% threshold</p>
                </div>
                <div className="rounded-xl bg-white/5 p-3 text-center">
                  <p className="text-lg font-semibold tabular-nums">
                    {summary.attendedClasses}/{summary.totalClasses}
                  </p>
                  <p className="mt-0.5 text-[10px] leading-tight text-zinc-400">classes attended</p>
                </div>
                <div className="rounded-xl bg-white/5 p-3 text-center">
                  <p className={`text-lg font-semibold ${isAtRisk ? 'text-amber-400' : 'text-emerald-400'}`}>{isAtRisk ? 'Active' : 'Clear'}</p>
                  <p className="mt-0.5 text-[10px] leading-tight text-zinc-400">at-risk status</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Recent sessions</p>
            <ul className="space-y-2">
              {sessions.map(({ instance, record }) => (
                <li key={instance.id} className="flex items-center justify-between gap-2 rounded-xl bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                      {new Date(instance.classStartAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {instance.venueName} {record && `· ${METHOD_LABEL[record.presenceMethod]}`}
                    </p>
                  </div>
                  {record ? (
                    <StatusPill status={pillStatus(record.verificationStatus)} />
                  ) : (
                    <span className="shrink-0 rounded-full border border-rose-200 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:border-rose-500/40 dark:text-rose-400">
                      Absent
                    </span>
                  )}
                </li>
              ))}
              {sessions.length === 0 && <p className="text-sm text-zinc-500 dark:text-zinc-400">No sessions recorded yet.</p>}
            </ul>
          </div>
        </div>
      )}
    </Drawer>
  );
}
