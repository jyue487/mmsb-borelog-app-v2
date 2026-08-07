import { MEMBER_ROLE_LIST, type Member, type MemberRole } from "@mmsb/core";

// Single source of truth for the user_to_role columns every query selects. As
// with PROJECT_COLUMNS, there are no generated DB types, so a column missing
// from this list fails silently as `undefined` rather than at compile time.
// Mirrored in packages/supabase/functions/_shared/members.ts, whose functions
// return a row straight to mapMemberRow below. A column added to one and not the
// other arrives as `undefined` rather than as a compile error.
export const MEMBER_COLUMNS =
  "user_id, name, email, role_id, created_at, deleted_at";

// The `roles` lookup table, mirrored in code rather than fetched: it is fixed,
// four rows, and keeping it here is what lets MemberRole stay a typed union so
// every Record<MemberRole, …> keeps its exhaustiveness check.
//
// Declared in this direction (role -> id) because it is the direction that can
// be type-checked: a role added to MEMBER_ROLE_LIST without an id here is a
// compile error. The id -> role lookup is derived from it, so the two cannot
// drift apart.
export const MEMBER_ROLE_TO_ROLE_ID: Record<MemberRole, number> = {
  owner: 1,
  admin: 2,
  supervisor: 3,
  viewer: 4,
};

const ROLE_ID_TO_MEMBER_ROLE = new Map<number, MemberRole>(
  MEMBER_ROLE_LIST.map((role) => [MEMBER_ROLE_TO_ROLE_ID[role], role]),
);

// Falls back to the *least* privileged role, so a role id this build does not
// know about can never render — or authorise — as something more powerful than
// it is. `context` only sharpens the warning.
export function memberRoleFromRoleId(
  roleId: number,
  context: string,
): MemberRole {
  const role = ROLE_ID_TO_MEMBER_ROLE.get(roleId);

  if (role === undefined) {
    console.warn(`Unknown role_id ${roleId} (${context}); treating as viewer.`);
    return "viewer";
  }

  return role;
}

type MemberRow = {
  user_id: string;
  name: string | null;
  email: string | null;
  role_id: number;
  created_at: string;
  deleted_at: string | null;
};

export function mapMemberRow(row: MemberRow): Member {
  return {
    id: row.user_id,
    name: row.name ?? "",
    email: row.email ?? "",
    role: memberRoleFromRoleId(row.role_id, `user_to_role row ${row.user_id}`),
    // Supabase returns timestamps as ISO strings. MembersPage formats this with
    // Intl.DateTimeFormat, which throws RangeError on anything that is not a
    // real Date — so the revive has to happen here.
    createdAt: new Date(row.created_at),
    // Stays null for a current member. `?? null` rather than a bare cast because
    // a column missing from MEMBER_COLUMNS arrives as `undefined`, and an
    // undefined here would read as "removed" in every `!== null` test.
    deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
  };
}
