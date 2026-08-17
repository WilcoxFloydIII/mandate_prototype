import { Routes, Route, Navigate } from 'react-router-dom';
import { StudentHome } from './StudentHome';
import { AtRiskCourses } from './AtRiskCourses';
import { AttendanceHistory } from './AttendanceHistory';
import { NotificationsPanel } from './NotificationsPanel';
import { ProfilePanel } from './ProfilePanel';
import { Onboarding } from './Onboarding';
import { ManualCheckIn } from './ManualCheckIn';

export function StudentRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="home" replace />} />
      <Route path="onboarding" element={<Onboarding />} />
      <Route path="home" element={<StudentHome />} />
      <Route path="at-risk" element={<AtRiskCourses />} />
      <Route path="history" element={<AttendanceHistory />} />
      {/* Course detail is a modal (CourseDetailDrawer) opened from Home or At-Risk Courses,
          not a standalone page — it needs student/course state that only those pages hold.
          Any deep link here (old bookmarks, notifications, etc.) redirects to Home. */}
      <Route path="course/:courseId" element={<Navigate to="/student/home" replace />} />
      <Route path="checkin/manual" element={<ManualCheckIn />} />
      <Route path="checkin/manual/:classId" element={<ManualCheckIn />} />
      <Route path="notifications" element={<NotificationsPanel />} />
      <Route path="profile" element={<ProfilePanel />} />
      <Route path="*" element={<Navigate to="home" replace />} />
    </Routes>
  );
}
