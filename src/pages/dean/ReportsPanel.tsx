import { ReportsView } from '../../components/shared/ReportsView';
import { useSessionStore } from '../../store/useSessionStore';
import { getUserById, getFacultyById, getDepartmentsForFaculty } from '../../data/mockData';

export function ReportsPanel() {
  const userId = useSessionStore((s) => s.currentUserId);
  const dean = getUserById(userId)!;
  const faculty = getFacultyById(dean.facultyId!)!;
  const facultyDepartments = getDepartmentsForFaculty(faculty.id);

  return (
    <ReportsView
      eyebrow={faculty.name}
      scopeDescription="Faculty-wide attendance reports across every department."
      departmentIds={facultyDepartments.map((d) => d.id)}
      departmentOptions={facultyDepartments.map((d) => ({ id: d.id, name: d.name }))}
      filenamePrefix={`gou-${faculty.shortName.toLowerCase()}`}
    />
  );
}
