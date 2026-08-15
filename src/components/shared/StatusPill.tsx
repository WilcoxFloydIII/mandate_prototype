export type Status = 'on-track' | 'at-risk' | 'verified' | 'confirmed' | 'unverified' | 'disputed' | 'absent' | 'rejected' | 'eligible';

// Filled = resolved/good. Outlined = needs attention. This is a second signal
// beyond hue alone, so status still reads for colour-blind viewers.
const STYLES: Record<Status, { dot: string; classes: string; label: string }> = {
  'on-track': { dot: 'bg-emerald-500', classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', label: 'On track' },
  eligible: { dot: 'bg-emerald-500', classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', label: 'Eligible' },
  verified: { dot: 'bg-emerald-500', classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', label: 'Verified' },
  confirmed: { dot: 'bg-emerald-500', classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', label: 'Confirmed' },
  'at-risk': { dot: 'bg-amber-500', classes: 'border border-amber-300 text-amber-700 dark:border-amber-500/50 dark:text-amber-400', label: 'At risk' },
  unverified: { dot: 'bg-amber-500', classes: 'border border-amber-300 text-amber-700 dark:border-amber-500/50 dark:text-amber-400', label: 'Unverified' },
  disputed: { dot: 'bg-amber-500', classes: 'border border-amber-300 text-amber-700 dark:border-amber-500/50 dark:text-amber-400', label: 'Disputed' },
  absent: { dot: 'bg-red-500', classes: 'border border-red-300 text-red-700 dark:border-red-500/50 dark:text-red-400', label: 'Absent' },
  rejected: { dot: 'bg-red-500', classes: 'border border-red-300 text-red-700 dark:border-red-500/50 dark:text-red-400', label: 'Rejected' },
};

export function StatusPill({ status, label }: { status: Status; label?: string }) {
  const s = STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${s.classes}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {label ?? s.label}
    </span>
  );
}
