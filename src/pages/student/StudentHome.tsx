import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, ChevronRight, QrCode } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { useAttendanceStore } from '../../store/useAttendanceStore';
import {
  getUserById,
  getDepartmentById,
  getCourseUnitsForStudent,
  getThresholdSummariesForStudent,
  getAtRiskSummariesForStudent,
  getTodayClassInstancesForStudent,
  getCourseUnitById,
} from '../../data/mockData';
import { StatusPill, type Status } from '../../components/shared/StatusPill';
import { CheckInModal } from './CheckInModal';
import { CourseDetailDrawer } from './CourseDetailDrawer';
import type { AttendanceThresholdSummary, CourseUnit } from '../../types';

function statusFor(summary: AttendanceThresholdSummary): Status {
  if (!summary.isEligible) return 'at-risk';
  return summary.attendancePct - summary.thresholdPct <= 10 ? 'at-risk' : 'on-track';
}

export function StudentHome() {
  const userId = useSessionStore((s) => s.currentUserId);
  const student = getUserById(userId)!;
  const department = getDepartmentById(student.departmentId!);
  const courses = getCourseUnitsForStudent(student.id);
  const summaries = getThresholdSummariesForStudent(student.id);
  const atRisk = getAtRiskSummariesForStudent(student.id);
  const todayClasses = getTodayClassInstancesForStudent(student.id);
  const nowClass = todayClasses.find((c) => c.status === 'active') ?? todayClasses[0];
  const alreadyCheckedIn = useAttendanceStore((s) => (nowClass ? s.records.some((r) => r.classInstanceId === nowClass.id && r.userId === student.id) : false));

  const [checkInOpen, setCheckInOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseUnit | null>(null);

  const nowCourse = nowClass ? getCourseUnitById(nowClass.courseUnitId) : undefined;

  return (
    <div className="pb-10">
      <div className="bg-zinc-950 px-5 pb-8 pt-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400">
              {department?.shortName} · {student.level} Level
            </p>
            <h1 className="mt-0.5 text-xl font-semibold">{student.fullName}</h1>
          </div>
          <button className="relative rounded-full bg-white/10 p-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400" aria-label="Notifications">
            <Bell className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-[11px] text-zinc-400">Enrolled courses</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums">{courses.length}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-[11px] text-zinc-400">At-risk courses</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums">{atRisk.length}</p>
          </div>
        </div>
      </div>

      <div className="-mt-4 space-y-4 px-4">
        {nowClass && nowCourse && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{nowClass.status === 'active' ? 'Now' : 'Next'}</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                  {nowCourse.code} · {nowCourse.title}
                </p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {nowClass.buildingName} · {nowClass.venueName}
                </p>
              </div>
              {nowClass.status === 'active' &&
                (alreadyCheckedIn ? (
                  <StatusPill status="verified" />
                ) : (
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <button
                      onClick={() => setCheckInOpen(true)}
                      className="flex items-center gap-1.5 rounded-full bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                    >
                      <QrCode className="h-3.5 w-3.5" aria-hidden="true" /> Check In
                    </button>
                    <Link
                      to={`/student/checkin/manual/${nowClass.id}`}
                      className="text-[11px] font-medium text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                    >
                      Trouble checking in?
                    </Link>
                  </div>
                ))}
            </div>
          </motion.div>
        )}

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Your courses</p>
          <div className="mt-3 space-y-2.5">
            {summaries.map((s) => {
              const course = courses.find((c) => c.id === s.courseUnitId);
              if (!course) return null;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedCourse(course)}
                  className="flex w-full items-center justify-between rounded-xl bg-zinc-50 px-3 py-2.5 text-left transition-colors hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:bg-zinc-800 dark:hover:bg-zinc-800/70"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{course.code}</p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{course.title}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusPill status={statusFor(s)} />
                    <span className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-white">{Math.round(s.attendancePct)}%</span>
                    <ChevronRight className="h-4 w-4 text-zinc-300 dark:text-zinc-600" aria-hidden="true" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {nowClass && nowCourse && (
        <CheckInModal open={checkInOpen} onClose={() => setCheckInOpen(false)} student={student} classInstance={nowClass} course={nowCourse} />
      )}
      <CourseDetailDrawer open={!!selectedCourse} onClose={() => setSelectedCourse(null)} student={student} course={selectedCourse} />
    </div>
  );
}
