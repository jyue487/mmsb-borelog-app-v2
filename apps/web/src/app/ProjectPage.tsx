// ProjectPage.tsx

import type { Borehole, Member, Project } from '@mmsb/core';
import { Pencil, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  useLocation,
  useNavigate,
  useParams,
} from 'react-router';

import AddBulkBoreholesModal from '../components/AddBulkBoreholesModal';
import AddPeopleModal from '../components/AddPeopleModal';
import EditProjectModal from '../components/EditProjectModal';
import EditTerminationCriteriaModal from '../components/EditTerminationCriteriaModal';
import { useAuth } from '../context/auth';
import {
  canManageProjectPeople,
  MEMBER_ROLE_BADGE_CLASSES,
  MEMBER_ROLE_LABELS,
} from '../data/memberRoles';
import { BOREHOLE_COLUMNS, mapBoreholeRow } from '../supabase/boreholeRow';
import { fetchProjectPeople } from '../supabase/projectPeople';
import { mapProjectRow, PROJECT_COLUMNS } from '../supabase/projectRow';
import { supabase } from '../supabase/supabase.server';

type ProjectPageLocationState = {
  project?: Project;
};

export default function ProjectPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectCode } = useParams<{ projectCode: string }>();
  const { role } = useAuth();

  // Derived on each effect run rather than seeded into state once. `useState`'s
  // initialiser only runs on mount, so going straight from one project to another
  // would leave this holding the first: the URL would say B while the page showed
  // A's details and A's boreholes.
  const projectFromRouterState =
    (location.state as ProjectPageLocationState | null)?.project ?? null;

  const [project, setProject] = useState<Project | null>(null);
  const [boreholes, setBoreholes] = useState<Borehole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAddBulkModalOpen, setIsAddBulkModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [isAddPeopleModalOpen, setIsAddPeopleModalOpen] = useState(false);
  const [people, setPeople] = useState<Member[]>([]);
  const [isPeopleLoading, setIsPeopleLoading] = useState(true);
  const [peopleErrorMessage, setPeopleErrorMessage] = useState<string | null>(
    null,
  );
  // Bumped after a save to re-run the fetch below. The modal cannot hand back
  // the new list itself: it only ever loaded supervisors and viewers, so any
  // owner or admin holding an assignment row would vanish from the panel until
  // the next reload.
  const [peopleRefreshToken, setPeopleRefreshToken] = useState(0);
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
        // Router state saves the round trip when arriving from the project list;
        // a refresh or a pasted link has none, so fall back to the code in the URL.
        let currentProject = projectFromRouterState;

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
        }

        // Written on every run, so switching projects replaces the previous one.
        // Edits from the modals below still land here and survive, because this
        // only re-runs when the URL or the router state changes.
        setProject(currentProject);

        const { data: boreholeData, error: boreholeError } = await supabase
          .from('boreholes')
          .select(BOREHOLE_COLUMNS)
          .eq('project_id', currentProject.id)
          .order('name', { ascending: true });

        if (boreholeError) {
          throw boreholeError;
        }

        const mappedBoreholes: Borehole[] = (boreholeData ?? [])
          .map(mapBoreholeRow)
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
  }, [projectCode, projectFromRouterState]);

  // Its own effect, keyed on the resolved project id rather than folded into the
  // one above. That effect's catch sets `errorMessage`, which replaces the whole
  // page with "Unable to load project" — a failure to read the assignment table
  // must cost the People panel, not the boreholes table.
  useEffect(() => {
    const projectId = project?.id;

    if (!projectId) {
      return;
    }

    // Guards against the response for the project we just navigated away from
    // landing after the one we navigated to. Two fetches are in flight whenever
    // the URL changes, and they can finish in either order.
    let isCurrent = true;

    const fetchPeople = async () => {
      setIsPeopleLoading(true);
      setPeopleErrorMessage(null);

      try {
        const projectPeople = await fetchProjectPeople(projectId);

        if (isCurrent) {
          setPeople(projectPeople);
        }
      } catch (error) {
        console.error('Error fetching project people:', error);

        if (isCurrent) {
          setPeopleErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to load the people on this project.',
          );
        }
      } finally {
        if (isCurrent) {
          setIsPeopleLoading(false);
        }
      }
    };

    void fetchPeople();

    return () => {
      isCurrent = false;
    };
  }, [project?.id, peopleRefreshToken]);

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
            className="lg:col-span-5"
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
            title="People"
            className="lg:col-span-3"
            bodyClassName="min-h-0 overflow-y-auto"
            headerAction={
              // Owners and admins only, matching the write rule in
              // packages/supabase/policies/project_to_user.sql. Everyone else
              // gets the same panel, read-only.
              canManageProjectPeople(role) ? (
                <button
                  type="button"
                  onClick={() => setIsAddPeopleModalOpen(true)}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                >
                  <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
                  Add people
                </button>
              ) : undefined
            }
          >
            {isPeopleLoading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Loading people...
              </p>
            ) : peopleErrorMessage ? (
              <p
                role="alert"
                className="text-sm font-medium text-red-600 dark:text-red-400"
              >
                {peopleErrorMessage}
              </p>
            ) : people.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Nobody is assigned to this project yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {people.map((person) => (
                  <li
                    key={person.id}
                    className="rounded-lg border border-slate-200 px-3 py-2.5 dark:border-slate-700"
                  >
                    <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                      {person.name || person.email || '—'}
                    </p>

                    <span
                      className={`mt-1.5 inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${MEMBER_ROLE_BADGE_CLASSES[person.role]}`}
                    >
                      {MEMBER_ROLE_LABELS[person.role]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
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

      {isAddPeopleModalOpen && (
        <AddPeopleModal
          projectId={project.id}
          assignedPeople={people}
          onClose={() => setIsAddPeopleModalOpen(false)}
          onPeopleSaved={() => {
            setPeopleRefreshToken((token) => token + 1);
            setIsAddPeopleModalOpen(false);
          }}
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
  // A control rendered in the header beside the title. Separate from `onEdit`
  // because that one is a hover-revealed pencil, which is right for "change
  // something already on screen" and wrong for a panel's primary action — a
  // hover-only button is undiscoverable on the one panel that starts empty.
  headerAction?: React.ReactNode;
  children: React.ReactNode;
};

function DashboardPanel({
  title,
  className = '',
  bodyClassName = '',
  onEdit,
  editLabel = 'Edit',
  headerAction,
  children,
}: DashboardPanelProps) {
  return (
    <section
      className={`group flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      <div className="mb-3 flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
        <h2 className="truncate text-lg font-bold text-slate-950 dark:text-white">
          {title}
        </h2>

        {headerAction}

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