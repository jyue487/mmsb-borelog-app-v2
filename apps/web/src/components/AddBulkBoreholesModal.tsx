import type { Borehole } from '@mmsb/core';
import { useMemo, useState } from 'react';

import { BOREHOLE_COLUMNS, mapBoreholeRow } from '../supabase/boreholeRow';
import { supabase } from '../supabase/supabase.server';

type AddBulkBoreholesModalProps = {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onBoreholesAdded: (boreholes: Borehole[]) => void;
};

type ParsedBorehole = {
  rowNumber: number;
  name: string;
  eastingInMetres: number | null;
  northingInMetres: number | null;
  reducedLevelInMetres: number | null;
  error: string | null;
};

function parseOptionalNumber(value: string): number | null {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const parsedValue = Number(trimmedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function parseBoreholeText(input: string): ParsedBorehole[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      /*
       * Excel normally copies cells using tabs.
       * Commas are accepted as a fallback for CSV-like input.
       */
      const columns = line.includes('\t')
        ? line.split('\t')
        : line.split(/,\s*|\s{2,}/);

      const [
        rawName = '',
        rawEasting = '',
        rawNorthing = '',
        rawReducedLevel = '',
      ] = columns.map((column) => column.trim());

      const eastingInMetres = parseOptionalNumber(rawEasting);
      const northingInMetres = parseOptionalNumber(rawNorthing);
      const reducedLevelInMetres =
        parseOptionalNumber(rawReducedLevel);

      let error: string | null = null;

      if (!rawName) {
        error = 'Borehole name is required.';
      } else if (
        rawEasting &&
        eastingInMetres === null
      ) {
        error = 'Easting must be a valid number.';
      } else if (
        rawNorthing &&
        northingInMetres === null
      ) {
        error = 'Northing must be a valid number.';
      } else if (
        rawReducedLevel &&
        reducedLevelInMetres === null
      ) {
        error = 'Reduced level must be a valid number.';
      } else if (columns.length > 4) {
        error = 'Expected four columns only.';
      }

      return {
        rowNumber: index + 1,
        name: rawName,
        eastingInMetres,
        northingInMetres,
        reducedLevelInMetres,
        error,
      };
    });
}

