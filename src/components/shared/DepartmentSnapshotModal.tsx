import { Modal } from './Modal';
import { getDepartmentSnapshot, getUserById } from '../../data/mockData';
import type { Department } from '../../types';

export function DepartmentSnapshotModal({ department, onClose }: { department: Department | null; onClose: () => void }) {
  const snapshot = department ? getDepartmentSnapshot(department.id) : null;
  const hod = department?.hodId ? getUserById(department.hodId) : null;

  return (
    <Modal open={!!department} onClose={onClose} title={department?.name}>
      {department && snapshot && (
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Head of Department: {hod?.fullName ?? '—'}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Attendance</p>
              <p className={`mt-0.5 text-xl font-semibold ${snapshot.avgAttendancePct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {snapshot.avgAttendancePct}%
              </p>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Students at risk</p>
              <p className="mt-0.5 text-xl font-semibold text-zinc-900 dark:text-white">{snapshot.studentsAtRisk}</p>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Lecturer compliance</p>
              <p className="mt-0.5 text-xl font-semibold text-zinc-900 dark:text-white">{snapshot.lecturerCompliancePct}%</p>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Classes today</p>
              <p className="mt-0.5 text-xl font-semibold text-zinc-900 dark:text-white">{snapshot.classesToday}</p>
            </div>
          </div>
          <p className="mt-4 text-[11px] text-zinc-400 dark:text-zinc-500">Read-only — the same rendered view an HOD sees, scoped to your viewing authority.</p>
        </div>
      )}
    </Modal>
  );
}
