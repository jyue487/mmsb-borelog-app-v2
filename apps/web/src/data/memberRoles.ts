// memberRoles.ts
//
// How each role is presented in the web UI. Keyed by MemberRole, so adding a
// role to MEMBER_ROLE_LIST in @mmsb/core surfaces a compiler error in every
// map below rather than a silently missing label.

import { MEMBER_ROLE_LIST, type Member, type MemberRole } from '@mmsb/core';

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

// Who may assign people to a project. The same `role_id in (1, 2)` rule as
// canManageMembers, and mirrored again in
// packages/supabase/policies/project_to_user.sql — kept as its own function
// rather than a call to that one because the two answer different questions,
// and tightening one should not silently move the other.
export function canManageProjectPeople(role: MemberRole | null): boolean {
  return role === 'owner' || role === 'admin';
}

// Who may upload, replace or remove a project's site plan. Owners and admins,
// and its own function for the same reason as the two above.
//
// Unlike canEditBoreholeDetails below, this one matches the database exactly:
// the write policies in packages/supabase/policies/documents.sql are
// `get_current_user_role() in (1, 2)`, with no assignment clause. Anyone else
// gets a 42501 from Storage, so hiding the control here only saves them the
// error.
//
// Note the asymmetry with reading, which is deliberate and lives in the policy
// rather than here: supervisors and viewers assigned to the project can open the
// plan, they just cannot change it. There is no canViewSitePlan() to go with
// this, because the page never has to ask — a viewer who may not read it gets
// `null` back from fetchSitePlan and sees "Not uploaded".
export function canManageSitePlan(role: MemberRole | null): boolean {
  return role === 'owner' || role === 'admin';
}

// Who may edit a borehole's details from the dashboard. Owners and admins, the
// same `role_id in (1, 2)` shape as the two above, and its own function for the
// same reason: it answers a third question.
//
// This one used to be *stricter than the database* — the update policy on
// `boreholes` carried no role, so anyone with a `project_to_user` row, viewers
// included, could issue the update through the API whether or not they saw a
// pencil. packages/supabase/policies/boreholes.sql closed that: supervisors now
// update only the boreholes on their assigned projects, viewers not at all, and
// the borehole NAME is owner/admin only, enforced by the
// boreholes_name_immutable trigger rather than by a policy.
//
// So the dashboard is still narrower than the database — supervisors may edit
// these fields, they just do it in the field app — but no longer in a way that
// leaves an unenforced claim. EditBoreholeModal is the only rename UI there is.
export function canEditBoreholeDetails(role: MemberRole | null): boolean {
  return role === 'owner' || role === 'admin';
}

// Who may see the member directory at all. Supervisors and above; viewers are
// kept out. Mirrors `get_current_user_role() in (1, 2, 3)` in the read policy in
// packages/supabase/policies/user_to_role.sql, which is the enforcement — this
// only decides whether the nav item and the route are offered.
//
// A rank comparison rather than a three-way ||, because "and above" is exactly
// what MEMBER_ROLE_LIST's ordering encodes. A role inserted between admin and
// supervisor would be included automatically; an explicit list would leave it
// out silently.
export function canViewMembers(role: MemberRole | null): boolean {
  return role !== null && memberRoleRank(role) <= memberRoleRank('supervisor');
}

// Whether one member may act on another: remove them, set their password, or
// hand them their role in the first place. Admins manage supervisors and
// viewers; the admin tier itself is the owner's to grant and revoke.
//
// Unlike the four owner/admin predicates above, this one deliberately *calls*
// canManageMembers rather than repeating the literal. Those are separate
// functions because they answer separate questions; this one asks that exact
// question and then one more clause, so sharing it is the point — tightening
// who may manage members at all must tighten this too.
//
// A strict rank comparison rather than an `=== 'admin'` carve-out, for the same
// reason canViewMembers uses one: "outranks" is what MEMBER_ROLE_LIST's ordering
// already encodes. It subsumes the owner rule (nobody outranks an owner, not
// even another owner), and a role inserted between admin and supervisor is
// ranked correctly with no edit here.
//
// The database states the same rule numerically — `role_id > current role` in
// packages/supabase/policies/user_to_role.sql, callerOutranksRole in
// packages/supabase/functions/_shared/members.ts — which works only because
// role_id is ordered by privilege (1 owner .. 4 viewer), the same order as
// MEMBER_ROLE_LIST. Renumbering the `roles` table breaks both of those and not
// this one.
export function canManageMemberWithRole(
  actorRole: MemberRole | null,
  targetRole: MemberRole,
): boolean {
  if (actorRole === null || !canManageMembers(actorRole)) {
    return false;
  }

  return memberRoleRank(actorRole) < memberRoleRank(targetRole);
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

// The roles *this* actor may hand out, as opposed to ASSIGNABLE_MEMBER_ROLES
// above, which is the roles anyone may hand out from the dashboard at all. An
// owner gets admin/supervisor/viewer; an admin gets supervisor/viewer.
//
// Empty for anyone who is not a manager. AddMemberModal is only ever mounted
// behind canManageMembers, so that case does not render — but it is the honest
// answer rather than a special case.
export function assignableMemberRolesFor(
  actorRole: MemberRole | null,
): Exclude<MemberRole, 'owner'>[] {
  return ASSIGNABLE_MEMBER_ROLES.filter((role) =>
    canManageMemberWithRole(actorRole, role),
  );
}

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

// Sorts a copy. The caller's array must not be reordered in place — every call
// site holds its members in React state.
//
// Ordering is by role rank then name rather than by a SQL `.order()`, because
// rank is a client-side notion: it comes from the position of the role in
// MEMBER_ROLE_LIST, not from anything stored on the row.
//
// Lives here rather than on the Members page because the project People panel
// and the Add people modal want the same order.
export function sortMembersByRank(members: Member[]): Member[] {
  return [...members].sort((a, b) => {
    const rankDifference = memberRoleRank(a.role) - memberRoleRank(b.role);

    if (rankDifference !== 0) {
      return rankDifference;
    }

    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
}
