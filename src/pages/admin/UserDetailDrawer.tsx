import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Mail, Phone, ShieldCheck, Smartphone, TrendingUp } from 'lucide-react';
import {
  getUserById,
  getDepartmentById,
  getFacultyById,
  getStudentOverview,
  getLecturerOverview,
  getCourseUnitsForLecturer,
  getThresholdSummariesForStudent,
  getCourseUnitById,
} from '../../data/mockData';
import { KPICard } from '../../components/shared/KPICard';
import type { UserRole } from '../../types';

const ROLE_LABELS: Record<UserRole, string> = {
  vice_chancellor: 'Vice-Chancellor',
  dean: 'Dean',
  hod: 'Head of Department',
  lecturer: 'Lecturer',
  student: 'Student',
  system_admin: 'System Administrator',
};

export function UserDetailDrawer() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const user = userId ? getUserById(userId) : undefined;

  if (!user) {
    return <Navigate to="/admin/users" replace />;
  }

  const department = user.departmentId ? getDepartmentById(user.departmentId) : undefined;
  const faculty = user.facultyId ? getFacultyById(user.facultyId) : undefined;
  const superior = user.directSuperiorId ? getUserById(user.directSuperiorId) : undefined;

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/admin/users')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </button>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
          style={{ backgroundColor: user.avatarColor }}
        >
          {user.initials}
        </span>
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">{user.fullName}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {ROLE_LABELS[user.role]} · {user.institutionalId}
          </p>
        </div>
        <span
          className={`ml-auto rounded-full px-2.5 py-1 text-xs font-semibold ${
            user.isActive
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
          }`}
        >
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ProfileField icon={Mail} label="Email" value={user.email} />
        <ProfileField icon={Phone} label="Phone" value={user.phoneMasked} />
        <ProfileField icon={ShieldCheck} label="Face ID" value={user.faceIdEnrolled ? 'Enrolled' : 'Not enrolled'} />
        <ProfileField label="Department" value={department?.name ?? '—'} />
        <ProfileField label="Faculty" value={faculty?.name ?? '—'} />
        <ProfileField label="Reports to" value={superior?.fullName ?? '—'} />
        {user.level !== null && <ProfileField label="Level" value={`${user.level}L`} />}
        {user.deviceModel && <ProfileField icon={Smartphone} label="Device" value={user.deviceModel} />}
      </div>

      {user.role === 'student' && <StudentAttendanceSection studentId={user.id} />}
      {user.role === 'lecturer' && <LecturerAttendanceSection lecturerId={user.id} />}
    </div>
  );
}

function ProfileField({ icon: Icon, label, value }: { icon?: typeof Mail; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </p>
      <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{value}</p>
    </div>
  );
}

function StudentAttendanceSection({ studentId }: { studentId: string }) {
  const overview = getStudentOverview(studentId);
  const summaries = getThresholdSummariesForStudent(studentId);
  return (
    <div>
      <div className="mb-4 grid grid-cols-3 gap-4">
        <KPICard
          label="Overall attendance"
          value={`${overview.overallAttendancePct}%`}
          icon={TrendingUp}
          tone={overview.overallAttendancePct >= 75 ? 'good' : 'warn'}
          hint="75% NUC threshold"
        />
        <KPICard label="Courses enrolled" value={overview.coursesEnrolled} icon={BookOpen} tone="neutral" />
        <KPICard label="Courses at risk" value={overview.coursesAtRisk} icon={ShieldCheck} tone={overview.coursesAtRisk > 0 ? 'warn' : 'good'} />
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 px-5 py-3.5 dark:border-zinc-800">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">Per-course breakdown</p>
        </div>
        <ul className="divide-y divide-zinc-50 dark:divide-zinc-800">
          {summaries.map((s) => {
            const course = getCourseUnitById(s.courseUnitId);
            if (!course) return null;
            return (
              <li key={s.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                  {course.code} · {course.title}
                </p>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    s.isEligible
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                  }`}
                >
                  {s.attendancePct}%
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function LecturerAttendanceSection({ lecturerId }: { lecturerId: string }) {
  const overview = getLecturerOverview(lecturerId);
  const courses = getCourseUnitsForLecturer(lecturerId);
  return (
    <div>
      <div className="mb-4 grid grid-cols-3 gap-4">
        <KPICard
          label="Attendance rate"
          value={`${overview.overallAttendancePct}%`}
          icon={TrendingUp}
          tone={overview.meetsThreshold ? 'good' : 'warn'}
          hint="75% NUC threshold"
        />
        <KPICard label="Courses taught" value={overview.coursesTaught} icon={BookOpen} tone="neutral" />
        <KPICard label="Classes held" value={overview.classesHeld} icon={ShieldCheck} tone="neutral" />
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 px-5 py-3.5 dark:border-zinc-800">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">Courses taught</p>
        </div>
        <ul className="divide-y divide-zinc-50 dark:divide-zinc-800">
          {courses.map((c) => (
            <li key={c.id} className="px-5 py-3 text-sm font-medium text-zinc-900 dark:text-white">
              {c.code} · {c.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
