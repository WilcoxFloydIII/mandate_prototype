import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, CalendarX2, TrendingUp } from 'lucide-react';
import {
  getUserById,
  getDepartmentById,
  getLecturerOverview,
  getLecturerSummariesForLecturer,
  getCourseUnitById,
  getLecturerAbsences,
} from '../../data/mockData';
import { KPICard } from '../../components/shared/KPICard';

export function LecturerDetailDrawer() {
  const { lecturerId } = useParams<{ lecturerId: string }>();
  const navigate = useNavigate();
  const lecturer = lecturerId ? getUserById(lecturerId) : undefined;

  if (!lecturer || lecturer.role !== 'lecturer') {
    return <Navigate to="/hod/lecturers" replace />;
  }

  const department = lecturer.departmentId ? getDepartmentById(lecturer.departmentId) : undefined;
  const overview = getLecturerOverview(lecturer.id);
  const summaries = getLecturerSummariesForLecturer(lecturer.id);
  const absences = getLecturerAbsences(lecturer.id);

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/hod/lecturers')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Lecturers
      </button>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
          style={{ backgroundColor: lecturer.avatarColor }}
        >
          {lecturer.initials}
        </span>
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">{lecturer.fullName}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {lecturer.institutionalId} · {department?.name}
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <KPICard
          label="Attendance rate"
          value={`${overview.overallAttendancePct}%`}
          icon={TrendingUp}
          tone={overview.meetsThreshold ? 'good' : 'warn'}
          hint="75% NUC threshold"
        />
        <KPICard label="Courses taught" value={overview.coursesTaught} icon={BookOpen} tone="neutral" />
        <KPICard label="Recorded absences" value={absences.length} icon={CalendarX2} tone={absences.length > 0 ? 'warn' : 'good'} />
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
                    {summary.attendedClasses}/{summary.totalClasses} classes held
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    summary.meetsThreshold
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
        <div className="border-b border-zinc-100 px-5 py-3.5 dark:border-zinc-800">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">Absence history</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Completed sessions with no lecturer attendance record</p>
        </div>
        {absences.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">No recorded absences.</p>
        ) : (
          <ul className="divide-y divide-zinc-50 dark:divide-zinc-800">
            {absences.map((a) => (
              <li key={a.classInstanceId} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                    {a.courseCode} · {a.courseTitle}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{a.venueName}</p>
                </div>
                <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">{a.instanceDate}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
