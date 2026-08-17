import { useMemo, useState } from 'react';
import { Save, ShieldCheck } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { getUserById, getDepartmentById, getCourseUnitsForDepartment, attendanceThresholdSummaries, institution } from '../../data/mockData';

export function SettingsPanel() {
  const userId = useSessionStore((s) => s.currentUserId);
  const hod = getUserById(userId)!;
  const department = getDepartmentById(hod.departmentId!)!;

  const departmentCourseIds = useMemo(() => new Set(getCourseUnitsForDepartment(department.id).map((c) => c.id)), [department.id]);
  const departmentSummaries = useMemo(() => attendanceThresholdSummaries.filter((s) => departmentCourseIds.has(s.courseUnitId)), [departmentCourseIds]);

  const [threshold, setThreshold] = useState(institution.defaultThresholdPct);
  const [saved, setSaved] = useState(false);

  const currentlyAtRisk = departmentSummaries.filter((s) => s.attendancePct < institution.defaultThresholdPct).length;
  const wouldBeAtRisk = departmentSummaries.filter((s) => s.attendancePct < threshold).length;
  const delta = wouldBeAtRisk - currentlyAtRisk;

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{department.name}</p>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Settings</h1>
      </div>

      <div className="max-w-lg rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="mb-1 text-sm font-semibold text-zinc-900 dark:text-white">Department attendance threshold</p>
        <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
          Institution default is {institution.defaultThresholdPct}%. Override it for {department.name} if departmental policy requires a different minimum.
        </p>

        <div className="mb-4 flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={100}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-24 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
          />
          <span className="text-sm text-zinc-500 dark:text-zinc-400">%</span>
        </div>

        {delta !== 0 && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
            At {threshold}%, {wouldBeAtRisk} of {departmentSummaries.length} enrollments would be at risk ({delta > 0 ? '+' : ''}
            {delta} vs. the {institution.defaultThresholdPct}% default).
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Save className="h-4 w-4" />
            Save threshold
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
