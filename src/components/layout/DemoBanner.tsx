import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, ChevronDown } from 'lucide-react';

export function DemoBanner() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative z-50 bg-zinc-950 text-zinc-300">
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-1.5 text-center text-[11px] sm:text-xs">
        <Info className="h-3.5 w-3.5 shrink-0 text-blue-400" aria-hidden="true" />
        <span>Demo environment — for investor evaluation only. People and attendance records shown are illustrative.</span>
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="inline-flex items-center gap-0.5 rounded font-medium text-blue-400 underline underline-offset-2 hover:text-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
        >
          Details
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-3 w-3" />
          </motion.span>
        </button>
      </div>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-zinc-800"
          >
            <div className="mx-auto max-w-3xl space-y-1.5 px-4 py-3 text-xs leading-relaxed text-zinc-400">
              <p>No camera, biometric, or location data is captured or transmitted by this prototype. The QR check-in and face-liveness steps are simulated end to end.</p>
              <p>Godfrey Okoye University (GOU) is Mandate&apos;s real pilot institution partner. The specific people and attendance records shown here are illustrative, not GOU&apos;s actual data.</p>
              <p>Figures and percentages are example data, not NUC-audited records. Screens represent planned product design and are subject to change before launch.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
