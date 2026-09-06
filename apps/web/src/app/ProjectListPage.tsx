import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import type { Project } from "@mmsb/core";

import { mapProjectRow, PROJECT_COLUMNS } from "../supabase/projectRow";
import { supabase } from "../supabase/supabase.server";
import { deleteProjectAndContents } from "../supabase/deleteCascade";
import AddProjectModal from "../components/AddProjectModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { useAuth } from "../context/authContext";
import { canDeleteProject } from "../data/memberRoles";

export default function ProjectListPage() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [projectPendingDeletion, setProjectPendingDeletion] =
    useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const { role } = useAuth();
  const canDelete = canDeleteProject(role);

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

  const deleteProject = async () => {
    const project = projectPendingDeletion;

    if (project === null || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const { strandedPhotoCount } = await deleteProjectAndContents(project.id);

      setProjects((currentProjects) =>
        currentProjects.filter(
          (currentProject) => currentProject.id !== project.id,
        ),
      );
      setProjectPendingDeletion(null);

      // Reported rather than swallowed: the project is gone either way, but the files are
      // still being paid for and somebody has to know to go and find them.
      setNoticeMessage(
        strandedPhotoCount === 0
          ? null
          : `${project.code} was deleted, but ${strandedPhotoCount} photo ` +
              `${strandedPhotoCount === 1 ? 'file' : 'files'} could not be removed from storage.`,
      );
    } catch (error) {
      console.error("Error deleting the project:", error);
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Unable to delete the project.",
      );
    } finally {
      setIsDeleting(false);
    }
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
            className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300"
          >
            {noticeMessage}
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

                    {/* The whole column goes when the viewer may not delete, rather than a
                        column of empty cells — the same choice the members table makes. */}
                    {canDelete && (
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        <span className="sr-only">Delete</span>
                      </th>
                    )}
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

                      {canDelete && (
                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          {/* stopPropagation because the row itself is the link: without it
                              this navigates into the project on the way to the dialog. */}
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setDeleteError(null);
                              setNoticeMessage(null);
                              setProjectPendingDeletion(project);
                            }}
                            aria-label={`Delete project ${project.code}`}
                            className="cursor-pointer rounded-lg px-2 py-1.5 text-xs font-semibold text-red-600 opacity-0 transition hover:bg-red-50 focus-visible:opacity-100 group-focus:opacity-100 group-hover:opacity-100 dark:text-red-400 dark:hover:bg-red-950/40"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {projectPendingDeletion !== null && (
        <DeleteConfirmModal
          title="Delete project"
          confirmationText={projectPendingDeletion.code}
          confirmLabel="Delete project"
          isDeleting={isDeleting}
          errorMessage={deleteError}
          onConfirm={() => void deleteProject()}
          onClose={() => {
            setProjectPendingDeletion(null);
            setDeleteError(null);
          }}
        >
          <p>
            <span className="font-semibold">
              {projectPendingDeletion.code}
            </span>
            {projectPendingDeletion.title
              ? ` — ${projectPendingDeletion.title}`
              : ''}{' '}
            and everything recorded under it will be deleted: every borehole,
            every block of every borehole log, every photo, and the site plan.
          </p>

          <p className="mt-2">This cannot be undone.</p>
        </DeleteConfirmModal>
      )}

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