// ProjectPage.tsx

import type { Borehole, Project } from '@mmsb/core';
import { Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  useLocation,
  useNavigate,
  useParams,
} from 'react-router';

import AddBulkBoreholesModal from '../components/AddBulkBoreholesModal';
import EditProjectModal from '../components/EditProjectModal';
import EditTerminationCriteriaModal from '../components/EditTerminationCriteriaModal';
import { mapProjectRow, PROJECT_COLUMNS } from '../supabase/projectRow';
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
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [
    isEditTerminationCriteriaModalOpen,
    setIsEditTerminationCriteriaModalOpen,
  ] = useState(false);

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

        if (!currentProject) {
          const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .select(PROJECT_COLUMNS)
            .eq('code', projectCode)
            .single();

          if (projectError) {
            throw projectError;
          }

          currentProject = mapProjectRow(projectData);

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
          .sort((a, b) =>
            a.name.localeCompare(b.name, undefined, {
              numeric: true,
              sensitivity: 'base',
            }),
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

  const involvedTeams = [
    { id: 'team-1', name: 'YEW' },
    { id: 'team-2', name: 'FAIZAN' },
    { id: 'team-3', name: 'THONG' },
    { id: 'team-4', name: 'BHARAT' },
    { id: 'team-5', name: 'GUAN' },
  ];

  const completedBoreholes =
    boreholes.length === 0
      ? 0
      : Math.max(1, Math.round(boreholes.length * 0.7));

  const completionPercentage =
    boreholes.length === 0
      ? 0
      : Math.round((completedBoreholes / boreholes.length) * 100);

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-slate-100 px-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Loading project details...
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage || !project) {
    return (
      <div className="flex min-h-full items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
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
            className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Back to projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 lg:h-full lg:overflow-hidden">
      <div className="mx-auto flex min-h-full w-full max-w-full flex-col px-4 py-3 sm:px-6 lg:h-full lg:min-h-0 lg:px-6 lg:py-8">
        {/* Compact heading: project code stays here only */}
        <header className="mb-3 flex shrink-0 items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Project dashboard
            </p>

            <h1 className="truncate text-3xl font-bold tracking-tight text-slate-950 dark:text-white lg:text-4xl">
              {project.code}
            </h1>
          </div>

          <div className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
            Active project
          </div>
        </header>

        <div className="grid flex-1 grid-cols-1 gap-3 lg:min-h-0 lg:grid-cols-12 lg:grid-rows-[minmax(0,1.0fr)_minmax(0,1.4fr)]">
          {/* Top left: no panel title and no repeated project code */}
          <section className="group relative min-h-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-4">
            <button
              type="button"
              onClick={() => setIsEditProjectModalOpen(true)}
              aria-label="Edit project details"
              className="absolute right-4 top-4 z-10 rounded-lg p-2 text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:opacity-100 group-hover:opacity-100 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="flex h-full min-h-0 flex-col">
              <dl className="min-h-0 flex-1 overflow-y-auto pr-10">
                <ProjectDetail
                  label="Title"
                  value={project.title}
                  scrollable
                />

                <ProjectDetail
                  label="Location"
                  value={project.location}
                  scrollable
                />

                <ProjectDetail
                  label="Client"
                  value={project.client}
                />

                <ProjectDetail
                  label="Consultant"
                  value={project.consultant}
                />
              </dl>
            </div>
          </section>

          {/* Top middle */}
          <DashboardPanel
            title="Termination Criteria"
            className="lg:col-span-6"
            bodyClassName="min-h-0 overflow-y-auto pr-2"
            onEdit={() => setIsEditTerminationCriteriaModalOpen(true)}
            editLabel="Edit termination criteria"
          >
            {project.terminationCriteria ? (
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700 dark:text-slate-300">
                {project.terminationCriteria}
              </p>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No termination criteria recorded yet.
              </p>
            )}
          </DashboardPanel>

          {/* Top right */}
          <DashboardPanel
            title="Teams"
            className="lg:col-span-2"
            bodyClassName="min-h-0 overflow-y-auto"
          >
            <ol className="space-y-2">
              {involvedTeams.map((team, index) => (
                <li
                  key={team.id}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-3 dark:border-slate-700"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {index + 1}
                  </span>

                  <span className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                    {team.name}
                  </span>
                </li>
              ))}
            </ol>
          </DashboardPanel>

          {/* Bottom left: boreholes */}
          <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-8">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                  Boreholes
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {boreholes.length}{' '}
                  {boreholes.length === 1 ? 'borehole' : 'boreholes'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddBulkModalOpen(true)}
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Add Boreholes
              </button>
            </div>

            {boreholes.length === 0 ? (
              <div className="flex flex-1 items-center justify-center px-6 py-10 text-center">
                <div>
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
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-auto">
                <table className="w-full min-w-[680px] text-left">
                  <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm dark:bg-slate-800">
                    <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="px-6 py-3">Borehole</th>
                      <th className="px-6 py-3">Driller</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">
                        <span className="sr-only">Open</span>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {boreholes.map((borehole, index) => {
                      const isCompleted = index < completedBoreholes;

                      return (
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
                          <td className="px-6 py-3">
                            <p className="font-semibold text-slate-950 group-hover:text-indigo-700 dark:text-white dark:group-hover:text-indigo-400">
                              {borehole.name}
                            </p>
                          </td>

                          <td className="px-6 py-3 text-sm text-slate-700 dark:text-slate-300">
                            {borehole.drillerName || '—'}
                          </td>

                          <td className="px-6 py-3">
                            {isCompleted ? (
                              <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
                                Completed
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400">
                                In progress
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-3 text-right">
                            <span className="inline-block text-lg text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                              →
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Bottom right: progress */}
          <DashboardPanel
            title="Progress Summary"
            className="lg:col-span-4"
            bodyClassName="min-h-0 overflow-y-auto"
          >
            <div className="flex min-h-full flex-col items-center justify-center">
              <div
                className="relative flex size-40 items-center justify-center rounded-full xl:size-44"
                style={{
                  background: `conic-gradient(
                    rgb(79 70 229) ${completionPercentage}%,
                    rgb(226 232 240) ${completionPercentage}% 100%
                  )`,
                }}
              >
                <div className="flex size-28 flex-col items-center justify-center rounded-full bg-white shadow-inner dark:bg-slate-900 xl:size-32">
                  <span className="text-3xl font-bold text-slate-950 dark:text-white">
                    {completionPercentage}%
                  </span>

                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Completed
                  </span>
                </div>
              </div>

              <div className="mt-5 grid w-full grid-cols-3 gap-2">
                <ProgressStat
                  label="Completed"
                  value={completedBoreholes}
                />

                <ProgressStat
                  label="Remaining"
                  value={Math.max(
                    boreholes.length - completedBoreholes,
                    0,
                  )}
                />

                <ProgressStat
                  label="Total"
                  value={boreholes.length}
                />
              </div>
            </div>
          </DashboardPanel>
        </div>
      </div>

      {isEditProjectModalOpen && (
        <EditProjectModal
          project={project}
          onClose={() => setIsEditProjectModalOpen(false)}
          onProjectUpdated={setProject}
        />
      )}

      {isEditTerminationCriteriaModalOpen && (
        <EditTerminationCriteriaModal
          project={project}
          onClose={() => setIsEditTerminationCriteriaModalOpen(false)}
          onProjectUpdated={setProject}
        />
      )}

      <AddBulkBoreholesModal
        projectId={project.id}
        isOpen={isAddBulkModalOpen}
        onClose={() => setIsAddBulkModalOpen(false)}
        onBoreholesAdded={(newBoreholes) => {
          setBoreholes((currentBoreholes) =>
            [...currentBoreholes, ...newBoreholes].sort(
              (first, second) =>
                first.name.localeCompare(second.name, undefined, {
                  numeric: true,
                  sensitivity: 'base',
                }),
            ),
          );
        }}
      />
    </div>
  );
}

type DashboardPanelProps = {
  title: string;
  className?: string;
  bodyClassName?: string;
  onEdit?: () => void;
  editLabel?: string;
  children: React.ReactNode;
};

function DashboardPanel({
  title,
  className = '',
  bodyClassName = '',
  onEdit,
  editLabel = 'Edit',
  children,
}: DashboardPanelProps) {
  return (
    <section
      className={`group flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      <div className="mb-3 flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">
          {title}
        </h2>

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            aria-label={editLabel}
            className="-my-1 shrink-0 rounded-lg p-2 text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:opacity-100 group-hover:opacity-100 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className={`flex-1 ${bodyClassName}`}>
        {children}
      </div>
    </section>
  );
}

type ProjectDetailProps = {
  label: string;
  value: string | null | undefined;
  scrollable?: boolean;
};

function ProjectDetail({
  label,
  value,
  scrollable = false,
}: ProjectDetailProps) {
  return (
    <div className="border-b border-slate-200 py-3 first:pt-0 last:border-b-0 last:pb-0 dark:border-slate-800">
      <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </dt>

      <dd
        className={`mt-1 text-sm font-semibold leading-6 text-slate-950 dark:text-slate-100 ${
          scrollable
            ? 'max-h-16 overflow-y-auto break-words pr-1'
            : 'break-words'
        }`}
      >
        {value || 'Not specified'}
      </dd>
    </div>
  );
}

type ProgressStatProps = {
  label: string;
  value: number;
};

function ProgressStat({
  label,
  value,
}: ProgressStatProps) {
  return (
    <div className="rounded-xl border border-slate-200 p-3 text-center dark:border-slate-700">
      <p className="text-xl font-bold text-slate-950 dark:text-white">
        {value}
      </p>

      <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}