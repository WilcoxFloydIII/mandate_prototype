import { Routes, Route, Navigate } from 'react-router-dom';
import { StudentHome } from './StudentHome';
import { SectionPlaceholder } from '../../components/layout/SectionPlaceholder';

export function StudentRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="home" replace />} />
      <Route path="home" element={<StudentHome />} />
      <Route path="at-risk" element={<SectionPlaceholder title="At-Risk Courses" description="Tap a course on Home for now — a dedicated full-list view is next." />} />
      <Route path="history" element={<SectionPlaceholder title="Attendance History" description="Calendar-grid view arrives in the next build pass." />} />
      <Route path="course/:courseId" element={<SectionPlaceholder title="Course Detail" description="Tap a course on Home to open its detail drawer." />} />
      <Route path="notifications" element={<SectionPlaceholder title="Notifications" />} />
      <Route path="profile" element={<SectionPlaceholder title="Profile" />} />
      <Route path="*" element={<Navigate to="home" replace />} />
    </Routes>
  );
}
