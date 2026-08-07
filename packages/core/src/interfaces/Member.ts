// The single source of truth for the role set: the add-member dropdown and the
// badge colour map are both derived from this, so adding a fifth role is one
// edit here plus a compiler error at each `Record<MemberRole, …>`.
//
// Order is significant — it is privilege order, most privileged first, and
// `memberRoleRank` in the web app is `MEMBER_ROLE_LIST.indexOf(role)`. It also
// matches the `roles` lookup table in Supabase, whose ids run 1..4 in this same
// sequence (see MEMBER_ROLE_TO_ROLE_ID in apps/web/src/supabase/memberRow.ts).
export const MEMBER_ROLE_LIST = [
  'owner',
  'admin',
  'supervisor',
  'viewer',
] as const;

export type MemberRole = (typeof MEMBER_ROLE_LIST)[number];

// Only supervisors have a password: they are the field engineers who key data
// into the mobile app, which signs in with `signInWithPassword`. Owners, admins
// and viewers only ever open the web dashboard, which signs in with an emailed
// one-time code — so a password on their account would be dead weight nobody
// knows exists, and the invite-member edge function refuses to set one.
export function memberRoleNeedsPassword(role: MemberRole): boolean {
  return role === 'supervisor';
}

// Stricter than Supabase's own default floor of 6, so this is the limit users
// actually hit. Mirrored as PASSWORD_MIN_LENGTH in
// packages/supabase/functions/_shared/members.ts, which re-checks it — this
// copy only saves a round trip, and edge functions cannot import from this
// package.
export const MEMBER_PASSWORD_MIN_LENGTH = 8;

export interface Member {
  // The Supabase auth user id — `user_to_role.user_id`, not a row id of its
  // own. The Members page's self-removal guard compares this against the
  // signed-in `userId`, so the two must be the same kind of identifier.
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  createdAt: Date;
  // Null for a current member. Set means removed: their membership was soft
  // deleted and their auth account banned, which is what the Members page's
  // Removed tab lists. The row is kept rather than deleted so the history of who
  // had access, and who took it away, survives.
  deletedAt: Date | null;
}
