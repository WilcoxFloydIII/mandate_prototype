import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarDays,
  FileBarChart,
  ClipboardEdit,
  Bell,
  Settings,
  Building2,
  UserCog,
  BookOpen,
  ListChecks,
  ShieldCheck,
} from 'lucide-react';
import type { DesktopNavItem } from '../components/layout/DesktopShell';

export const HOD_NAV: DesktopNavItem[] = [
  { label: 'Dashboard', path: '/hod/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Students', path: '/hod/students', icon: GraduationCap },
  { label: 'Lecturers', path: '/hod/lecturers', icon: Users },
  { label: 'Timetable', path: '/hod/timetable', icon: CalendarDays },
  { label: 'Reports', path: '/hod/reports', icon: FileBarChart },
  { label: 'Corrections', path: '/hod/corrections', icon: ClipboardEdit },
  { label: 'Alerts', path: '/hod/alerts', icon: Bell },
  { label: 'Settings', path: '/hod/settings', icon: Settings },
];

export const DEAN_NAV: DesktopNavItem[] = [
  { label: 'Dashboard', path: '/dean/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Departments', path: '/dean/departments', icon: Building2 },
  { label: 'Reports', path: '/dean/reports', icon: FileBarChart },
  { label: 'Schedule Approvals', path: '/dean/schedule-approvals', icon: ListChecks },
  { label: 'Settings', path: '/dean/settings', icon: Settings },
];

export const ADMIN_NAV: DesktopNavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Users', path: '/admin/users', icon: UserCog },
  { label: 'Timetable', path: '/admin/timetable', icon: CalendarDays },
  { label: 'Courses', path: '/admin/courses', icon: BookOpen },
  { label: 'Sessions', path: '/admin/sessions', icon: ListChecks },
  { label: 'Reports', path: '/admin/reports', icon: FileBarChart },
  { label: 'Activity Log', path: '/admin/activity-log', icon: ShieldCheck },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

export const VC_NAV: DesktopNavItem[] = [
  { label: 'Dashboard', path: '/vc/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Reports', path: '/vc/reports', icon: FileBarChart },
];
