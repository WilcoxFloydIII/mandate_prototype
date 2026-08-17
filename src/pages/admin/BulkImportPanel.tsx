import { useCallback, useMemo, useState, type DragEvent } from 'react';
import { CheckCircle2, Download, FileSpreadsheet, Upload, XCircle } from 'lucide-react';
import { users, departments } from '../../data/mockData';
import { parseImportFile, type ParseResult } from '../../lib/parseImportFile';
import { exportToExcel } from '../../lib/exportExcel';
import { DataTable, type DataTableColumn } from '../../components/shared/DataTable';

type ImportType = 'users' | 'courses' | 'hierarchy';

const TEMPLATE_COLUMNS: Record<ImportType, string[]> = {
  users: ['Full Name', 'Institutional ID', 'Email', 'Role', 'Department Short Name', 'Faculty Short Name', 'Level', 'Direct Superior Institutional ID'],
  courses: ['Course Code', 'Course Title', 'Credit Units', 'Level', 'Department Short Name', 'Faculty Short Name', 'Semester', 'Lead Lecturer Institutional ID', 'Co-Lecturer Institutional ID'],
  hierarchy: ['Role Name', 'Access Type', 'Admin Dashboard Sections Accessible'],
};

const REQUIRED_COLUMNS: Record<ImportType, string[]> = {
  users: ['Full Name', 'Institutional ID', 'Email', 'Role'],
  courses: ['Course Code', 'Course Title', 'Credit Units', 'Level', 'Department Short Name', 'Semester', 'Lead Lecturer Institutional ID'],
  hierarchy: ['Role Name', 'Access Type'],
};

const VALID_ROLES = ['vice_chancellor', 'dean', 'hod', 'lecturer', 'student', 'system_admin'];

interface ValidatedRow {
  rowNumber: number;
  data: Record<string, string>;
  error: string | null;
}

interface ImportHistoryEntry {
  id: string;
  filename: string;
  type: ImportType;
  importedAt: string;
  totalRows: number;
  validRows: number;
  failedRows: number;
}

function validateRow(type: ImportType, row: Record<string, string>): string | null {
  const missing = REQUIRED_COLUMNS[type].filter((col) => !row[col]?.trim());
  if (missing.length > 0) return `Missing required field(s): ${missing.join(', ')}`;

  if (type === 'users') {
    const institutionalId = row['Institutional ID'].trim();
    if (users.some((u) => u.institutionalId === institutionalId)) return `Institutional ID "${institutionalId}" already exists`;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row['Email'].trim())) return 'Email is not a valid address';
    const role = row['Role'].trim();
    if (!VALID_ROLES.includes(role)) return `Role must be one of: ${VALID_ROLES.join(', ')}`;
    const deptShort = row['Department Short Name']?.trim();
    if (deptShort && !departments.some((d) => d.shortName === deptShort)) return `Unknown department short name: ${deptShort}`;
    if (role === 'student') {
      const level = Number(row['Level']);
      if (![100, 200, 300, 400, 500].includes(level)) return 'Level must be 100, 200, 300, 400, or 500 for students';
    }
  }

  if (type === 'courses') {
    const deptShort = row['Department Short Name']?.trim();
    if (deptShort && !departments.some((d) => d.shortName === deptShort)) return `Unknown department short name: ${deptShort}`;
    if (!Number.isFinite(Number(row['Credit Units']))) return 'Credit Units must be a number';
    if (!Number.isFinite(Number(row['Level']))) return 'Level must be a number';
  }

  return null;
}

