import * as XLSX from 'xlsx';

export interface ExcelSheet {
  /** Sheet tab name — will be truncated to Excel's 31-character limit. */
  name: string;
  rows: Record<string, string | number | boolean | null | undefined>[];
}

/**
 * Builds and downloads a real, client-side .xlsx workbook from seeded demo data.
 * Per the Investor Prototype Plan (8.5): cheap to make genuinely functional,
 * and doing so measurably raises the "is this real" impression.
 */
export function exportToExcel(filename: string, sheets: ExcelSheet[]): void {
  const workbook = XLSX.utils.book_new();

  sheets.forEach((sheet) => {
    const rows = sheet.rows.length > 0 ? sheet.rows : [{ 'No data': 'No rows matched the current filters' }];
    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = computeColumnWidths(rows);
    const safeName = sheet.name.slice(0, 31) || 'Sheet1';
    XLSX.utils.book_append_sheet(workbook, worksheet, safeName);
  });

  const safeFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, safeFilename);
}

function computeColumnWidths(rows: Record<string, unknown>[]): Array<{ wch: number }> {
  if (rows.length === 0) return [];
  const keys = Object.keys(rows[0]);
  return keys.map((key) => {
    const longestValue = rows.reduce((max, row) => Math.max(max, String(row[key] ?? '').length), key.length);
    return { wch: Math.min(Math.max(longestValue + 2, 10), 42) };
  });
}
