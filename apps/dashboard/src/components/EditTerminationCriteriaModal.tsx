import type { Project } from "@mmsb/core";
import { X } from "lucide-react";
import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type KeyboardEvent,
    type SubmitEvent,
} from "react";

import { useAuth } from "../context/authContext";
import { mapProjectRow, PROJECT_COLUMNS } from "../supabase/projectRow";
import { supabase } from "../supabase/supabase.server";

const INDENT = "  ";

const DISCARD_MESSAGE =
  "Discard your changes to the termination criteria?";

const PLACEHOLDER = `Case 1: [Some case]
- cond1
- cond2
then such and such and so.

Case 2: ...`;

type EditTerminationCriteriaModalProps = {
  project: Project;
  onClose: () => void;
  onProjectUpdated: (project: Project) => void;
};

export default function EditTerminationCriteriaModal({
  project,
  onClose,
  onProjectUpdated,
}: EditTerminationCriteriaModalProps) {
  const { userId } = useAuth();

  const initialDraft = normalizeLineBreaks(project.terminationCriteria);

  const [draft, setDraft] = useState(initialDraft);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingSelectionRef = useRef<[number, number] | null>(null);

  const isDirty = draft !== initialDraft;

  // Start at the end of the existing text so the workspace opens ready to
  // append rather than with the caret parked in front of everything.
  useLayoutEffect(() => {
    textareaRef.current?.setSelectionRange(
      textareaRef.current.value.length,
      textareaRef.current.value.length,
    );
  }, []);

  // Selection is restored after render because Tab/Shift+Tab rewrite the whole
  // value, which would otherwise drop the caret at the end of the textarea.
  useLayoutEffect(() => {
    const pendingSelection = pendingSelectionRef.current;

    if (!pendingSelection || !textareaRef.current) {
      return;
    }

    pendingSelectionRef.current = null;

    textareaRef.current.setSelectionRange(
      pendingSelection[0],
      pendingSelection[1],
    );
  }, [draft]);

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape" || isSubmitting) {
        return;
      }

      // Tab is bound to indentation, so Escape is what releases focus from the
      // workspace. A second Escape then closes the modal.
      if (document.activeElement === textareaRef.current) {
        textareaRef.current?.blur();
        return;
      }

      if (shouldClose(isDirty)) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDirty, isSubmitting, onClose]);

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }

    if (shouldClose(isDirty)) {
      onClose();
    }
  };

  const applyDraft = (
    nextDraft: string,
    selectionStart: number,
    selectionEnd: number,
  ) => {
    // An unchanged value (Shift+Tab on an unindented line) re-renders nothing,
    // so a queued selection would be left to fire on some later keystroke.
    if (nextDraft === draft) {
      return;
    }

    pendingSelectionRef.current = [selectionStart, selectionEnd];
    setDraft(nextDraft);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Tab") {
      return;
    }

    event.preventDefault();

    const textarea = event.currentTarget;
    const { selectionStart, selectionEnd } = textarea;

    if (!event.shiftKey && selectionStart === selectionEnd) {
      const caret = selectionStart + INDENT.length;

      applyDraft(
        draft.slice(0, selectionStart) + INDENT + draft.slice(selectionStart),
        caret,
        caret,
      );

      return;
    }

    const lineStart =
      selectionStart === 0
        ? 0
        : draft.lastIndexOf("\n", selectionStart - 1) + 1;

    const nextNewline = draft.indexOf("\n", selectionEnd);
    const lineEnd = nextNewline === -1 ? draft.length : nextNewline;

    let firstLineShift = 0;
    let totalShift = 0;

    const shiftedLines = draft
      .slice(lineStart, lineEnd)
      .split("\n")
      .map((line, index) => {
        const shifted = event.shiftKey ? outdentLine(line) : indentLine(line);
        const shift = shifted.length - line.length;

        if (index === 0) {
          firstLineShift = shift;
        }

        totalShift += shift;

        return shifted;
      });

    applyDraft(
      draft.slice(0, lineStart) + shiftedLines.join("\n") + draft.slice(lineEnd),
      Math.max(lineStart, selectionStart + firstLineShift),
      Math.max(lineStart, selectionEnd + totalShift),
    );
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
          termination_criteria: normalizeForSave(draft),
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
      console.error("Error updating termination criteria:", error);

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to save the termination criteria.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-termination-criteria-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
      >
        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <h2
              id="edit-termination-criteria-title"
              className="text-lg font-bold text-slate-900 dark:text-white"
            >
              Termination criteria
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Paste or type freely — line breaks, blank lines and indentation
              are kept exactly as entered.
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

        <div className="flex min-h-0 flex-1 flex-col px-6 py-5">
          <label htmlFor="termination-criteria-workspace" className="sr-only">
            Termination criteria
          </label>

          <textarea
            id="termination-criteria-workspace"
            ref={textareaRef}
            value={draft}
            onChange={(event) => {
              setDraft(normalizeLineBreaks(event.target.value));

              if (submitError) {
                setSubmitError(null);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={PLACEHOLDER}
            rows={16}
            autoFocus
            spellCheck={false}
            disabled={isSubmitting}
            className="min-h-[45dvh] w-full flex-1 resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
          />

          <p className="mt-2 shrink-0 text-xs text-slate-500 dark:text-slate-400">
            Tab indents · Shift+Tab outdents · Esc leaves the editor
          </p>

          {submitError && (
            <p
              role="alert"
              className="mt-3 shrink-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400"
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

function shouldClose(isDirty: boolean) {
  return !isDirty || window.confirm(DISCARD_MESSAGE);
}

function normalizeLineBreaks(text: string) {
  return text.replace(/\r\n?/g, "\n");
}

function normalizeForSave(text: string) {
  return text
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/, ""))
    .join("\n")
    .trim();
}

function indentLine(line: string) {
  return line.length === 0 ? line : INDENT + line;
}

function outdentLine(line: string) {
  const leadingSpaces = line.length - line.trimStart().length;

  return line.slice(Math.min(leadingSpaces, INDENT.length));
}
