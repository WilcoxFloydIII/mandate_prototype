import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { useScheduleStore } from '../../store/useScheduleStore';
import { courseUnits, departments, getCourseUnitById, getDepartmentById, getUserById, getUsersByRole } from '../../data/mockData';
import { TimetableGrid, type TimetableBlock } from '../../components/shared/TimetableGrid';
import { ScheduleFormOverlay } from '../../components/shared/ScheduleFormOverlay';

export function TimetablePanel() {
  const userId = useSessionStore((s) => s.currentUserId);
  const admin = getUserById(userId)!;
  const submissions = useScheduleStore((s) => s.submissions);
  const submit = useScheduleStore((s) => s.submit);

  const [deptFilter, setDeptFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const scopedCourseIds = useMemo(() => {
    if (deptFilter === 'all') return null;
    return new Set(courseUnits.filter((c) => c.departmentId === deptFilter).map((c) => c.id));
  }, [deptFilter]);

  const approved = submissions.filter((s) => s.approvalStatus === 'approved' && (!scopedCourseIds || scopedCourseIds.has(s.courseUnitId)));

  const blocks: TimetableBlock[] = approved.map((s) => {
    const course = getCourseUnitById(s.courseUnitId)!;
    const department = getDepartmentById(course.departmentId);
    return {
      id: s.id,
      dayOfWeek: s.dayOfWeek,
      startHour: s.startHour,
      endHour: s.endHour,
      title: course.code,
      subtitle: `${department?.shortName ?? ''} · ${s.venueName}`,
    };
  });

  const allLecturers = getUsersByRole('lecturer');
  const formCourses = deptFilter === 'all' ? courseUnits : courseUnits.filter((c) => c.departmentId === deptFilter);
  const formLecturers = deptFilter === 'all' ? allLecturers : allLecturers.filter((l) => l.departmentId === deptFilter);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Institution Console</p>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Timetable Editor</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Institution-wide grid — System Admin changes are auto-approved.</p>
        </div>
        <div className="flex items-center gap-2">
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
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            Add class
          </button>
        </div>
      </div>

      <TimetableGrid blocks={blocks} />

      {showAddForm && (
        <ScheduleFormOverlay
          courses={formCourses}
          lecturers={formLecturers}
          submitLabel="Add to timetable"
          helperText="System Admin changes are auto-approved — no review queue."
          onClose={() => setShowAddForm(false)}
          onSubmit={(input) => {
            submit(input, admin.id, true);
            setShowAddForm(false);
          }}
        />
      )}
    </div>
  );
}
