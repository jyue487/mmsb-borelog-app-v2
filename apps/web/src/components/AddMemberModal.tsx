// AddMemberModal.tsx

import {
  MEMBER_PASSWORD_MIN_LENGTH,
  memberRoleNeedsPassword,
  type Member,
  type MemberRole,
} from '@mmsb/core';
import { X } from 'lucide-react';
import { useEffect, useState, type SubmitEvent } from 'react';

import { useAuth } from '../context/auth';
import {
  assignableMemberRolesFor,
  canManageMemberWithRole,
  MEMBER_ROLE_DESCRIPTIONS,
  MEMBER_ROLE_LABELS,
} from '../data/memberRoles';
import { readInvokeError } from '../supabase/invokeError';
import { mapMemberRow } from '../supabase/memberRow';
import { supabase } from '../supabase/supabase.server';
import { ERROR_CLASSES, FIELD_CLASSES, LABEL_CLASSES } from './fieldClasses';
import PasswordField from './PasswordField';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AddMemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
  existingMembers: Member[];
  onMemberAdded: (member: Member) => void;
};

export default function AddMemberModal({
  isOpen,
  onClose,
  existingMembers,
  onMemberAdded,
}: AddMemberModalProps) {
  // An admin may not hand out the admin role — that tier is the owner's to
  // grant. Read here rather than passed in as a prop, so the modal cannot be
  // mounted with a role that disagrees with the session.
  const { role: actorRole } = useAuth();
  const assignableRoles = assignableMemberRolesFor(actorRole);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberRole>('viewer');
  const [password, setPassword] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const needsPassword = memberRoleNeedsPassword(role);

  const resetModal = () => {
    setName('');
    setEmail('');
    setRole('viewer');
    setPassword('');
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);
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

    if (isSubmitting) {
      return;
    }

    const trimmedName = name.trim();
    const normalisedEmail = email.trim().toLowerCase();

    const nextNameError =
      trimmedName.length === 0 ? 'Enter the member’s full name.' : null;

    let nextEmailError: string | null = null;

    if (normalisedEmail.length === 0) {
      nextEmailError = 'Enter an email address.';
    } else if (!EMAIL_PATTERN.test(normalisedEmail)) {
      nextEmailError = 'Enter a valid email address.';
    } else if (
      // A free fast path, not a correctness guarantee — this only sees the rows
      // already on screen. The server repeats the check against the table and
      // answers with `duplicate`, which is what actually enforces it.
      existingMembers.some(
        (member) => member.email.toLowerCase() === normalisedEmail,
      )
    ) {
      nextEmailError = 'A member with this email already exists.';
    }

    let nextPasswordError: string | null = null;

    if (needsPassword) {
      if (password.length === 0) {
        nextPasswordError = 'Enter a password for this supervisor.';
      } else if (password.length < MEMBER_PASSWORD_MIN_LENGTH) {
        nextPasswordError = `Use at least ${MEMBER_PASSWORD_MIN_LENGTH} characters.`;
      }
    }

    setNameError(nextNameError);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);

    if (
      nextNameError !== null ||
      nextEmailError !== null ||
      nextPasswordError !== null
    ) {
      return;
    }

    // Belt and braces. The select cannot offer a role this user may not grant,
    // and invite-member refuses one server-side regardless — this catches the
    // case in between, where the session's role changed while the modal sat
    // open, and turns it into a sentence rather than a 403.
    if (!canManageMemberWithRole(actorRole, role)) {
      setSubmitError('You cannot give someone that role.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    // An edge function rather than a plain insert: granting access means
    // creating the auth.users record first, which needs the service role key.
    // That key must never reach this bundle, so the work happens server-side.
    const { data, error } = await supabase.functions.invoke('invite-member', {
      body: {
        name: trimmedName,
        email: normalisedEmail,
        role,
        // Omitted rather than sent empty for the other roles — the function
        // rejects a password on an account that will never use one.
        ...(needsPassword ? { password } : {}),
      },
    });

    if (error) {
      console.error('Error adding member:', error);

      const failure = await readInvokeError(
        error,
        'Unable to add the member. Please try again.',
      );

      // A password the server rejected belongs under the password field, where
      // it can be corrected, not in the banner at the bottom of the form. The
      // project's own password policy can be stricter than the check above, so
      // this branch is reachable even after client-side validation passes.
      if (failure.code === 'weak_password' || failure.code === 'password_required') {
        setPasswordError(failure.message);
      } else {
        setSubmitError(failure.message);
      }

      setIsSubmitting(false);
      return;
    }

    onMemberAdded(mapMemberRow(data.member));
    resetModal();
    setIsSubmitting(false);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
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
  }, [isOpen, isSubmitting]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-member-title"
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
              id="add-member-title"
              className="text-lg font-bold text-slate-900 dark:text-white"
            >
              Add member
            </h2>

            {/*
              Hedged rather than promised: invite-member sends no mail at all when it
              revives a removed member (index.ts:161-165) or adopts an auth account
              that already exists (index.ts:228-279), and both return a member row
              indistinguishable from a fresh invite. Stating it flatly sent admins
              looking for an email that was never going to arrive.
            */}
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {needsPassword
                ? 'They will sign in to the mobile app with this password.'
                : 'They will receive an email invitation, unless they already have an account.'}
            </p>
          </div>

          <button
            type="button"
            onClick={closeModal}
            disabled={isSubmitting}
            aria-label="Close modal"
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div>
            <label htmlFor="member-name" className={LABEL_CLASSES}>
              Full name
            </label>

            <input
              id="member-name"
              name="memberName"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);

                if (nameError) {
                  setNameError(null);
                }
              }}
              placeholder="e.g. Nadia Rahman"
              autoFocus
              autoComplete="off"
              disabled={isSubmitting}
              aria-invalid={nameError !== null}
              aria-describedby={nameError ? 'member-name-error' : undefined}
              className={FIELD_CLASSES}
            />

            {nameError && (
              <p id="member-name-error" role="alert" className={ERROR_CLASSES}>
                {nameError}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="member-email" className={LABEL_CLASSES}>
              Email
            </label>

            <input
              id="member-email"
              name="memberEmail"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);

                if (emailError) {
                  setEmailError(null);
                }
              }}
              placeholder="e.g. nadia.rahman@mmsb.com"
              autoComplete="off"
              disabled={isSubmitting}
              aria-invalid={emailError !== null}
              aria-describedby={emailError ? 'member-email-error' : undefined}
              className={FIELD_CLASSES}
            />

            {emailError && (
              <p id="member-email-error" role="alert" className={ERROR_CLASSES}>
                {emailError}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="member-role" className={LABEL_CLASSES}>
              Role
            </label>

            <select
              id="member-role"
              name="memberRole"
              value={role}
              onChange={(event) => {
                const nextRole = event.target.value as MemberRole;

                setRole(nextRole);

                // Drop anything typed for a role that no longer applies. Left
                // in place it would be submitted invisibly, and the function
                // rejects a password on a non-supervisor.
                if (!memberRoleNeedsPassword(nextRole)) {
                  setPassword('');
                  setPasswordError(null);
                }
              }}
              disabled={isSubmitting}
              className={`${FIELD_CLASSES} cursor-pointer disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {/* Not MEMBER_ROLE_LIST — `owner` is never offered here, and an
                  admin is not offered `admin` either. */}
              {assignableRoles.map((memberRole) => (
                <option key={memberRole} value={memberRole}>
                  {MEMBER_ROLE_LABELS[memberRole]}
                </option>
              ))}
            </select>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {MEMBER_ROLE_DESCRIPTIONS[role]}
            </p>
          </div>

          {/* Directly under the Role select, so it reads as a consequence of
              the choice rather than a field that appeared from nowhere. */}
          {needsPassword && (
            <PasswordField
              id="member-password"
              label="Password"
              value={password}
              onChange={(value) => {
                setPassword(value);

                if (passwordError) {
                  setPasswordError(null);
                }
              }}
              error={passwordError}
              helperText={`Supervisors sign in to the mobile app with this password. At least ${MEMBER_PASSWORD_MIN_LENGTH} characters.`}
              disabled={isSubmitting}
            />
          )}

          {submitError && (
            <p role="alert" className={ERROR_CLASSES}>
              {submitError}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={closeModal}
            disabled={isSubmitting}
            className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? needsPassword
                ? 'Creating account...'
                : 'Sending invite...'
              : 'Add member'}
          </button>
        </div>
      </form>
    </div>
  );
}
