import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CalendarClock, GraduationCap, Users } from 'lucide-react';
import {
  getDepartmentById,
  getFacultyById,
  getDepartmentSnapshot,
  getCourseUnitsForDepartment,
  getCourseComplianceSnapshot,
  getLecturersForDepartment,
  getLecturerOverview,
  getUserById,
} from '../../data/mockData';
import { KPICard } from '../../components/shared/KPICard';
import { DataTable, type DataTableColumn } from '../../components/shared/DataTable';
import type { CourseUnit, User } from '../../types';

export function DepartmentDetail() {
  const { deptId } = useParams<{ deptId: string }>();
  const navigate = useNavigate();
  const department = deptId ? getDepartmentById(deptId) : undefined;

  if (!department) {
    return <Navigate to="/dean/departments" replace />;
  }

  const faculty = getFacultyById(department.facultyId);
  const snapshot = getDepartmentSnapshot(department.id);
  const hod = department.hodId ? getUserById(department.hodId) : undefined;
  const courses = getCourseUnitsForDepartment(department.id);
  const lecturers = getLecturersForDepartment(department.id);

  const courseColumns: DataTableColumn<CourseUnit>[] = [
    {
      key: 'code',
      header: 'Course',
      sortable: true,
      sortValue: (c) => c.code,
      render: (c) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-zinc-900 dark:text-white">{c.code}</p>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{c.title}</p>
        </div>
      ),
    },
    { key: 'level', header: 'Level', align: 'center', sortable: true, sortValue: (c) => c.level, render: (c) => <span className="text-zinc-600 dark:text-zinc-300">{c.level}L</span> },
    {
      key: 'enrolled',
      header: 'Enrolled',
      align: 'center',
      sortable: true,
      sortValue: (c) => getCourseComplianceSnapshot(c.id).enrolledCount,
      render: (c) => <span className="text-zinc-600 dark:text-zinc-300">{getCourseComplianceSnapshot(c.id).enrolledCount}</span>,
    },
    {
      key: 'atRisk',
      header: 'At risk',
      align: 'center',
      sortable: true,
      sortValue: (c) => getCourseComplianceSnapshot(c.id).atRiskCount,
      render: (c) => {
        const n = getCourseComplianceSnapshot(c.id).atRiskCount;
        return n > 0 ? (
          <span className="text-amber-600 dark:text-amber-400">{n}</span>
        ) : (
          <span className="text-zinc-400 dark:text-zinc-600">—</span>
        );
      },
    },
    {
      key: 'attendance',
      header: 'Attendance %',
      align: 'right',
      sortable: true,
      sortValue: (c) => getCourseComplianceSnapshot(c.id).avgAttendancePct,
      render: (c) => {
        const pct = getCourseComplianceSnapshot(c.id).avgAttendancePct;
        return <span className={`font-semibold ${pct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>{pct}%</span>;
      },
    },
  ];

  const lecturerColumns: DataTableColumn<User>[] = [
    {
      key: 'fullName',
      header: 'Lecturer',
      sortable: true,
      sortValue: (l) => l.fullName,
      render: (l) => (
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white" style={{ backgroundColor: l.avatarColor }}>
            {l.initials}
          </span>
          <span className="truncate font-medium text-zinc-900 dark:text-white">{l.fullName}</span>
        </div>
      ),
    },
    {
      key: 'attendance',
      header: 'Attendance %',
      align: 'right',
      sortable: true,
      sortValue: (l) => getLecturerOverview(l.id).overallAttendancePct,
      render: (l) => {
        const overview = getLecturerOverview(l.id);
        return <span className={`font-semibold ${overview.meetsThreshold ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>{overview.overallAttendancePct}%</span>;
      },
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right',
      render: (l) => {
        const overview = getLecturerOverview(l.id);
        return (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              overview.meetsThreshold
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
            }`}
          >
            {overview.meetsThreshold ? 'Passing' : 'Failing'}
          </span>
        );
      },
    },
  ];

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/dean/departments')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Departments
      </button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{faculty?.name}</p>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">{department.name}</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">HOD: {hod?.fullName ?? 'Unassigned'}</p>
        </div>
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">Read-only — Dean view</span>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard label="Department attendance" value={`${snapshot.avgAttendancePct}%`} icon={Users} tone={snapshot.avgAttendancePct >= 75 ? 'good' : 'warn'} hint="75% NUC threshold" />
        <KPICard label="Students at risk" value={snapshot.studentsAtRisk} icon={AlertTriangle} tone={snapshot.studentsAtRisk > 0 ? 'warn' : 'good'} />
        <KPICard label="Lecturer compliance" value={`${snapshot.lecturerCompliancePct}%`} icon={GraduationCap} tone={snapshot.lecturerCompliancePct >= 75 ? 'good' : 'warn'} />
        <KPICard label="Classes today" value={snapshot.classesToday} icon={CalendarClock} tone="neutral" />
      </div>

      <div className="mb-8">
        <p className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">Courses</p>
        <DataTable columns={courseColumns} data={courses} getRowId={(c) => c.id} pageSize={10} emptyMessage="No courses in this department." initialSortKey="code" />
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">Lecturers</p>
        <DataTable columns={lecturerColumns} data={lecturers} getRowId={(l) => l.id} pageSize={10} emptyMessage="No lecturers in this department." initialSortKey="fullName" />
      </div>
    </div>
  );
}
