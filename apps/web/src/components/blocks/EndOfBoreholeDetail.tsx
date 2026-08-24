import { END_OF_BOREHOLE_OTHER_INSTALLATIONS_NONE, type Block } from '@mmsb/core';

import { getDateTime } from '../../utils/datetime';

// Port of apps/mobile/src/components/blockComponents/EndOfBoreholeBlockComponent.tsx.
//
// One deliberate difference: mobile revives a missing installation timestamp as
// `new Date(null)` — the epoch — so its `installationDate === null` guard never
// fires and blocks with no installation still print "1970/01/01 07:30". The web
// parser keeps a missing timestamp as null, so the line is correctly omitted here.

type EndOfBoreholeDetailProps = {
  block: Block<'EndOfBorehole'>;
};

export default function EndOfBoreholeDetail({
  block,
}: EndOfBoreholeDetailProps) {
  const hasInstallation =
    block.otherInstallations !== END_OF_BOREHOLE_OTHER_INSTALLATIONS_NONE;

  return (
    <div className="space-y-2">
      {hasInstallation && (
        <div className="text-xs text-slate-600 dark:text-slate-400">
          {block.installationDate && block.installationTime && (
            <p>
              Installation Date and Time:{' '}
              {getDateTime(block.installationDate, block.installationTime)}
            </p>
          )}

          {block.waterLevelInMetres !== null && (
            <p>Water Level: {block.waterLevelInMetres}</p>
          )}
        </div>
      )}

      {block.description && (
        <p className="whitespace-pre-wrap break-words">{block.description}</p>
      )}

      {block.remarks.length > 0 && (
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Remarks: {block.remarks}.
        </p>
      )}
    </div>
  );
}
