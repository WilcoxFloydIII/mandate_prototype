import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Moon, Sun } from 'lucide-react';
import { PERSONAS } from '../config/personas';
import { useSessionStore } from '../store/useSessionStore';
import { useThemeStore } from '../store/useThemeStore';
import { institution } from '../data/mockData';

export function RoleSelector() {
  const setPersona = useSessionStore((s) => s.setPersona);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-white">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <div className="mb-8 flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Investor Prototype · {institution.name}</p>
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-white"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
        <h1 className="text-balance font-display text-4xl font-semibold tracking-tight sm:text-5xl">Mandate</h1>
        <p className="mt-4 max-w-xl text-zinc-600 dark:text-zinc-300">
          Institutional time and presence auditing, governed by one real hierarchy. Pick a vantage point to see what each role sees — and how a single verified check-in rolls all the way up.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {PERSONAS.map((p, i) => (
            <motion.div
              key={p.role}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <Link
                to={p.homePath}
                onClick={() => setPersona(p.role)}
                className="group flex flex-col items-start rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-left transition-colors hover:border-blue-400 hover:bg-blue-50/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-500/50 dark:hover:bg-zinc-900/80"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-blue-400 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-white dark:text-blue-600">
                  <p.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="mt-4 text-base font-semibold">Enter as {p.label}</span>
                <span className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{p.scopeLine}</span>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-blue-400">
                  Enter <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="mt-12 text-xs text-zinc-400 dark:text-zinc-500">
          Demo environment — for investor evaluation only. Institutions, people, and attendance records shown are illustrative and do not depict real individuals or real attendance data.
        </p>
      </div>
    </div>
  );
}
