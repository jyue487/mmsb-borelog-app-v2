// MembersPage.tsx

import type { Member } from '@mmsb/core';
import { useState } from 'react';

import AddMemberModal from '../components/AddMemberModal';
import RemoveMemberModal from '../components/RemoveMemberModal';
import { useAuth } from '../context/AuthContextProvider';
import { createDummyMembers } from '../data/dummyMembers';
import {
  MEMBER_ROLE_BADGE_CLASSES,
  MEMBER_ROLE_LABELS,
  MEMBER_ROLE_RANK,
} from '../data/memberRoles';

const ADDED_DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

// Sorts a copy. The caller's array must not be reordered in place — the dummy
// list is module state and `members` is React state.
function sortMembers(members: Member[]): Member[] {
  return [...members].sort((a, b) => {
    const rankDifference =
      MEMBER_ROLE_RANK[a.role] - MEMBER_ROLE_RANK[b.role];

    if (rankDifference !== 0) {
      return rankDifference;
    }

    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
}

export default function MembersPage() {
  // `ProtectedRoute` already blocks rendering until the session resolves, so
  // `email` is populated on the very first render and the seed can stay a
  // one-shot initialiser — no effect that could clobber members just added.
  const { email } = useAuth();

  const [members, setMembers] = useState<Member[]>(() =>
    sortMembers(createDummyMembers(email)),
  );
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [memberPendingRemoval, setMemberPendingRemoval] =
    useState<Member | null>(null);

  const isCurrentUser = (member: Member) =>
    email !== null && member.email.toLowerCase() === email.toLowerCase();

  return (
    <div className="min-h-full bg-slate-100 px-4 py-8 text-slate-950 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            MMSB Dashboard
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">Members</h1>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Add or remove people who can access the dashboard.
          </p>
        </header>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="font-semibold">Member list</h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {members.length} member{members.length === 1 ? '' : 's'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddMemberOpen(true)}
              className="cursor-pointer inline-flex items-center gap-2 self-start rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 sm:self-auto"
            >
              Add member
            </button>
          </div>

          {members.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <p className="font-medium text-slate-700 dark:text-slate-300">
                No members yet
              </p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Use Add member to give someone access to the dashboard.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Member
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Role
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Added
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {members.map((member) => (
                    <tr
                      key={member.id}
                      className="bg-white dark:bg-slate-900"
                    >
                      <td className="min-w-64 px-5 py-4">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {member.name}
                          </p>

                          {isCurrentUser(member) && (
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              You
                            </span>
                          )}
                        </div>

                        <p className="mt-0.5 break-all text-sm text-slate-500 dark:text-slate-400">
                          {member.email}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={`rounded-md px-2.5 py-1 text-sm font-semibold ${MEMBER_ROLE_BADGE_CLASSES[member.role]}`}
                        >
                          {MEMBER_ROLE_LABELS[member.role]}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {ADDED_DATE_FORMATTER.format(member.createdAt)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        {isCurrentUser(member) ? (
                          // Disabled rather than hidden, so the reason is
                          // discoverable instead of the button just missing.
                          <button
                            type="button"
                            disabled
                            title="You cannot remove yourself"
                            className="cursor-not-allowed rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-400 dark:text-slate-600"
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setMemberPendingRemoval(member)}
                            className="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-red-400 dark:hover:bg-red-950/50"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        existingMembers={members}
        onMemberAdded={(newMember) => {
          setMembers((currentMembers) =>
            sortMembers([...currentMembers, newMember]),
          );
        }}
      />

      <RemoveMemberModal
        member={memberPendingRemoval}
        onClose={() => setMemberPendingRemoval(null)}
        onConfirm={(member) => {
          setMembers((currentMembers) =>
            currentMembers.filter(
              (currentMember) => currentMember.id !== member.id,
            ),
          );
          setMemberPendingRemoval(null);
        }}
      />
    </div>
  );
}
