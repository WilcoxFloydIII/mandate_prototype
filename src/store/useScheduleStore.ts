import { create } from 'zustand';
import { scheduledClassSubmissions as seedSubmissions } from '../data/mockData';
import type { AttendanceMode, ScheduleApprovalStatus, ScheduledClassSubmission } from '../types';

export interface NewScheduleInput {
  courseUnitId: string;
  lecturerId: string;
  dayOfWeek: number[];
  startHour: number;
  endHour: number;
  venueName: string;
  buildingName: string;
  attendanceMode: AttendanceMode;
}

interface ScheduleState {
  submissions: ScheduledClassSubmission[];
  approve: (id: string, approverId: string) => void;
  reject: (id: string, approverId: string, reason: string) => void;
  /** autoApprove=true is the system_admin path (PRD: admin edits are auto-approved, no queue). */
  submit: (input: NewScheduleInput, submittedBy: string, autoApprove: boolean) => void;
}

let nextId = seedSubmissions.length + 1;

export const useScheduleStore = create<ScheduleState>((set) => ({
  submissions: seedSubmissions,

  approve: (id, approverId) =>
    set((state) => ({
      submissions: state.submissions.map((s) =>
        s.id === id
          ? { ...s, approvalStatus: 'approved' as ScheduleApprovalStatus, approvedBy: approverId, approvedAt: new Date().toISOString(), rejectionReason: null }
          : s
      ),
    })),

  reject: (id, approverId, reason) =>
    set((state) => ({
      submissions: state.submissions.map((s) =>
        s.id === id
          ? { ...s, approvalStatus: 'rejected' as ScheduleApprovalStatus, approvedBy: approverId, approvedAt: new Date().toISOString(), rejectionReason: reason }
          : s
      ),
    })),

  submit: (input, submittedBy, autoApprove) =>
    set((state) => {
      const now = new Date().toISOString();
      const submission: ScheduledClassSubmission = {
        id: `scs-new-${nextId++}`,
        courseUnitId: input.courseUnitId,
        lecturerId: input.lecturerId,
        venueName: input.venueName,
        buildingName: input.buildingName,
        dayOfWeek: input.dayOfWeek,
        startHour: input.startHour,
        endHour: input.endHour,
        attendanceMode: input.attendanceMode,
        approvalStatus: autoApprove ? 'approved' : 'pending',
        submittedBy,
        submittedAt: now,
        approvedBy: autoApprove ? submittedBy : null,
        approvedAt: autoApprove ? now : null,
        rejectionReason: null,
      };
      return { submissions: [...state.submissions, submission] };
    }),
}));
