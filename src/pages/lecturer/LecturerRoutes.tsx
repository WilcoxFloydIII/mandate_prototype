import { Routes, Route, Navigate } from 'react-router-dom';
import { LecturerHome } from './LecturerHome';
import { BroadcastRoster } from './BroadcastRoster';
import { SectionPlaceholder } from '../../components/layout/SectionPlaceholder';

export function LecturerRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="home" replace />} />
      <Route path="home" element={<LecturerHome />} />
      <Route path="session/:classId/broadcast" element={<BroadcastRoster />} />
      <Route path="session/:classId/roster" element={<BroadcastRoster />} />
      <Route path="history" element={<SectionPlaceholder title="Attendance History" />} />
      <Route path="courses" element={<SectionPlaceholder title="My Courses" description="Tap a course card on Home for its live snapshot — a full list view is next." />} />
      <Route path="schedule/submit" element={<SectionPlaceholder title="Submit Schedule" />} />
      <Route path="notifications" element={<SectionPlaceholder title="Notifications" />} />
      <Route path="profile" element={<SectionPlaceholder title="Profile" />} />
      <Route path="*" element={<Navigate to="home" replace />} />
    </Routes>
  );
}
