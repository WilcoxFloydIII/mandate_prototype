import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { users } from '../../data/mockData';
import type { User, UserRole } from '../../types';

const ROLE_LABELS: Record<UserRole, string> = {
  vice_chancellor: 'Vice-Chancellor',
  dean: 'Dean',
  hod: 'Head of Department',
  lecturer: 'Lecturer',
  student: 'Student',
  system_admin: 'System Administrator',
};

const ROLE_BADGE: Record<UserRole, string> = {
  vice_chancellor: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
  dean: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  hod: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400',
  lecturer: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  student: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
  system_admin: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
};

interface TreeNode {
  user: User;
  children: TreeNode[];
}

function buildForest(allUsers: User[]): TreeNode[] {
  const byId = new Map(allUsers.map((u) => [u.id, u]));
  const childrenOf = new Map<string, User[]>();
  const roots: User[] = [];

  for (const u of allUsers) {
    if (u.directSuperiorId && byId.has(u.directSuperiorId)) {
      const list = childrenOf.get(u.directSuperiorId) ?? [];
      list.push(u);
      childrenOf.set(u.directSuperiorId, list);
    } else {
      roots.push(u);
    }
  }

  function build(u: User): TreeNode {
    const kids = (childrenOf.get(u.id) ?? []).sort((a, b) => a.fullName.localeCompare(b.fullName));
    return { user: u, children: kids.map(build) };
  }

  return roots.sort((a, b) => a.fullName.localeCompare(b.fullName)).map(build);
}

function countDescendants(node: TreeNode): number {
  return node.children.reduce((sum, c) => sum + 1 + countDescendants(c), 0);
}

export function HierarchyPanel() {
  const forest = useMemo(() => buildForest(users), []);
  // Expanded by default down to HOD level (depth 2: VC -> Dean -> HOD); Lecturer/Student subtrees start collapsed.
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    function seed(node: TreeNode, depth: number) {
      if (depth < 2) {
        initial.add(node.user.id);
        node.children.forEach((c) => seed(c, depth + 1));
      }
    }
    forest.forEach((n) => seed(n, 0));
    return initial;
  });

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function expandAll() {
    const all = new Set<string>();
    function walk(node: TreeNode) {
      all.add(node.user.id);
      node.children.forEach(walk);
    }
    forest.forEach(walk);
    setExpanded(all);
  }

  function collapseAll() {
    setExpanded(new Set());
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Institution Console</p>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Reporting Hierarchy</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">The materialised reporting_lines tree — {users.length} users, built entirely from each user's direct superior.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-600 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-600 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Collapse all
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {forest.map((node) => (
          <TreeRow key={node.user.id} node={node} depth={0} expanded={expanded} onToggle={toggle} />
        ))}
      </div>
    </div>
  );
}

function TreeRow({ node, depth, expanded, onToggle }: { node: TreeNode; depth: number; expanded: Set<string>; onToggle: (id: string) => void }) {
  const isExpanded = expanded.has(node.user.id);
  const hasChildren = node.children.length > 0;
  const descendantCount = countDescendants(node);

  return (
    <div>
      <div className="flex items-center gap-1.5 rounded-lg py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60" style={{ paddingLeft: `${depth * 20}px` }}>
        <button
          type="button"
          onClick={() => hasChildren && onToggle(node.user.id)}
          disabled={!hasChildren}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
          className="flex h-5 w-5 shrink-0 items-center justify-center text-zinc-400 disabled:opacity-0"
        >
          {hasChildren && (isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />)}
        </button>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white" style={{ backgroundColor: node.user.avatarColor }}>
          {node.user.initials}
        </span>
        <span className="truncate text-sm font-medium text-zinc-900 dark:text-white">{node.user.fullName}</span>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${ROLE_BADGE[node.user.role]}`}>{ROLE_LABELS[node.user.role]}</span>
        {hasChildren && <span className="shrink-0 text-[11px] text-zinc-400 dark:text-zinc-500">{descendantCount} reports</span>}
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeRow key={child.user.id} node={child} depth={depth + 1} expanded={expanded} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  );
}
