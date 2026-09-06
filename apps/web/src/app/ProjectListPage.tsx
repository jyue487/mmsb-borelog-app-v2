import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import type { Project } from "@mmsb/core";

import { mapProjectRow, PROJECT_COLUMNS } from "../supabase/projectRow";
import { supabase } from "../supabase/supabase.server";
import AddProjectModal from "../components/AddProjectModal";

export default function ProjectListPage() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  // Handed over by ProjectPage when a delete left photo files behind. Read once into state
  // and dropped from the history entry, so a reload does not resurrect a stale warning about
  // a project that went hours ago.
  const location = useLocation();
  const [noticeMessage, setNoticeMessage] = useState<string | null>(
    typeof (location.state as { notice?: unknown } | null)?.notice === 'string'
      ? ((location.state as { notice: string }).notice)
      : null,
  );

  // Drops the notice from the history entry once it has been read into state above, so that
  // reloading, or coming back here later, does not show a warning about a project that was
  // deleted hours ago.
  useEffect(() => {
    if ((location.state as { notice?: unknown } | null)?.notice !== undefined) {
      void navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    const fetchAllProjects = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      const { data, error } = await supabase
        .from("projects")
        .select(PROJECT_COLUMNS)
        .order("code");

      if (error) {
        console.error("Error fetching projects:", error);
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      setProjects((data ?? []).map(mapProjectRow));

      setIsLoading(false);
    };

    console.log('fetching all projects');
    void fetchAllProjects();
    console.log('done fetching all projects');
  }, []);

  const openProject = (project: Project) => {
    // No router state: ProjectPage resolves the project from the code in the URL.
    navigate(`/projects/${encodeURIComponent(project.code)}`);
  };

  return (
    <div className="min-h-full bg-slate-50 px-4 py-8 text-slate-950 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
            MMSB Dashboard
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Projects
          </h1>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Select a project to view its boreholes and progress.
          </p>
        </header>

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
          >
            <span className="font-semibold">Something went wrong: </span>
            {errorMessage}
          </div>
        )}

        {noticeMessage && (
          <div
            role="alert"
            className="mb-6 flex items-start justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300"
          >
            <span>{noticeMessage}</span>

            <button
              type="button"
              onClick={() => setNoticeMessage(null)}
              aria-label="Dismiss"
              className="cursor-pointer font-semibold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="font-semibold">Project list</h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {isLoading
                  ? "Loading projects..."
                  : `${projects.length} project${projects.length === 1 ? "" : "s"}`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsAddProjectOpen(true)}
                className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                Add Project
              </button>
            </div>
          </div>


          {isLoading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-14 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <p className="font-medium text-slate-700 dark:text-slate-300">
                No projects found
              </p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Projects will appear here once they are assigned to your
                account.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Code
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Project
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Location
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Client
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Consultant
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {projects.map((project) => (
                    <tr
                      key={project.id}
                      tabIndex={0}
                      role="link"
                      onClick={() => openProject(project)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openProject(project);
                        }
                      }}
                      className="group cursor-pointer bg-white transition-colors hover:bg-blue-50 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:bg-slate-900 dark:hover:bg-slate-800 dark:focus:bg-slate-800"
                    >
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="rounded-md bg-blue-50 px-2.5 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {project.code}
                        </span>
                      </td>

                      <td className="min-w-64 px-5 py-4">
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {project.title || "Untitled project"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {project.location || "—"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {project.client || "—"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {project.consultant || "—"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:text-blue-700 dark:text-blue-400 dark:group-hover:text-blue-300">
                          View boreholes
                          <span aria-hidden="true">→</span>
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

      <AddProjectModal
        isOpen={isAddProjectOpen}
        onClose={() => setIsAddProjectOpen(false)}
        onProjectAdded={(newProject) => {
          setProjects((currentProjects) =>
            [...currentProjects, newProject].sort((a, b) =>
              a.code.localeCompare(
                b.code,
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
    </div>
  );
}