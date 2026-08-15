import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { FakeQRCode } from '../../components/shared/FakeQRCode';
import { useAttendanceStore } from '../../store/useAttendanceStore';
import { getClassInstanceById, getCourseUnitById, getEnrolledStudents, getUserById } from '../../data/mockData';
import { StatusPill } from '../../components/shared/StatusPill';

const ROTATE_SECONDS = 18;

export function BroadcastRoster() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const instance = classId ? getClassInstanceById(classId) : undefined;
  const course = instance ? getCourseUnitById(instance.courseUnitId) : undefined;
  const enrolled = useMemo(() => (instance ? getEnrolledStudents(instance.courseUnitId) : []), [instance]);

  const records = useAttendanceStore((s) => s.records);
  const addRecord = useAttendanceStore((s) => s.addRecord);
  const setVerificationStatus = useAttendanceStore((s) => s.setVerificationStatus);

  const [ended, setEnded] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(ROTATE_SECONDS);
  const [nonce, setNonce] = useState(0);

  const checkedIn = useMemo(
    () => (instance ? records.filter((r) => r.classInstanceId === instance.id && r.userRoleAtEvent === 'student') : []),
    [records, instance]
  );
  const checkedInIds = new Set(checkedIn.map((r) => r.userId));
  const remaining = enrolled.filter((s) => !checkedInIds.has(s.id));

  useEffect(() => {
    if (ended || !instance) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setNonce((n) => n + 1);
          return ROTATE_SECONDS;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [ended, instance]);

  useEffect(() => {
    if (ended || !instance || remaining.length === 0) return;
    const nextStudent = remaining[Math.floor(Math.random() * remaining.length)];
    const priorPresentIds = checkedIn.map((r) => r.userId);
    const roll = Math.random();
    const depth = priorPresentIds.length === 0 ? 0 : roll < 0.5 ? 0 : roll < 0.78 ? 1 : 2;
    const via = depth > 0 && priorPresentIds.length > 0 ? priorPresentIds[Math.floor(Math.random() * priorPresentIds.length)] : null;
    const t = setTimeout(() => {
      addRecord({
        id: `ar-live-${Date.now()}-${nextStudent.id}`,
        clientEventId: `evt-live-${Date.now()}-${nextStudent.id}`,
        classInstanceId: instance.id,
        userId: nextStudent.id,
        userRoleAtEvent: 'student',
        institutionId: nextStudent.institutionId,
        presenceMethod: 'qr_chain_verified',
        verificationStatus: 'verified',
        scanDepth: depth,
        scannedViaUserId: via,
        faceLivenessConfirmed: true,
        eventTimestamp: new Date().toISOString(),
      });
    }, 2600 + Math.random() * 2600);
    return () => clearTimeout(t);
  }, [checkedIn, remaining, ended, instance, addRecord]);

  if (!instance || !course) {
    return (
      <div className="p-5">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">This session isn't active right now.</p>
        <button onClick={() => navigate('/lecturer/home')} className="mt-3 rounded text-sm font-medium text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:text-blue-400">
          Back to home
        </button>
      </div>
    );
  }

  const feed = [...checkedIn].sort((a, b) => new Date(b.eventTimestamp).getTime() - new Date(a.eventTimestamp).getTime());

  return (
    <div className="pb-10">
      <div className="flex items-center gap-2 bg-zinc-950 px-5 pb-2 pt-5 text-white">
        <Link to="/lecturer/home" aria-label="Back to home" className="rounded-full p-1.5 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
        <div className="min-w-0">
          <p className="truncate text-xs text-zinc-400">
            {course.code} · {course.title}
          </p>
        </div>
      </div>

      <div className="bg-zinc-950 px-5 pb-8 pt-2 text-white">
        {!ended ? (
          <>
            <div className="flex flex-col items-center rounded-2xl bg-white/5 py-6">
              <FakeQRCode seed={`${instance.id}-${nonce}`} />
              <p className="mt-3 text-xs tabular-nums text-zinc-400">New code in {secondsLeft}s</p>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
              <div className="flex items-center gap-2" aria-live="polite">
                <Users className="h-4 w-4 text-zinc-400" aria-hidden="true" />
                <span className="text-sm font-medium tabular-nums">
                  {checkedIn.length} of {enrolled.length} checked in
                </span>
              </div>
              <button
                onClick={() => setEnded(true)}
                className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
              >
                End Session
              </button>
            </div>
          </>
        ) : (
          <div className="rounded-2xl bg-white/5 px-4 py-5 text-center">
            <p className="text-sm font-semibold">Session Ended</p>
            <p className="mt-1 text-xs tabular-nums text-zinc-400">
              {checkedIn.length} of {enrolled.length} students checked in
            </p>
          </div>
        )}
      </div>

      <div className="-mt-4 space-y-4 px-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Live Roster</p>
          <ul className="mt-2 divide-y divide-zinc-50 dark:divide-zinc-800">
            <AnimatePresence initial={false}>
              {feed.map((r) => {
                const s = getUserById(r.userId);
                const via = r.scannedViaUserId ? getUserById(r.scannedViaUserId) : null;
                if (!s) return null;
                return (
                  <motion.li
                    key={r.id}
                    layout
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between gap-2 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{s.fullName}</p>
                      <p className="truncate text-[11px] text-zinc-400 dark:text-zinc-500">
                        {r.verificationStatus === 'verified'
                          ? via
                            ? `Scanned via ${via.fullName.split(' ')[0]}'s code · depth ${r.scanDepth}`
                            : 'Scanned root code'
                          : 'Needs review'}
                      </p>
                    </div>
                    {r.verificationStatus === 'verified' ? (
                      <StatusPill status="verified" />
                    ) : (
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          onClick={() => setVerificationStatus(r.id, 'confirmed')}
                          aria-label={`Confirm ${s.fullName}`}
                          className="rounded-full bg-emerald-50 p-1.5 text-emerald-600 hover:bg-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20"
                        >
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => setVerificationStatus(r.id, 'rejected')}
                          aria-label={`Reject ${s.fullName}`}
                          className="rounded-full bg-red-50 p-1.5 text-red-600 hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:bg-red-500/10 dark:hover:bg-red-500/20"
                        >
                          <XCircle className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </motion.li>
                );
              })}
            </AnimatePresence>
            {feed.length === 0 && <p className="py-4 text-sm text-zinc-500 dark:text-zinc-400">No check-ins yet.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}
