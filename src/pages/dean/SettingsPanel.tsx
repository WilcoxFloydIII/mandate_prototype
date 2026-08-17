import { Mail, Phone, ShieldCheck } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { getUserById, getFacultyById } from '../../data/mockData';

export function SettingsPanel() {
  const userId = useSessionStore((s) => s.currentUserId);
  const dean = getUserById(userId)!;
  const faculty = dean.facultyId ? getFacultyById(dean.facultyId) : undefined;

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{faculty?.name}</p>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Profile only — the Dean role has no configurable options beyond identity.</p>
      </div>

      <div className="max-w-lg rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center gap-3">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-semibold text-white"
            style={{ backgroundColor: dean.avatarColor }}
          >
            {dean.initials}
          </span>
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">{dean.fullName}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{dean.institutionalId} · Dean</p>
          </div>
        </div>
        <div>
          <ProfileRow icon={Mail} label="Email" value={dean.email} />
          <ProfileRow icon={Phone} label="Phone" value={dean.phoneMasked} />
          <ProfileRow icon={ShieldCheck} label="Face ID" value={dean.faceIdEnrolled ? 'Enrolled' : 'Not enrolled'} />
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-50 py-2.5 text-sm last:border-0 dark:border-zinc-800">
      <span className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="font-medium text-zinc-900 dark:text-white">{value}</span>
    </div>
  );
}
