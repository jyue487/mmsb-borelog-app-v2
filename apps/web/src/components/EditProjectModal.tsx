import type { Project } from "@mmsb/core";
import { X } from "lucide-react";
import { useEffect, useState, type SubmitEvent } from "react";

import { useAuth } from "../context/auth";
import { mapProjectRow, PROJECT_COLUMNS } from "../supabase/projectRow";
import { supabase } from "../supabase/supabase.server";

type EditProjectModalProps = {
  project: Project;
  onClose: () => void;
  onProjectUpdated: (project: Project) => void;
};

export default function EditProjectModal({
  project,
  onClose,
  onProjectUpdated,
}: EditProjectModalProps) {
  const { userId } = useAuth();

  const [title, setTitle] = useState(project.title ?? "");
  const [location, setLocation] = useState(project.location ?? "");
  const [client, setClient] = useState(project.client ?? "");
  const [consultant, setConsultant] = useState(project.consultant ?? "");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }

    onClose();
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { data, error } = await supabase
        .from("projects")
        .update({
          title: title.trim(),
          location: location.trim(),
          client: client.trim(),
          consultant: consultant.trim(),
          updated_at: new Date().toISOString(),
          updated_by: userId,
        })
        .eq("id", project.id)
        .select(PROJECT_COLUMNS)
        .single();

      if (error) {
        throw error;
      }

      onProjectUpdated(mapProjectRow(data));
      onClose();
    } catch (error) {
      console.error("Error updating project:", error);

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to save the project details.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSubmitting, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-project-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
      >
        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <h2
              id="edit-project-title"
              className="text-lg font-bold text-slate-900 dark:text-white"
            >
              Edit project details
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Update the descriptive details recorded for this project.
            </p>
          </div>

          <button
            type="button"
            onClick={closeModal}
            disabled={isSubmitting}
            aria-label="Close modal"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-6 py-5">
          <div>
            <label
              htmlFor="edit-project-code"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Project code
            </label>

            <input
              id="edit-project-code"
              type="text"
              value={project.code}
              readOnly
              disabled
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
            />

            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Project code cannot be changed.
            </p>
          </div>

          <div>
            <label
              htmlFor="edit-project-title-input"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Title
            </label>

            <input
              id="edit-project-title-input"
              name="title"
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value.toUpperCase());

                if (submitError) {
                  setSubmitError(null);
                }
              }}
              placeholder="e.g. PROPOSED MIXED DEVELOPMENT"
              autoFocus
              autoComplete="off"
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="edit-project-location"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Location
            </label>

            <input
              id="edit-project-location"
              name="location"
              type="text"
              value={location}
              onChange={(event) => {
                setLocation(event.target.value);

                if (submitError) {
                  setSubmitError(null);
                }
              }}
              placeholder="e.g. Sungai Buloh, Selangor"
              autoComplete="off"
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="edit-project-client"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Client
            </label>

            <input
              id="edit-project-client"
              name="client"
              type="text"
              value={client}
              onChange={(event) => {
                setClient(event.target.value);

                if (submitError) {
                  setSubmitError(null);
                }
              }}
              placeholder="e.g. MRT Corp"
              autoComplete="off"
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="edit-project-consultant"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Consultant
            </label>

            <input
              id="edit-project-consultant"
              name="consultant"
              type="text"
              value={consultant}
              onChange={(event) => {
                setConsultant(event.target.value);

                if (submitError) {
                  setSubmitError(null);
                }
              }}
              placeholder="e.g. Michael"
              autoComplete="off"
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>

          {submitError && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400"
            >
              {submitError}
            </p>
          )}
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={closeModal}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Saving changes..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
