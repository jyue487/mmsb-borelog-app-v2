// ProjectPage.tsx

import type { Borehole, Project } from '@mmsb/core';
import { useEffect, useState } from 'react';
import {
  useLocation,
  useNavigate,
  useParams,
} from 'react-router';

import AddBulkBoreholesModal from '../components/AddBulkBoreholesModal';
import { supabase } from '../supabase/supabase.server';

type ProjectPageLocationState = {
  project?: Project;
};

export default function ProjectPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectCode } = useParams<{ projectCode: string }>();

  const locationState = location.state as ProjectPageLocationState | null;

  const [project, setProject] = useState<Project | null>(
    locationState?.project ?? null,
  );
  const [boreholes, setBoreholes] = useState<Borehole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAddBulkModalOpen, setIsAddBulkModalOpen] = useState(false);

  useEffect(() => {
    const fetchProjectAndBoreholes = async () => {
      if (!projectCode) {
        setErrorMessage('No project code was provided.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        let currentProject = project;

        /*
         * location.state is lost when the page is refreshed or opened directly.
         * Fetch the project using projectCode when it is unavailable.
         */
        if (!currentProject) {
          const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .select(`
              id,
              code,
              title,
              location,
              client,
              consultant
            `)
            .eq('code', projectCode)
            .single();

          if (projectError) {
            throw projectError;
          }

          currentProject = {
            id: projectData.id,
            code: projectData.code,
            title: projectData.title,
            location: projectData.location,
            client: projectData.client,
            consultant: projectData.consultant,
          };

          setProject(currentProject);
        }

        const { data: boreholeData, error: boreholeError } = await supabase
          .from('boreholes')
          .select(`
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
          `)
          .eq('project_id', currentProject.id)
          .order('name', { ascending: true });

        if (boreholeError) {
          throw boreholeError;
        }

        const mappedBoreholes: Borehole[] = (boreholeData ?? [])
          .map(
            (row): Borehole => ({
              id: row.id,
              projectId: row.project_id,
              name: row.name,
              typeOfBoring: row.type_of_boring,
              typeOfRig: row.type_of_rig,
              diameterOfBoring: row.diameter_of_boring,
              eastingInMetres: row.easting_in_metres,
              northingInMetres: row.northing_in_metres,
              reducedLevelInMetres: row.reduced_level_in_metres,
              drillerName: row.driller_name,
              verifierName: row.verifier_name,
              verifierSignatureBase64: row.verifier_signature_base64,
              verifierSignDate: null,
            }),
          )
          .sort(
            (a, b) => a.name.localeCompare(
              b.name,
              undefined,
              { numeric: true, sensitivity: 'base' }
            )
          );

        setBoreholes(mappedBoreholes);
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

    void fetchProjectAndBoreholes();
  }, [projectCode]);

  const openBorehole = (borehole: Borehole) => {
    if (!project || !projectCode) {
      return;
    }

    navigate(
      `/projects/${encodeURIComponent(
        projectCode,
      )}/boreholes/${encodeURIComponent(borehole.name)}`,
      {
        state: borehole,
      },
    );
  };

  if (isLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-100 px-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Loading project details...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage || !project) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-sm dark:border-red-900/50 dark:bg-slate-900">
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
            Unable to load project
          </p>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {errorMessage ?? 'The requested project could not be found.'}
          </p>

          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            Back to projects
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Page heading */}
        <section>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="cursor-pointer mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
          >
            <span aria-hidden="true">←</span>
            Projects
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Project
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                {project.code}
              </h1>

              <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
                {project.title}
              </p>
            </div>

            <div className="inline-flex w-fit items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
              Active project
            </div>
          </div>
        </section>

        {/* Project information */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ProjectInfoCard label="Project title" value={project.title} />

          <ProjectInfoCard
            label="Location"
            value={project.location}
          />

          <ProjectInfoCard
            label="Client"
            value={project.client}
          />

          <ProjectInfoCard
            label="Consultant"
            value={project.consultant}
          />
        </section>

        {/* Borehole table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                Boreholes
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {boreholes.length} {boreholes.length === 1 ? 'borehole' : 'boreholes'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsAddBulkModalOpen(true)}
                className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                Add Boreholes
              </button>
            </div>
          </div>

          {boreholes.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-slate-100 text-xl dark:bg-slate-800">
                ◉
              </div>

              <h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">
                No boreholes found
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                No boreholes have been assigned to this project yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60">
                  <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="px-6 py-4">Borehole</th>
                    <th className="px-6 py-4">Driller</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">
                      <span className="sr-only">Open</span>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {boreholes.map((borehole) => (
                    <tr
                      key={borehole.id}
                      onClick={() => openBorehole(borehole)}
                      onKeyDown={(event) => {
                        if (
                          event.key === 'Enter' ||
                          event.key === ' '
                        ) {
                          event.preventDefault();
                          openBorehole(borehole);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className="group cursor-pointer transition hover:bg-indigo-50/70 focus:bg-indigo-50/70 focus:outline-none dark:hover:bg-indigo-950/20 dark:focus:bg-indigo-950/20"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-950 group-hover:text-indigo-700 dark:text-white dark:group-hover:text-indigo-400">
                          {borehole.name}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                        {borehole.drillerName || '—'}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
                          Completed
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className="text-lg text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          →
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <AddBulkBoreholesModal
        projectId={project.id}
        isOpen={isAddBulkModalOpen}
        onClose={() => setIsAddBulkModalOpen(false)}
        onBoreholesAdded={(newBoreholes) => {
          setBoreholes((currentBoreholes) =>
            [...currentBoreholes, ...newBoreholes].sort(
              (first, second) =>
                first.name.localeCompare(
                  second.name,
                  undefined,
                  {
                    numeric: true,
                    sensitivity: 'base',
                  },
                ),
            ),
          );
        }}
      />
    </main>
  );
}

type ProjectInfoCardProps = {
  label: string;
  value: string | null | undefined;
};

function ProjectInfoCard({
  label,
  value,
}: ProjectInfoCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="mt-3 text-base font-semibold text-slate-950 dark:text-slate-100">
        {value || 'Not specified'}
      </p>
    </article>
  );
}