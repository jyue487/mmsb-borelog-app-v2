// memberRoles.ts
//
// How each role is presented in the web UI. Keyed by MemberRole, so adding a
// role to MEMBER_ROLE_LIST in @mmsb/core surfaces a compiler error in every
// map below rather than a silently missing label.

import { MEMBER_ROLE_LIST, type MemberRole } from '@mmsb/core';

// Sort order for the member list: most privileged first. Order comes from
// MEMBER_ROLE_LIST itself, so a role added there is ranked automatically
// instead of needing a rank assigned by hand here.
export function memberRoleRank(role: MemberRole): number {
  return MEMBER_ROLE_LIST.indexOf(role);
}

// Who may add or remove members. Mirrors the `role_id in (1, 2)` check in
// packages/supabase/policies/user_to_role.sql and in the invite-member edge
// function — this one only decides what the UI offers.
export function canManageMembers(role: MemberRole | null): boolean {
  return role === 'owner' || role === 'admin';
}

// The roles a member can actually be given from this dashboard. `owner` is
// deliberately excluded: owners are not handed out or revoked through the UI,
// only in SQL. The same rule is enforced server-side by the invite-member edge
// function and by the RLS policies in
// packages/supabase/policies/user_to_role.sql — this list is the affordance,
// not the enforcement.
export const ASSIGNABLE_MEMBER_ROLES = MEMBER_ROLE_LIST.filter(
  (role): role is Exclude<MemberRole, 'owner'> => role !== 'owner',
);

export const MEMBER_ROLE_LABELS: Record<MemberRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  supervisor: 'Supervisor',
  viewer: 'Viewer',
};

export const MEMBER_ROLE_BADGE_CLASSES: Record<MemberRole, string> = {
  owner:
    'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  admin: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  supervisor:
    'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  viewer: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export const MEMBER_ROLE_DESCRIPTIONS: Record<MemberRole, string> = {
  owner: 'Full access. Assigned directly in the database, not from here.',
  admin: 'Full access, including managing members.',
  supervisor: 'Can record and edit borehole data.',
  viewer: 'Read-only access to projects and logs.',
};
