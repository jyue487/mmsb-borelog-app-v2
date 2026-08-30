// BoreholePage.tsx

import type { Block, Borehole } from '@mmsb/core';
import type { ReportProject } from '@mmsb/report';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';

import { sortAndReindexAllBlocks } from '../blocks/sortAndReindexAllBlocks';
import BlockRow from '../components/blocks/BlockRow';
import BoreholeDetailStrip from '../components/BoreholeDetailStrip';
import EditBoreholeModal from '../components/EditBoreholeModal';
import { useAuth } from '../context/auth';
import { canEditBoreholeDetails } from '../data/memberRoles';
import {
  fetchBlockPhotosByBlockIds,
  type BlockPhoto,
} from '../supabase/blockPhotos';
import { BLOCK_COLUMNS, mapBlockRow } from '../supabase/blockRow';
import { BOREHOLE_COLUMNS, mapBoreholeRow } from '../supabase/boreholeRow';
import { supabase } from '../supabase/supabase.server';
import { buildPhotoFilenames } from '../utils/blockPhotoFilenames';
import { sanitiseFilename } from '../utils/sanitiseFilename';

type BoreholePageLocationState = Borehole | null;

/**
 * The report header prints title/location/client/consultant, so they are fetched even when
 * the borehole itself arrived in router state — that path used to skip the project query
 * altogether, and the previous version selected only `id`.
 */
async function fetchProjectByCode(
  projectCode: string,
): Promise<{ id: string; project: ReportProject }> {
  const { data, error } = await supabase
    .from('projects')
    .select('id, title, location, client, consultant')
    .eq('code', projectCode)
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    project: {
      title: data.title,
      location: data.location,
      client: data.client,
      consultant: data.consultant,
    },
  };
}

/**
 * ProjectPage hands the borehole over in router state, but that is gone on a
 * refresh or a pasted link, so fall back to resolving it from the URL.
 */
async function fetchBoreholeByProjectIdAndName(
  projectId: string,
  boreholeName: string,
): Promise<Borehole> {
  const { data: boreholeData, error: boreholeError } = await supabase
    .from('boreholes')
    .select(BOREHOLE_COLUMNS)
    .eq('project_id', projectId)
    .eq('name', boreholeName)
    .single();

  if (boreholeError) {
    throw boreholeError;
  }

  return mapBoreholeRow(boreholeData);
}

