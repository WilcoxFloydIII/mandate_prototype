import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, AlertTriangle, GraduationCap } from 'lucide-react';
import { getFacultyById, getFacultySnapshot, getDepartmentComparison } from '../../data/mockData';
import { ComparisonChart } from '../../components/shared/ComparisonChart';
import { KPICard } from '../../components/shared/KPICard';

export function FacultyDrilldown() {
  const { facultyId } = useParams<{ facultyId: string }>();
  const navigate = useNavigate();
  const faculty = facultyId ? getFacultyById(facultyId) : undefined;

  if (!faculty) {
    return (
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Faculty not found.</p>
        <button onClick={() => navigate('/vc/dashboard')} className="mt-3 rounded text-sm font-medium text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:text-blue-400">
          Back to institution summary
        </button>
      </div>
    );
  }

  const snapshot = getFacultySnapshot(faculty.id);
  const comparison = getDepartmentComparison(faculty.id);

  return (
    <div>
      <Link
        to="/vc/dashboard"
        className="mb-4 flex items-center gap-1.5 rounded text-sm font-medium text-zinc-500 hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:text-zinc-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to institution summary
      </Link>
      <div className="mb-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Faculty Drill-down · Read-only</p>
        <h1 className="text-balance text-2xl font-semibold text-zinc-900 dark:text-white">{faculty.name}</h1>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <KPICard label="Faculty attendance" value={`${snapshot.avgAttendancePct}%`} icon={Building2} tone={snapshot.avgAttendancePct >= 75 ? 'good' : 'warn'} />
        <KPICard label="Students at risk" value={snapshot.studentsAtRisk} icon={AlertTriangle} tone={snapshot.studentsAtRisk > 0 ? 'warn' : 'good'} />
        <KPICard label="Lecturer compliance" value={`${snapshot.lecturerCompliancePct}%`} icon={GraduationCap} tone={snapshot.lecturerCompliancePct >= 75 ? 'good' : 'warn'} />
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-semibold text-zinc-900 dark:text-white">Department comparison</p>
        <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">Same component the Dean uses — read only from here</p>
        <ComparisonChart data={comparison} />
      </div>
    </div>
  );
}
