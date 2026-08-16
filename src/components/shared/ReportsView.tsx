import { useMemo, useState } from 'react';
import { Download, GraduationCap, Users } from 'lucide-react';
import { DataTable, type DataTableColumn } from './DataTable';
import { exportToExcel } from '../../lib/exportExcel';
import { buildLecturerReportRows, buildStudentReportRows, type LecturerReportRow, type ReportType, type StudentReportRow } from '../../lib/reportData';

export interface ReportsViewProps {
  eyebrow: string;
  scopeDescription: string;
  /** Department ids to include. Undefined = institution-wide. */
  departmentIds?: string[];
  /** If provided, renders a department dropdown that narrows further within departmentIds. */
  departmentOptions?: { id: string; name: string }[];
  /** File name prefix for the downloaded workbook, e.g. "gou-cs-dept". */
  filenamePrefix: string;
  /** VC-style read-only view: hides department/level/course filters, keeps subject + status + search + export. */
  minimal?: boolean;
}

const STUDENT_TYPES: { value: ReportType; label: string }[] = [
  { value: 'all', label: 'All students' },
  { value: 'at_risk', label: 'At risk' },
  { value: 'eligible', label: 'Eligible' },
];
const LECTURER_TYPES: { value: ReportType; label: string }[] = [
  { value: 'all', label: 'All lecturers' },
  { value: 'passing', label: 'Passing' },
  { value: 'failing', label: 'Failing' },
];

function statusClasses(status: string): string {
  if (status === 'At Risk' || status === 'Failing') return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
  return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
}

const selectClass =
  'rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200';

