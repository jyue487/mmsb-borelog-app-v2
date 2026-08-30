import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import { useEffect, useId, useState } from 'react';

import type { BlockPhoto } from '../../supabase/blockPhotos';
import { buildDownloadUrl } from '../../utils/blockPhotoFilenames';

// The full-size photo popup, scoped to one block. There is no shared Modal component in
// apps/web and nothing uses createPortal — all eight existing modals hand-roll the same
// overlay, the same `onMouseDown` backdrop check and their own Escape listener, so this
// follows that shape rather than introducing a second convention.

type BlockPhotoLightboxProps = {
  photos: BlockPhoto[];
  /** Which photo the click landed on. */
  startIndex: number;
  /** Block label and depth interval, e.g. `S-1 · 1.000 – 1.450 m`. */
  title: string;
  /** Download filename for every photo of the borehole, keyed by photo id. */
  filenames: Map<string, string>;
  onClose: () => void;
};

export default function BlockPhotoLightbox({
  photos,
  startIndex,
  title,
  filenames,
  onClose,
}: BlockPhotoLightboxProps) {
  const titleId = useId();
  const [index, setIndex] = useState(startIndex);

  // Navigation is block-scoped and deliberately does not wrap: running off the end of a
  // block would otherwise silently loop without ever saying so.
  const hasPrevious = index > 0;
  const hasNext = index < photos.length - 1;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key === 'ArrowLeft') {
        setIndex((current) => Math.max(0, current - 1));
        return;
      }

      if (event.key === 'ArrowRight') {
        setIndex((current) => Math.min(photos.length - 1, current + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, photos.length]);

  const photo = photos[index];
  // The map is built from the same photos, so the fallback is belt and braces — but a
  // download with no name at all would be worse than one named after the row id.
  const filename = filenames.get(photo.id) ?? `${photo.id}.jpg`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      // `onMouseDown` with the target check rather than `onClick`, so a drag that starts
      // on the photo and releases on the backdrop does not close the popup.
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[90dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2
            id={titleId}
            className="text-lg font-bold text-slate-900 dark:text-white"
          >
            {title}
          </h2>

          <div className="flex shrink-0 items-center gap-1">
            {/* A real anchor, not a button: this is a link to a file. Storage names the
                download through `Content-Disposition`, since the `download` attribute
                below is ignored for a cross-origin href and only serves as a hint. */}
            <a
              href={buildDownloadUrl(photo.signedUrl, filename)}
              download={filename}
              aria-label={`Download ${filename}`}
              title={filename}
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <Download className="h-5 w-5" />
            </a>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 items-center gap-3 overflow-hidden px-4 py-4">
          <button
            type="button"
            onClick={() => setIndex(index - 1)}
            disabled={!hasPrevious}
            aria-label="Previous photo"
            className="shrink-0 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <img
            src={photo.signedUrl}
            alt={`${title} photo ${index + 1} of ${photos.length}`}
            className="mx-auto max-h-[70dvh] min-w-0 object-contain"
          />

          <button
            type="button"
            onClick={() => setIndex(index + 1)}
            disabled={!hasNext}
            aria-label="Next photo"
            className="shrink-0 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        <div className="shrink-0 border-t border-slate-200 px-6 py-3 text-center text-sm tabular-nums text-slate-500 dark:border-slate-800 dark:text-slate-400">
          {index + 1} / {photos.length}
        </div>
      </div>
    </div>
  );
}
