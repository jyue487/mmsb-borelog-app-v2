// AddPeopleModal.tsx
//
// Assigns supervisors and viewers to a project by ticking them, and unassigns
// them by unticking. One list, one Save.
//
// Owners and admins are not in the list on purpose: they reach every project
// through their own bypass policy on `projects`, so a tick box for them would
// change nothing. See packages/supabase/policies/project_to_user.sql.
//
// Conditionally rendered by ProjectPage rather than gated on an `isOpen` prop —
// both conventions exist in this codebase, and mounting is what resets the tick
// state, so reopening after a Cancel cannot inherit the previous session's
// changes.

import type { Member } from '@mmsb/core';
import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '../context/auth';
import {
  MEMBER_ROLE_BADGE_CLASSES,
  MEMBER_ROLE_LABELS,
} from '../data/memberRoles';
import {
  fetchAssignableMembers,
  saveProjectPeople,
} from '../supabase/projectPeople';
import { ERROR_CLASSES } from './fieldClasses';

type AddPeopleModalProps = {
  projectId: string;
  // Who is on the project right now. The page already has them, so the modal
  // does not re-read the assignment table just to know what to pre-tick.
  assignedPeople: Member[];
  onClose: () => void;
  // Deliberately carries no payload. This modal only ever loaded supervisors and
  // viewers, so it cannot describe the project's full membership — an owner or
  // admin holding an assignment row is invisible to it. The page refetches.
  onPeopleSaved: () => void;
};

export default function AddPeopleModal({
  projectId,
  assignedPeople,
  onClose,
  onPeopleSaved,
}: AddPeopleModalProps) {
  const { userId } = useAuth();

  const [assignableMembers, setAssignableMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // What was ticked when the modal opened. Held separately from `checkedIds` so
  // Save can diff against it — the modal writes only the difference, never the
  // whole list, so it cannot clobber a change someone else made meanwhile.
  const initiallyAssignedIds = useMemo(
    () => new Set(assignedPeople.map((person) => person.id)),
    [assignedPeople],
  );

  const [checkedIds, setCheckedIds] = useState<Set<string>>(
    () => new Set(assignedPeople.map((person) => person.id)),
  );

  useEffect(() => {
    const loadAssignableMembers = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        setAssignableMembers(await fetchAssignableMembers());
      } catch (error) {
        console.error('Error fetching assignable members:', error);

        setLoadError(
          error instanceof Error
            ? error.message
            : 'Unable to load the member list.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadAssignableMembers();
  }, []);

  const closeModal = () => {
    if (isSaving) {
      return;
    }

    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSaving) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSaving, onClose]);

  const toggle = (memberId: string) => {
    setCheckedIds((current) => {
      const next = new Set(current);

      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }

      return next;
    });
  };

  const addUserIds = [...checkedIds].filter(
    (id) => !initiallyAssignedIds.has(id),
  );

  const removeUserIds = [...initiallyAssignedIds].filter(
    (id) => !checkedIds.has(id),
  );

  const hasChanges = addUserIds.length > 0 || removeUserIds.length > 0;

  const handleSave = async () => {
    if (isSaving || !hasChanges) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await saveProjectPeople({
        projectId,
        addUserIds,
        removeUserIds,
        actorId: userId,
      });
    } catch (error) {
      console.error('Error saving project people:', error);

      setSaveError(
        error instanceof Error
          ? error.message
          : 'Unable to save. Please try again.',
      );
      setIsSaving(false);
      return;
    }

    onPeopleSaved();

    setIsSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-people-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      <div className="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <h2
              id="add-people-title"
              className="text-lg font-bold text-slate-900 dark:text-white"
            >
              Add people
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Tick everyone who should see this project. Owners and admins
              already see every project.
            </p>
          </div>

          <button
            type="button"
            onClick={closeModal}
            disabled={isSaving}
            aria-label="Close modal"
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading members...
            </p>
          ) : loadError ? (
            <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
              {loadError}
            </p>
          ) : assignableMembers.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              There are no supervisors or viewers yet. Add them on the Members
              page first, then come back here to put them on this project.
            </p>
          ) : (
            <ul className="space-y-1">
              {assignableMembers.map((member) => (
                <li key={member.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 transition hover:bg-slate-100 dark:hover:bg-slate-800">
                    <input
                      type="checkbox"
                      checked={checkedIds.has(member.id)}
                      onChange={() => toggle(member.id)}
                      disabled={isSaving}
                      className="size-4 shrink-0 cursor-pointer accent-indigo-600 disabled:cursor-not-allowed"
                    />

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {member.name || '—'}
                      </span>

                      <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                        {member.email || '—'}
                      </span>
                    </span>

                    <span
                      className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${MEMBER_ROLE_BADGE_CLASSES[member.role]}`}
                    >
                      {MEMBER_ROLE_LABELS[member.role]}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}

          {saveError && (
            <p role="alert" className={ERROR_CLASSES}>
              {saveError}
            </p>
          )}
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={closeModal}
            disabled={isSaving}
            className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving || !hasChanges}
            className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
