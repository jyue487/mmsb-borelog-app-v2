// EditMemberModal.tsx
//
// The single per-row entry point on the Members page: replace a supervisor's
// password, or remove the member entirely. Replaces the old RemoveMemberModal,
// whose soft delete now lives in the danger zone at the bottom.
//
// MembersPage only ever opens this for a member the signed-in user is allowed to
// manage — the row's button is disabled otherwise, with the reason in its
// tooltip — so there is no "you cannot do anything here" state to render.
//
// State is reset by remounting rather than by an effect: MembersPage keys this
// on the member's id, so a password typed for one person cannot survive into
// another's modal.

import {
  MEMBER_PASSWORD_MIN_LENGTH,
  memberRoleNeedsPassword,
  type Member,
} from '@mmsb/core';
import { X } from 'lucide-react';
import { useEffect, useState, type SubmitEvent } from 'react';

import { useAuth } from '../context/auth';
import {
  MEMBER_ROLE_BADGE_CLASSES,
  MEMBER_ROLE_LABELS,
} from '../data/memberRoles';
import { readInvokeError } from '../supabase/invokeError';
import { supabase } from '../supabase/supabase.server';
import { ERROR_CLASSES, HELPER_CLASSES } from './fieldClasses';
import PasswordField from './PasswordField';

const SECTION_HEADING_CLASSES =
  'text-sm font-semibold text-slate-900 dark:text-slate-100';

type EditMemberModalProps = {
  member: Member | null;
  onClose: () => void;
  onMemberRemoved: (member: Member) => void;
};

