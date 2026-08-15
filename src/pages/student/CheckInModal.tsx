import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine, ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { Modal } from '../../components/shared/Modal';
import { useAttendanceStore } from '../../store/useAttendanceStore';
import type { ClassInstance, CourseUnit, User } from '../../types';

type Stage = 'scanning' | 'liveness' | 'success' | 'failed';

export function CheckInModal({
  open,
  onClose,
  student,
  classInstance,
  course,
}: {
  open: boolean;
  onClose: () => void;
  student: User;
  classInstance: ClassInstance;
  course: CourseUnit;
}) {
  const [stage, setStage] = useState<Stage>('scanning');
  const addRecord = useAttendanceStore((s) => s.addRecord);

  useEffect(() => {
    if (!open) return;
    setStage('scanning');
    const t1 = setTimeout(() => setStage('liveness'), 1500);
    return () => clearTimeout(t1);
  }, [open]);

  useEffect(() => {
    if (stage !== 'liveness') return;
    const t = setTimeout(() => {
      setStage('success');
      addRecord({
        id: `ar-live-${Date.now()}`,
        clientEventId: `evt-live-${Date.now()}`,
        classInstanceId: classInstance.id,
        userId: student.id,
        userRoleAtEvent: 'student',
        institutionId: student.institutionId,
        presenceMethod: 'qr_chain_verified',
        verificationStatus: 'verified',
        scanDepth: 0,
        scannedViaUserId: null,
        faceLivenessConfirmed: true,
        eventTimestamp: new Date().toISOString(),
      });
    }, 1500);
    return () => clearTimeout(t);
  }, [stage, addRecord, classInstance.id, student.id, student.institutionId]);

  function simulateFailure() {
    setStage('failed');
    addRecord({
      id: `ar-live-${Date.now()}`,
      clientEventId: `evt-live-${Date.now()}`,
      classInstanceId: classInstance.id,
      userId: student.id,
      userRoleAtEvent: 'student',
      institutionId: student.institutionId,
      presenceMethod: 'manual_student',
      verificationStatus: 'unverified',
      scanDepth: null,
      scannedViaUserId: null,
      faceLivenessConfirmed: false,
      eventTimestamp: new Date().toISOString(),
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={stage === 'success' || stage === 'failed' ? undefined : `${course.code} Check-In`}>
      <div className="flex flex-col items-center py-2 text-center" aria-live="polite">
        <AnimatePresence mode="wait">
          {stage === 'scanning' && (
            <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
              <div className="relative mx-auto flex h-44 w-44 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
                <ScanLine className="h-10 w-10 text-zinc-300 dark:text-zinc-600" aria-hidden="true" />
                <motion.div
                  className="absolute left-2 right-2 h-0.5 bg-blue-500"
                  animate={{ top: ['10%', '90%', '10%'] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
              <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-white">Scanning code…</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Hold your camera on the lecturer's screen</p>
            </motion.div>
          )}
          {stage === 'liveness' && (
            <motion.div key="liveness" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
              <div className="relative mx-auto flex h-44 w-44 items-center justify-center rounded-full border-2 border-dashed border-blue-400 bg-zinc-50 dark:bg-zinc-800">
                <Loader2 className="h-9 w-9 animate-spin text-blue-500" aria-hidden="true" />
              </div>
              <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-white">Blink to confirm it's you</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">On-device face match — nothing leaves your phone</p>
            </motion.div>
          )}
          {stage === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
              >
                <ShieldCheck className="h-10 w-10" aria-hidden="true" />
              </motion.div>
              <p className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">Verified</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {course.code} · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <button
                onClick={onClose}
                className="mt-5 w-full rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
              >
                Done
              </button>
            </motion.div>
          )}
          {stage === 'failed' && (
            <motion.div key="failed" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                <AlertTriangle className="h-10 w-10" aria-hidden="true" />
              </div>
              <p className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">Couldn't confirm</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Routed to your lecturer for review — this counts as Unverified, not Absent.</p>
              <button
                onClick={onClose}
                className="mt-5 w-full rounded-full bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Done
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        {(stage === 'scanning' || stage === 'liveness') && (
          <button
            onClick={simulateFailure}
            className="mt-6 rounded text-xs text-zinc-400 underline underline-offset-2 hover:text-zinc-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:hover:text-zinc-300"
          >
            Simulate a failed check-in
          </button>
        )}
      </div>
    </Modal>
  );
}
