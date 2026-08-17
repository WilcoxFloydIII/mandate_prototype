import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users2 } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { getUserById, getCourseUnitsForLecturer, getCourseComplianceSnapshot } from '../../data/mockData';

export function CoursesPanel() {
  const navigate = useNavigate();
  const userId = useSessionStore((s) => s.currentUserId);
  const lecturer = getUserById(userId)!;
  const courses = getCourseUnitsForLecturer(lecturer.id);

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
              <li key={course.id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
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
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