export default function EditMemberModal({
  member,
  onClose,
  onMemberRemoved,
}: EditMemberModalProps) {
  const { userId } = useAuth();

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isPasswordSaved, setIsPasswordSaved] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [isConfirmingRemoval, setIsConfirmingRemoval] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const isBusy = isSavingPassword || isRemoving;

  const closeModal = () => {
    if (isBusy) {
      return;
    }

    onClose();
  };

  const handleUpdatePassword = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (member === null || isBusy) {
      return;
    }

    if (password.length === 0) {
      setPasswordError('Enter a new password.');
      return;
    }

    if (password.length < MEMBER_PASSWORD_MIN_LENGTH) {
      setPasswordError(`Use at least ${MEMBER_PASSWORD_MIN_LENGTH} characters.`);
      return;
    }

    setIsSavingPassword(true);
    setPasswordError(null);
    setIsPasswordSaved(false);

    // An edge function because admin.auth.admin.updateUserById needs the
    // service role key, which must never reach this bundle. It re-checks that
    // the target really is a supervisor — the conditional section below is only
    // an affordance.
    const { error } = await supabase.functions.invoke('set-member-password', {
      body: { userId: member.id, password },
    });

    if (error) {
      console.error('Error updating member password:', error);

      const failure = await readInvokeError(
        error,
        'Unable to update the password. Please try again.',
      );

      setPasswordError(failure.message);
      setIsSavingPassword(false);
      return;
    }

    setPassword('');
    setIsPasswordSaved(true);
    setIsSavingPassword(false);
  };

  const handleRemove = async () => {
    if (member === null || isBusy) {
      return;
    }

    // The disabled Edit buttons on the members table are the affordance; this
    // is the invariant. The edge function re-checks both rules server-side,
    // which is what holds against a hand-crafted request.
    if (member.id === userId || member.role === 'owner') {
      setRemoveError('This member cannot be removed.');
      return;
    }

    setIsRemoving(true);
    setRemoveError(null);

    // An edge function rather than the soft delete this used to do inline.
    // Removing someone has to ban their auth.users record as well as hide the
    // row, or the mobile app — which gates on "is there a session" and nothing
    // else — keeps letting them sign in and sync. Banning needs the service role
    // key, so it cannot happen here. Doing both server-side is also what stops
    // the two halves getting out of step.
    const { error } = await supabase.functions.invoke('remove-member', {
      body: { userId: member.id },
    });

    if (error) {
      console.error('Error removing member:', error);

      const failure = await readInvokeError(
        error,
        'Unable to remove the member. Please try again.',
      );

      setRemoveError(failure.message);
      setIsRemoving(false);
      return;
    }

    onMemberRemoved(member);
    setIsRemoving(false);
  };

  useEffect(() => {
    if (member === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [member, isBusy]);

  if (member === null) {
    return null;
  }

  const hasPassword = memberRoleNeedsPassword(member.role);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-member-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      <div className="max-h-full w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <h2
              id="edit-member-title"
              className="text-lg font-bold text-slate-900 dark:text-white"
            >
              Edit member
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage this person’s access.
            </p>
          </div>

          <button
            type="button"
            onClick={closeModal}
            disabled={isBusy}
            aria-label="Close modal"
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-6 px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {member.name || '—'}
              </p>

              <p className="mt-0.5 break-all text-sm text-slate-500 dark:text-slate-400">
                {member.email || '—'}
              </p>
            </div>

            <span
              className={`shrink-0 rounded-md px-2.5 py-1 text-sm font-semibold ${MEMBER_ROLE_BADGE_CLASSES[member.role]}`}
            >
              {MEMBER_ROLE_LABELS[member.role]}
            </span>
          </div>

          <section className="border-t border-slate-200 pt-5 dark:border-slate-800">
            <h3 className={SECTION_HEADING_CLASSES}>Password</h3>

            {hasPassword ? (
              // A <form> rather than a bare button so Enter in the field
              // submits, which is what anyone typing a password expects. It is
              // nested inside the card <div>, not another form.
              <form onSubmit={(event) => void handleUpdatePassword(event)}>
                <p className={`${HELPER_CLASSES} mb-4`}>
                  Passwords cannot be viewed — only replaced. Set a new one and
                  pass it on to them.
                </p>

                <PasswordField
                  id="edit-member-password"
                  label="New password"
                  value={password}
                  onChange={(value) => {
                    setPassword(value);

                    if (passwordError) {
                      setPasswordError(null);
                    }

                    if (isPasswordSaved) {
                      setIsPasswordSaved(false);
                    }
                  }}
                  error={passwordError}
                  helperText={`At least ${MEMBER_PASSWORD_MIN_LENGTH} characters.`}
                  disabled={isBusy}
                  autoFocus
                />

                {isPasswordSaved && (
                  <p
                    role="status"
                    className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400"
                  >
                    Password updated. Their old password no longer works.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isBusy}
                  className="mt-4 cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSavingPassword ? 'Updating...' : 'Update password'}
                </button>
              </form>
            ) : (
              <p className={HELPER_CLASSES}>
                {MEMBER_ROLE_LABELS[member.role]}s sign in to the dashboard with
                a one-time code sent by email, so there is no password to set.
                Only supervisors, who use the mobile app, have one.
              </p>
            )}
          </section>

          <section className="rounded-lg border border-red-200 bg-red-50/60 p-4 dark:border-red-900/60 dark:bg-red-950/20">
            <h3 className="text-sm font-semibold text-red-900 dark:text-red-200">
              Remove member
            </h3>

            {isConfirmingRemoval ? (
              <>
                <p className="mt-2 text-sm text-red-800 dark:text-red-300">
                  Remove{' '}
                  <span className="font-semibold">
                    {member.name || member.email}
                  </span>{' '}
                  <span className="break-all">({member.email})</span>? They will
                  be signed out of the dashboard the next time it loads.
                </p>

                {removeError && (
                  <p role="alert" className={ERROR_CLASSES}>
                    {removeError}
                  </p>
                )}

                <div className="mt-4 flex gap-3">
                  {/* autoFocus on Keep, not Remove: Enter must not confirm a
                      destructive action. This button mounts with the confirm
                      step, so it takes focus from the password field above. */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsConfirmingRemoval(false);
                      setRemoveError(null);
                    }}
                    disabled={isRemoving}
                    autoFocus
                    className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Keep member
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleRemove()}
                    disabled={isRemoving}
                    className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isRemoving ? 'Removing...' : 'Yes, remove'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm text-red-800 dark:text-red-300">
                  They lose access to the dashboard and the mobile app straight
                  away. Nothing they have already recorded is deleted, and you
                  can add them back later.
                </p>

                <button
                  type="button"
                  onClick={() => setIsConfirmingRemoval(true)}
                  disabled={isBusy}
                  className="mt-4 cursor-pointer rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-950/50"
                >
                  Remove member
                </button>
              </>
            )}
          </section>
        </div>

        <div className="flex justify-end border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          {/* Takes focus only when there is no password field to take it, so
              opening the dialog never leaves focus behind on the table row.
              Never the destructive button — Enter must not remove anyone. */}
          <button
            type="button"
            onClick={closeModal}
            disabled={isBusy}
            autoFocus={!hasPassword}
            className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
