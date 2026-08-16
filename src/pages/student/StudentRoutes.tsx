import { Routes, Route, Navigate } from 'react-router-dom';
import { StudentHome } from './StudentHome';
import { AtRiskCourses } from './AtRiskCourses';
import { AttendanceHistory } from './AttendanceHistory';
import { SectionPlaceholder } from '../../components/layout/SectionPlaceholder';

export function StudentRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="home" replace />} />
      <Route path="home" element={<StudentHome />} />
      <Route path="at-risk" element={<AtRiskCourses />} />
      <Route path="history" element={<AttendanceHistory />} />
      <Route path="course/:courseId" element={<SectionPlaceholder title="Course Detail" description="Tap a course on Home to open its detail drawer." />} />
      <Route path="notifications" element={<SectionPlaceholder title="Notifications" />} />
      <Route path="profile" element={<SectionPlaceholder title="Profile" />} />
      <Route path="*" element={<Navigate to="home" replace />} />
    </Routes>
  );
}
