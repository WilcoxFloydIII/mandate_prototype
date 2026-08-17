import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedRow {
  rowNumber: number;
  data: Record<string, string>;
}

export interface ParseResult {
  headers: string[];
  rows: ParsedRow[];
}

/** Parses a dropped/selected .csv or .xlsx/.xls file entirely client-side. */
export async function parseImportFile(file: File): Promise<ParseResult> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.csv')) return parseCsv(file);
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) return parseWorkbook(file);
  throw new Error('Unsupported file type — upload a .csv or .xlsx file.');
}

function parseCsv(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields ?? [];
        const rows: ParsedRow[] = results.data.map((data, i) => ({ rowNumber: i + 2, data })); // +2: row 1 is the header
        resolve({ headers, rows });
      },
      error: (err: Error) => reject(err),
    });
  });
}

async function parseWorkbook(file: File): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });
  const headers = json.length > 0 ? Object.keys(json[0]) : [];
  const rows: ParsedRow[] = json.map((data, i) => ({ rowNumber: i + 2, data }));
  return { headers, rows };
}
