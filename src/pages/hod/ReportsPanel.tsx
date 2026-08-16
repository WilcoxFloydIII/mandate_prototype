import { ReportsView } from '../../components/shared/ReportsView';
import { useSessionStore } from '../../store/useSessionStore';
import { getUserById, getDepartmentById } from '../../data/mockData';

export function ReportsPanel() {
  const userId = useSessionStore((s) => s.currentUserId);
  const hod = getUserById(userId)!;
  const department = getDepartmentById(hod.departmentId!)!;

  return (
    <ReportsView
      eyebrow={department.name}
      scopeDescription="Department-scoped student and lecturer attendance reports."
      departmentIds={[department.id]}
      filenamePrefix={`gou-${department.shortName.toLowerCase()}`}
    />
  );
}
