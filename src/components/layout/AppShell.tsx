import { useEffect, type ComponentType } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { DemoBanner } from './DemoBanner';
import { TopNav } from './TopNav';
import { PhoneFrame } from './PhoneFrame';
import { useSessionStore } from '../../store/useSessionStore';
import { PERSONAS, ROUTE_TO_ROLE } from '../../config/personas';
import { StudentRoutes } from '../../pages/student/StudentRoutes';
import { LecturerRoutes } from '../../pages/lecturer/LecturerRoutes';
import { HODDashboard } from '../../pages/hod/HODDashboard';
import { DeanDashboard } from '../../pages/dean/DeanDashboard';
import { AdminDashboard } from '../../pages/admin/AdminDashboard';
import { VCDashboard } from '../../pages/vc/VCDashboard';

const ROLE_ROUTER: Record<string, ComponentType> = {
  student: StudentRoutes,
  lecturer: LecturerRoutes,
  hod: HODDashboard,
  dean: DeanDashboard,
  admin: AdminDashboard,
  vc: VCDashboard,
};

export function AppShell() {
  const { role } = useParams<{ role: string }>();
  const currentRole = useSessionStore((s) => s.currentRole);
  const setPersona = useSessionStore((s) => s.setPersona);

  useEffect(() => {
    const routeRole = role ? ROUTE_TO_ROLE[role] : undefined;
    if (routeRole && routeRole !== currentRole) setPersona(routeRole);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  if (!role || !ROUTE_TO_ROLE[role]) return <Navigate to="/" replace />;

  const persona = PERSONAS.find((p) => p.role === ROUTE_TO_ROLE[role])!;
  const RoleRouter = ROLE_ROUTER[role];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <a href="#main-content" className="skip-link rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
        Skip to content
      </a>
      <DemoBanner />
      <TopNav />
      <div id="main-content">
        {persona.isPhoneFrame ? (
          <PhoneFrame>
            <RoleRouter />
          </PhoneFrame>
        ) : (
          <RoleRouter />
        )}
      </div>
    </div>
  );
}
