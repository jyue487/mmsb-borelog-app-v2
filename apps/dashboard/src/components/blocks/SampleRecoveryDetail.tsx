import type { Block } from '@mmsb/core';

// The three undisturbed-sample types (UD, MZ, PS) render identically: the soil
// description, with a recovery percentage below it.
//
// The R% column reuses SptDetail's track sizing verbatim and lands in its fourth
// column, so recovery sits at the same x on every row of the log whether the block
// is an SPT or a sample. That deliberately diverges from
// apps/mobile/src/components/blockComponents/{Ud,Mz,Ps}BlockComponent.tsx, which
// still place recovery beside the description.

type SampleRecoveryDetailProps = {
  block: Block<'Ud'> | Block<'Mz'> | Block<'Ps'>;
};

export default function SampleRecoveryDetail({
  block,
}: SampleRecoveryDetailProps) {
  return (
    <div className="space-y-2">
      <p className="whitespace-pre-wrap break-words">
        {block.soilDescription}
      </p>

      {/* `col-start-4` rather than three empty spacer cells — and `border-l` on the
          one cell rather than `divide-x`, which would rule off the empty columns. */}
      <div className="grid max-w-md grid-cols-[2fr_4fr_1fr_1.5fr] text-xs tabular-nums">
        <div className="col-start-4 flex flex-col items-center border-l border-slate-300 px-1 dark:border-slate-700">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            R%
          </span>

          <span>{block.recoveryInPercentage.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}
