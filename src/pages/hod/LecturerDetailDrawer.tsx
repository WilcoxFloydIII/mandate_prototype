import { useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, CalendarX2, TrendingUp, ChevronRight } from 'lucide-react';
import {
  getUserById,
  getDepartmentById,
  getLecturerOverview,
  getLecturerSummariesForLecturer,
  getCourseUnitById,
  getLecturerAbsences,
  calculateLecturerCourseStats,
} from '../../data/mockData';
import { KPICard } from '../../components/shared/KPICard';
import { Modal } from '../../components/shared/Modal';
import { presenceMethodLabel } from '../../lib/formatters';
import type { CourseUnit } from '../../types';

export function LecturerDetailDrawer() {
  const { lecturerId } = useParams<{ lecturerId: string }>();
  const navigate = useNavigate();
  const lecturer = lecturerId ? getUserById(lecturerId) : undefined;

  const [historyCourse, setHistoryCourse] = useState<CourseUnit | null>(null);

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
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      summary.meetsThreshold
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                    }`}
                  >
                    {summary.attendancePct}%
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
            );
          })}
          {summaries.length === 0 && <li className="px-5 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">No courses assigned.</li>}
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

      <LecturerCourseHistoryModal course={historyCourse} lecturerId={lecturer.id} onClose={() => setHistoryCourse(null)} />
    </div>
  );
}

/** The complete chronological session log for one course from the lecturer's own side — every class instance they were assigned to teach, one row each, with date, venue, session mode, and their attendance status (Present/Verified or Absent). Mirrors FullHistoryModal in StudentDetailDrawer.tsx. */
function LecturerCourseHistoryModal({ course, lecturerId, onClose }: { course: CourseUnit | null; lecturerId: string; onClose: () => void }) {
  const stats = course ? calculateLecturerCourseStats(lecturerId, course.id) : null;

  return (
    <Modal open={!!course} onClose={onClose} title={course ? `${course.code} · ${course.title} · Full History` : undefined}>
      {course && stats && (
        <div>
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-zinc-800">
              <p className="text-lg font-semibold text-zinc-900 dark:text-white">{stats.classesHeld}</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Classes held</p>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-zinc-800">
              <p className="text-lg font-semibold text-zinc-900 dark:text-white">{stats.attendancePct}%</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Attendance rate</p>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-zinc-800">
              <p className={`text-lg font-semibold ${stats.absencesCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {stats.absencesCount}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Absences</p>
            </div>
          </div>

          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            All sessions ({stats.classesHeld})
          </p>
          <ul className="max-h-96 space-y-2 overflow-y-auto pr-1">
            {stats.sessions.map(({ instance, record, present }) => (
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
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    present
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                  }`}
                >
                  {present ? 'Present / Verified' : 'Absent'}
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
