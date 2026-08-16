export interface TimetableBlock {
  id: string;
  /** ISO weekday: 1=Mon..5=Fri */
  dayOfWeek: number[];
  startHour: number;
  endHour: number;
  title: string;
  subtitle: string;
  tone?: 'default' | 'pending' | 'rejected';
  onClick?: () => void;
}

export interface TimetableGridProps {
  blocks: TimetableBlock[];
  startHour?: number;
  endHour?: number;
}

const DAYS: { iso: number; label: string }[] = [
  { iso: 1, label: 'Mon' },
  { iso: 2, label: 'Tue' },
  { iso: 3, label: 'Wed' },
  { iso: 4, label: 'Thu' },
  { iso: 5, label: 'Fri' },
];

const TONE_CLASSES: Record<NonNullable<TimetableBlock['tone']>, string> = {
  default: 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-800/70',
  pending: 'border-amber-200 bg-amber-50 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:hover:bg-amber-500/20',
  rejected: 'border-rose-200 bg-rose-50 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:hover:bg-rose-500/20',
};

export function TimetableGrid({ blocks, startHour, endHour }: TimetableGridProps) {
  const minHour = startHour ?? Math.min(8, ...blocks.map((b) => b.startHour));
  const maxHour = endHour ?? Math.max(17, ...blocks.map((b) => b.endHour));
  const hourCount = Math.max(1, maxHour - minHour);
  const hours = Array.from({ length: hourCount }, (_, i) => minHour + i);

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div
        className="grid min-w-[760px]"
        style={{ gridTemplateColumns: `72px repeat(${DAYS.length}, 1fr)`, gridTemplateRows: `40px repeat(${hourCount}, 56px)` }}
      >
        <div className="sticky left-0 z-10 border-b border-r border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900" style={{ gridColumn: 1, gridRow: 1 }} />
        {DAYS.map((day, i) => (
          <div
            key={day.iso}
            className="flex items-center justify-center border-b border-l border-zinc-100 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400"
            style={{ gridColumn: i + 2, gridRow: 1 }}
          >
            {day.label}
          </div>
        ))}

        {hours.map((hour, i) => (
          <div
            key={`label-${hour}`}
            className="sticky left-0 z-10 flex items-start justify-end border-r border-t border-zinc-100 bg-white pr-2 pt-1 text-[11px] text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500"
            style={{ gridColumn: 1, gridRow: i + 2 }}
          >
            {String(hour).padStart(2, '0')}:00
          </div>
        ))}

        {hours.map((hour, i) =>
          DAYS.map((day, dayIdx) => (
            <div
              key={`cell-${hour}-${day.iso}`}
              className="border-l border-t border-zinc-100 dark:border-zinc-800"
              style={{ gridColumn: dayIdx + 2, gridRow: i + 2 }}
            />
          ))
        )}

        {blocks.flatMap((block) =>
          block.dayOfWeek
            .map((iso) => DAYS.findIndex((d) => d.iso === iso))
            .filter((dayIdx) => dayIdx !== -1)
            .map((dayIdx) => {
              const startRow = block.startHour - minHour + 2;
              const span = Math.max(1, block.endHour - block.startHour);
              return (
                <button
                  key={`${block.id}-${dayIdx}`}
                  type="button"
                  onClick={block.onClick}
                  disabled={!block.onClick}
                  className={`m-0.5 flex flex-col justify-start overflow-hidden rounded-lg border px-2 py-1.5 text-left text-xs transition-colors ${
                    TONE_CLASSES[block.tone ?? 'default']
                  } ${block.onClick ? 'cursor-pointer' : 'cursor-default'}`}
                  style={{ gridColumn: dayIdx + 2, gridRow: `${startRow} / span ${span}` }}
                >
                  <span className="truncate font-semibold text-zinc-900 dark:text-white">{block.title}</span>
                  <span className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">{block.subtitle}</span>
                </button>
              );
            })
        )}
      </div>
    </div>
  );
}
