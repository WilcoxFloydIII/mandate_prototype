// ─────────────────────────────────────────────────────────────────
// Domain types for the Mandate investor prototype.
// These mirror the production schema in the PRD (institutions,
// users, class_instances, attendance_records, threshold summaries,
// etc.) but are simplified where the real schema's detail exists
// only to serve real biometric/encryption infrastructure this
// prototype deliberately simulates instead of implementing.
// ─────────────────────────────────────────────────────────────────

export type UserRole =
  | 'vice_chancellor'
  | 'dean'
  | 'hod'
  | 'lecturer'
  | 'student'
  | 'system_admin';

export type PresenceMethod =
  | 'qr_chain_verified'
  | 'manual_student'
  | 'lecturer_marked'
  | 'degraded_manual_entry'
  | 'admin_corrected';

export type VerificationStatus =
  | 'verified'
  | 'unverified'
  | 'disputed'
  | 'confirmed'
  | 'rejected';

export type ClassInstanceStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

export type AttendanceMode = 'window' | 'duration';

export type CorrectionType =
  | 'absent_to_present'
  | 'present_to_absent'
  | 'verify_unverified'
  | 'reject_unverified';

export interface Institution {
  id: string;
  name: string;
  shortName: string;
  country: string;
  timezone: string;
  defaultThresholdPct: number;
  isPilotPartner: boolean;
}

export interface Faculty {
  id: string;
  institutionId: string;
  name: string;
  shortName: string;
  deanId: string | null;
}

export interface Department {
  id: string;
  institutionId: string;
  facultyId: string;
  name: string;
  shortName: string;
  hodId: string | null;
}

export interface User {
  id: string;
  institutionId: string;
  departmentId: string | null;
  facultyId: string | null;
  fullName: string;
  institutionalId: string;
  email: string;
  phoneMasked: string;
  role: UserRole;
  level: number | null;
  directSuperiorId: string | null;
  isActive: boolean;
  faceIdEnrolled: boolean;
  deviceModel: string | null;
  isDemoDefault: boolean;
  avatarColor: string;
  initials: string;
}

export interface AcademicSession {
  id: string;
  institutionId: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface Semester {
  id: string;
  academicSessionId: string;
  name: 'First Semester' | 'Second Semester';
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface CourseUnit {
  id: string;
  departmentId: string;
  semesterId: string;
  code: string;
  title: string;
  creditUnits: number;
  level: number;
  /** First entry is the lead lecturer; any additional entries are co-lecturers. */
  lecturerIds: string[];
}

export interface CourseEnrollment {
  id: string;
  courseUnitId: string;
  studentId: string;
  isActive: boolean;
}

export interface ClassInstance {
  id: string;
  courseUnitId: string;
  lecturerId: string;
  venueName: string;
  buildingName: string;
  instanceDate: string;
  windowOpenAt: string;
  windowCloseAt: string;
  classStartAt: string;
  classEndAt: string;
  attendanceMode: AttendanceMode;
  status: ClassInstanceStatus;
}

export interface AttendanceRecord {
  id: string;
  clientEventId: string;
  classInstanceId: string;
  userId: string;
  userRoleAtEvent: 'student' | 'lecturer';
  institutionId: string;
  presenceMethod: PresenceMethod;
  verificationStatus: VerificationStatus;
  /** Lineage depth from the lecturer's root QR (0 = scanned root directly). Null when not a QR check-in. */
  scanDepth: number | null;
  /** The peer user id this check-in was scanned via, when scanDepth > 0. */
  scannedViaUserId: string | null;
  faceLivenessConfirmed: boolean;
  eventTimestamp: string;
}

export interface AttendanceThresholdSummary {
  id: string;
  studentId: string;
  courseUnitId: string;
  semesterId: string;
  totalClasses: number;
  attendedClasses: number;
  attendancePct: number;
  thresholdPct: number;
  isEligible: boolean;
}

export interface LecturerAttendanceSummary {
  id: string;
  lecturerId: string;
  courseUnitId: string;
  semesterId: string;
  totalClasses: number;
  attendedClasses: number;
  attendancePct: number;
  thresholdPct: number;
  meetsThreshold: boolean;
}

export interface CorrectionRecord {
  id: string;
  originalRecordId: string | null;
  correctedRecordId: string | null;
  correctedBy: string;
  correctingRole: UserRole;
  correctionType: CorrectionType;
  documentedReason: string;
  createdAt: string;
}

export interface AdminActivityLogEntry {
  id: string;
  actorId: string | null;
  actionType: string;
  targetId: string | null;
  targetType: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}
