import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ScanFace, ShieldCheck, SkipForward, Smartphone } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { getUserById } from '../../data/mockData';

const STEPS = ['identity', 'face', 'battery'] as const;
type Step = (typeof STEPS)[number];

export function Onboarding() {
  const navigate = useNavigate();
  const userId = useSessionStore((s) => s.currentUserId);
  const student = getUserById(userId)!;
  const [stepIndex, setStepIndex] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const step: Step = STEPS[stepIndex];

  function finish() {
    navigate('/student/home');
  }
  function next() {
    if (stepIndex < STEPS.length - 1) setStepIndex((i) => i + 1);
    else finish();
  }
  function simulateScan() {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setEnrolled(true);
    }, 1600);
  }

  return (
    <div className="flex min-h-full flex-col px-5 py-5">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-1.5">
          {STEPS.map((s, i) => (
            <span key={s} className={`h-1.5 w-8 rounded-full ${i <= stepIndex ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
          ))}
        </div>
        <button type="button" onClick={finish} className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
          Skip
          <SkipForward className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {step === 'identity' && (
          <>
            <span
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold text-white"
              style={{ backgroundColor: student.avatarColor }}
            >
              {student.initials}
            </span>
            <h1 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-white">Is this you?</h1>
            <p className="mb-1 text-sm text-zinc-600 dark:text-zinc-300">{student.fullName}</p>
            <p className="mb-6 text-xs text-zinc-400 dark:text-zinc-500">{student.institutionalId}</p>
          </>
        )}

        {step === 'face' && (
          <>
            <div className="relative mb-5 flex h-40 w-40 items-center justify-center rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-700">
              {scanning && (
                <motion.span
                  className="absolute inset-0 rounded-full border-2 border-zinc-900 dark:border-white"
                  animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              )}
              {enrolled ? <CheckCircle2 className="h-14 w-14 text-emerald-500" /> : <ScanFace className="h-14 w-14 text-zinc-300 dark:text-zinc-600" />}
            </div>
            <h1 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-white">{enrolled ? 'Face ID enrolled' : 'Position your face in the frame'}</h1>
            <p className="mb-6 max-w-[240px] text-xs text-zinc-500 dark:text-zinc-400">
              {enrolled
                ? 'You can now check in with a live liveness check at every class.'
                : 'Used only for on-device liveness matching — nothing is uploaded from this simulation.'}
            </p>
            {!enrolled && (
              <button
                type="button"
                onClick={simulateScan}
                disabled={scanning}
                className="mb-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-zinc-900"
              >
                {scanning ? 'Scanning…' : 'Simulate scan'}
              </button>
            )}
          </>
        )}

        {step === 'battery' && (
          <>
            <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <Smartphone className="h-7 w-7" />
            </span>
            <h1 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-white">Two quick battery steps</h1>
            <p className="mb-4 max-w-[260px] text-xs text-zinc-500 dark:text-zinc-400">
              We noticed you're on {student.deviceModel ?? 'an Android device'} — a couple of settings keep attendance tracking reliable when the app isn't open.
            </p>
            <ul className="mb-4 w-full max-w-[260px] space-y-2 text-left text-xs text-zinc-600 dark:text-zinc-300">
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
                Add Mandate to your Protected Apps list
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
                Disable Auto-start management restrictions
              </li>
            </ul>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={next}
        disabled={step === 'face' && !enrolled}
        className="mt-4 w-full rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-900"
      >
        {stepIndex === STEPS.length - 1 ? 'Get started' : 'Continue'}
      </button>
    </div>
  );
}
