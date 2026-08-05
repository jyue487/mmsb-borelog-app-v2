import type { Project } from "@mmsb/core";
import { X } from "lucide-react";
import { useEffect, useState, type SubmitEvent } from "react";

import { mapProjectRow, PROJECT_COLUMNS } from "../supabase/projectRow";
import { supabase } from "../supabase/supabase.server";

type AddProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onProjectAdded: (project: Project) => void;
};

export default function AddProjectModal({
  isOpen,
  onClose,
  onProjectAdded,
}: AddProjectModalProps) {
  const [input, setInput] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedProjectCode = input.trim();
  const canSubmit = trimmedProjectCode.length > 0 && !isSubmitting;

  const resetModal = () => {
    setInput("");
    setSubmitError(null);
  };

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }

    resetModal();
    onClose();
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const { data, error } = await supabase
      .from("projects")
      .insert({
        code: trimmedProjectCode,
      })
      .select(PROJECT_COLUMNS)
      .single();

    if (error) {
      console.error("Error adding project:", error);

      if (error.code === "23505") {
        setSubmitError("A project with this code already exists.");
      } else {
        setSubmitError(error.message);
      }

      setIsSubmitting(false);
      return;
    }

    onProjectAdded(mapProjectRow(data));
    resetModal();
    setIsSubmitting(false);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSubmitting]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-project-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <h2
              id="add-project-title"
              className="text-lg font-bold text-slate-900 dark:text-white"
            >
              Add project
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Enter the unique code used to identify this project.
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

        <div className="px-6 py-5">
          <label
            htmlFor="project-code"
            className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            Project code
          </label>

          <input
            id="project-code"
            name="projectCode"
            type="text"
            value={input}
            onChange={(event) => {
              setInput(event.target.value);

              if (submitError) {
                setSubmitError(null);
              }
            }}
            placeholder="e.g. MM1234"
            autoFocus
            autoComplete="off"
            disabled={isSubmitting}
            aria-invalid={submitError !== null}
            aria-describedby={submitError ? "project-code-error" : undefined}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
          />

          {submitError && (
            <p
              id="project-code-error"
              role="alert"
              className="mt-2 text-sm font-medium text-red-600 dark:text-red-400"
            >
              {submitError}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800">
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
            disabled={!canSubmit}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Adding project..." : "Add project"}
          </button>
        </div>
      </form>
    </div>
  );
}