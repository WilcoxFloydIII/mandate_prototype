import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { Users, Building2, CalendarCheck2, ShieldCheck, ArrowRight } from 'lucide-react';
import { DesktopShell } from '../../components/layout/DesktopShell';
import { SectionPlaceholder } from '../../components/layout/SectionPlaceholder';
import { ADMIN_NAV } from '../../config/navigation';
import { users, departments, institution, academicSession, currentSemester, adminActivityLog, getUserById, getInstitutionSnapshot } from '../../data/mockData';
import { KPICard } from '../../components/shared/KPICard';
import { ActivityLogPanel } from './ActivityLogPanel';
import { ReportsPanel } from './ReportsPanel';

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function AdminHome() {
  const snapshot = getInstitutionSnapshot();

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Institution Console</p>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">{institution.name}</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {academicSession.name} · {currentSemester.name}
        </p>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard label="Total users" value={users.length} icon={Users} tone="neutral" />
        <KPICard label="Departments" value={departments.length} icon={Building2} tone="neutral" />
        <KPICard label="Classes today" value={snapshot.classesToday} icon={CalendarCheck2} tone="neutral" />
        <KPICard label="Institution attendance" value={`${snapshot.avgAttendancePct}%`} icon={ShieldCheck} tone={snapshot.avgAttendancePct >= 75 ? 'good' : 'warn'} hint="75% NUC threshold" />
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Recent activity</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Latest entries from the institutional audit trail</p>
          </div>
          <Link
            to="activity-log"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <ul className="divide-y divide-zinc-50 dark:divide-zinc-800">
          {adminActivityLog.slice(0, 8).map((entry) => {
            const actor = entry.actorId ? getUserById(entry.actorId) : null;
            return (
              <li key={entry.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-zinc-900 dark:text-white">{entry.actionType.replace(/_/g, ' ')}</p>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{actor ? actor.fullName : 'System'}</p>
                </div>
                <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">{timeAgo(entry.createdAt)}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  return (
    <DesktopShell navItems={ADMIN_NAV} roleLabel="System Administrator" scopeLine="Institution-wide management console">
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminHome />} />
        <Route path="users" element={<SectionPlaceholder title="User Management" description="Bulk import and per-user editing arrive in the next build pass." />} />
        <Route path="users/:userId" element={<SectionPlaceholder title="User Detail" />} />
        <Route path="users/import" element={<SectionPlaceholder title="Bulk Import" />} />
        <Route path="timetable" element={<SectionPlaceholder title="Timetable Editor" />} />
        <Route path="courses" element={<SectionPlaceholder title="Courses" />} />
        <Route path="sessions" element={<SectionPlaceholder title="Sessions" description="Academic session lifecycle and Exam Eligibility Lock." />} />
        <Route path="reports" element={<ReportsPanel />} />
        <Route path="activity-log" element={<ActivityLogPanel />} />
        <Route path="settings" element={<SectionPlaceholder title="Settings" />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </DesktopShell>
  );
}