export function BulkImportPanel() {
  const [importType, setImportType] = useState<ImportType>('users');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [history, setHistory] = useState<ImportHistoryEntry[]>([]);

  const validatedRows: ValidatedRow[] = useMemo(() => {
    if (!parseResult) return [];
    return parseResult.rows.map((r) => ({ rowNumber: r.rowNumber, data: r.data, error: validateRow(importType, r.data) }));
  }, [parseResult, importType]);

  const validCount = validatedRows.filter((r) => !r.error).length;
  const failedCount = validatedRows.length - validCount;

  const handleFile = useCallback(async (file: File) => {
    setParseError(null);
    setFileName(file.name);
    try {
      const result = await parseImportFile(file);
      setParseResult(result);
    } catch (err) {
      setParseResult(null);
      setParseError(err instanceof Error ? err.message : 'Could not parse this file.');
    }
  }, []);

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  function handleDownloadTemplate() {
    const columns = TEMPLATE_COLUMNS[importType];
    exportToExcel(`mandate-${importType}-import-template`, [{ name: 'Template', rows: [Object.fromEntries(columns.map((c) => [c, '']))] }]);
  }

  function handleConfirmImport() {
    if (!parseResult || !fileName) return;
    setHistory((prev) => [
      {
        id: `import-${Date.now()}`,
        filename: fileName,
        type: importType,
        importedAt: new Date().toISOString(),
        totalRows: validatedRows.length,
        validRows: validCount,
        failedRows: failedCount,
      },
      ...prev,
    ]);
    setParseResult(null);
    setFileName(null);
  }

  const previewColumns: DataTableColumn<ValidatedRow>[] = useMemo(() => {
    if (!parseResult) return [];
    const dataCols: DataTableColumn<ValidatedRow>[] = parseResult.headers.map((header) => ({
      key: header,
      header,
      render: (row) => <span className="truncate text-zinc-600 dark:text-zinc-300">{row.data[header] || '—'}</span>,
    }));
    return [
      { key: 'rowNumber', header: 'Row', align: 'center', width: '64px', render: (row) => <span className="text-zinc-400">{row.rowNumber}</span> },
      {
        key: 'status',
        header: 'Status',
        render: (row) =>
          row.error ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
              <XCircle className="h-3 w-3" />
              {row.error}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              Valid
            </span>
          ),
      },
      ...dataCols,
    ];
  }, [parseResult]);

  const historyColumns: DataTableColumn<ImportHistoryEntry>[] = [
    { key: 'filename', header: 'File', sortable: true, sortValue: (h) => h.filename, render: (h) => <span className="font-medium text-zinc-900 dark:text-white">{h.filename}</span> },
    { key: 'type', header: 'Type', render: (h) => <span className="capitalize text-zinc-600 dark:text-zinc-300">{h.type}</span> },
    { key: 'importedAt', header: 'Imported', sortable: true, sortValue: (h) => new Date(h.importedAt).getTime(), render: (h) => <span className="text-zinc-500 dark:text-zinc-400">{new Date(h.importedAt).toLocaleString()}</span> },
    { key: 'totalRows', header: 'Rows', align: 'center', render: (h) => <span className="text-zinc-600 dark:text-zinc-300">{h.totalRows}</span> },
    { key: 'validRows', header: 'Valid', align: 'center', render: (h) => <span className="text-emerald-600 dark:text-emerald-400">{h.validRows}</span> },
    { key: 'failedRows', header: 'Failed', align: 'center', render: (h) => <span className={h.failedRows > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-400'}>{h.failedRows}</span> },
  ];

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Institution Console</p>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Bulk Import</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Download a template, drop a completed file, and review the validation preview before confirming.</p>
      </div>

      <div className="mb-4 inline-flex rounded-xl border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {(['users', 'courses', 'hierarchy'] as ImportType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setImportType(type);
              setParseResult(null);
              setParseError(null);
            }}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium capitalize transition-colors ${
              importType === type ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Download {importType} template</p>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{TEMPLATE_COLUMNS[importType].join(' · ')}</p>
          </div>
          <Download className="h-5 w-5 shrink-0 text-zinc-400" />
        </button>

        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragActive(true);
          }}
          onDragLeave={() => setIsDragActive(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed p-4 text-center transition-colors ${
            isDragActive ? 'border-zinc-900 bg-zinc-50 dark:border-white dark:bg-zinc-800' : 'border-zinc-300 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800'
          }`}
        >
          <Upload className="h-5 w-5 text-zinc-400" />
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Drop a .csv or .xlsx file, or click to browse</p>
          {fileName && <p className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400"><FileSpreadsheet className="h-3.5 w-3.5" />{fileName}</p>}
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = '';
            }}
          />
        </label>
      </div>

      {parseError && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
          {parseError}
        </div>
      )}

      {parseResult && (
        <div className="mb-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
              Validation preview — {validCount} valid, {failedCount} need attention
            </p>
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={validatedRows.length === 0}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-900"
            >
              Confirm Import
            </button>
          </div>
          <DataTable columns={previewColumns} data={validatedRows} getRowId={(r) => String(r.rowNumber)} pageSize={10} emptyMessage="No rows found in this file." />
        </div>
      )}

      <div>
        <p className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">Import history</p>
        {history.length === 0 ? (
          <p className="rounded-2xl border border-zinc-200 bg-white px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            No imports confirmed yet this session.
          </p>
        ) : (
          <DataTable columns={historyColumns} data={history} getRowId={(h) => h.id} pageSize={8} initialSortKey="importedAt" initialSortDirection="desc" />
        )}
      </div>
    </div>
  );
}
