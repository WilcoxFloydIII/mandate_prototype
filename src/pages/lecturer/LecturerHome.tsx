import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, Radio, Users2 } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import {
  getUserById,
  getDepartmentById,
  getCourseUnitsForLecturer,
  getTodayClassInstancesForLecturer,
  getCourseComplianceSnapshot,
} from '../../data/mockData';

export function LecturerHome() {
  const navigate = useNavigate();
  const userId = useSessionStore((s) => s.currentUserId);
  const lecturer = getUserById(userId)!;
  const department = getDepartmentById(lecturer.departmentId!);
  const courses = getCourseUnitsForLecturer(lecturer.id);
  const todayClasses = getTodayClassInstancesForLecturer(lecturer.id);
  const nowClass = todayClasses.find((c) => c.status === 'active') ?? todayClasses[0];

  return (
    <div className="pb-10">
      <div className="bg-zinc-950 px-5 pb-8 pt-6 text-white">
        <div className="flex items-center justify-between">
          <Link to="/lecturer/profile" className="rounded-lg transition-opacity hover:opacity-80" aria-label="View profile">
            <p className="text-xs text-zinc-400">{department?.shortName} · Lecturer</p>
            <h1 className="mt-0.5 text-xl font-semibold">{lecturer.fullName}</h1>
          </Link>
          <Link 
  to="/lecturer/notifications" 
  className="relative rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors block"
  aria-label="Notifications"
>

            <Bell className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link
            to="/lecturer/courses"
            className="rounded-xl bg-white/5 p-3 hover:bg-white/10 transition-colors block"
            aria-label={`Courses taught: ${courses.length}. View all courses`}
          >
            <p className="text-[11px] text-zinc-400">Courses taught</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums">{courses.length}</p>
          </Link>
          <Link
            to="/lecturer/schedule"
            className="rounded-xl bg-white/5 p-3 hover:bg-white/10 transition-colors block"
            aria-label={`Classes today: ${todayClasses.length}. View schedule`}
          >
            <p className="text-[11px] text-zinc-400">Classes today</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums">{todayClasses.length}</p>
          </Link>

        </div>
      </div>

      <div id="active-class-section" className="mt-4 space-y-4 px-4">
        {nowClass && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{nowClass.status === 'active' ? 'Now' : 'Up next'}</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                  {courses.find((c) => c.id === nowClass.courseUnitId)?.code} · {courses.find((c) => c.id === nowClass.courseUnitId)?.title}
                </p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {nowClass.buildingName} · {nowClass.venueName}
                </p>
              </div>
              {nowClass.status === 'active' && (
                <button
                  onClick={() => navigate(`/lecturer/session/${nowClass.id}/broadcast`)}
                  className="flex shrink-0 items-center gap-1.5 rounded-full bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                >
                  <Radio className="h-3.5 w-3.5" aria-hidden="true" /> Start Attendance
                </button>
              )}
            </div>
          </motion.div>
        )}

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">My courses</p>
            <Link
              to="/lecturer/history"
              className="flex items-center gap-0.5 text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              aria-label="View attendance history"
            >
              History <ChevronRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-3 space-y-2.5">
            {courses.map((course) => {
              const snapshot = getCourseComplianceSnapshot(course.id);
              const isCoTaught = course.lecturerIds.length > 1;
              return (
                <Link 
  key={course.id} 
  to={`/lecturer/courses?id=${course.id}`}
  className="flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors block"
  aria-label={`View ${course.code} details`}
>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                      {course.code}
                      {isCoTaught && (
                        <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] font-normal text-zinc-400 dark:text-zinc-500">
                          <Users2 className="h-2.5 w-2.5" aria-hidden="true" /> co-taught
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                      {snapshot.enrolledCount} students · class avg {snapshot.avgAttendancePct}%
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {snapshot.atRiskCount > 0 && (
                      <span className="rounded-full border border-amber-300 px-2 py-0.5 text-[11px] font-medium tabular-nums text-amber-700 dark:border-amber-500/50 dark:text-amber-400">
                        {snapshot.atRiskCount} at risk
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-zinc-300 dark:text-zinc-600" aria-hidden="true" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
