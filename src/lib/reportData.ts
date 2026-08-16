import {
  attendanceThresholdSummaries,
  lecturerAttendanceSummaries,
  getUserById,
  getCourseUnitById,
  getDepartmentById,
} from '../data/mockData';

export type ReportSubject = 'students' | 'lecturers';
export type ReportType = 'all' | 'at_risk' | 'eligible' | 'passing' | 'failing';

export interface ReportScope {
  /** Department ids to include. Undefined = institution-wide, no restriction. */
  departmentIds?: string[];
}

export interface StudentReportRow {
  studentId: string;
  fullName: string;
  institutionalId: string;
  departmentName: string;
  level: number | null;
  courseCode: string;
  courseTitle: string;
  attendedClasses: number;
  totalClasses: number;
  attendancePct: number;
  thresholdPct: number;
  status: 'On Track' | 'At Risk' | 'Eligible';
}

export interface LecturerReportRow {
  lecturerId: string;
  fullName: string;
  institutionalId: string;
  departmentName: string;
  courseCode: string;
  courseTitle: string;
  attendedClasses: number;
  totalClasses: number;
  attendancePct: number;
  thresholdPct: number;
  status: 'Passing' | 'Failing';
}

export function buildStudentReportRows(scope: ReportScope, reportType: ReportType): StudentReportRow[] {
  return attendanceThresholdSummaries
    .map((s): StudentReportRow | null => {
      const student = getUserById(s.studentId);
      const course = getCourseUnitById(s.courseUnitId);
      if (!student || !course) return null;
      if (scope.departmentIds && !scope.departmentIds.includes(course.departmentId)) return null;
      const department = getDepartmentById(course.departmentId);
      const status: StudentReportRow['status'] = !s.isEligible ? 'At Risk' : s.attendancePct - s.thresholdPct < 10 ? 'On Track' : 'Eligible';
      return {
        studentId: student.id,
        fullName: student.fullName,
        institutionalId: student.institutionalId,
        departmentName: department?.name ?? '',
        level: student.level,
        courseCode: course.code,
        courseTitle: course.title,
        attendedClasses: s.attendedClasses,
        totalClasses: s.totalClasses,
        attendancePct: s.attendancePct,
        thresholdPct: s.thresholdPct,
        status,
      };
    })
    .filter((r): r is StudentReportRow => r !== null)
    .filter((r) => {
      if (reportType === 'at_risk') return r.status === 'At Risk';
      if (reportType === 'eligible') return r.status !== 'At Risk';
      return true;
    })
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export function buildLecturerReportRows(scope: ReportScope, reportType: ReportType): LecturerReportRow[] {
  return lecturerAttendanceSummaries
    .map((s): LecturerReportRow | null => {
      const lecturer = getUserById(s.lecturerId);
      const course = getCourseUnitById(s.courseUnitId);
      if (!lecturer || !course) return null;
      if (scope.departmentIds && !scope.departmentIds.includes(course.departmentId)) return null;
      const department = getDepartmentById(course.departmentId);
      return {
        lecturerId: lecturer.id,
        fullName: lecturer.fullName,
        institutionalId: lecturer.institutionalId,
        departmentName: department?.name ?? '',
        courseCode: course.code,
        courseTitle: course.title,
        attendedClasses: s.attendedClasses,
        totalClasses: s.totalClasses,
        attendancePct: s.attendancePct,
        thresholdPct: s.thresholdPct,
        status: s.meetsThreshold ? 'Passing' : 'Failing',
      };
    })
    .filter((r): r is LecturerReportRow => r !== null)
    .filter((r) => {
      if (reportType === 'passing') return r.status === 'Passing';
      if (reportType === 'failing') return r.status === 'Failing';
      return true;
    })
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}