export default function AddBulkBoreholesModal({
  projectId,
  isOpen,
  onClose,
  onBoreholesAdded,
}: AddBulkBoreholesModalProps) {
  const [input, setInput] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedRows = useMemo(
    () => parseBoreholeText(input),
    [input],
  );

  const invalidRows = parsedRows.filter(
    (row) => row.error,
  );

  const duplicateNames = useMemo(() => {
    const nameCounts = new Map<string, number>();

    for (const row of parsedRows) {
      const normalizedName = row.name
        .trim()
        .toLowerCase();

      if (!normalizedName) {
        continue;
      }

      nameCounts.set(
        normalizedName,
        (nameCounts.get(normalizedName) ?? 0) + 1,
      );
    }

    return new Set(
      [...nameCounts.entries()]
        .filter(([, count]) => count > 1)
        .map(([name]) => name),
    );
  }, [parsedRows]);

  const hasDuplicateNames =
    duplicateNames.size > 0;

  const canSubmit =
    parsedRows.length > 0 &&
    invalidRows.length === 0 &&
    !hasDuplicateNames &&
    !isSubmitting;

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }

    setInput('');
    setSubmitError(null);
    onClose();
  };

  const addBoreholes = async () => {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const rowsToInsert = parsedRows.map((row) => ({
        project_id: projectId,
        name: row.name,
        easting_in_metres: row.eastingInMetres,
        northing_in_metres: row.northingInMetres,
        reduced_level_in_metres: row.reducedLevelInMetres,
        type_of_boring: 'Rotary Wash Boring',
        type_of_rig: 'YWE D90R',
        diameter_of_boring: '89mm/114mm',
        driller_name: '',
        verifier_name: '',
        verifier_signature_base64: '',
        verifier_sign_date: null,
      }));

      const { data, error } = await supabase
        .from('boreholes')
        .insert(rowsToInsert)
        .select(BOREHOLE_COLUMNS);

      if (error) {
        throw error;
      }

      // verifierSignDate goes from `row.verifier_sign_date` to a hardcoded null
      // via mapBoreholeRow. Not a behaviour change: every row here is inserted
      // with `verifier_sign_date: null`, so that is the only value it read back.
      const newBoreholes: Borehole[] = (data ?? []).map(mapBoreholeRow);

      onBoreholesAdded(newBoreholes);
      closeModal();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Unable to add boreholes.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-bulk-boreholes-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      <div className="flex max-h-[90dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <h2
              id="add-bulk-boreholes-title"
              className="text-xl font-bold text-slate-950 dark:text-white"
            >
              Add boreholes in bulk
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Copy rows from Excel and paste them
              below.
            </p>
          </div>

          <button
            type="button"
            onClick={closeModal}
            disabled={isSubmitting}
            aria-label="Close modal"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm dark:border-indigo-900/60 dark:bg-indigo-950/30">
            <p className="font-semibold text-indigo-900 dark:text-indigo-300">
              Expected column order
            </p>

            <p className="mt-1 font-mono text-xs text-indigo-700 dark:text-indigo-400">
              Name → Easting → Northing →
              Reduced level
            </p>

            <p className="mt-2 text-xs text-indigo-700 dark:text-indigo-400">
              Only the borehole name is required.
              Leave optional Excel cells empty when
              their values are unavailable.
            </p>
          </div>

          <label
            htmlFor="bulk-borehole-data"
            className="mt-5 block text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            Borehole data
          </label>

          <textarea
            id="bulk-borehole-data"
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            placeholder={
              'BH1\t321456.23\t345678.90\t12.50\n' +
              'BH2\t321466.10\t345688.42\t11.80'
            }
            rows={10}
            spellCheck={false}
            className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />

          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-400">
              {parsedRows.length}{' '}
              {parsedRows.length === 1
                ? 'row'
                : 'rows'}{' '}
              detected
            </span>

            {invalidRows.length > 0 && (
              <span className="font-semibold text-red-600 dark:text-red-400">
                {invalidRows.length} invalid
              </span>
            )}

            {hasDuplicateNames && (
              <span className="font-semibold text-red-600 dark:text-red-400">
                Duplicate borehole names detected
              </span>
            )}
          </div>

          {parsedRows.length > 0 && (
            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">
                        Row
                      </th>
                      <th className="px-4 py-3">
                        Name
                      </th>
                      <th className="px-4 py-3">
                        Easting
                      </th>
                      <th className="px-4 py-3">
                        Northing
                      </th>
                      <th className="px-4 py-3">
                        Reduced level
                      </th>
                      <th className="px-4 py-3">
                        Validation
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {parsedRows.map((row) => {
                      const isDuplicate =
                        duplicateNames.has(
                          row.name
                            .trim()
                            .toLowerCase(),
                        );

                      return (
                        <tr key={row.rowNumber}>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                            {row.rowNumber}
                          </td>

                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                            {row.name || '—'}
                          </td>

                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                            {row.eastingInMetres ??
                              '—'}
                          </td>

                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                            {row.northingInMetres ??
                              '—'}
                          </td>

                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                            {row.reducedLevelInMetres ??
                              '—'}
                          </td>

                          <td className="px-4 py-3">
                            {row.error ? (
                              <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                                {row.error}
                              </span>
                            ) : isDuplicate ? (
                              <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                                Duplicate name
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                Valid
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {submitError && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
              {submitError}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={closeModal}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => void addBoreholes()}
            disabled={!canSubmit}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? 'Adding boreholes...'
              : `Add ${parsedRows.length} ${parsedRows.length > 1 ? 'boreholes' : 'borehole'}`}
          </button>
        </div>
      </div>
    </div>
  );
}