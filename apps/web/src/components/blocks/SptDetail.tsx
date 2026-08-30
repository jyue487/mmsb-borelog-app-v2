import type { Block } from '@mmsb/core';

// Port of apps/mobile/src/components/blockComponents/SptBlockComponent.tsx. The
// column proportions (2 / 4 / 1 / 1.5) are the mobile flex weights, kept so the
// two clients read the same way side by side.

type IncrementProps = {
  blows: number | null;
  penetrationInMillimetres: number | null;
};

/** One drive increment: blow count over penetration. */
function Increment({ blows, penetrationInMillimetres }: IncrementProps) {
  return (
    <div className="flex flex-col items-center px-0.5">
      <span>{blows}</span>
      <span className="text-slate-500 dark:text-slate-400">
        {penetrationInMillimetres}
      </span>
    </div>
  );
}

type ColumnProps = {
  heading: string;
  className?: string;
  children: React.ReactNode;
};

function Column({ heading, className = '', children }: ColumnProps) {
  return (
    <div className={`flex flex-col items-center px-1 ${className}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {heading}
      </span>

      {children}
    </div>
  );
}

type SptDetailProps = {
  block: Block<'Spt'>;
};

export default function SptDetail({ block }: SptDetailProps) {
  // A first main increment of 50 blows means refusal, so the second increment was
  // never driven and is left blank rather than printed as zero.
  const showsSecondMainIncrement = block.mainIncBlows1 < 50;

  return (
    <div className="space-y-2">
      {block.description && (
        <p className="whitespace-pre-wrap break-words">{block.description}</p>
      )}

      <div className="grid max-w-md grid-cols-[2fr_4fr_1fr_1.5fr] divide-x divide-slate-300 text-xs tabular-nums dark:divide-slate-700">
        <Column heading="Seating">
          <div className="grid w-full grid-cols-2">
            <Increment
              blows={block.seatingIncBlows1}
              penetrationInMillimetres={block.seatingIncPen1}
            />

            <Increment
              blows={block.seatingIncBlows2}
              penetrationInMillimetres={block.seatingIncPen2}
            />
          </div>
        </Column>

        <Column heading="Test Drive">
          <div className="grid w-full grid-cols-4">
            <Increment
              blows={block.mainIncBlows1}
              penetrationInMillimetres={block.mainIncPen1}
            />

            <Increment
              blows={showsSecondMainIncrement ? block.mainIncBlows2 : null}
              penetrationInMillimetres={
                showsSecondMainIncrement ? block.mainIncPen2 : null
              }
            />

            <Increment
              blows={block.mainIncBlows3}
              penetrationInMillimetres={block.mainIncPen3}
            />

            <Increment
              blows={block.mainIncBlows4}
              penetrationInMillimetres={block.mainIncPen4}
            />
          </div>
        </Column>

        <Column heading="N">
          <span className="font-semibold">{block.sptNValue}</span>

          {/* At N = 50 the test is a refusal, so the log records how far it
              actually penetrated instead of a blow count. */}
          {block.sptNValue === 50 && (
            <span className="text-slate-500 dark:text-slate-400">
              {block.totalMainPenetrationInMillimetres}
            </span>
          )}
        </Column>

        <Column heading="R%">
          <span>{block.recoveryInPercentage.toFixed(1)}</span>
        </Column>
      </div>
    </div>
  );
}
