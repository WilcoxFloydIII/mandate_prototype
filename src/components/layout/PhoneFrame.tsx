import type { ReactNode } from 'react';

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-center px-3 py-6 sm:px-4 sm:py-8">
      <div className="w-full max-w-[390px]">
        {/* [transform:translateZ(0)] makes this the containing block for any
            `position: fixed` descendant (Modal/Drawer), so overlays stay inside
            the phone instead of covering the real viewport. overflow-hidden
            then clips those overlays to the bezel's rounded silhouette instead
            of rendering as a sharp-cornered rectangle inside a rounded frame. */}
        <div className="relative [transform:translateZ(0)] overflow-hidden rounded-[2.75rem] border-[6px] border-zinc-950 bg-zinc-950 shadow-phone dark:border-zinc-800 dark:bg-zinc-800 dark:ring-1 dark:ring-white/10">
          <div className="pointer-events-none absolute left-1/2 top-0 z-20 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-zinc-950 dark:bg-zinc-800" />
          <div className="relative z-10 h-[720px] overflow-y-auto overflow-x-hidden overscroll-contain rounded-[2.25rem] bg-white [scrollbar-width:none] dark:bg-zinc-950 [&::-webkit-scrollbar]:hidden">
            {children}
          </div>
        </div>
        <p className="mt-3 text-center text-[11px] text-zinc-400 dark:text-zinc-500">Simulated mobile view — the production app is built in Flutter</p>
      </div>
    </div>
  );
}
