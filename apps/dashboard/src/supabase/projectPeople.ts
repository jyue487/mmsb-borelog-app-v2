// projectPeople.ts
//
// Reads and writes public.project_to_user — who is assigned to a project, which
// is what the People panel on the project page shows and what the Add people
// modal edits.
//
// The RLS behind all of this is packages/supabase/policies/project_to_user.sql:
// any active member may read the table, only owners and admins may write it.

import type { Member } from '@mmsb/core';

import { sortMembersByRank } from '../data/memberRoles';
import {
  mapMemberRow,
  MEMBER_COLUMNS,
  MEMBER_ROLE_TO_ROLE_ID,
} from './memberRow';
import { supabase } from './supabase.server';

// The roles the Add people modal offers. Owners and admins are deliberately
// absent: they reach every project through their own bypass policy, so a tick
// box for them would be a control that changes nothing.
export const PROJECT_ASSIGNABLE_ROLE_IDS = [
  MEMBER_ROLE_TO_ROLE_ID.supervisor,
  MEMBER_ROLE_TO_ROLE_ID.viewer,
];

// Two round trips, deliberately — this cannot be a PostgREST embed.
//
// Embedding needs a foreign key between the two tables, and there is none:
// project_to_user.user_id and user_to_role.user_id both point at auth.users, not
// at each other. `select('user_id, user_to_role(...)')` fails at runtime with
// "Could not find a relationship", so do not "simplify" this into a join.
export async function fetchProjectPeople(projectId: string): Promise<Member[]> {
  const { data: assignmentRows, error: assignmentError } = await supabase
    .from('project_to_user')
    .select('user_id')
    .eq('project_id', projectId);

  if (assignmentError) {
    throw assignmentError;
  }

  const userIds = (assignmentRows ?? []).map((row) => row.user_id);

  // `.in('user_id', [])` is a valid query that returns nothing, but it is still
  // a round trip. An unassigned project is the common case on a fresh install.
  if (userIds.length === 0) {
    return [];
  }

  const { data: memberRows, error: memberError } = await supabase
    .from('user_to_role')
    .select(MEMBER_COLUMNS)
    .in('user_id', userIds);

  if (memberError) {
    throw memberError;
  }

  return sortMembersByRank(
    (memberRows ?? [])
      .map(mapMemberRow)
      // Removing a member soft-deletes their user_to_role row and bans the auth
      // account, but leaves every project_to_user row they hold untouched. A
      // banned account must not render as "involved in this project".
      .filter((member) => member.deletedAt === null),
  );
}

// Everyone who can be assigned: active supervisors and viewers. Filtered
// server-side rather than in the browser so the modal never holds rows it has
// no use for.
export async function fetchAssignableMembers(): Promise<Member[]> {
  const { data, error } = await supabase
    .from('user_to_role')
    .select(MEMBER_COLUMNS)
    .in('role_id', PROJECT_ASSIGNABLE_ROLE_IDS)
    .is('deleted_at', null);

  if (error) {
    throw error;
  }

  return sortMembersByRank((data ?? []).map(mapMemberRow));
}

type SaveProjectPeopleArgs = {
  projectId: string;
  addUserIds: string[];
  removeUserIds: string[];
  // The signed-in user, stamped into created_by. Nullable because useAuth()'s
  // userId is typed for unprotected routes too; the column is nullable text.
  actorId: string | null;
};

// Applies one modal save: the removals first, then the additions.
//
// Not a transaction — PostgREST has no way to express one across two statements
// — so a failure between them leaves the removals applied and the additions not.
// That is recoverable by pressing Save again, which is why the modal reports the
// error rather than closing.
export async function saveProjectPeople({
  projectId,
  addUserIds,
  removeUserIds,
  actorId,
}: SaveProjectPeopleArgs): Promise<void> {
  if (removeUserIds.length > 0) {
    // `.select()` is load-bearing, not a convenience. A delete that RLS refuses
    // is NOT an error: Postgres applies the policy as a row filter, so the
    // statement succeeds having matched nothing and PostgREST returns 200. A
    // supervisor pressing Save would see "removed" and nothing would have
    // happened. Asking for the deleted rows back is the only way to tell.
    //
    // (An insert refused by the same policy does error, with 42501 — the
    // asymmetry is in Postgres, not in this client.)
    const { data: deletedRows, error: deleteError } = await supabase
      .from('project_to_user')
      .delete()
      .eq('project_id', projectId)
      .in('user_id', removeUserIds)
      .select('user_id');

    if (deleteError) {
      throw deleteError;
    }

    // Fewer rows back than asked for. Almost always RLS refusing the delete;
    // it can also mean someone else removed the same person first, which is
    // harmless. Reporting the likely cause beats reporting success.
    if ((deletedRows ?? []).length !== removeUserIds.length) {
      throw new Error(
        'Some people could not be removed — you may not have permission to ' +
          'change who is on this project. Reopen this dialog to see the ' +
          'current list.',
      );
    }
  }

  if (addUserIds.length > 0) {
    // upsert rather than insert, on the (project_id, user_id) primary key: if
    // someone else assigned the same person between this modal opening and Save,
    // the row already exists and a plain insert would fail the whole batch on a
    // duplicate key. Ignoring the conflict makes the save idempotent.
    const { error: insertError } = await supabase
      .from('project_to_user')
      .upsert(
        addUserIds.map((userId) => ({
          project_id: projectId,
          user_id: userId,
          created_by: actorId,
        })),
        { onConflict: 'project_id,user_id', ignoreDuplicates: true },
      );

    if (insertError) {
      throw insertError;
    }
  }
}
