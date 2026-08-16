import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import type { NewScheduleInput } from '../../store/useScheduleStore';
import type { AttendanceMode, CourseUnit, User } from '../../types';

const WEEKDAYS = [
  { iso: 1, label: 'Mon' },
  { iso: 2, label: 'Tue' },
  { iso: 3, label: 'Wed' },
  { iso: 4, label: 'Thu' },
  { iso: 5, label: 'Fri' },
];
const HOURS = Array.from({ length: 10 }, (_, i) => 8 + i); // 08:00..17:00

const fieldClass =
  'mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-600';

export interface ScheduleFormOverlayProps {
  courses: CourseUnit[];
  lecturers: User[];
  onSubmit: (input: NewScheduleInput) => void;
  onClose: () => void;
  submitLabel?: string;
  helperText?: string;
}

export function ScheduleFormOverlay({ courses, lecturers, onSubmit, onClose, submitLabel = 'Submit', helperText }: ScheduleFormOverlayProps) {
  const [courseUnitId, setCourseUnitId] = useState(courses[0]?.id ?? '');
  const course = useMemo(() => courses.find((c) => c.id === courseUnitId), [courses, courseUnitId]);
  const [lecturerId, setLecturerId] = useState(course?.lecturerIds[0] ?? lecturers[0]?.id ?? '');
  const [days, setDays] = useState<number[]>([1]);
  const [startHour, setStartHour] = useState(8);
  const [endHour, setEndHour] = useState(10);
  const [venueName, setVenueName] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [mode, setMode] = useState<AttendanceMode>('window');

  const canSubmit = Boolean(courseUnitId && lecturerId && days.length > 0 && startHour < endHour && venueName.trim() && buildingName.trim());

  function toggleDay(iso: number) {
    setDays((prev) => (prev.includes(iso) ? prev.filter((d) => d !== iso) : [...prev, iso].sort((a, b) => a - b)));
  }

  function handleCourseChange(id: string) {
    setCourseUnitId(id);
    const next = courses.find((c) => c.id === id);
    if (next) setLecturerId(next.lecturerIds[0] ?? lecturers[0]?.id ?? '');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl dark:bg-zinc-900">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Propose a class slot</p>
            {helperText && <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{helperText}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Course
            <select value={courseUnitId} onChange={(e) => handleCourseChange(e.target.value)} className={fieldClass}>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} · {c.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Lecturer
            <select value={lecturerId} onChange={(e) => setLecturerId(e.target.value)} className={fieldClass}>
              {lecturers.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.fullName}
                </option>
              ))}
            </select>
          </label>

          <div>
            <p className="mb-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">Days</p>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map((d) => (
                <button
                  key={d.iso}
                  type="button"
                  onClick={() => toggleDay(d.iso)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    days.includes(d.iso)
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Start
              <select value={startHour} onChange={(e) => setStartHour(Number(e.target.value))} className={fieldClass}>
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, '0')}:00
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              End
              <select value={endHour} onChange={(e) => setEndHour(Number(e.target.value))} className={fieldClass}>
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, '0')}:00
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Venue
              <input value={venueName} onChange={(e) => setVenueName(e.target.value)} placeholder="e.g. CS Lab 2" className={fieldClass} />
            </label>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Building
              <input value={buildingName} onChange={(e) => setBuildingName(e.target.value)} placeholder="e.g. Engineering Complex" className={fieldClass} />
            </label>
          </div>

          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Attendance mode
            <select value={mode} onChange={(e) => setMode(e.target.value as AttendanceMode)} className={fieldClass}>
              <option value="window">Window</option>
              <option value="duration">Duration</option>
            </select>
          </label>
        </div>

        {startHour >= endHour && <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">End time must be after start time.</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 px-3.5 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() =>
              onSubmit({
                courseUnitId,
                lecturerId,
                dayOfWeek: days,
                startHour,
                endHour,
                venueName: venueName.trim(),
                buildingName: buildingName.trim(),
                attendanceMode: mode,
              })
            }
            className="rounded-xl bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
