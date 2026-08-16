import { Routes, Route, Navigate } from 'react-router-dom';
import { Users, GraduationCap, AlertTriangle, CalendarClock } from 'lucide-react';
import { DesktopShell } from '../../components/layout/DesktopShell';
import { SectionPlaceholder } from '../../components/layout/SectionPlaceholder';
import { HOD_NAV } from '../../config/navigation';
import { useSessionStore } from '../../store/useSessionStore';
import { getUserById, getDepartmentById, getDepartmentSnapshot } from '../../data/mockData';
import { KPICard } from '../../components/shared/KPICard';
import { CorrectionsPanel } from './CorrectionsPanel';
import { AlertsPanel } from './AlertsPanel';
import { StudentsPanel } from './StudentsPanel';
import { StudentDetailDrawer } from './StudentDetailDrawer';
import { LecturersPanel } from './LecturersPanel';
import { LecturerDetailDrawer } from './LecturerDetailDrawer';
import { ReportsPanel } from './ReportsPanel';
import { TimetablePanel } from './TimetablePanel';

function HODHome() {
  const userId = useSessionStore((s) => s.currentUserId);
  const hod = getUserById(userId)!;
  const department = getDepartmentById(hod.departmentId!)!;
  const snapshot = getDepartmentSnapshot(department.id);

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Department Dashboard</p>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">{department.name}</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Welcome back, {hod.fullName}.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard label="Department attendance" value={`${snapshot.avgAttendancePct}%`} icon={Users} tone={snapshot.avgAttendancePct >= 75 ? 'good' : 'warn'} hint="75% NUC threshold" />
        <KPICard label="Students at risk" value={snapshot.studentsAtRisk} icon={AlertTriangle} tone={snapshot.studentsAtRisk > 0 ? 'warn' : 'good'} />
        <KPICard label="Lecturer compliance" value={`${snapshot.lecturerCompliancePct}%`} icon={GraduationCap} tone={snapshot.lecturerCompliancePct >= 75 ? 'good' : 'warn'} />
        <KPICard label="Classes today" value={snapshot.classesToday} icon={CalendarClock} tone="neutral" />
      </div>
    </div>
  );
}

export function HODDashboard() {
  return (
    <DesktopShell navItems={HOD_NAV} roleLabel="Head of Department" scopeLine="Department-scoped compliance and oversight">
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<HODHome />} />
        <Route path="students" element={<StudentsPanel />} />
        <Route path="students/:studentId" element={<StudentDetailDrawer />} />
        <Route path="lecturers" element={<LecturersPanel />} />
        <Route path="lecturers/:lecturerId" element={<LecturerDetailDrawer />} />
        <Route path="timetable" element={<TimetablePanel />} />
        <Route path="reports" element={<ReportsPanel />} />
        <Route path="corrections" element={<CorrectionsPanel />} />
        <Route path="alerts" element={<AlertsPanel />} />
        <Route path="settings" element={<SectionPlaceholder title="Settings" />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </DesktopShell>
  );
}
