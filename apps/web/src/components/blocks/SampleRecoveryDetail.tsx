import type { Block } from '@mmsb/core';

// The three undisturbed-sample types (UD, MZ, PS) render identically: the soil
// description beside a recovery percentage. Ports
// apps/mobile/src/components/blockComponents/{Ud,Mz,Ps}BlockComponent.tsx, which
// are three copies of the same markup.

type SampleRecoveryDetailProps = {
  block: Block<'Ud'> | Block<'Mz'> | Block<'Ps'>;
};

export default function SampleRecoveryDetail({
  block,
}: SampleRecoveryDetailProps) {
  return (
    <div className="flex items-start gap-2">
      <p className="min-w-0 flex-1 whitespace-pre-wrap break-words">
        {block.soilDescription}
      </p>

      <div className="flex w-16 shrink-0 flex-col items-center border-l border-slate-300 px-1 text-xs tabular-nums dark:border-slate-700">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          R%
        </span>

        <span>{block.recoveryInPercentage.toFixed(1)}</span>
      </div>
    </div>
  );
}
