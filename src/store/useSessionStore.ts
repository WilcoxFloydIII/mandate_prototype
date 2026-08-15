import { create } from 'zustand';
import type { UserRole } from '../types';
import { getDemoDefaultUser } from '../data/mockData';

interface SessionState {
  currentRole: UserRole;
  currentUserId: string;
  setPersona: (role: UserRole) => void;
}

const initialUser = getDemoDefaultUser('student');

export const useSessionStore = create<SessionState>((set) => ({
  currentRole: initialUser.role,
  currentUserId: initialUser.id,
  setPersona: (role) => {
    const user = getDemoDefaultUser(role);
    set({ currentRole: role, currentUserId: user.id });
  },
}));
