import { useMemo, useState } from 'react';
import { courseUnits, departments, getDepartmentById, getUserById, getCourseComplianceSnapshot } from '../../data/mockData';
import { DataTable, type DataTableColumn } from '../../components/shared/DataTable';
import type { CourseUnit } from '../../types';

export function CoursesPanel() {
  const [query, setQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  const levels = useMemo(() => Array.from(new Set(courseUnits.map((c) => c.level))).sort((a, b) => a - b), []);

  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return courseUnits
      .filter((c) => deptFilter === 'all' || c.departmentId === deptFilter)
      .filter((c) => levelFilter === 'all' || String(c.level) === levelFilter)
      .filter((c) => !needle || `${c.code} ${c.title}`.toLowerCase().includes(needle));
  }, [deptFilter, levelFilter, query]);

  const columns: DataTableColumn<CourseUnit>[] = [
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
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      sortValue: (c) => getDepartmentById(c.departmentId)?.name ?? '',
      render: (c) => <span className="text-zinc-600 dark:text-zinc-300">{getDepartmentById(c.departmentId)?.shortName ?? '—'}</span>,
    },
    {
      key: 'level',
      header: 'Level',
      align: 'center',
      sortable: true,
      sortValue: (c) => c.level,
      render: (c) => <span className="text-zinc-600 dark:text-zinc-300">{c.level}L</span>,
    },
    {
      key: 'creditUnits',
      header: 'Units',
      align: 'center',
      sortable: true,
      sortValue: (c) => c.creditUnits,
      render: (c) => <span className="text-zinc-600 dark:text-zinc-300">{c.creditUnits}</span>,
    },
    {
      key: 'lecturers',
      header: 'Lecturer(s)',
      render: (c) => {
        const names = c.lecturerIds.map((id) => getUserById(id)?.fullName).filter((n): n is string => Boolean(n));
        return <span className="truncate text-zinc-600 dark:text-zinc-300">{names.join(', ') || '—'}</span>;
      },
    },
    {
      key: 'enrolled',
      header: 'Enrolled',
      align: 'center',
      sortable: true,
      sortValue: (c) => getCourseComplianceSnapshot(c.id).enrolledCount,
      render: (c) => <span className="text-zinc-600 dark:text-zinc-300">{getCourseComplianceSnapshot(c.id).enrolledCount}</span>,
    },
    {
      key: 'attendance',
      header: 'Attendance %',
      align: 'right',
      sortable: true,
      sortValue: (c) => getCourseComplianceSnapshot(c.id).avgAttendancePct,
      render: (c) => {
        const snapshot = getCourseComplianceSnapshot(c.id);
        return (
          <span className={`font-semibold ${snapshot.avgAttendancePct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {snapshot.avgAttendancePct}%
          </span>
        );
      },
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Institution Console</p>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Course Catalogue</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{courseUnits.length} course units across every department.</p>
      </div>
      <DataTable
        columns={columns}
        data={filteredRows}
        getRowId={(c) => c.id}
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search course code or title…"
        emptyMessage="No courses match your filters."
        pageSize={15}
        initialSortKey="code"
        toolbarRight={
          <>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option value="all">All departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
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
          </>
        }
      />
    </div>
  );
}
