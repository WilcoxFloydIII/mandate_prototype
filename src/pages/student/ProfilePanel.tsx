import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, ShieldCheck, Smartphone } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { getUserById, getDepartmentById } from '../../data/mockData';

export function ProfilePanel() {
  const navigate = useNavigate();
  const userId = useSessionStore((s) => s.currentUserId);
  const student = getUserById(userId)!;
  const department = student.departmentId ? getDepartmentById(student.departmentId) : undefined;

  return (
    <div className="px-4 py-4">
      <button
        type="button"
        onClick={() => navigate('/student/home')}
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 dark:text-zinc-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Home
      </button>

      <div className="mb-5 flex flex-col items-center text-center">
        <span
          className="mb-3 flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold text-white"
          style={{ backgroundColor: student.avatarColor }}
        >
          {student.initials}
        </span>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">{student.fullName}</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {student.institutionalId} · {student.level}L
        </p>
      </div>

      <div className="space-y-2">
        <ProfileRow label="Department" value={department?.name ?? '—'} />
        <ProfileRow icon={Mail} label="Email" value={student.email} />
        <ProfileRow icon={Phone} label="Phone" value={student.phoneMasked} />
        <ProfileRow icon={ShieldCheck} label="Face ID" value={student.faceIdEnrolled ? 'Enrolled' : 'Not enrolled'} tone={student.faceIdEnrolled ? 'good' : 'warn'} />
        {student.deviceModel && <ProfileRow icon={Smartphone} label="Device" value={student.deviceModel} />}
      </div>
    </div>
  );
}

function ProfileRow({ icon: Icon, label, value, tone }: { icon?: typeof Mail; label: string; value: string; tone?: 'good' | 'warn' }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <span className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </span>
      <span
        className={`text-sm font-medium ${
          tone === 'good' ? 'text-emerald-600 dark:text-emerald-400' : tone === 'warn' ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-900 dark:text-white'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
