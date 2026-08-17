import { Routes, Route, Navigate } from 'react-router-dom';
import { StudentHome } from './StudentHome';
import { AtRiskCourses } from './AtRiskCourses';
import { AttendanceHistory } from './AttendanceHistory';
import { NotificationsPanel } from './NotificationsPanel';
import { ProfilePanel } from './ProfilePanel';
import { Onboarding } from './Onboarding';
import { ManualCheckIn } from './ManualCheckIn';
import { SectionPlaceholder } from '../../components/layout/SectionPlaceholder';

export function StudentRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="home" replace />} />
      <Route path="onboarding" element={<Onboarding />} />
      <Route path="home" element={<StudentHome />} />
      <Route path="at-risk" element={<AtRiskCourses />} />
      <Route path="history" element={<AttendanceHistory />} />
      <Route path="course/:courseId" element={<SectionPlaceholder title="Course Detail" description="Tap a course on Home to open its detail drawer." />} />
      <Route path="checkin/manual" element={<ManualCheckIn />} />
      <Route path="checkin/manual/:classId" element={<ManualCheckIn />} />
      <Route path="notifications" element={<NotificationsPanel />} />
      <Route path="profile" element={<ProfilePanel />} />
      <Route path="*" element={<Navigate to="home" replace />} />
    </Routes>
  );
}
