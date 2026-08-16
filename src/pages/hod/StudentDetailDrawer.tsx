import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, CalendarClock, TrendingUp } from 'lucide-react';
import {
  getUserById,
  getDepartmentById,
  getThresholdSummariesForStudent,
  getCourseUnitById,
  getAttendanceRecordsForStudent,
  getClassInstanceById,
  getStudentOverview,
} from '../../data/mockData';
import { KPICard } from '../../components/shared/KPICard';
import { presenceMethodLabel, verificationStatusLabel, verificationStatusClasses } from '../../lib/formatters';

export function StudentDetailDrawer() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const student = studentId ? getUserById(studentId) : undefined;

  if (!student || student.role !== 'student') {
    return <Navigate to="/hod/students" replace />;
  }

  const department = student.departmentId ? getDepartmentById(student.departmentId) : undefined;
  const overview = getStudentOverview(student.id);
  const summaries = getThresholdSummariesForStudent(student.id);
  const records = getAttendanceRecordsForStudent(student.id).slice(0, 20);

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
          {summaries.map((summary) => {
            const course = getCourseUnitById(summary.courseUnitId);
            if (!course) return null;
            return (
              <li key={summary.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                    {course.code} · {course.title}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {summary.attendedClasses}/{summary.totalClasses} classes attended
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    summary.isEligible
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                  }`}
                >
                  {summary.attendancePct}%
                </span>
              </li>
            );
          })}
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
        {records.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">No attendance records yet.</p>
        ) : (
          <ul className="divide-y divide-zinc-50 dark:divide-zinc-800">
            {records.map((record) => {
              const instance = getClassInstanceById(record.classInstanceId);
              const course = instance ? getCourseUnitById(instance.courseUnitId) : undefined;
              return (
                <li key={record.id} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{course?.code ?? 'Unknown course'}</p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {instance?.instanceDate} · {instance?.venueName} · {presenceMethodLabel(record.presenceMethod)}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${verificationStatusClasses(record.verificationStatus)}`}>
                    {verificationStatusLabel(record.verificationStatus)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
