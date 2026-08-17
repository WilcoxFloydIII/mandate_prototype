import { useState, type ReactNode } from 'react';
import { Save, ShieldCheck } from 'lucide-react';
import { institution } from '../../data/mockData';

const TIMEZONES = ['Africa/Lagos', 'Africa/Cairo', 'Europe/London', 'America/New_York', 'Asia/Dubai'];

const fieldClass =
  'w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white';

export function SettingsPanel() {
  const [name, setName] = useState(institution.name);
  const [timezone, setTimezone] = useState(institution.timezone);
  const [threshold, setThreshold] = useState(institution.defaultThresholdPct);
  const [maintenanceHour, setMaintenanceHour] = useState(2);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Institution Console</p>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Institution name, timezone, default threshold, and nightly maintenance window.</p>
      </div>

      <div className="max-w-lg space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <Field label="Institution name">
          <input value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
        </Field>

        <Field label="Timezone">
          <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={fieldClass}>
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Default attendance threshold">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={100}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className={`${fieldClass} w-24`}
            />
            <span className="text-sm text-zinc-500 dark:text-zinc-400">%</span>
          </div>
        </Field>

        <Field label="Nightly maintenance hour (local time)">
          <select value={maintenanceHour} onChange={(e) => setMaintenanceHour(Number(e.target.value))} className={fieldClass}>
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, '0')}:00
              </option>
            ))}
          </select>
        </Field>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Save className="h-4 w-4" />
            Save settings
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}
