import type { Borehole } from '@mmsb/core';
import { Pencil } from 'lucide-react';

// Labels and number formatting are taken from the report header
// (apps/mobile/src/utils/pdf/renderHeaderToHtml.ts:50-68) so the dashboard and the
// printed log describe a borehole with the same words.

function formatGroundLevel(reducedLevelInMetres: number | null): string | null {
  return reducedLevelInMetres === null
    ? null
    : `${reducedLevelInMetres.toFixed(3)}m (RL)`;
}

function formatCoordinate(
  eastingInMetres: number | null,
  northingInMetres: number | null,
): string | null {
  // The report prints nothing unless it has both halves of the pair.
  return eastingInMetres === null || northingInMetres === null
    ? null
    : `(${eastingInMetres.toFixed(3)}E, ${northingInMetres.toFixed(3)}N)`;
}

type DetailItemProps = {
  label: string;
  value: string | null | undefined;
};

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </dt>

      <dd className="mt-0.5 truncate text-sm font-semibold text-slate-950 dark:text-slate-100">
        {value || '—'}
      </dd>
    </div>
  );
}

type BoreholeDetailStripProps = {
  borehole: Borehole;
  // Omitted for anyone who may not edit, which is what hides the pencil. The
  // `pr-12` clearance below is unconditional so the strip does not reflow
  // between a viewer and an admin looking at the same borehole.
  onEdit?: () => void;
};

export default function BoreholeDetailStrip({
  borehole,
  onEdit,
}: BoreholeDetailStripProps) {
  return (
    <section className="group relative mb-3 shrink-0 rounded-2xl border border-slate-200 bg-white px-5 py-4 pr-12 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          aria-label="Edit borehole details"
          className="absolute right-3 top-3 z-10 rounded-lg p-2 text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:opacity-100 group-hover:opacity-100 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </button>
      )}

      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-7">
        <DetailItem label="Type of Boring" value={borehole.typeOfBoring} />

        <DetailItem label="Type of Rig" value={borehole.typeOfRig} />

        <DetailItem label="Dia. of Boring" value={borehole.diameterOfBoring} />

        <DetailItem
          label="Ground Level"
          value={formatGroundLevel(borehole.reducedLevelInMetres)}
        />

        <DetailItem
          label="Coordinate"
          value={formatCoordinate(
            borehole.eastingInMetres,
            borehole.northingInMetres,
          )}
        />

        <DetailItem label="Driller" value={borehole.drillerName} />

        <div className="min-w-0">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Verifier
          </dt>

          <dd className="mt-0.5 text-sm font-semibold text-slate-950 dark:text-slate-100">
            <span className="block truncate">{borehole.verifierName || '—'}</span>

            {/* Stored as a base64 data URI by the mobile signature pad. Capped in
                height so a tall signature cannot stretch the strip. */}
            {borehole.verifierSignatureBase64 && (
              <img
                src={borehole.verifierSignatureBase64}
                alt={`Signature of ${borehole.verifierName || 'verifier'}`}
                className="mt-1 h-8 w-auto max-w-full object-contain"
              />
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}
