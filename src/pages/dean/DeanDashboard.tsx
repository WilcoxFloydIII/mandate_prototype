import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Building2, Users, AlertTriangle, CalendarClock } from 'lucide-react';
import { DesktopShell } from '../../components/layout/DesktopShell';
import { SectionPlaceholder } from '../../components/layout/SectionPlaceholder';
import { DEAN_NAV } from '../../config/navigation';
import { useSessionStore } from '../../store/useSessionStore';
import { getUserById, getFacultyById, getFacultySnapshot, getDepartmentSnapshot, getDepartmentComparison, getDepartmentById, departments } from '../../data/mockData';
import { KPICard } from '../../components/shared/KPICard';
import { ComparisonChart } from '../../components/shared/ComparisonChart';
import { DepartmentSnapshotModal } from '../../components/shared/DepartmentSnapshotModal';
import type { Department } from '../../types';

function DeanHome() {
  const userId = useSessionStore((s) => s.currentUserId);
  const dean = getUserById(userId)!;
  const faculty = getFacultyById(dean.facultyId!)!;
  const snapshot = getFacultySnapshot(faculty.id);
  const comparison = getDepartmentComparison(faculty.id);
  const [selected, setSelected] = useState<Department | null>(null);

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Faculty Dashboard</p>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">{faculty.name}</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Welcome back, {dean.fullName}.</p>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard label="Faculty attendance" value={`${snapshot.avgAttendancePct}%`} icon={Building2} tone={snapshot.avgAttendancePct >= 75 ? 'good' : 'warn'} hint="75% NUC threshold" />
        <KPICard label="Students at risk" value={snapshot.studentsAtRisk} icon={AlertTriangle} tone={snapshot.studentsAtRisk > 0 ? 'warn' : 'good'} />
        <KPICard label="Lecturer compliance" value={`${snapshot.lecturerCompliancePct}%`} icon={Users} tone={snapshot.lecturerCompliancePct >= 75 ? 'good' : 'warn'} />
        <KPICard label="Classes today" value={snapshot.classesToday} icon={CalendarClock} tone="neutral" />
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-semibold text-zinc-900 dark:text-white">Department comparison</p>
        <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">Average attendance by department — click a bar to drill in</p>
        <ComparisonChart data={comparison} onItemClick={(id) => setSelected(getDepartmentById(id) ?? null)} />
      </div>
      <DepartmentSnapshotModal department={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function DepartmentsList() {
  const userId = useSessionStore((s) => s.currentUserId);
  const dean = getUserById(userId)!;
  const deptList = departments.filter((d) => d.facultyId === dean.facultyId);
  const [selected, setSelected] = useState<Department | null>(null);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Departments</h1>
      <div className="mt-5 rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <ul className="divide-y divide-zinc-50 dark:divide-zinc-800">
          {deptList.map((d) => {
            const pct = getDepartmentSnapshot(d.id).avgAttendancePct;
            return (
              <li key={d.id}>
                <button onClick={() => setSelected(d)} className="flex w-full items-center justify-between px-5 py-3.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">{d.name}</span>
                  <span className={`text-sm font-semibold ${pct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>{pct}%</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <DepartmentSnapshotModal department={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

export function DeanDashboard() {
  return (
    <DesktopShell navItems={DEAN_NAV} roleLabel="Dean" scopeLine="Cross-department visibility within one faculty">
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DeanHome />} />
        <Route path="departments" element={<DepartmentsList />} />
        <Route path="departments/:deptId" element={<SectionPlaceholder title="Department Detail" description="Click a department from the list — the full read-only HOD view is next." />} />
        <Route path="reports" element={<SectionPlaceholder title="Reports" />} />
        <Route path="schedule-approvals" element={<SectionPlaceholder title="Schedule Approvals" description="View only — approvals are managed at department level." />} />
        <Route path="settings" element={<SectionPlaceholder title="Settings" />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </DesktopShell>
  );
}
