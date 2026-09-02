// MembersPage.tsx

import type { Member } from '@mmsb/core';
import { useEffect, useState } from 'react';

import AddMemberModal from '../components/AddMemberModal';
import EditMemberModal from '../components/EditMemberModal';
import { useAuth } from '../context/auth';
import {
    canManageMembers,
    canManageMemberWithRole,
    MEMBER_ROLE_BADGE_CLASSES,
    MEMBER_ROLE_LABELS,
    sortMembersByRank,
} from '../data/memberRoles';
import { mapMemberRow, MEMBER_COLUMNS } from '../supabase/memberRow';
import { supabase } from '../supabase/supabase.server';

const ADDED_DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

// Intl.DateTimeFormat throws RangeError on an Invalid Date, which is what a
// null or malformed created_at column produces once it has been through
// `new Date(...)`. One bad row must not take the whole table down.
function formatAddedDate(date: Date): string {
  return Number.isNaN(date.getTime()) ? '—' : ADDED_DATE_FORMATTER.format(date);
}

// Removed members sort by when they were removed, most recent first — the
// opposite question from the active list. Nobody scans this looking for a
// specific person by rank; they look for "who did we just remove".
function sortRemovedMembers(members: Member[]): Member[] {
  return [...members].sort(
    (a, b) => (b.deletedAt?.getTime() ?? 0) - (a.deletedAt?.getTime() ?? 0),
  );
}

type MembersTab = 'active' | 'removed';

