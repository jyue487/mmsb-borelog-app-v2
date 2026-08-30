import type { BlockPhoto } from '../../supabase/blockPhotos';

// The right-hand column of a log row: the block's photos as thumbnails, left to right.
// The column is a fixed width so that every row keeps the same geometry — the log is a
// depth log, and uneven row heights would break the vertical pacing that carries meaning.
// Overflow is therefore a `+N` badge rather than wrapping or a nested scrollbar.

/**
 * How many tiles fit on one line. Paired with the `w-[200px]` on the container below:
 * 200px less the `px-2` padding leaves 184px, which takes three `size-12` (48px) tiles
 * and their two `gap-1` (4px) gutters with 28px to spare. Changing either number means
 * changing the other.
 */
const VISIBLE_SLOTS = 3;

const TILE_CLASSES =
  'size-12 shrink-0 overflow-hidden rounded border border-slate-200 transition hover:border-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-slate-700';

type BlockPhotoStripProps = {
  photos: BlockPhoto[];
  /** Opens the block's gallery at this index. */
  onOpen: (index: number) => void;
  /** Block label used to caption the thumbnails, e.g. `S-1`. */
  label: string;
};

export default function BlockPhotoStrip({
  photos,
  onOpen,
  label,
}: BlockPhotoStripProps) {
  // The last slot becomes a `+N` badge as soon as the photos do not all fit, so one
  // fewer thumbnail is shown in that case.
  const hasOverflow = photos.length > VISIBLE_SLOTS;
  const visiblePhotos = hasOverflow
    ? photos.slice(0, VISIBLE_SLOTS - 1)
    : photos;
  const hiddenCount = photos.length - visiblePhotos.length;

  return (
    // Rendered even when the block has no photos, so the column stays aligned all the
    // way down the log.
    <div className="flex w-[200px] shrink-0 items-start gap-1 overflow-hidden border-l border-slate-200 px-2 py-2 dark:border-slate-800">
      {visiblePhotos.map((photo, index) => (
        <button
          key={photo.id}
          type="button"
          onClick={() => onOpen(index)}
          className={TILE_CLASSES}
          title={`${label} — photo ${index + 1} of ${photos.length}`}
        >
          <img
            // Only the rows scrolled into view fetch their bytes. Photos are captured at
            // `quality: 0.1` so they are small enough to serve as their own thumbnails.
            loading="lazy"
            src={photo.signedUrl}
            alt={`${label} photo ${index + 1}`}
            className="size-full object-cover"
          />
        </button>
      ))}

      {hasOverflow && (
        <button
          type="button"
          onClick={() => onOpen(visiblePhotos.length)}
          className={`${TILE_CLASSES} flex items-center justify-center bg-slate-100 text-xs font-semibold tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-300`}
          title={`Show the other ${hiddenCount} photos of ${label}`}
        >
          +{hiddenCount}
        </button>
      )}
    </div>
  );
}
