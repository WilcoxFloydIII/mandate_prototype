import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { getUserById, getAtRiskSummariesForStudent, getCourseUnitById, institution } from '../../data/mockData';

export function AtRiskCourses() {
  const navigate = useNavigate();
  const userId = useSessionStore((s) => s.currentUserId);
  const student = getUserById(userId)!;
  const summaries = getAtRiskSummariesForStudent(student.id);

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
      <h1 className="mb-1 text-xl font-semibold text-zinc-900 dark:text-white">At-Risk Courses</h1>
      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">Courses below the {institution.defaultThresholdPct}% NUC attendance threshold.</p>

      {summaries.length === 0 ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-8 text-center dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">You're on track in every course.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {summaries.map((s) => {
            const course = getCourseUnitById(s.courseUnitId);
            if (!course) return null;
            const gap = s.thresholdPct - s.attendancePct;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/student/course/${course.id}`)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left shadow-sm transition-colors hover:bg-amber-100 dark:border-amber-500/20 dark:bg-amber-500/10 dark:hover:bg-amber-500/20"
                >
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                      {course.code} · {course.title}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {s.attendedClasses}/{s.totalClasses} classes attended · {gap.toFixed(0)}pt below threshold
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{s.attendancePct}%</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">of {s.thresholdPct}%</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