export default function MembersPage() {
  // `ProtectedRoute` blocks rendering until the session *and* the role resolve,
  // so both are populated on the very first render here. `userId` is typed
  // `string | null` only because `useAuth()` is shared with unprotected routes.
  const { userId, role } = useAuth();

  const [members, setMembers] = useState<Member[]>([]);
  const [removedMembers, setRemovedMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MembersTab>('active');
  const [memberBeingEdited, setMemberBeingEdited] = useState<Member | null>(
    null,
  );

  const canManage = canManageMembers(role);

  useEffect(() => {
    const fetchAllMembers = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      // One round trip for both tabs, split client-side below — the read policy
      // on user_to_role returns removed rows too, so a manager needs no second
      // query to fill the Removed tab.
      //
      // Everyone else gets the filter, because they have no Removed tab to put
      // those rows in. Supervisors can read them (the policy admits roles 1-3)
      // but never see them, so pulling them into the browser is pointless — and
      // who lost access is administrative history. This is tidiness, not a
      // boundary: the boundary is the policy.
      const query = supabase.from('user_to_role').select(MEMBER_COLUMNS);

      const { data, error } = await (canManage
        ? query
        : query.is('deleted_at', null));

      if (error) {
        console.error('Error fetching members:', error);
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      const allMembers = (data ?? []).map(mapMemberRow);

      setMembers(
        sortMembersByRank(allMembers.filter((member) => member.deletedAt === null)),
      );
      setRemovedMembers(
        sortRemovedMembers(
          allMembers.filter((member) => member.deletedAt !== null),
        ),
      );

      setIsLoading(false);
    };

    void fetchAllMembers();
    // `canManage` is derived from the role, which is already resolved and fixed
    // by the time ProtectedRoute renders this page — so this does not refetch.
  }, [canManage]);

  // Who had access and lost it is administrative history, so the tab is only
  // offered to the people who can act on it. Everyone else sees the page exactly
  // as it was before, with no tab strip at all.
  const canSeeRemoved = canManage;
  const visibleTab: MembersTab = canSeeRemoved ? activeTab : 'active';
  const isRemovedTab = visibleTab === 'removed';
  const visibleMembers = isRemovedTab ? removedMembers : members;

  const isCurrentUser = (member: Member) => member.id === userId;

  // Null means manageable. Returning the reason rather than a boolean is what
  // lets the disabled button explain itself; order matters, because more than
  // one can apply at once and the most specific should win.
  //
  // The same four rules cover everything behind the Edit button — setting a
  // password and removing the member alike — so EditMemberModal never has to
  // render a "nothing you can do here" state.
  const manageBlockedReason = (member: Member): string | null => {
    if (isCurrentUser(member)) {
      return 'You cannot manage your own membership';
    }

    if (member.role === 'owner') {
      return 'Owners are managed in the database, not from here';
    }

    // No longer reachable through this page: the whole Action column is hidden
    // when !canManage, so a supervisor never sees a button to disable. Kept
    // because this function states the rule, and the missing column is only the
    // affordance for it.
    if (!canManage) {
      return 'Only owners and admins can manage members';
    }

    // Admins manage supervisors and viewers; the admin tier is the owner's to
    // grant and revoke. Only reachable for an admin acting on another admin —
    // the owner target and the non-manager caller are both caught above, so
    // naming admins here is accurate rather than a summary of the rule.
    if (!canManageMemberWithRole(role, member.role)) {
      return 'Only owners can manage admins';
    }

    return null;
  };

  return (
    <div className="min-h-full bg-slate-100 px-4 py-8 text-slate-950 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            MMSB Dashboard
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">Members</h1>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {canManage
              ? 'Add or remove people who can access the dashboard.'
              : 'People who can access the dashboard.'}
          </p>
        </header>

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
          >
            <span className="font-semibold">Something went wrong: </span>
            {errorMessage}
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="font-semibold">
                {isRemovedTab ? 'Removed members' : 'Member list'}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {isLoading
                  ? 'Loading members...'
                  : isRemovedTab
                    ? `${removedMembers.length} removed`
                    : `${members.length} member${members.length === 1 ? '' : 's'}`}
              </p>
            </div>

            {/* Only on the active tab. Add member on the Removed tab would read
                as "add one of these back", which is not what it does — it takes
                a fresh name, email and role. */}
            {canManage && !isRemovedTab && (
              <button
                type="button"
                onClick={() => setIsAddMemberOpen(true)}
                className="cursor-pointer inline-flex items-center gap-2 self-start rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 sm:self-auto"
              >
                Add member
              </button>
            )}
          </div>

          {canSeeRemoved && (
            <div
              role="tablist"
              aria-label="Member status"
              className="flex gap-1 border-b border-slate-200 px-5 dark:border-slate-800 sm:px-6"
            >
              {(['active', 'removed'] as const).map((tab) => {
                const isSelected = visibleTab === tab;
                const count = tab === 'active' ? members.length : removedMembers.length;

                return (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActiveTab(tab)}
                    className={`cursor-pointer -mb-px border-b-2 px-3 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      isSelected
                        ? 'border-indigo-600 text-indigo-700 dark:border-indigo-400 dark:text-indigo-300'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {tab === 'active' ? 'Active' : 'Removed'}
                    {!isLoading && (
                      <span className="ml-2 rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-14 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : visibleMembers.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <p className="font-medium text-slate-700 dark:text-slate-300">
                {isRemovedTab ? 'Nobody has been removed' : 'No members yet'}
              </p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {isRemovedTab
                  ? 'People you remove will be listed here.'
                  : canManage
                    ? 'Use Add member to give someone access to the dashboard.'
                    : 'Members will appear here once they are given access.'}
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
                      {isRemovedTab ? 'Removed' : 'Added'}
                    </th>

                    {/* Supervisors can read this page but manage nobody, so
                        the column would be nothing but disabled buttons all the
                        way down. The per-row disabled state below still earns
                        its place for owners and admins, where it explains one
                        row among many. */}
                    {canManage && (
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Action
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {visibleMembers.map((member) => {
                    const blockedReason = manageBlockedReason(member);

                    return (
                      <tr
                        key={member.id}
                        className="bg-white dark:bg-slate-900"
                      >
                        <td className="min-w-64 px-5 py-4">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900 dark:text-slate-100">
                              {member.name || '—'}
                            </p>

                            {isCurrentUser(member) && (
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                You
                              </span>
                            )}
                          </div>

                          <p className="mt-0.5 break-all text-sm text-slate-500 dark:text-slate-400">
                            {member.email || '—'}
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
                          {formatAddedDate(
                            isRemovedTab && member.deletedAt !== null
                              ? member.deletedAt
                              : member.createdAt,
                          )}
                        </td>

                        {canManage && (
                          <td className="whitespace-nowrap px-5 py-4 text-right">
                            {isRemovedTab ? (
                              // Read-only for now. Adding them back is the Add
                              // member flow on the Active tab, which finds this
                              // row by email, lifts the ban and revives it — so
                              // a Restore button here would be a shortcut, not
                              // new capability.
                              <span className="text-sm text-slate-400 dark:text-slate-600">
                                No access
                              </span>
                            ) : blockedReason !== null ? (
                              // Disabled rather than hidden, so the reason is
                              // discoverable instead of the button just missing.
                              <button
                                type="button"
                                disabled
                                title={blockedReason}
                                className="cursor-not-allowed rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-400 dark:text-slate-600"
                              >
                                Edit
                              </button>
                            ) : (
                              // Not styled as destructive any more: removal
                              // moved behind the modal's danger zone, and this
                              // row button now also leads to the password
                              // controls.
                              <button
                                type="button"
                                onClick={() => setMemberBeingEdited(member)}
                                className="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                              >
                                Edit
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
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
        onMemberAdded={(member) => {
          setMembers((currentMembers) =>
            sortMembersByRank([...currentMembers, member]),
          );
          // Adding someone by an email that was previously removed revives that
          // same row rather than inserting a new one, so they have to leave the
          // Removed tab or they would appear in both at once.
          setRemovedMembers((currentRemoved) =>
            currentRemoved.filter((removed) => removed.id !== member.id),
          );
        }}
      />

      {/* Keyed on the member, so opening it for someone else remounts it. That
          is what clears a half-typed password and an armed remove confirmation
          without an effect that has to remember every piece of state. */}
      <EditMemberModal
        key={memberBeingEdited?.id ?? 'none'}
        member={memberBeingEdited}
        onClose={() => setMemberBeingEdited(null)}
        onMemberRemoved={(member) => {
          setMembers((currentMembers) =>
            currentMembers.filter(
              (currentMember) => currentMember.id !== member.id,
            ),
          );
          // Straight onto the Removed tab, rather than waiting for a reload.
          // `deletedAt` is stamped here because the edge function returns only
          // `{ ok: true }` — a second later than the server's own timestamp, and
          // only ever used to sort and format this row.
          setRemovedMembers((currentRemoved) =>
            sortRemovedMembers([
              ...currentRemoved,
              { ...member, deletedAt: new Date() },
            ]),
          );
          setMemberBeingEdited(null);
        }}
      />
    </div>
  );
}