export function ReportsView({ eyebrow, scopeDescription, departmentIds, departmentOptions, filenamePrefix, minimal }: ReportsViewProps) {
  const [subject, setSubject] = useState<'students' | 'lecturers'>('students');
  const [reportType, setReportType] = useState<ReportType>('all');
  const [selectedDept, setSelectedDept] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [query, setQuery] = useState('');

  const effectiveDepartmentIds = useMemo(() => {
    if (selectedDept !== 'all') return [selectedDept];
    return departmentIds;
  }, [selectedDept, departmentIds]);

  const studentRows = useMemo(
    () => (subject === 'students' ? buildStudentReportRows({ departmentIds: effectiveDepartmentIds }, reportType) : []),
    [subject, effectiveDepartmentIds, reportType]
  );
  const lecturerRows = useMemo(
    () => (subject === 'lecturers' ? buildLecturerReportRows({ departmentIds: effectiveDepartmentIds }, reportType) : []),
    [subject, effectiveDepartmentIds, reportType]
  );

  const levels = useMemo(
    () => Array.from(new Set(studentRows.map((r) => r.level).filter((l): l is number => l !== null))).sort((a, b) => a - b),
    [studentRows]
  );
  const courses = useMemo(() => {
    const source = subject === 'students' ? studentRows.map((r) => r.courseCode) : lecturerRows.map((r) => r.courseCode);
    return Array.from(new Set(source)).sort();
  }, [subject, studentRows, lecturerRows]);

  const filteredStudentRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return studentRows
      .filter((r) => levelFilter === 'all' || String(r.level) === levelFilter)
      .filter((r) => courseFilter === 'all' || r.courseCode === courseFilter)
      .filter((r) => !needle || `${r.fullName} ${r.institutionalId} ${r.courseCode}`.toLowerCase().includes(needle));
  }, [studentRows, levelFilter, courseFilter, query]);

  const filteredLecturerRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return lecturerRows
      .filter((r) => courseFilter === 'all' || r.courseCode === courseFilter)
      .filter((r) => !needle || `${r.fullName} ${r.institutionalId} ${r.courseCode}`.toLowerCase().includes(needle));
  }, [lecturerRows, courseFilter, query]);

  const studentColumns: DataTableColumn<StudentReportRow>[] = [
    {
      key: 'fullName',
      header: 'Student',
      sortable: true,
      sortValue: (r) => r.fullName,
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-zinc-900 dark:text-white">{r.fullName}</p>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{r.institutionalId}</p>
        </div>
      ),
    },
    {
      key: 'departmentName',
      header: 'Department',
      sortable: true,
      sortValue: (r) => r.departmentName,
      render: (r) => <span className="text-zinc-600 dark:text-zinc-300">{r.departmentName}</span>,
    },
    {
      key: 'level',
      header: 'Level',
      align: 'center',
      sortable: true,
      sortValue: (r) => r.level ?? 0,
      render: (r) => <span className="text-zinc-600 dark:text-zinc-300">{r.level}L</span>,
    },
    {
      key: 'course',
      header: 'Course',
      sortable: true,
      sortValue: (r) => r.courseCode,
      render: (r) => <span className="text-zinc-600 dark:text-zinc-300">{r.courseCode}</span>,
    },
    {
      key: 'attended',
      header: 'Attended',
      align: 'center',
      render: (r) => (
        <span className="text-zinc-600 dark:text-zinc-300">
          {r.attendedClasses}/{r.totalClasses}
        </span>
      ),
    },
    {
      key: 'pct',
      header: 'Attendance %',
      align: 'right',
      sortable: true,
      sortValue: (r) => r.attendancePct,
      render: (r) => <span className="font-semibold text-zinc-900 dark:text-white">{r.attendancePct}%</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right',
      render: (r) => <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(r.status)}`}>{r.status}</span>,
    },
  ];

  const lecturerColumns: DataTableColumn<LecturerReportRow>[] = [
    {
      key: 'fullName',
      header: 'Lecturer',
      sortable: true,
      sortValue: (r) => r.fullName,
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-zinc-900 dark:text-white">{r.fullName}</p>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{r.institutionalId}</p>
        </div>
      ),
    },
    {
      key: 'departmentName',
      header: 'Department',
      sortable: true,
      sortValue: (r) => r.departmentName,
      render: (r) => <span className="text-zinc-600 dark:text-zinc-300">{r.departmentName}</span>,
    },
    {
      key: 'course',
      header: 'Course',
      sortable: true,
      sortValue: (r) => r.courseCode,
      render: (r) => <span className="text-zinc-600 dark:text-zinc-300">{r.courseCode}</span>,
    },
    {
      key: 'held',
      header: 'Classes Held',
      align: 'center',
      render: (r) => <span className="text-zinc-600 dark:text-zinc-300">{r.totalClasses}</span>,
    },
    {
      key: 'pct',
      header: 'Attendance %',
      align: 'right',
      sortable: true,
      sortValue: (r) => r.attendancePct,
      render: (r) => <span className="font-semibold text-zinc-900 dark:text-white">{r.attendancePct}%</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right',
      render: (r) => <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(r.status)}`}>{r.status}</span>,
    },
  ];

  function handleExport() {
    if (subject === 'students') {
      exportToExcel(`${filenamePrefix}-students-report`, [
        {
          name: 'Students',
          rows: filteredStudentRows.map((r) => ({
            'Student Name': r.fullName,
            'Matric Number': r.institutionalId,
            Department: r.departmentName,
            Level: r.level,
            'Course Code': r.courseCode,
            'Course Title': r.courseTitle,
            'Classes Attended': r.attendedClasses,
            'Total Classes': r.totalClasses,
            'Attendance %': r.attendancePct,
            'Threshold %': r.thresholdPct,
            Status: r.status,
          })),
        },
      ]);
    } else {
      exportToExcel(`${filenamePrefix}-lecturers-report`, [
        {
          name: 'Lecturers',
          rows: filteredLecturerRows.map((r) => ({
            'Lecturer Name': r.fullName,
            'Staff ID': r.institutionalId,
            Department: r.departmentName,
            'Course Code': r.courseCode,
            'Course Title': r.courseTitle,
            'Classes Held': r.totalClasses,
            'Classes Attended': r.attendedClasses,
            'Attendance %': r.attendancePct,
            'Threshold %': r.thresholdPct,
            Status: r.status,
          })),
        },
      ]);
    }
  }

  const typeOptions = subject === 'students' ? STUDENT_TYPES : LECTURER_TYPES;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{eyebrow}</p>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Reports</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{scopeDescription}</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <Download className="h-4 w-4" />
          Download Excel
        </button>
      </div>

      <div className="mb-4 inline-flex rounded-xl border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <button
          type="button"
          onClick={() => {
            setSubject('students');
            setReportType('all');
            setCourseFilter('all');
          }}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
            subject === 'students' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          Students
        </button>
        <button
          type="button"
          onClick={() => {
            setSubject('lecturers');
            setReportType('all');
            setCourseFilter('all');
          }}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
            subject === 'lecturers' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
          }`}
        >
          <GraduationCap className="h-3.5 w-3.5" />
          Lecturers
        </button>
      </div>

      {subject === 'students' ? (
        <DataTable
          columns={studentColumns}
          data={filteredStudentRows}
          getRowId={(r) => `${r.studentId}-${r.courseCode}`}
          searchValue={query}
          onSearchChange={setQuery}
          searchPlaceholder="Search student, matric no., or course…"
          emptyMessage="No students match your filters."
          pageSize={15}
          initialSortKey="fullName"
          toolbarRight={
            <>
              {!minimal && departmentOptions && (
                <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className={selectClass}>
                  <option value="all">All departments</option>
                  {departmentOptions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              )}
              {!minimal && (
                <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className={selectClass}>
                  <option value="all">All levels</option>
                  {levels.map((l) => (
                    <option key={l} value={l}>
                      {l}L
                    </option>
                  ))}
                </select>
              )}
              {!minimal && (
                <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className={selectClass}>
                  <option value="all">All courses</option>
                  {courses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
              <select value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)} className={selectClass}>
                {typeOptions.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </>
          }
        />
      ) : (
        <DataTable
          columns={lecturerColumns}
          data={filteredLecturerRows}
          getRowId={(r) => `${r.lecturerId}-${r.courseCode}`}
          searchValue={query}
          onSearchChange={setQuery}
          searchPlaceholder="Search lecturer, staff ID, or course…"
          emptyMessage="No lecturers match your filters."
          pageSize={15}
          initialSortKey="fullName"
          toolbarRight={
            <>
              {!minimal && departmentOptions && (
                <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className={selectClass}>
                  <option value="all">All departments</option>
                  {departmentOptions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              )}
              {!minimal && (
                <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className={selectClass}>
                  <option value="all">All courses</option>
                  {courses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
              <select value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)} className={selectClass}>
                {typeOptions.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </>
          }
        />
      )}
    </div>
  );
}
