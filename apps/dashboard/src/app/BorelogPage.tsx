import type { BorelogWorkbook } from '@mmsb/borelog';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { useRef, useState } from 'react';

/**
 * Prints borelogs from an AGS workbook: upload one `.xlsx`, tick the boreholes, get a zip
 * with one PDF per borehole — or `<borehole>.error.txt` in its place when it cannot be drawn.
 *
 * Everything happens in the browser. The workbook is never uploaded anywhere, and
 * `@mmsb/borelog` (pdf-lib, fflate and the legend PNGs) is loaded only once a workbook is
 * picked, behind a dynamic `import()`, so the rest of the dashboard never carries it.
 */

type LoadedWorkbook = {
  fileName: string;
  /** The file name without `.xlsx`, which every PDF in the zip is named after. */
  stem: string;
  workbook: BorelogWorkbook;
  /** What a blank SPT-N Max (D13) is drawn as. */
  defaultSptNMax: number;
};

type PrintSummary = {
  printed: number;
  failed: number;
};

function stemOf(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  return dot > 0 ? fileName.slice(0, dot) : fileName;
}

function downloadBytes(bytes: Uint8Array, fileName: string, type: string) {
  // Same idiom as downloadAgsExcel.ts.
  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type }));
  try {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function BorelogPage() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [loaded, setLoaded] = useState<LoadedWorkbook | null>(null);
  const [selectedHoleIds, setSelectedHoleIds] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [isReading, setIsReading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [summary, setSummary] = useState<PrintSummary | null>(null);

  const boreholes = loaded?.workbook.boreholes ?? [];
  const sptNMax = loaded?.workbook.project.sptNMax ?? null;
  const allSelected =
    boreholes.length > 0 && selectedHoleIds.size === boreholes.length;

  const openWorkbook = async (file: File) => {
    setIsReading(true);
    setErrorMessage(null);
    setSummary(null);
    setLoaded(null);
    setSelectedHoleIds(new Set());

    try {
      const { DEFAULT_SPT_N_MAX, parseBorelogWorkbook } = await import(
        '@mmsb/borelog'
      );
      const workbook = parseBorelogWorkbook(
        new Uint8Array(await file.arrayBuffer()),
      );

      if (workbook.boreholes.length === 0) {
        throw new Error('The Holes - AGS sheet lists no boreholes.');
      }

      setLoaded({
        fileName: file.name,
        stem: stemOf(file.name),
        workbook,
        defaultSptNMax: DEFAULT_SPT_N_MAX,
      });
      setSelectedHoleIds(new Set(workbook.boreholes.map((hole) => hole.id)));
    } catch (error) {
      console.error('Could not read the workbook:', error);
      setErrorMessage(
        error instanceof Error
          ? `Could not read ${file.name}: ${error.message}`
          : `Could not read ${file.name}.`,
      );
    } finally {
      setIsReading(false);
    }
  };

  const toggleHole = (holeId: string) => {
    setSummary(null);
    setSelectedHoleIds((current) => {
      const next = new Set(current);
      if (next.has(holeId)) {
        next.delete(holeId);
      } else {
        next.add(holeId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    setSummary(null);
    setSelectedHoleIds(
      allSelected ? new Set() : new Set(boreholes.map((hole) => hole.id)),
    );
  };

  const printBorelogs = async () => {
    if (loaded === null || selectedHoleIds.size === 0) {
      return;
    }

    setIsPrinting(true);
    setErrorMessage(null);
    setSummary(null);

    try {
      const [{ renderBorelogs, zipBorelogs }, { loadBorelogAssets }] =
        await Promise.all([
          import('@mmsb/borelog'),
          import('../utils/borelogAssets'),
        ]);

      // Sheet order, not the order the boxes were ticked in.
      const holeIds = loaded.workbook.boreholes
        .map((hole) => hole.id)
        .filter((holeId) => selectedHoleIds.has(holeId));

      const results = await renderBorelogs(
        loaded.workbook,
        holeIds,
        loadBorelogAssets,
      );

      downloadBytes(
        zipBorelogs(results, loaded.stem),
        `${loaded.stem} - borelogs.zip`,
        'application/zip',
      );

      const printed = results.filter((result) => 'pdf' in result).length;
      setSummary({ printed, failed: results.length - printed });
    } catch (error) {
      console.error('Borelog printing failed:', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'Could not print the borelogs.',
      );
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-100 px-4 py-8 text-slate-950 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            MMSB Dashboard
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">Borelog</h1>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Print borelogs from a filled AGS workbook. The workbook stays on
            this computer.
          </p>
        </header>

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
          >
            {errorMessage}
          </div>
        )}

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <FileSpreadsheet
                className="size-9 shrink-0 text-slate-400"
                aria-hidden="true"
              />

              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {loaded?.fileName ?? 'No workbook selected'}
                </p>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {loaded
                    ? `${boreholes.length} borehole${boreholes.length === 1 ? '' : 's'} on the Holes - AGS sheet`
                    : 'One .xlsx at a time, exported from the dashboard or filled in by hand.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isReading || isPrinting}
              className="shrink-0 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {isReading
                ? 'Reading...'
                : loaded
                  ? 'Choose another workbook'
                  : 'Choose workbook'}
            </button>

            {/*
              Hidden; the button above drives it. `value` is cleared on every
              change so that picking the same file again still fires.
            */}
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = '';

                if (file) {
                  void openWorkbook(file);
                }
              }}
            />
          </div>

          {loaded && (
            <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 border-t border-slate-200 pt-5 text-sm dark:border-slate-800 sm:grid-cols-3">
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Project
                </dt>
                <dd className="mt-1 break-words font-semibold">
                  {loaded.workbook.project.id || 'Not specified'}
                </dd>
              </div>

              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Title
                </dt>
                <dd className="mt-1 break-words font-semibold">
                  {loaded.workbook.project.name || 'Not specified'}
                </dd>
              </div>

              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  SPT-N Max
                </dt>
                <dd className="mt-1 font-semibold">
                  {sptNMax ??
                    `${loaded.defaultSptNMax} (cell D13 is blank, so assumed)`}
                </dd>
              </div>
            </dl>
          )}

        </section>

        {loaded && (
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  disabled={isPrinting}
                  className="size-4 accent-indigo-600"
                />
                {selectedHoleIds.size} of {boreholes.length} selected
              </label>

              <button
                type="button"
                onClick={() => void printBorelogs()}
                disabled={isPrinting || selectedHoleIds.size === 0}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Printer className="size-4" aria-hidden="true" />
                {isPrinting
                  ? 'Printing...'
                  : `Print ${selectedHoleIds.size} borelog${selectedHoleIds.size === 1 ? '' : 's'}`}
              </button>
            </div>

            {summary && (
              <p
                role="status"
                className={`border-b px-5 py-3 text-sm sm:px-6 ${
                  summary.failed === 0
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300'
                }`}
              >
                {summary.printed} printed
                {summary.failed > 0 &&
                  `, ${summary.failed} failed — the reason for each is in its .error.txt in the zip`}
                .
              </p>
            )}

            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {boreholes.map((hole, index) => (
                <li key={`${hole.id}-${index}`}>
                  <label className="flex cursor-pointer items-center gap-3 px-5 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/50 sm:px-6">
                    <input
                      type="checkbox"
                      checked={selectedHoleIds.has(hole.id)}
                      onChange={() => toggleHole(hole.id)}
                      disabled={isPrinting}
                      className="size-4 shrink-0 accent-indigo-600"
                    />

                    <span className="min-w-0 flex-1 truncate font-semibold">
                      {hole.id}
                    </span>

                    <span className="shrink-0 text-sm text-slate-500 dark:text-slate-400">
                      {hole.finalDepthInMetres.toFixed(2)} m
                      {hole.startDate && ` · ${hole.startDate}`}
                      {hole.endDate && ` – ${hole.endDate}`}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
