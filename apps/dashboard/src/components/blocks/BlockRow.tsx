import {
  ASPHALT_BLOCK_TYPE_ID,
  CAVITY_BLOCK_TYPE_ID,
  CONCRETE_SLAB_BLOCK_TYPE_ID,
  CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
  CORING_BLOCK_TYPE_ID,
  CUSTOM_BLOCK_TYPE_ID,
  END_OF_BOREHOLE_BLOCK_TYPE_ID,
  FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
  HA_BLOCK_TYPE_ID,
  LUGEON_TEST_BLOCK_TYPE_ID,
  MZ_BLOCK_TYPE_ID,
  PRESSUREMETER_TEST_BLOCK_TYPE_ID,
  PS_BLOCK_TYPE_ID,
  RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
  SPT_BLOCK_TYPE_ID,
  UD_BLOCK_TYPE_ID,
  VANE_SHEAR_TEST_BLOCK_TYPE_ID,
  WASH_BORING_BLOCK_TYPE_ID,
  type Block,
} from '@mmsb/core';
import { useState } from 'react';

import type { BlockPhoto } from '../../supabase/blockPhotos';
import BlockPhotoLightbox from './BlockPhotoLightbox';
import BlockPhotoStrip from './BlockPhotoStrip';
import { BLOCK_GUTTER_SPECS } from './blockGutterSpec';
import CoringDetail from './CoringDetail';
import DayWorkStatusLines from './DayWorkStatusLines';
import EndOfBoreholeDetail from './EndOfBoreholeDetail';
import SampleRecoveryDetail from './SampleRecoveryDetail';
import SptDetail from './SptDetail';

// One row of the borehole log. Every block type shares this frame — a fixed depth
// gutter on the left, the shift boundary and the type-specific body on the right —
// which is what apps/mobile/src/constants/styles.ts calls `block` and
// `blockComponentLeftColumn`.

/**
 * Twelve of the eighteen block types have no numbers to show and render as their
 * description alone.
 */
function DescriptionDetail({ description }: { description: string }) {
  return <p className="whitespace-pre-wrap break-words">{description}</p>;
}

function BlockDetail({ block }: { block: Block }) {
  switch (block.blockTypeId) {
    case SPT_BLOCK_TYPE_ID:
      return <SptDetail block={block} />;

    case CORING_BLOCK_TYPE_ID:
      return <CoringDetail block={block} />;

    case UD_BLOCK_TYPE_ID:
    case MZ_BLOCK_TYPE_ID:
    case PS_BLOCK_TYPE_ID:
      return <SampleRecoveryDetail block={block} />;

    case END_OF_BOREHOLE_BLOCK_TYPE_ID:
      return <EndOfBoreholeDetail block={block} />;

    case CAVITY_BLOCK_TYPE_ID:
    case HA_BLOCK_TYPE_ID:
    case WASH_BORING_BLOCK_TYPE_ID:
    case CONCRETE_SLAB_BLOCK_TYPE_ID:
    case ASPHALT_BLOCK_TYPE_ID:
    case CUSTOM_BLOCK_TYPE_ID:
    case VANE_SHEAR_TEST_BLOCK_TYPE_ID:
    case FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID:
    case RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID:
    case CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID:
    case LUGEON_TEST_BLOCK_TYPE_ID:
    case PRESSUREMETER_TEST_BLOCK_TYPE_ID:
      return <DescriptionDetail description={block.description} />;

    default:
      // Adding a block type without adding a case here is a compile error.
      return block satisfies never;
  }
}

type BlockRowProps = {
  block: Block;
  photos: BlockPhoto[];
  /**
   * Download filenames for the whole borehole, keyed by photo id. Built once by the page
   * rather than per row, because the counter in a name is scoped to the depth interval and
   * so can span two blocks that happen to share one.
   */
  photoFilenames: Map<string, string>;
};

export default function BlockRow({
  block,
  photos,
  photoFilenames,
}: BlockRowProps) {
  const gutterSpec = BLOCK_GUTTER_SPECS[block.blockTypeId];
  const labels = gutterSpec.labels(block);

  // The gallery belongs to the row rather than to the page: only one can be open at a
  // time anyway, since opening one takes a click, and keeping it here spares BoreholePage
  // a piece of state it would otherwise thread back down.
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Caption the photos with the same label and depths the gutter prints, by reading the
  // gutter spec again instead of adding a second per-type table.
  const depthParts: string[] = [];

  if (gutterSpec.showsTopDepth(block)) {
    depthParts.push(block.topDepthInMetres.toFixed(3));
  }

  if (gutterSpec.showsBaseDepth(block)) {
    depthParts.push(block.baseDepthInMetres.toFixed(3));
  }

  const interval = depthParts.length > 0 ? `${depthParts.join(' – ')} m` : '';
  const sampleLabel = labels.join(' / ');

  // Twelve of the eighteen types carry no sample label, and a custom block can hide both
  // of its depths, so fall back label → interval → a plain word rather than captioning a
  // photo with an empty string.
  const photoLabel = sampleLabel || interval || 'Block';
  const photoTitle =
    sampleLabel && interval ? `${sampleLabel} · ${interval}` : photoLabel;

  return (
    <div className="flex border-b border-slate-200 text-sm text-slate-900 dark:border-slate-800 dark:text-slate-100">
      <div className="flex w-[70px] shrink-0 flex-col items-center border-r border-slate-200 px-1 py-2 text-xs tabular-nums dark:border-slate-800">
        {gutterSpec.showsTopDepth(block) && (
          <span>{block.topDepthInMetres.toFixed(3)}</span>
        )}

        <div className="min-h-5 flex-1" />

        {labels.length > 0 && (
          <>
            <div className="flex flex-col items-center font-semibold">
              {labels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>

            <div className="min-h-5 flex-1" />
          </>
        )}

        {gutterSpec.showsBaseDepth(block) && (
          <span>{block.baseDepthInMetres.toFixed(3)}</span>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-3 px-3 py-2">
        <DayWorkStatusLines dayWorkStatus={block.dayWorkStatus} />

        <BlockDetail block={block} />
      </div>

      <BlockPhotoStrip
        photos={photos}
        onOpen={setLightboxIndex}
        label={photoLabel}
      />

      {lightboxIndex !== null && (
        <BlockPhotoLightbox
          photos={photos}
          startIndex={lightboxIndex}
          title={photoTitle}
          filenames={photoFilenames}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
