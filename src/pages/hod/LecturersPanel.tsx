import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../store/useSessionStore';
import {
  getUserById,
  getDepartmentById,
  getLecturersForDepartment,
  getLecturerOverview,
  getCourseUnitsForLecturer,
} from '../../data/mockData';
import { DataTable, type DataTableColumn } from '../../components/shared/DataTable';

interface LecturerRow {
  id: string;
  fullName: string;
  institutionalId: string;
  initials: string;
  avatarColor: string;
  coursesTaught: number;
  classesHeld: number;
  overallAttendancePct: number;
  meetsThreshold: boolean;
}

export function LecturersPanel() {
  const navigate = useNavigate();
  const userId = useSessionStore((s) => s.currentUserId);
  const hod = getUserById(userId)!;
  const department = getDepartmentById(hod.departmentId!)!;

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'failing'>('all');

  const rows = useMemo<LecturerRow[]>(() => {
    return getLecturersForDepartment(department.id).map((lecturer) => {
      const overview = getLecturerOverview(lecturer.id);
      return {
        id: lecturer.id,
        fullName: lecturer.fullName,
        institutionalId: lecturer.institutionalId,
        initials: lecturer.initials,
        avatarColor: lecturer.avatarColor,
        coursesTaught: getCourseUnitsForLecturer(lecturer.id).length,
        classesHeld: overview.classesHeld,
        overallAttendancePct: overview.overallAttendancePct,
        meetsThreshold: overview.meetsThreshold,
      };
    });
  }, [department.id]);

  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows
      .filter((r) => statusFilter === 'all' || !r.meetsThreshold)
      .filter((r) => !needle || `${r.fullName} ${r.institutionalId}`.toLowerCase().includes(needle));
  }, [rows, statusFilter, query]);

  const columns: DataTableColumn<LecturerRow>[] = [
    {
      key: 'fullName',
      header: 'Lecturer',
      sortable: true,
      sortValue: (r) => r.fullName,
      render: (r) => (
        <div className="flex items-center gap-3">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: r.avatarColor }}
          >
            {r.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-zinc-900 dark:text-white">{r.fullName}</p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{r.institutionalId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'coursesTaught',
      header: 'Courses Taught',
      align: 'center',
      sortable: true,
      sortValue: (r) => r.coursesTaught,
      render: (r) => <span className="text-zinc-700 dark:text-zinc-300">{r.coursesTaught}</span>,
    },
    {
      key: 'classesHeld',
      header: 'Classes Held',
      align: 'center',
      sortable: true,
      sortValue: (r) => r.classesHeld,
      render: (r) => <span className="text-zinc-700 dark:text-zinc-300">{r.classesHeld}</span>,
    },
    {
      key: 'overallAttendancePct',
      header: 'Attendance %',
      align: 'right',
      sortable: true,
      sortValue: (r) => r.overallAttendancePct,
      render: (r) => (
        <span className={`font-semibold ${r.overallAttendancePct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
          {r.overallAttendancePct}%
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right',
      render: (r) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            r.meetsThreshold
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
          }`}
        >
          {r.meetsThreshold ? 'Passing' : 'Failing'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{department.name}</p>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Lecturers</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{rows.length} lecturers assigned to this department.</p>
      </div>

      <DataTable
        columns={columns}
        data={filteredRows}
        getRowId={(r) => r.id}
        onRowClick={(r) => navigate(`/hod/lecturers/${r.id}`)}
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search name or staff ID…"
        emptyMessage="No lecturers match your filters."
        pageSize={12}
        initialSortKey="fullName"
        toolbarRight={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'failing')}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <option value="all">All lecturers</option>
            <option value="failing">Below threshold</option>
          </select>
        }
      />
    </div>
  );
}
