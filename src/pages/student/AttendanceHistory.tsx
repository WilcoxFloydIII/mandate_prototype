import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Clock, MinusCircle, XCircle } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { getUserById, getCourseUnitsForStudent, getClassInstancesForCourse, getAttendanceRecordsForClassInstance } from '../../data/mockData';
import { CalendarGrid, type CalendarEvent, type CalendarEventStatus } from '../../components/shared/CalendarGrid';
import { presenceMethodLabel } from '../../lib/formatters';

interface DayItem {
  id: string;
  courseCode: string;
  courseTitle: string;
  venueName: string;
  time: string;
  status: CalendarEventStatus;
  presenceMethod?: string;
}

function dateKeyOf(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function AttendanceHistory() {
  const navigate = useNavigate();
  const userId = useSessionStore((s) => s.currentUserId);
  const student = getUserById(userId)!;
  const courses = getCourseUnitsForStudent(student.id);

  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const dayItemsByDate = useMemo(() => {
    const map: Record<string, DayItem[]> = {};
    for (const course of courses) {
      const instances = getClassInstancesForCourse(course.id);
      for (const instance of instances) {
        const key = dateKeyOf(instance.classStartAt);
        const records = getAttendanceRecordsForClassInstance(instance.id).filter((r) => r.userId === student.id);
        const record = records[0];

        let status: CalendarEventStatus = 'none';
        if (instance.status === 'completed') {
          if (!record) {
            status = 'absent';
          } else if (record.verificationStatus === 'verified' || record.verificationStatus === 'confirmed') {
            status = 'verified';
          } else if (record.verificationStatus === 'rejected') {
            status = 'absent';
          } else {
            status = 'unverified';
          }
        }

        const item: DayItem = {
          id: instance.id,
          courseCode: course.code,
          courseTitle: course.title,
          venueName: instance.venueName,
          time: new Date(instance.classStartAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
          status,
          presenceMethod: record?.presenceMethod,
        };
        if (!map[key]) map[key] = [];
        map[key].push(item);
      }
    }
    return map;
  }, [courses, student.id]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const [date, items] of Object.entries(dayItemsByDate)) {
      map[date] = items.map((i) => ({ id: i.id, label: i.courseCode, status: i.status }));
    }
    return map;
  }, [dayItemsByDate]);

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const selectedItems = selectedDate ? dayItemsByDate[selectedDate] ?? [] : [];

  function shiftMonth(delta: number) {
    setSelectedDate(null);
    setCursor((c) => {
      const next = new Date(c.year, c.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

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
      <h1 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-white">Attendance History</h1>

      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month" className="rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold text-zinc-900 dark:text-white">{monthLabel}</p>
        <button type="button" onClick={() => shiftMonth(1)} aria-label="Next month" className="rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <CalendarGrid year={cursor.year} month={cursor.month} eventsByDate={eventsByDate} selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      {selectedDate && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          {selectedItems.length === 0 ? (
            <p className="rounded-xl border border-zinc-200 bg-white px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              No scheduled classes.
            </p>
          ) : (
            <ul className="space-y-2">
              {selectedItems.map((item) => (
                <li key={item.id} className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <StatusIcon status={item.status} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                      {item.courseCode} · {item.courseTitle}
                    </p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {item.time} · {item.venueName}
                      {item.presenceMethod && ` · ${presenceMethodLabel(item.presenceMethod)}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: CalendarEventStatus }) {
  if (status === 'verified') return <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />;
  if (status === 'unverified') return <Clock className="h-5 w-5 shrink-0 text-amber-500" />;
  if (status === 'absent') return <XCircle className="h-5 w-5 shrink-0 text-rose-500" />;
  return <MinusCircle className="h-5 w-5 shrink-0 text-zinc-300 dark:text-zinc-600" />;
}
