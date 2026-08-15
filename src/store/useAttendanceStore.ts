import { create } from 'zustand';
import { attendanceRecords as seedRecords, correctionRecords as seedCorrections } from '../data/mockData';
import type { AttendanceRecord, CorrectionRecord, CorrectionType, UserRole, VerificationStatus } from '../types';

let correctionSeq = seedCorrections.length;

interface AttendanceState {
  records: AttendanceRecord[];
  corrections: CorrectionRecord[];
  addRecord: (record: AttendanceRecord) => void;
  setVerificationStatus: (recordId: string, status: VerificationStatus) => void;
  submitCorrection: (input: {
    originalRecordId: string | null;
    correctedBy: string;
    correctingRole: UserRole;
    correctionType: CorrectionType;
    documentedReason: string;
    newStatus?: VerificationStatus;
  }) => void;
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
  records: seedRecords,
  corrections: seedCorrections,

  addRecord: (record) => set((s) => ({ records: [record, ...s.records] })),

  setVerificationStatus: (recordId, status) =>
    set((s) => ({
      records: s.records.map((r) => (r.id === recordId ? { ...r, verificationStatus: status } : r)),
    })),

  submitCorrection: (input) => {
    correctionSeq++;
    const correction: CorrectionRecord = {
      id: `cr-live-${correctionSeq}`,
      originalRecordId: input.originalRecordId,
      correctedRecordId: null,
      correctedBy: input.correctedBy,
      correctingRole: input.correctingRole,
      correctionType: input.correctionType,
      documentedReason: input.documentedReason,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({
      corrections: [correction, ...s.corrections],
      records:
        input.newStatus && input.originalRecordId
          ? s.records.map((r) => (r.id === input.originalRecordId ? { ...r, verificationStatus: input.newStatus! } : r))
          : s.records,
    }));
  },
}));
