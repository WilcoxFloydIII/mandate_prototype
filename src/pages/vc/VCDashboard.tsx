import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Landmark, AlertTriangle, GraduationCap, Building2 } from 'lucide-react';
import { DesktopShell } from '../../components/layout/DesktopShell';
import { SectionPlaceholder } from '../../components/layout/SectionPlaceholder';
import { VC_NAV } from '../../config/navigation';
import { useSessionStore } from '../../store/useSessionStore';
import { getUserById, departments, getDepartmentSnapshot, getDepartmentById, getFacultyComparison, institution } from '../../data/mockData';
import { KPICard } from '../../components/shared/KPICard';
import { ComparisonChart } from '../../components/shared/ComparisonChart';
import { DepartmentSnapshotModal } from '../../components/shared/DepartmentSnapshotModal';
import { FacultyDrilldown } from './FacultyDrilldown';
import type { Department } from '../../types';

function VCHome() {
  const navigate = useNavigate();
  const userId = useSessionStore((s) => s.currentUserId);
  const vc = getUserById(userId)!;
  const comparison = getFacultyComparison();
  const [selected, setSelected] = useState<Department | null>(null);

  const worstDepartments = departments
    .map((d) => ({ department: d, snapshot: getDepartmentSnapshot(d.id) }))
    .sort((a, b) => a.snapshot.avgAttendancePct - b.snapshot.avgAttendancePct)
    .slice(0, 3);

  const institutionAvg = comparison.length ? Math.round((comparison.reduce((sum, c) => sum + c.value, 0) / comparison.length) * 10) / 10 : 0;
  const totalAtRisk = departments.reduce((sum, d) => sum + getDepartmentSnapshot(d.id).studentsAtRisk, 0);
  const totalBelowThreshold = departments.reduce((sum, d) => sum + getDepartmentSnapshot(d.id).lecturersBelowThreshold, 0);

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Institution Summary</p>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">{institution.name}</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Welcome back, {vc.fullName}.</p>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard label="Institution attendance" value={`${institutionAvg}%`} icon={Landmark} tone={institutionAvg >= 75 ? 'good' : 'warn'} hint="75% NUC threshold" />
        <KPICard label="Students at risk" value={totalAtRisk} icon={AlertTriangle} tone={totalAtRisk > 0 ? 'warn' : 'good'} />
        <KPICard label="Lecturers below threshold" value={totalBelowThreshold} icon={GraduationCap} tone={totalBelowThreshold > 0 ? 'warn' : 'good'} />
        <KPICard label="Faculties" value={comparison.length} icon={Building2} tone="neutral" />
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-3">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">Faculty comparison</p>
          <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">Click a bar to drill into that faculty's departments</p>
          <ComparisonChart data={comparison} onItemClick={(id) => navigate(`/vc/faculties/${id}`)} />
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">Needs attention</p>
          <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">Lowest-performing departments institution-wide</p>
          <ul className="space-y-2.5">
            {worstDepartments.map(({ department, snapshot }) => (
              <li key={department.id}>
                <button
                  onClick={() => setSelected(getDepartmentById(department.id) ?? null)}
                  className="flex w-full items-center justify-between rounded-xl bg-zinc-50 px-3 py-2.5 text-left transition-colors hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-800/70"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{department.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{snapshot.studentsAtRisk} students at risk</p>
                  </div>
                  <span className={`text-sm font-semibold ${snapshot.avgAttendancePct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {snapshot.avgAttendancePct}%
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <DepartmentSnapshotModal department={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

export function VCDashboard() {
  return (
    <DesktopShell navItems={VC_NAV} roleLabel="Vice-Chancellor" scopeLine="Read-only, institution-wide">
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<VCHome />} />
        <Route path="faculties/:facultyId" element={<FacultyDrilldown />} />
        <Route path="reports" element={<SectionPlaceholder title="Reports" />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </DesktopShell>
  );
}
