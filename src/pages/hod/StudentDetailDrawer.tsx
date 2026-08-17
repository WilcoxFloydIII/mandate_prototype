import { useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, CalendarClock, TrendingUp, ChevronRight } from 'lucide-react';
import {
  getUserById,
  getDepartmentById,
  getCourseUnitsForStudent,
  getStudentOverview,
  calculateCourseStats,
  type SessionStatus,
} from '../../data/mockData';
import { KPICard } from '../../components/shared/KPICard';
import { Modal } from '../../components/shared/Modal';
import { presenceMethodLabel, verificationStatusLabel, verificationStatusClasses } from '../../lib/formatters';
import type { CourseUnit } from '../../types';

const SESSION_STATUS_LABEL: Record<SessionStatus, string> = {
  verified: 'Verified',
  unverified: 'Unverified',
  disputed: 'Disputed',
  rejected: 'Rejected',
  absent: 'Absent',
};

const SESSION_STATUS_CLASSES: Record<SessionStatus, string> = {
  verified: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  unverified: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  disputed: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  rejected: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
  absent: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
};

export function StudentDetailDrawer() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const student = studentId ? getUserById(studentId) : undefined;

  const [historyCourse, setHistoryCourse] = useState<CourseUnit | null>(null);

  if (!student || student.role !== 'student') {
    return <Navigate to="/hod/students" replace />;
  }

  const department = student.departmentId ? getDepartmentById(student.departmentId) : undefined;
  const overview = getStudentOverview(student.id);
  const courses = getCourseUnitsForStudent(student.id);
  // Single source of truth: same calculateCourseStats used on the student and lecturer
  // portals, so the HOD's per-course breakdown always agrees with what the student and
  // their lecturer see. This also gives us the full per-session list for the "View Full
  // History" modal, for free, with the exact same Verified/Unverified/Absent rules.
  const courseStats = courses.map((course) => ({ course, stats: calculateCourseStats(student.id, course.id) }));

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/hod/students')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Students
      </button>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
          style={{ backgroundColor: student.avatarColor }}
        >
          {student.initials}
        </span>
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">{student.fullName}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {student.institutionalId} · {student.level}L · {department?.name}
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <KPICard
          label="Overall attendance"
          value={`${overview.overallAttendancePct}%`}
          icon={TrendingUp}
          tone={overview.overallAttendancePct >= 75 ? 'good' : 'warn'}
          hint="75% NUC threshold"
        />
        <KPICard label="Courses enrolled" value={overview.coursesEnrolled} icon={BookOpen} tone="neutral" />
        <KPICard
          label="Courses at risk"
          value={overview.coursesAtRisk}
          icon={CalendarClock}
          tone={overview.coursesAtRisk > 0 ? 'warn' : 'good'}
        />
      </div>

      <div className="mb-6 rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 px-5 py-3.5 dark:border-zinc-800">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">Per-course breakdown</p>
        </div>
        <ul className="divide-y divide-zinc-50 dark:divide-zinc-800">
          {courseStats.map(({ course, stats }) => (
            <li key={course.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                  {course.code} · {course.title}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {stats.attendedClasses}/{stats.totalClasses} classes attended
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    stats.isEligible
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                  }`}
                >
                  {stats.attendancePct}%
                </span>
                <button
                  type="button"
                  onClick={() => setHistoryCourse(course)}
                  className="flex items-center gap-0.5 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View Full History
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
          {courseStats.length === 0 && <li className="px-5 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">Not enrolled in any courses.</li>}
        </ul>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3.5 dark:border-zinc-800">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">Recent sessions</p>
          <button
            type="button"
            onClick={() => navigate('/hod/corrections')}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            Open Corrections →
          </button>
        </div>
        <RecentSessionsList studentId={student.id} courseStats={courseStats} />
      </div>

      <FullHistoryModal course={historyCourse} studentId={student.id} onClose={() => setHistoryCourse(null)} />
    </div>
  );
}

/** A quick cross-course glance — most recent sessions first, capped for readability. Full detail per course lives in FullHistoryModal via "View Full History". */
function RecentSessionsList({
  courseStats,
}: {
  studentId: string;
  courseStats: { course: CourseUnit; stats: ReturnType<typeof calculateCourseStats> }[];
}) {
  const allSessions = courseStats
    .flatMap(({ course, stats }) => stats.sessions.map((session) => ({ course, ...session })))
    .sort((a, b) => new Date(b.instance.classStartAt).getTime() - new Date(a.instance.classStartAt).getTime())
    .slice(0, 20);

  if (allSessions.length === 0) {
    return <p className="px-5 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">No attendance records yet.</p>;
  }

  return (
    <ul className="divide-y divide-zinc-50 dark:divide-zinc-800">
      {allSessions.map(({ course, instance, record, status }) => (
        <li key={instance.id} className="flex items-center justify-between gap-4 px-5 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{course.code}</p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {instance.instanceDate} · {instance.venueName}
              {record && ` · ${presenceMethodLabel(record.presenceMethod)}`}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
              record ? verificationStatusClasses(record.verificationStatus) : SESSION_STATUS_CLASSES[status]
            }`}
          >
            {record ? verificationStatusLabel(record.verificationStatus) : SESSION_STATUS_LABEL[status]}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** The complete chronological session log for one course — every completed/active class instance, one row each, with date, venue, session type, and status (Verified / Unverified / Absent). This is the "View Full History" fix: previously the HOD could only see a short cross-course snippet capped at 20 records total. */
function FullHistoryModal({ course, studentId, onClose }: { course: CourseUnit | null; studentId: string; onClose: () => void }) {
  const stats = course ? calculateCourseStats(studentId, course.id) : null;

  return (
    <Modal open={!!course} onClose={onClose} title={course ? `${course.code} · Full History` : undefined}>
      {course && stats && (
        <div>
          <div className="mb-4 grid grid-cols-3 gap-3">
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

          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            All sessions ({stats.totalClasses})
          </p>
          <ul className="max-h-96 space-y-2 overflow-y-auto pr-1">
            {stats.sessions.map(({ instance, record, status }) => (
              <li key={instance.id} className="flex items-center justify-between gap-2 rounded-xl bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                    {new Date(instance.classStartAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {instance.venueName}
                    {record && ` · ${presenceMethodLabel(record.presenceMethod)}`}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${SESSION_STATUS_CLASSES[status]}`}>
                  {SESSION_STATUS_LABEL[status]}
                </span>
              </li>
            ))}
            {stats.sessions.length === 0 && <p className="text-sm text-zinc-500 dark:text-zinc-400">No sessions recorded yet.</p>}
          </ul>
        </div>
      )}
    </Modal>
  );
}
