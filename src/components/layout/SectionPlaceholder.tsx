import { Construction } from 'lucide-react';

export function SectionPlaceholder({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/60 px-6 py-16 text-center sm:py-20 dark:border-zinc-700 dark:bg-zinc-900/60">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
        <Construction className="h-5 w-5" />
      </span>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">{description ?? 'This section is scaffolded for the next build pass.'}</p>
    </div>
  );
}
