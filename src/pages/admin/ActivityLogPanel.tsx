import { useMemo, useState } from 'react';
import { Download, ShieldCheck } from 'lucide-react';
import { adminActivityLog, getUserById } from '../../data/mockData';
import { DataTable, type DataTableColumn } from '../../components/shared/DataTable';
import { exportToExcel } from '../../lib/exportExcel';

// Extends whatever adminActivityLog's real element type is with the optional
// governance fields the PRD defines on admin_activity_log (target_id,
// target_type, metadata). Reads degrade gracefully if a given seeded entry
// doesn't populate them.
type ActivityLogEntry = (typeof adminActivityLog)[number] & {
  targetId?: string | null;
  targetType?: string | null;
  metadata?: Record<string, unknown> | null;
};

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function actionLabel(actionType: string): string {
  return actionType.replace(/_/g, ' ');
}

export function ActivityLogPanel() {
  const [query, setQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const entries = adminActivityLog as ActivityLogEntry[];

  const actionTypes = useMemo(() => {
    return Array.from(new Set(entries.map((e) => e.actionType))).sort();
  }, [entries]);

  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return entries
      .filter((entry) => actionFilter === 'all' || entry.actionType === actionFilter)
      .filter((entry) => {
        if (!needle) return true;
        const actor = entry.actorId ? getUserById(entry.actorId) : null;
        const haystack = [actionLabel(entry.actionType), actor?.fullName, entry.targetType, entry.targetId]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(needle);
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [entries, actionFilter, query]);

  const columns: DataTableColumn<ActivityLogEntry>[] = [
    {
      key: 'createdAt',
      header: 'Timestamp',
      sortable: true,
      width: '180px',
      sortValue: (row) => new Date(row.createdAt).getTime(),
      render: (row) => <span className="whitespace-nowrap text-zinc-500 dark:text-zinc-400">{timeLabel(row.createdAt)}</span>,
    },
    {
      key: 'actor',
      header: 'Actor',
      sortable: true,
      sortValue: (row) => (row.actorId ? getUserById(row.actorId)?.fullName ?? '' : ''),
      render: (row) => {
        const actor = row.actorId ? getUserById(row.actorId) : null;
        return <span className="font-medium text-zinc-900 dark:text-white">{actor ? actor.fullName : 'System'}</span>;
      },
    },
    {
      key: 'actionType',
      header: 'Action',
      sortable: true,
      sortValue: (row) => row.actionType,
      render: (row) => <span className="capitalize text-zinc-700 dark:text-zinc-300">{actionLabel(row.actionType)}</span>,
    },
    {
      key: 'target',
      header: 'Target',
      render: (row) => {
        if (!row.targetType && !row.targetId) return <span className="text-zinc-400 dark:text-zinc-600">—</span>;
        return (
          <span className="text-zinc-500 dark:text-zinc-400">
            {row.targetType ? `${row.targetType} · ` : ''}
            {row.targetId ? `${row.targetId.slice(0, 8)}…` : ''}
          </span>
        );
      },
    },
  ];

  function handleExport() {
    exportToExcel('mandate-activity-log', [
      {
        name: 'Activity Log',
        rows: filteredRows.map((entry) => ({
          Timestamp: new Date(entry.createdAt).toISOString(),
          Actor: entry.actorId ? getUserById(entry.actorId)?.fullName ?? entry.actorId : 'System',
          Action: actionLabel(entry.actionType),
          'Target Type': entry.targetType ?? '',
          'Target ID': entry.targetId ?? '',
        })),
      },
    ]);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Institution Console</p>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Activity Log</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Immutable, append-only record of every administrative and system action.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <Download className="h-4 w-4" />
          Download Excel
        </button>
      </div>

      <div className="mb-4 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <ShieldCheck className="h-3.5 w-3.5" />
        {entries.length} entries logged · no UPDATE or DELETE policy exists on this table
      </div>

      <DataTable
        columns={columns}
        data={filteredRows}
        getRowId={(row) => row.id}
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search actor, action, or target…"
        emptyMessage="No activity matches your filters."
        pageSize={20}
        initialSortKey="createdAt"
        initialSortDirection="desc"
        toolbarRight={
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <option value="all">All actions</option>
            {actionTypes.map((type) => (
              <option key={type} value={type}>
                {actionLabel(type)}
              </option>
            ))}
          </select>
        }
      />
    </div>
  );
}
