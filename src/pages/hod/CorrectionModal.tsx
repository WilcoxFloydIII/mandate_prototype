import { useId, useState } from 'react';
import { Modal } from '../../components/shared/Modal';
import { useAttendanceStore } from '../../store/useAttendanceStore';
import { getUserById, getClassInstanceById, getCourseUnitById } from '../../data/mockData';
import type { AttendanceRecord, CorrectionType, User, VerificationStatus } from '../../types';

const MIN_REASON_LENGTH = 20;

const CORRECTION_OPTIONS: { value: CorrectionType; label: string; newStatus: VerificationStatus }[] = [
  { value: 'verify_unverified', label: 'Verify — Mark Present', newStatus: 'confirmed' },
  { value: 'reject_unverified', label: 'Reject — Mark Absent', newStatus: 'rejected' },
];

export function CorrectionModal({ record, hod, onClose }: { record: AttendanceRecord | null; hod: User; onClose: () => void }) {
  const [type, setType] = useState<CorrectionType>('verify_unverified');
  const [reason, setReason] = useState('');
  const submitCorrection = useAttendanceStore((s) => s.submitCorrection);
  const reasonId = useId();
  const counterId = useId();

  const student = record ? getUserById(record.userId) : null;
  const instance = record ? getClassInstanceById(record.classInstanceId) : null;
  const course = instance ? getCourseUnitById(instance.courseUnitId) : null;
  const selected = CORRECTION_OPTIONS.find((o) => o.value === type)!;
  const canSubmit = reason.trim().length >= MIN_REASON_LENGTH;

  function handleClose() {
    setReason('');
    setType('verify_unverified');
    onClose();
  }

  function handleSubmit() {
    if (!record || !canSubmit) return;
    submitCorrection({
      originalRecordId: record.id,
      correctedBy: hod.id,
      correctingRole: hod.role,
      correctionType: type,
      documentedReason: reason.trim(),
      newStatus: selected.newStatus,
    });
    handleClose();
  }

  return (
    <Modal open={!!record} onClose={handleClose} title="Apply Correction">
      {record && student && course && (
        <div className="space-y-4">
          <div className="rounded-xl bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800">
            <p className="text-sm font-medium text-zinc-900 dark:text-white">{student.fullName}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {course.code} · {instance && new Date(instance.classStartAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </p>
          </div>

          <fieldset>
            <legend className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Correction Type</legend>
            <div className="grid grid-cols-1 gap-2">
              {CORRECTION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  aria-pressed={type === opt.value}
                  className={`rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 ${
                    type === opt.value
                      ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-300'
                      : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor={reasonId} className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Documented Reason
              </label>
              <span id={counterId} className={`text-[11px] font-medium tabular-nums ${canSubmit ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
                {reason.trim().length}/{MIN_REASON_LENGTH} min
              </span>
            </div>
            <textarea
              id={reasonId}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              autoComplete="off"
              aria-describedby={counterId}
              placeholder="Explain what you reviewed and why…"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
          >
            Submit Correction
          </button>
        </div>
      )}
    </Modal>
  );
}
