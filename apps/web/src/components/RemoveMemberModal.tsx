// RemoveMemberModal.tsx

import type { Member } from '@mmsb/core';
import { X } from 'lucide-react';
import { useEffect } from 'react';

type RemoveMemberModalProps = {
  member: Member | null;
  onClose: () => void;
  onConfirm: (member: Member) => void;
};

export default function RemoveMemberModal({
  member,
  onClose,
  onConfirm,
}: RemoveMemberModalProps) {
  useEffect(() => {
    if (member === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [member]);

  if (member === null) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="remove-member-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <h2
            id="remove-member-title"
            className="text-lg font-bold text-slate-900 dark:text-white"
          >
            Remove member
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Remove{' '}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {member.name}
            </span>{' '}
            <span className="break-all">({member.email})</span>? They will lose
            access to the dashboard.
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onConfirm(member)}
            className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
