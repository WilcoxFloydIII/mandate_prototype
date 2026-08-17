import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Users2 } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { getUserById, getCourseUnitsForLecturer, getCourseComplianceSnapshot, getEnrolledStudents } from '../../data/mockData';

export function CoursesPanel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get('id');
  const userId = useSessionStore((s) => s.currentUserId);
  const lecturer = getUserById(userId)!;
  const courses = getCourseUnitsForLecturer(lecturer.id);
  const selectedRef = useRef<HTMLLIElement | null>(null);

  const selectedRoster = useMemo(
    () => (selectedId ? getEnrolledStudents(selectedId) : []),
    [selectedId]
  );

  useEffect(() => {
    if (selectedId && selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedId]);

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
            const isSelected = selectedId === course.id;
            return (
              <li
                key={course.id}
                ref={isSelected ? selectedRef : undefined}
                aria-current={isSelected ? 'true' : undefined}
                className={`rounded-2xl border p-4 shadow-sm transition-colors ${
                  isSelected
                    ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-400 dark:border-blue-500/60 dark:bg-blue-500/10 dark:ring-blue-500/60'
                    : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                }`}
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

                {isSelected && (
                  <div className="mt-3 border-t border-blue-200 pt-3 dark:border-blue-500/30">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400">
                      Enrolled roster ({selectedRoster.length})
                    </p>
                    {selectedRoster.length === 0 ? (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">No students enrolled yet.</p>
                    ) : (
                      <ul className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
                        {selectedRoster.map((student) => (
                          <li
                            key={student.id}
                            className="flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5 text-xs dark:bg-zinc-900"
                          >
                            <span className="truncate text-zinc-700 dark:text-zinc-300">{student.fullName}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
