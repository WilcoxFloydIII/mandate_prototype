import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { users, departments, getDepartmentById } from '../../data/mockData';
import { DataTable, type DataTableColumn } from '../../components/shared/DataTable';
import type { User, UserRole } from '../../types';

const ROLE_LABELS: Record<UserRole, string> = {
  vice_chancellor: 'Vice-Chancellor',
  dean: 'Dean',
  hod: 'Head of Department',
  lecturer: 'Lecturer',
  student: 'Student',
  system_admin: 'System Administrator',
};

export function UsersPanel() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [deptFilter, setDeptFilter] = useState('all');

  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return users
      .filter((u) => roleFilter === 'all' || u.role === roleFilter)
      .filter((u) => deptFilter === 'all' || u.departmentId === deptFilter)
      .filter((u) => !needle || `${u.fullName} ${u.institutionalId} ${u.email}`.toLowerCase().includes(needle));
  }, [roleFilter, deptFilter, query]);

  const columns: DataTableColumn<User>[] = [
    {
      key: 'fullName',
      header: 'User',
      sortable: true,
      sortValue: (u) => u.fullName,
      render: (u) => (
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ backgroundColor: u.avatarColor }}>
            {u.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-zinc-900 dark:text-white">{u.fullName}</p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{u.institutionalId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      sortValue: (u) => u.role,
      render: (u) => <span className="text-zinc-700 dark:text-zinc-300">{ROLE_LABELS[u.role]}</span>,
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      sortValue: (u) => (u.departmentId ? getDepartmentById(u.departmentId)?.name ?? '' : ''),
      render: (u) => <span className="text-zinc-600 dark:text-zinc-300">{u.departmentId ? getDepartmentById(u.departmentId)?.name : '—'}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (u) => <span className="truncate text-zinc-500 dark:text-zinc-400">{u.email}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right',
      render: (u) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            u.isActive
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
          }`}
        >
          {u.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Institution Console</p>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">User Management</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{users.length} users across every role and department.</p>
      </div>
      <DataTable
        columns={columns}
        data={filteredRows}
        getRowId={(u) => u.id}
        onRowClick={(u) => navigate(`/admin/users/${u.id}`)}
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search name, ID, or email…"
        emptyMessage="No users match your filters."
        pageSize={15}
        initialSortKey="fullName"
        toolbarRight={
          <>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | UserRole)}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option value="all">All roles</option>
              {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option value="all">All departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </>
        }
      />
    </div>
  );
}
