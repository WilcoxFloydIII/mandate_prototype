import type { LucideIcon } from 'lucide-react';

type Tone = 'good' | 'warn' | 'bad' | 'neutral';

const TONE_STYLES: Record<Tone, string> = {
  good: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/15',
  warn: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/15',
  bad: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/15',
  neutral: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/15',
};

export function KPICard({
  label,
  value,
  icon: Icon,
  tone = 'neutral',
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: Tone;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${TONE_STYLES[tone]}`}>
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-white">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">{hint}</p>}
    </div>
  );
}
