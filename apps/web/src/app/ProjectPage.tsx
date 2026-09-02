// ProjectPage.tsx

import type { Borehole, Member, Project } from '@mmsb/core';
import { FileText, Pencil, UserPlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
  BOREHOLE_STATUS_BADGE_BASE_CLASSES,
  BOREHOLE_STATUS_BADGE_CLASSES,
  BOREHOLE_STATUS_LABELS,
  countBoreholeStatuses,
  type BoreholeStatus,
} from '../data/boreholeStatus';
import {
  canManageProjectPeople,
  canManageSitePlan,
  MEMBER_ROLE_BADGE_CLASSES,
  MEMBER_ROLE_LABELS,
} from '../data/memberRoles';
import { BOREHOLE_COLUMNS, mapBoreholeRow } from '../supabase/boreholeRow';
import { fetchBoreholeStatuses } from '../supabase/fetchBoreholeStatuses';
import { fetchProjectPeople } from '../supabase/projectPeople';
import { mapProjectRow, PROJECT_COLUMNS } from '../supabase/projectRow';
import {
  deleteSitePlan,
  fetchSitePlan,
  fetchSitePlanUrl,
  type SitePlan,
  uploadSitePlan,
} from '../supabase/sitePlan';
import { supabase } from '../supabase/supabase.server';

// Same shape as ADDED_DATE_FORMATTER on MembersPage: a site plan's date and a
// member's join date are read in the same glance and should not differ.
const SITE_PLAN_DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

// Intl.DateTimeFormat throws RangeError on an Invalid Date, which is what a
// missing or malformed `updated_at` from Storage produces once it has been
// through `new Date(...)`. One odd object must not take the panel down.
function formatSitePlanDate(date: Date | null): string {
  if (date === null || Number.isNaN(date.getTime())) {
    return 'Date unknown';
  }

  return SITE_PLAN_DATE_FORMATTER.format(date);
}

