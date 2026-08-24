// BoreholePage.tsx

import type { Block, Borehole } from '@mmsb/core';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';

import { sortAndReindexAllBlocks } from '../blocks/sortAndReindexAllBlocks';
import BlockRow from '../components/blocks/BlockRow';
import BoreholeDetailStrip from '../components/BoreholeDetailStrip';
import { BLOCK_COLUMNS, mapBlockRow } from '../supabase/blockRow';
import { supabase } from '../supabase/supabase.server';

type BoreholePageLocationState = Borehole | null;

const BOREHOLE_COLUMNS = `
  id,
  project_id,
  name,
  type_of_boring,
  type_of_rig,
  diameter_of_boring,
  easting_in_metres,
  northing_in_metres,
  reduced_level_in_metres,
  driller_name,
  verifier_name,
  verifier_signature_base64,
  verifier_sign_date
`;

/**
 * ProjectPage hands the borehole over in router state, but that is gone on a
 * refresh or a pasted link, so fall back to resolving it from the URL.
 */
async function fetchBoreholeByProjectCodeAndName(
  projectCode: string,
  boreholeName: string,
): Promise<Borehole> {
  const { data: projectData, error: projectError } = await supabase
    .from('projects')
    .select('id')
    .eq('code', projectCode)
    .single();

  if (projectError) {
    throw projectError;
  }

  const { data: boreholeData, error: boreholeError } = await supabase
    .from('boreholes')
    .select(BOREHOLE_COLUMNS)
    .eq('project_id', projectData.id)
    .eq('name', boreholeName)
    .single();

  if (boreholeError) {
    throw boreholeError;
  }

  return {
    id: boreholeData.id,
    projectId: boreholeData.project_id,
    name: boreholeData.name,
    typeOfBoring: boreholeData.type_of_boring,
    typeOfRig: boreholeData.type_of_rig,
    diameterOfBoring: boreholeData.diameter_of_boring,
    eastingInMetres: boreholeData.easting_in_metres,
    northingInMetres: boreholeData.northing_in_metres,
    reducedLevelInMetres: boreholeData.reduced_level_in_metres,
    drillerName: boreholeData.driller_name,
    verifierName: boreholeData.verifier_name,
    verifierSignatureBase64: boreholeData.verifier_signature_base64,
    verifierSignDate: null,
  };
}

export default function BoreholePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectCode, boreholeName } = useParams<{
    projectCode: string;
    boreholeName: string;
  }>();

  // Derived on each effect run rather than seeded into state once. `useState`'s
  // initialiser only runs on mount, so going straight from one borehole to another
  // would leave this holding the first. Same shape as ProjectPage.
  const boreholeFromRouterState = location.state as BoreholePageLocationState;

  const [borehole, setBorehole] = useState<Borehole | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        let currentBorehole = boreholeFromRouterState;

        if (!currentBorehole) {
          currentBorehole = await fetchBoreholeByProjectCodeAndName(
            projectCode,
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
        setBlocks(sortAndReindexAllBlocks((blockData ?? []).map(mapBlockRow)));
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

        </header>

        <BoreholeDetailStrip borehole={borehole} />

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
              <div className="min-w-[680px] border-t border-slate-200 dark:border-slate-800">
                {blocks.map((block) => (
                  <BlockRow key={block.id} block={block} />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