export default function BoreholePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();
  const { projectCode, boreholeName } = useParams<{
    projectCode: string;
    boreholeName: string;
  }>();

  // Derived on each effect run rather than seeded into state once. `useState`'s
  // initialiser only runs on mount, so going straight from one borehole to another
  // would leave this holding the first. Same shape as ProjectPage.
  const boreholeFromRouterState = location.state as BoreholePageLocationState;

  const [borehole, setBorehole] = useState<Borehole | null>(null);
  const [project, setProject] = useState<ReportProject | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [photoZipProgress, setPhotoZipProgress] = useState<string | null>(null);
  // Deliberately not `errorMessage`: the guard below renders an error card *instead of*
  // the log, so a failed download would take the borehole off the screen.
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [photosByBlockId, setPhotosByBlockId] = useState<
    Map<string, BlockPhoto[]>
  >(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEditBoreholeModalOpen, setIsEditBoreholeModalOpen] = useState(false);

  useEffect(() => {
    const fetchBoreholeAndBlocks = async () => {
      if (!projectCode || !boreholeName) {
        setErrorMessage('No borehole was provided.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const { id: projectId, project: fetchedProject } =
          await fetchProjectByCode(projectCode);
        setProject(fetchedProject);

        let currentBorehole = boreholeFromRouterState;

        if (!currentBorehole) {
          currentBorehole = await fetchBoreholeByProjectIdAndName(
            projectId,
            boreholeName,
          );
        }

        setBorehole(currentBorehole);

        const { data: blockData, error: blockError } = await supabase
          .from('blocks')
          .select(BLOCK_COLUMNS)
          .eq('borehole_id', currentBorehole.id)
          // Defensive, not currently load-bearing: blocks are hard deleted today
          // (deleteBlockByBlockIdDbAsync issues a plain DELETE and Connector.ts
          // maps it to a real .delete()), so deleted_at is never populated and
          // this matches every row. It is here so the dashboard is already right
          // if blocks move to soft deletion like every other table in the schema.
          // See packages/supabase/policies/blocks.sql.
          .is('deleted_at', null);

        if (blockError) {
          throw blockError;
        }

        // Blocks carry no stored order, so the list is sorted by depth and each
        // type's counter renumbered from 1 on every read, exactly as mobile does.
        const sortedBlocks = sortAndReindexAllBlocks(
          (blockData ?? []).map(mapBlockRow),
        );

        setBlocks(sortedBlocks);

        // Photos are a garnish on the log, so their own try/catch: a Storage outage or a
        // policy that denies the bucket must not blank out the borehole the engineer came
        // here to read. They ride along with this load rather than getting a second
        // loading state, since it is only two more round trips.
        try {
          setPhotosByBlockId(
            await fetchBlockPhotosByBlockIds(
              sortedBlocks.map((block) => block.id),
            ),
          );
        } catch (photoError) {
          console.error('Could not load block photos:', photoError);
          setPhotosByBlockId(new Map());
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred.';

        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchBoreholeAndBlocks();
  }, [projectCode, boreholeName, boreholeFromRouterState]);

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-slate-100 px-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Loading borehole log...
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage || !borehole) {
    return (
      <div className="flex min-h-full items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-sm dark:border-red-900/50 dark:bg-slate-900">
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
            Unable to load borehole
          </p>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {errorMessage ?? 'The requested borehole could not be found.'}
          </p>

          <button
            type="button"
            onClick={() => navigate(`/projects/${projectCode ?? ''}`)}
            className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Back to project
          </button>
        </div>
      </div>
    );
  }

  // Built for the whole borehole in one pass rather than per row: the counter in a photo's
  // name is scoped to the depth interval, so it can run across two blocks that share one.
  // No useMemo — the React Compiler is enabled for this app.
  const photoFilenames = buildPhotoFilenames(
    projectCode ?? '',
    borehole.name,
    blocks,
    photosByBlockId,
  );
  const photoCount = photoFilenames.size;

  return (
    <div className="min-h-full bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 lg:h-full lg:overflow-hidden">
      <div className="mx-auto flex min-h-full w-full max-w-full flex-col px-4 py-3 sm:px-6 lg:h-full lg:min-h-0 lg:px-6 lg:py-8">
        <header className="mb-3 flex shrink-0 items-center justify-between gap-4">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => navigate(`/projects/${projectCode ?? ''}`)}
              className="text-xs font-semibold uppercase tracking-wider text-indigo-600 transition hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              ← {projectCode}
            </button>

            <h1 className="truncate text-3xl font-bold tracking-tight text-slate-950 dark:text-white lg:text-4xl">
              {borehole.name}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              disabled={photoZipProgress !== null || photoCount === 0}
              onClick={async () => {
                setDownloadError(null);
                setPhotoZipProgress(`Zipping 0/${photoCount}...`);
                try {
                  // Dynamic import for the same reason as the PDF below, if less
                  // dramatically: fflate is ~8 KB that most visits never need.
                  const { downloadBlockPhotosZip } = await import(
                    '../utils/downloadBlockPhotosZip'
                  );
                  await downloadBlockPhotosZip(
                    `${sanitiseFilename(projectCode ?? '')}-${sanitiseFilename(borehole.name)}-photos.zip`,
                    blocks.flatMap((block) =>
                      (photosByBlockId.get(block.id) ?? []).map((photo) => ({
                        filename: photoFilenames.get(photo.id) ?? `${photo.id}.jpg`,
                        signedUrl: photo.signedUrl,
                      })),
                    ),
                    (completed, total) => {
                      setPhotoZipProgress(`Zipping ${completed}/${total}...`);
                    },
                  );
                } catch (error) {
                  console.error('Photo download failed:', error);
                  setDownloadError(
                    error instanceof Error
                      ? error.message
                      : 'Could not download the photos.',
                  );
                } finally {
                  setPhotoZipProgress(null);
                }
              }}
              className="shrink-0 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {photoZipProgress ?? 'Download photos'}
            </button>

            <button
              type="button"
              disabled={isExporting || project === null || blocks.length === 0}
              onClick={async () => {
                if (project === null) {
                  return;
                }
                setDownloadError(null);
                setIsExporting(true);
                try {
                  // Dynamic import: pdf-lib + fontkit are ~1.1 MB, and a static import would
                  // put them in the main bundle for every page load.
                  const { downloadBorelogPdf } = await import('../utils/downloadBorelogPdf');
                  await downloadBorelogPdf(project, borehole, blocks);
                } catch (error) {
                  console.error('PDF generation failed:', error);
                  setDownloadError(
                    error instanceof Error ? error.message : 'Could not generate the PDF.',
                  );
                } finally {
                  setIsExporting(false);
                }
              }}
              className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isExporting ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
        </header>

        {downloadError !== null && (
          <p className="mb-3 shrink-0 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            {downloadError}
          </p>
        )}

        <BoreholeDetailStrip
          borehole={borehole}
          // Owners and admins only. Passing undefined is what hides the pencil;
          // the rule and the policy it is stricter than are documented on
          // canEditBoreholeDetails.
          onEdit={
            canEditBoreholeDetails(role)
              ? () => setIsEditBoreholeModalOpen(true)
              : undefined
          }
        />

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                Borehole Log
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {blocks.length} {blocks.length === 1 ? 'block' : 'blocks'}
              </p>
            </div>
          </div>

          {blocks.length === 0 ? (
            <div className="flex flex-1 items-center justify-center px-6 py-10 text-center">
              <div>
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-slate-100 text-xl dark:bg-slate-800">
                  ◉
                </div>

                <h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">
                  No blocks logged
                </h3>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Nothing has been recorded for this borehole yet.
                </p>
              </div>
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-auto">
              {/* Widened from 680px by the 200px photo column on the right of every row. */}
              <div className="min-w-[900px] border-t border-slate-200 dark:border-slate-800">
                {blocks.map((block) => (
                  <BlockRow
                    key={block.id}
                    block={block}
                    photos={photosByBlockId.get(block.id) ?? []}
                    photoFilenames={photoFilenames}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* The save does not touch projectCode, boreholeName or the router state,
          so the fetch effect above does not re-run and overwrite this — the same
          reasoning ProjectPage records for its own modals. */}
      {isEditBoreholeModalOpen && (
        <EditBoreholeModal
          borehole={borehole}
          onClose={() => setIsEditBoreholeModalOpen(false)}
          onBoreholeUpdated={setBorehole}
        />
      )}
    </div>
  );
}