// Decimal units, matching what a file manager shows for the same PDF, rather
// than the binary ones. One decimal place below 10 MB and none above it, so the
// figure stays about as precise as it is useful in a two-column panel.
function formatFileSize(bytes: number): string {
  const megabytes = bytes / 1_000_000;

  if (megabytes < 0.1) {
    return `${Math.max(1, Math.round(bytes / 1_000))} KB`;
  }

  return `${megabytes.toFixed(megabytes < 10 ? 1 : 0)} MB`;
}

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
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [exportErrorMessage, setExportErrorMessage] = useState<string | null>(null);
  // null while the blocks query is in flight, so the table can paint before the
  // statuses arrive rather than holding the whole page behind a second round trip.
  const [boreholeStatuses, setBoreholeStatuses] = useState<Map<
    string,
    BoreholeStatus
  > | null>(null);
  const [statusErrorMessage, setStatusErrorMessage] = useState<string | null>(
    null,
  );
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
  // Three states, not two. `undefined` while the check is in flight, so the panel
  // shows a placeholder rather than "Not uploaded" — which would read as an
  // answer, and would send a manager to upload a plan that is already there.
  // `null` is the answer "there is none".
  const [sitePlan, setSitePlan] = useState<SitePlan | null | undefined>(
    undefined,
  );
  const [sitePlanErrorMessage, setSitePlanErrorMessage] = useState<
    string | null
  >(null);
  // One flag for all three operations. They share a row and none can overlap:
  // whichever is running, every control in the row is disabled.
  const [isSitePlanBusy, setIsSitePlanBusy] = useState(false);
  const sitePlanInputRef = useRef<HTMLInputElement | null>(null);

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

  // Its own effect for the same reason the people fetch below is: a failure here
  // must cost the Status column, not the page. The borehole effect above sets
  // `errorMessage`, which replaces everything with "Unable to load project".
  //
  // It also runs after the boreholes rather than alongside them, because it needs
  // their ids — `blocks` has no project_id of its own to scope by.
  useEffect(() => {
    // Same guard as the people fetch: two of these are in flight whenever the URL
    // changes, and the one for the project we left can land after the one we
    // arrived at.
    let isCurrent = true;

    // Nothing is reset before the fetch: the map left in state is keyed by the
    // previous project's borehole ids, so every row of this one already reads as
    // pending through `statusOf`, and no state is written until the response is
    // in. That keeps this effect free of the cascading render a synchronous
    // setState in an effect body causes.
    const loadStatuses = async () => {
      try {
        const statuses = await fetchBoreholeStatuses(boreholes);

        if (isCurrent) {
          setBoreholeStatuses(statuses);
          setStatusErrorMessage(null);
        }
      } catch (error) {
        console.error('Error fetching borehole statuses:', error);

        if (isCurrent) {
          setStatusErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to work out how far along these boreholes are.',
          );
        }
      }
    };

    void loadStatuses();

    return () => {
      isCurrent = false;
    };
  }, [boreholes]);

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

  // Its own effect, for the third time and the same reason: a project with no
  // site plan is the common case, and a bucket that cannot be reached at all must
  // cost this one row rather than replace the page with "Unable to load project".
  useEffect(() => {
    const projectId = project?.id;

    if (!projectId) {
      return;
    }

    // Same guard as the two effects above: two of these are in flight whenever
    // the URL changes, and they can finish in either order.
    let isCurrent = true;

    const loadSitePlan = async () => {
      try {
        const plan = await fetchSitePlan(projectId);

        if (isCurrent) {
          setSitePlan(plan);
          setSitePlanErrorMessage(null);
        }
      } catch (error) {
        console.error('Error checking for a site plan:', error);

        if (isCurrent) {
          // null rather than undefined: the panel stops saying "Checking..."
          // forever, and a manager can still upload. The message below says why
          // the view button is missing.
          setSitePlan(null);
          setSitePlanErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to check whether this project has a site plan.',
          );
        }
      }
    };

    void loadSitePlan();

    return () => {
      isCurrent = false;
    };
  }, [project?.id]);

  const openSitePlan = async () => {
    if (!project) {
      return;
    }

    // Opened synchronously, before the await. A window.open() issued after one is
    // no longer attributable to the click and popup blockers stop it — so the tab
    // is claimed now and pointed at the URL once it arrives.
    //
    // `noopener` cannot go in the feature string here: it makes window.open
    // return null in Chrome and Firefox, leaving nothing to navigate. Clearing
    // `opener` afterwards severs the same reference.
    const tab = window.open('', '_blank');

    if (tab === null) {
      setSitePlanErrorMessage(
        'The site plan could not be opened. Allow pop-ups for this site and try again.',
      );
      return;
    }

    tab.opener = null;

    setSitePlanErrorMessage(null);
    setIsSitePlanBusy(true);

    try {
      const url = await fetchSitePlanUrl(project.id);

      if (url === null) {
        // Removed by someone else since this page loaded. Correct the row rather
        // than leaving a button that fails the same way again.
        tab.close();
        setSitePlan(null);
        setSitePlanErrorMessage('This project no longer has a site plan.');
        return;
      }

      tab.location.href = url;
    } catch (error) {
      console.error('Error opening the site plan:', error);
      tab.close();
      setSitePlanErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to open the site plan.',
      );
    } finally {
      setIsSitePlanBusy(false);
    }
  };

  const changeSitePlan = async (file: File) => {
    if (!project) {
      return;
    }

    // Checked here as well as by the bucket's MIME restriction, which rejects the
    // upload with a message about the storage API rather than about the file the
    // person just picked.
    if (file.type !== 'application/pdf') {
      setSitePlanErrorMessage('The site plan must be a PDF.');
      return;
    }

    setSitePlanErrorMessage(null);
    setIsSitePlanBusy(true);

    try {
      await uploadSitePlan(project.id, file);
      // Written from what we just sent rather than re-listing the folder.
      // `uploadSitePlan` returns nothing, and a second round trip would only
      // read back the size and timestamp of this very file.
      setSitePlan({ updatedAt: new Date(), sizeInBytes: file.size });
    } catch (error) {
      console.error('Error uploading the site plan:', error);
      setSitePlanErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to upload the site plan.',
      );
    } finally {
      setIsSitePlanBusy(false);
    }
  };

  const removeSitePlan = async () => {
    if (!project) {
      return;
    }

    if (
      !window.confirm(
        'Remove the site plan for this project? Anyone on the project will lose access to it.',
      )
    ) {
      return;
    }

    setSitePlanErrorMessage(null);
    setIsSitePlanBusy(true);

    try {
      await deleteSitePlan(project.id);
      setSitePlan(null);
    } catch (error) {
      console.error('Error removing the site plan:', error);
      setSitePlanErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to remove the site plan.',
      );
    } finally {
      setIsSitePlanBusy(false);
    }
  };

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

  // A borehole missing from the map is pending, not "not started": between two
  // projects the map is briefly the previous one's. Rendered as a placeholder.
  const statusOf = (borehole: Borehole): BoreholeStatus | null =>
    boreholeStatuses?.get(borehole.id) ?? null;

  // Only tallied once every borehole has a real status, so the panel never shows
  // a percentage computed from a half-loaded map.
  const resolvedStatuses = boreholes
    .map(statusOf)
    .filter((status): status is BoreholeStatus => status !== null);

  const statusCounts =
    resolvedStatuses.length === boreholes.length
      ? countBoreholeStatuses(resolvedStatuses)
      : null;

  const completionPercentage =
    statusCounts === null || boreholes.length === 0
      ? 0
      : Math.round((statusCounts.completed / boreholes.length) * 100);

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

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              disabled={isExportingExcel || boreholes.length === 0}
              onClick={async () => {
                setExportErrorMessage(null);
                setIsExportingExcel(true);
                try {
                  // Blocks are not loaded with the page — this view never shows them, and a
                  // project can hold thousands. They are fetched on demand, in one query.
                  const { fetchBlocksByBoreholeIds } = await import(
                    '../supabase/fetchBlocksByBoreholeIds'
                  );
                  const { agsWorkbookFilename, downloadAgsExcel } = await import(
                    '../utils/downloadAgsExcel'
                  );

                  const blocksByBoreholeId =
                    await fetchBlocksByBoreholeIds(boreholes);

                  await downloadAgsExcel(
                    project,
                    // Boreholes with no blocks are dropped rather than written as empty
                    // rows: every sheet stops at its first blank row, so a hole with
                    // nothing logged would truncate the sheet for the holes after it.
                    boreholes
                      .map((borehole) => ({
                        borehole,
                        blocks: blocksByBoreholeId.get(borehole.id) ?? [],
                      }))
                      .filter((entry) => entry.blocks.length > 0),
                    agsWorkbookFilename(project.code, null),
                  );
                } catch (error) {
                  console.error('Excel export failed:', error);
                  setExportErrorMessage(
                    error instanceof Error
                      ? error.message
                      : 'Could not generate the Excel workbook.',
                  );
                } finally {
                  setIsExportingExcel(false);
                }
              }}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {isExportingExcel ? 'Exporting...' : 'Export Excel'}
            </button>

            <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
              Active project
            </div>
          </div>
        </header>

        {exportErrorMessage !== null && (
          <p className="mb-3 shrink-0 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            {exportErrorMessage}
          </p>
        )}

        {statusErrorMessage !== null && (
          <p className="mb-3 shrink-0 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
            Could not load borehole progress: {statusErrorMessage}
          </p>
        )}

        <div className="grid flex-1 grid-cols-1 gap-3 lg:min-h-0 lg:grid-cols-12 lg:grid-rows-[minmax(0,1.0fr)_minmax(0,1.4fr)]">
          {/* Top left: no panel title and no repeated project code */}
          <section className="group relative min-h-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-3">
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

          {/* Top middle left: the site plan, its own panel rather than a row in
              the list above. Its value is a set of controls whose shape changes
              with state, so as a <dl> row it reflowed the whole list every time
              somebody uploaded or removed a plan. */}
          <DashboardPanel
            title="Site Plan"
            className="lg:col-span-2"
            bodyClassName="min-h-0 overflow-y-auto"
          >
            <div className="flex min-h-full flex-col items-center justify-center gap-3 text-center">
              <FileText
                className={`h-9 w-9 ${
                  sitePlan
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-300 dark:text-slate-700'
                }`}
                aria-hidden="true"
              />

              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">
                  {sitePlan === undefined
                    ? 'Checking...'
                    : sitePlan === null
                      ? 'Not uploaded'
                      : 'Uploaded'}
                </p>

                {sitePlan && (
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {formatSitePlanDate(sitePlan.updatedAt)}
                    {sitePlan.sizeInBytes === null
                      ? ''
                      : ` · ${formatFileSize(sitePlan.sizeInBytes)}`}
                  </p>
                )}
              </div>

              {/* Stacked and full width rather than wrapped: at two columns the
                  row would wrap anyway, so it may as well be deliberate. */}
              <div className="flex w-full flex-col items-stretch gap-2">
                {sitePlan && (
                  <button
                    type="button"
                    onClick={() => void openSitePlan()}
                    disabled={isSitePlanBusy}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    View
                  </button>
                )}

                {canManageSitePlan(role) && (
                  <>
                    <button
                      type="button"
                      onClick={() => sitePlanInputRef.current?.click()}
                      disabled={isSitePlanBusy || sitePlan === undefined}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      {isSitePlanBusy
                        ? 'Working...'
                        : sitePlan
                          ? 'Replace'
                          : 'Upload'}
                    </button>

                    {sitePlan && (
                      <button
                        type="button"
                        onClick={() => void removeSitePlan()}
                        disabled={isSitePlanBusy}
                        className="rounded-lg px-2 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/40"
                      >
                        Remove
                      </button>
                    )}

                    {/*
                      The input is never shown; the styled button above drives
                      it. `value` is cleared on every change so that picking the
                      same file twice — after a failed upload — still fires.
                    */}
                    <input
                      ref={sitePlanInputRef}
                      type="file"
                      accept="application/pdf,.pdf"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = '';

                        if (file) {
                          void changeSitePlan(file);
                        }
                      }}
                    />
                  </>
                )}
              </div>

              {sitePlanErrorMessage !== null && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {sitePlanErrorMessage}
                </p>
              )}
            </div>
          </DashboardPanel>

          {/* Top middle right */}
          <DashboardPanel
            title="Termination Criteria"
            className="lg:col-span-4"
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
                    {boreholes.map((borehole) => {
                      const status = statusOf(borehole);

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
                            {status === null ? (
                              <span
                                className={`${BOREHOLE_STATUS_BADGE_BASE_CLASSES} border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600`}
                              >
                                &mdash;
                              </span>
                            ) : (
                              <span
                                className={`${BOREHOLE_STATUS_BADGE_BASE_CLASSES} ${BOREHOLE_STATUS_BADGE_CLASSES[status]}`}
                              >
                                {BOREHOLE_STATUS_LABELS[status]}
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
                  label={BOREHOLE_STATUS_LABELS.completed}
                  value={statusCounts?.completed ?? '—'}
                />

                <ProgressStat
                  label={BOREHOLE_STATUS_LABELS.inProgress}
                  value={statusCounts?.inProgress ?? '—'}
                />

                <ProgressStat
                  label={BOREHOLE_STATUS_LABELS.notStarted}
                  value={statusCounts?.notStarted ?? '—'}
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
  // A string so the tiles can show a placeholder while the statuses are still
  // being fetched, rather than a 0 that reads as a real count.
  value: number | string;
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