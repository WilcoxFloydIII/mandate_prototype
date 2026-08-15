import type { LucideIcon } from 'lucide-react';
import { GraduationCap, Presentation, Users, Building2, Landmark, ShieldCheck } from 'lucide-react';
import type { UserRole } from '../types';

export interface PersonaConfig {
  role: UserRole;
  label: string;
  icon: LucideIcon;
  scopeLine: string;
  homePath: string;
  isPhoneFrame: boolean;
}

export const PERSONAS: PersonaConfig[] = [
  {
    role: 'student',
    label: 'Student',
    icon: GraduationCap,
    scopeLine: 'See the app the way a 300-level Computer Science student would',
    homePath: '/student/home',
    isPhoneFrame: true,
  },
  {
    role: 'lecturer',
    label: 'Lecturer',
    icon: Presentation,
    scopeLine: 'Run a live session and confirm attendance as it happens',
    homePath: '/lecturer/home',
    isPhoneFrame: true,
  },
  {
    role: 'hod',
    label: 'Head of Department',
    icon: Users,
    scopeLine: "Oversee one department's students, lecturers, and compliance",
    homePath: '/hod/dashboard',
    isPhoneFrame: false,
  },
  {
    role: 'dean',
    label: 'Dean',
    icon: Building2,
    scopeLine: 'Compare departments across a faculty at a glance',
    homePath: '/dean/dashboard',
    isPhoneFrame: false,
  },
  {
    role: 'vice_chancellor',
    label: 'Vice-Chancellor',
    icon: Landmark,
    scopeLine: 'The boardroom view — institution-wide compliance in one look',
    homePath: '/vc/dashboard',
    isPhoneFrame: false,
  },
  {
    role: 'system_admin',
    label: 'System Administrator',
    icon: ShieldCheck,
    scopeLine: 'Manage users, timetables, and the institutional audit trail',
    homePath: '/admin/dashboard',
    isPhoneFrame: false,
  },
];

export const ROUTE_TO_ROLE: Record<string, UserRole> = {
  student: 'student',
  lecturer: 'lecturer',
  hod: 'hod',
  dean: 'dean',
  vc: 'vice_chancellor',
  admin: 'system_admin',
};
