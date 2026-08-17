import { Routes, Route, Navigate } from 'react-router-dom';
import { LecturerHome } from './LecturerHome';
import { BroadcastRoster } from './BroadcastRoster';
import { AttendanceHistory } from './AttendanceHistory';
import { CoursesPanel } from './CoursesPanel';
import { SubmitSchedule } from './SubmitSchedule';
import { NotificationsPanel } from './NotificationsPanel';
import { ProfilePanel } from './ProfilePanel';

export function LecturerRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="home" replace />} />
      <Route path="home" element={<LecturerHome />} />
      <Route path="session/:classId/broadcast" element={<BroadcastRoster />} />
      <Route path="session/:classId/roster" element={<BroadcastRoster />} />
      <Route path="history" element={<AttendanceHistory />} />
      <Route path="courses" element={<CoursesPanel />} />
      <Route path="schedule" element={<SubmitSchedule />} />
      <Route path="schedule/submit" element={<SubmitSchedule />} />
      <Route path="notifications" element={<NotificationsPanel />} />
      <Route path="profile" element={<ProfilePanel />} />
      <Route path="*" element={<Navigate to="home" replace />} />
    </Routes>
  );
}
