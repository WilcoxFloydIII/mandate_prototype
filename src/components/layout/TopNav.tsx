import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, LayoutGrid, Moon, Sun } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { useThemeStore } from '../../store/useThemeStore';
import { PERSONAS } from '../../config/personas';
import { getDemoDefaultUser, getUserById, institution } from '../../data/mockData';
import type { UserRole } from '../../types';

export function TopNav() {
  const currentUserId = useSessionStore((s) => s.currentUserId);
  const currentRole = useSessionStore((s) => s.currentRole);
  const setPersona = useSessionStore((s) => s.setPersona);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentUser = getUserById(currentUserId);
  const currentPersona = PERSONAS.find((p) => p.role === currentRole) ?? PERSONAS[0];

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function handleSwitch(role: UserRole) {
    setPersona(role);
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-blue-400 dark:bg-white dark:text-blue-600">
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">Mandate</span>
          <span className="hidden rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 sm:inline dark:bg-zinc-800 dark:text-zinc-300">
            {institution.shortName}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 60, scale: 0.6 }}
                transition={{ duration: 0.18 }}
                className="flex"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
              </motion.span>
            </AnimatePresence>
          </button>

          <div className="relative" ref={containerRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-haspopup="listbox"
              className="flex items-center gap-2.5 rounded-full border border-zinc-200 bg-white py-1.5 pl-1.5 pr-3 shadow-sm transition-colors hover:border-zinc-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: currentUser?.avatarColor ?? '#2563EB' }}
              >
                {currentUser?.initials}
              </span>
              <span className="hidden flex-col items-start leading-tight sm:flex">
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">{currentUser?.fullName}</span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{currentPersona.label}</span>
              </span>
              <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  role="listbox"
                  className="absolute right-0 mt-2 w-72 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="border-b border-zinc-100 px-3.5 py-2.5 dark:border-zinc-800">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Viewing as</p>
                  </div>
                  <ul className="max-h-96 overflow-y-auto py-1">
                    {PERSONAS.map((p) => {
                      const user = getDemoDefaultUser(p.role);
                      const active = p.role === currentRole;
                      return (
                        <li key={p.role}>
                          <Link
                            to={p.homePath}
                            onClick={() => handleSwitch(p.role)}
                            role="option"
                            aria-selected={active}
                            className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 ${active ? 'bg-zinc-50 dark:bg-zinc-800' : ''}`}
                          >
                            <span
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                              style={{ backgroundColor: user.avatarColor }}
                            >
                              {user.initials}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-zinc-900 dark:text-white">{p.label}</span>
                              <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">{user.fullName}</span>
                            </span>
                            {active && <Check className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
