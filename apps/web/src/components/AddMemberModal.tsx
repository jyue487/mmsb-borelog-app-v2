// AddMemberModal.tsx

import { MEMBER_ROLE_LIST, type Member, type MemberRole } from '@mmsb/core';
import { X } from 'lucide-react';
import { useEffect, useState, type SubmitEvent } from 'react';

import {
  MEMBER_ROLE_DESCRIPTIONS,
  MEMBER_ROLE_LABELS,
} from '../data/memberRoles';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELD_CLASSES =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500';

const LABEL_CLASSES =
  'mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300';

const ERROR_CLASSES = 'mt-2 text-sm font-medium text-red-600 dark:text-red-400';

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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberRole>('viewer');
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const resetModal = () => {
    setName('');
    setEmail('');
    setRole('viewer');
    setNameError(null);
    setEmailError(null);
  };

  const closeModal = () => {
    resetModal();
    onClose();
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

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
      existingMembers.some(
        (member) => member.email.toLowerCase() === normalisedEmail,
      )
    ) {
      nextEmailError = 'A member with this email already exists.';
    }

    setNameError(nextNameError);
    setEmailError(nextEmailError);

    if (nextNameError !== null || nextEmailError !== null) {
      return;
    }

    onMemberAdded({
      id: crypto.randomUUID(),
      name: trimmedName,
      email: normalisedEmail,
      role,
      createdAt: new Date(),
    });

    resetModal();
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
  }, [isOpen]);

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
        onSubmit={handleSubmit}
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

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Give someone access to the dashboard.
            </p>
          </div>

          <button
            type="button"
            onClick={closeModal}
            aria-label="Close modal"
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
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
              onChange={(event) =>
                setRole(event.target.value as MemberRole)
              }
              className={`${FIELD_CLASSES} cursor-pointer`}
            >
              {MEMBER_ROLE_LIST.map((memberRole) => (
                <option key={memberRole} value={memberRole}>
                  {MEMBER_ROLE_LABELS[memberRole]}
                </option>
              ))}
            </select>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {MEMBER_ROLE_DESCRIPTIONS[role]}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={closeModal}
            className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Add member
          </button>
        </div>
      </form>
    </div>
  );
}
