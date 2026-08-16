export type CalendarEventStatus = 'verified' | 'unverified' | 'absent' | 'none';

export interface CalendarEvent {
  id: string;
  label: string;
  status: CalendarEventStatus;
}

export interface CalendarGridProps {
  year: number;
  /** 0-11 */
  month: number;
  eventsByDate: Record<string, CalendarEvent[]>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STATUS_DOT: Record<CalendarEventStatus, string> = {
  verified: 'bg-emerald-500',
  unverified: 'bg-amber-500',
  absent: 'bg-rose-500',
  none: 'bg-zinc-300 dark:bg-zinc-600',
};

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function CalendarGrid({ year, month, eventsByDate, selectedDate, onSelectDate }: CalendarGridProps) {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = toDateKey(new Date());

  const cells: (string | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => toDateKey(new Date(year, month, i + 1))),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((dateKey, i) => {
          if (!dateKey) return <div key={`empty-${i}`} />;
          const events = eventsByDate[dateKey] ?? [];
          const dayNum = Number(dateKey.slice(-2));
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDate;
          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelectDate(dateKey)}
              disabled={events.length === 0}
              className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl text-xs transition-colors ${
                isSelected
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : isToday
                    ? 'bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-white'
                    : events.length > 0
                      ? 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800'
                      : 'text-zinc-300 dark:text-zinc-700'
              }`}
            >
              <span>{dayNum}</span>
              {events.length > 0 && (
                <span className="flex gap-0.5">
                  {events.slice(0, 3).map((e) => (
                    <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[e.status]}`} />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 border-t border-zinc-100 pt-3 text-[11px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <Legend colorClass={STATUS_DOT.verified} label="Verified" />
        <Legend colorClass={STATUS_DOT.unverified} label="Unverified" />
        <Legend colorClass={STATUS_DOT.absent} label="Absent" />
        <Legend colorClass={STATUS_DOT.none} label="No class" />
      </div>
    </div>
  );
}

function Legend({ colorClass, label }: { colorClass: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${colorClass}`} />
      {label}
    </span>
  );
}
