import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { getUserById, getDepartmentById, getStudentsForDepartment, getStudentOverview } from '../../data/mockData';
import { DataTable, type DataTableColumn } from '../../components/shared/DataTable';

interface StudentRow {
  id: string;
  fullName: string;
  institutionalId: string;
  level: number | null;
  initials: string;
  avatarColor: string;
  overallAttendancePct: number;
  coursesEnrolled: number;
  coursesAtRisk: number;
}

export function StudentsPanel() {
  const navigate = useNavigate();
  const userId = useSessionStore((s) => s.currentUserId);
  const hod = getUserById(userId)!;
  const department = getDepartmentById(hod.departmentId!)!;

  const [query, setQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'at-risk'>('all');

  const rows = useMemo<StudentRow[]>(() => {
    return getStudentsForDepartment(department.id).map((student) => {
      const overview = getStudentOverview(student.id);
      return {
        id: student.id,
        fullName: student.fullName,
        institutionalId: student.institutionalId,
        level: student.level,
        initials: student.initials,
        avatarColor: student.avatarColor,
        overallAttendancePct: overview.overallAttendancePct,
        coursesEnrolled: overview.coursesEnrolled,
        coursesAtRisk: overview.coursesAtRisk,
      };
    });
  }, [department.id]);

  const levels = useMemo(
    () => Array.from(new Set(rows.map((r) => r.level).filter((l): l is number => l !== null))).sort((a, b) => a - b),
    [rows]
  );

  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows
      .filter((r) => levelFilter === 'all' || String(r.level) === levelFilter)
      .filter((r) => statusFilter === 'all' || r.coursesAtRisk > 0)
      .filter((r) => !needle || `${r.fullName} ${r.institutionalId}`.toLowerCase().includes(needle));
  }, [rows, levelFilter, statusFilter, query]);

  const columns: DataTableColumn<StudentRow>[] = [
    {
      key: 'fullName',
      header: 'Student',
      sortable: true,
      sortValue: (row) => row.fullName,
      render: (row) => (
        <div className="flex items-center gap-3">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: row.avatarColor }}
          >
            {row.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-zinc-900 dark:text-white">{row.fullName}</p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{row.institutionalId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'level',
      header: 'Level',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.level ?? 0,
      render: (row) => <span className="text-zinc-700 dark:text-zinc-300">{row.level}L</span>,
    },
    {
      key: 'coursesEnrolled',
      header: 'Courses',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.coursesEnrolled,
      render: (row) => <span className="text-zinc-700 dark:text-zinc-300">{row.coursesEnrolled}</span>,
    },
    {
      key: 'coursesAtRisk',
      header: 'At risk',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.coursesAtRisk,
      render: (row) =>
        row.coursesAtRisk > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            <AlertTriangle className="h-3 w-3" />
            {row.coursesAtRisk}
          </span>
        ) : (
          <span className="text-zinc-400 dark:text-zinc-600">—</span>
        ),
    },
    {
      key: 'overallAttendancePct',
      header: 'Overall %',
      align: 'right',
      sortable: true,
      sortValue: (row) => row.overallAttendancePct,
      render: (row) => (
        <span
          className={`font-semibold ${row.overallAttendancePct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}
        >
          {row.overallAttendancePct}%
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{department.name}</p>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Students</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{rows.length} students enrolled in this department.</p>
      </div>

      <DataTable
        columns={columns}
        data={filteredRows}
        getRowId={(row) => row.id}
        onRowClick={(row) => navigate(`/hod/students/${row.id}`)}
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search name or matric number…"
        emptyMessage="No students match your filters."
        pageSize={12}
        initialSortKey="fullName"
        toolbarRight={
          <>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option value="all">All levels</option>
              {levels.map((l) => (
                <option key={l} value={l}>
                  {l}L
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'at-risk')}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option value="all">All students</option>
              <option value="at-risk">At risk only</option>
            </select>
          </>
        }
      />
    </div>
  );
}
