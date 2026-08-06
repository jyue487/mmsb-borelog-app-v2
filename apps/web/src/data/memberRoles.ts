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

export const MEMBER_ROLE_LABELS: Record<MemberRole, string> = {
  admin: 'Admin',
  supervisor: 'Supervisor',
  viewer: 'Viewer',
};

export const MEMBER_ROLE_BADGE_CLASSES: Record<MemberRole, string> = {
  admin: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  supervisor:
    'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  viewer: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export const MEMBER_ROLE_DESCRIPTIONS: Record<MemberRole, string> = {
  admin: 'Full access, including managing members.',
  supervisor: 'Can record and edit borehole data.',
  viewer: 'Read-only access to projects and logs.',
};
