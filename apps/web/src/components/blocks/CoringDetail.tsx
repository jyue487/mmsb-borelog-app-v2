import type { Block } from '@mmsb/core';

// Port of apps/mobile/src/components/blockComponents/CoringBlockComponent.tsx.

type MetricProps = {
  heading: string;
  value: string;
  className?: string;
};

function Metric({ heading, value, className = '' }: MetricProps) {
  return (
    <div className={`flex flex-col items-center px-1 ${className}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {heading}
      </span>

      <span>{value}</span>
    </div>
  );
}

type CoringDetailProps = {
  block: Block<'Coring'>;
};

export default function CoringDetail({ block }: CoringDetailProps) {
  return (
    <div className="space-y-2">
      {block.description && (
        <p className="whitespace-pre-wrap break-words">{block.description}</p>
      )}

      <div className="grid max-w-md grid-cols-[4fr_3fr_3fr] divide-x divide-slate-300 text-xs tabular-nums dark:divide-slate-700">
        <Metric heading="Core Run (m)" value={block.coreRunInMetres.toFixed(2)} />

        <Metric heading="C.R.%" value={String(block.coreRecoveryInPercentage)} />

        <Metric heading="R.Q.D%" value={String(block.rqdInPercentage)} />
      </div>
    </div>
  );
}
