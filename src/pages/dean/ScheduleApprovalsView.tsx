import { useMemo } from 'react';
import { Eye } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { useScheduleStore } from '../../store/useScheduleStore';
import { getUserById, getFacultyById, getDepartmentsForFaculty, getCourseUnitById, getDepartmentById } from '../../data/mockData';
import { DataTable, type DataTableColumn } from '../../components/shared/DataTable';
import type { ScheduledClassSubmission } from '../../types';

const WEEKDAY_LABELS: Record<number, string> = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri' };

const STATUS_CLASSES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  approved: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  rejected: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
};

export function ScheduleApprovalsView() {
  const userId = useSessionStore((s) => s.currentUserId);
  const dean = getUserById(userId)!;
  const faculty = getFacultyById(dean.facultyId!)!;
  const facultyDepartments = getDepartmentsForFaculty(faculty.id);
  const submissions = useScheduleStore((s) => s.submissions);

  const facultySubmissions = useMemo(() => {
    const deptIds = new Set(facultyDepartments.map((d) => d.id));
    return submissions
      .filter((s) => {
        const course = getCourseUnitById(s.courseUnitId);
        return course ? deptIds.has(course.departmentId) : false;
      })
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }, [submissions, facultyDepartments]);

  const pendingCount = facultySubmissions.filter((s) => s.approvalStatus === 'pending').length;
  const approvedCount = facultySubmissions.filter((s) => s.approvalStatus === 'approved').length;
  const rejectedCount = facultySubmissions.filter((s) => s.approvalStatus === 'rejected').length;

  const columns: DataTableColumn<ScheduledClassSubmission>[] = [
    {
      key: 'course',
      header: 'Course',
      sortable: true,
      sortValue: (s) => getCourseUnitById(s.courseUnitId)?.code ?? '',
      render: (s) => {
        const course = getCourseUnitById(s.courseUnitId);
        return (
          <div className="min-w-0">
            <p className="truncate font-medium text-zinc-900 dark:text-white">{course?.code ?? 'Course'}</p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{course ? getDepartmentById(course.departmentId)?.shortName : ''}</p>
          </div>
        );
      },
    },
    {
      key: 'lecturer',
      header: 'Submitted by',
      sortable: true,
      sortValue: (s) => getUserById(s.submittedBy)?.fullName ?? '',
      render: (s) => <span className="text-zinc-600 dark:text-zinc-300">{getUserById(s.submittedBy)?.fullName ?? '—'}</span>,
    },
    {
      key: 'slot',
      header: 'Proposed slot',
      render: (s) => (
        <span className="text-zinc-600 dark:text-zinc-300">
          {s.dayOfWeek.map((d) => WEEKDAY_LABELS[d]).join('/')} · {String(s.startHour).padStart(2, '0')}:00–{String(s.endHour).padStart(2, '0')}:00 · {s.venueName}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right',
      sortable: true,
      sortValue: (s) => s.approvalStatus,
      render: (s) => <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_CLASSES[s.approvalStatus]}`}>{s.approvalStatus}</span>,
    },
  ];

  return (
    <div>
      <div className="mb-2">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{faculty.name}</p>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Schedule Approvals</h1>
      </div>
      <div className="mb-6 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
        <Eye className="h-4 w-4 shrink-0 text-zinc-400" />
        View only — approvals are managed at department level.
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{pendingCount}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Pending</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{approvedCount}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Approved</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-2xl font-semibold text-rose-600 dark:text-rose-400">{rejectedCount}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Rejected</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={facultySubmissions}
        getRowId={(s) => s.id}
        pageSize={12}
        emptyMessage="No schedule submissions across this faculty yet."
        initialSortKey="course"
      />
    </div>
  );
}
