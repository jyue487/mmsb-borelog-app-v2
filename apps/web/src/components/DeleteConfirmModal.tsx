// DeleteConfirmModal.tsx
//
// The confirmation in front of an irreversible delete. One component for both callers, because
// the project and the borehole differ only in how hard they are to confirm: pass
// `confirmationText` and the button stays dead until the user types that string back, omit it
// and a plain confirm is enough.
//
// The chrome is AddProjectModal's; the destructive rules are EditMemberModal's danger zone,
// which is where this app settled how to ask before wrecking something.

import { X } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { useEscapeKey } from '../utils/useEscapeKey';
import { ERROR_CLASSES, FIELD_CLASSES, LABEL_CLASSES } from './fieldClasses';

type DeleteConfirmModalProps = {
  /** Dialog heading, e.g. 'Delete project'. */
  title: string;
  /** What will be destroyed. Rendered inside the red panel. */
  children: ReactNode;
  /**
   * When set, the confirm button is disabled until this exact string is typed. Used for a
   * project, which takes every borehole, block and photo under it; a single borehole is not
   * worth the friction.
   */
  confirmationText?: string;
  /** Confirm button label, e.g. 'Delete project'. */
  confirmLabel: string;
  isDeleting: boolean;
  errorMessage: string | null;
  onConfirm: () => void;
  onClose: () => void;
};

export function DeleteConfirmModal({
  title,
  children,
  confirmationText,
  confirmLabel,
  isDeleting,
  errorMessage,
  onConfirm,
  onClose,
}: DeleteConfirmModalProps) {
  const [typedConfirmation, setTypedConfirmation] = useState('');

  const closeModal = () => {
    if (isDeleting) {
      return;
    }

    onClose();
  };

  useEscapeKey(true, closeModal);

  // Exact, not trimmed or case-folded. The point of the gate is that the user read the name off
  // the row they are about to destroy; accepting a near miss gives that up for nothing.
  const isConfirmed =
    confirmationText === undefined || typedConfirmation === confirmationText;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <h2
            id="delete-confirm-title"
            className="text-lg font-bold text-slate-900 dark:text-white"
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={closeModal}
            disabled={isDeleting}
            aria-label="Close modal"
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 py-5">
          <section className="rounded-lg border border-red-200 bg-red-50/60 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-300">
            {children}
          </section>

          {confirmationText !== undefined && (
            <div className="mt-5">
              <label htmlFor="delete-confirmation" className={LABEL_CLASSES}>
                Type <span className="font-mono">{confirmationText}</span> to
                confirm
              </label>

              {/* Takes focus on open, which is also what keeps it off the destructive button
                  below — EditMemberModal's rule, where the password field plays this part.
                  Enter submits nothing: this is not a form. */}
              <input
                id="delete-confirmation"
                type="text"
                value={typedConfirmation}
                onChange={(event) => setTypedConfirmation(event.target.value)}
                disabled={isDeleting}
                autoFocus
                autoComplete="off"
                spellCheck={false}
                className={FIELD_CLASSES}
              />
            </div>
          )}

          {errorMessage && (
            <p role="alert" className={ERROR_CLASSES}>
              {errorMessage}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          {/* autoFocus lands here only when there is no confirmation field to take it, and
              never on the delete button: Enter must not destroy anything. */}
          <button
            type="button"
            onClick={closeModal}
            disabled={isDeleting}
            autoFocus={confirmationText === undefined}
            className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting || !isConfirmed}
            className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
