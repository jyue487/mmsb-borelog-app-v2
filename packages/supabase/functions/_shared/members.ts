// _shared/members.ts
//
// Common ground between the member-management edge functions. Directories under
// supabase/functions/ whose names start with `_` are not deployed as functions
// of their own, but are bundled into any function that imports them — so this
// needs no config, only a relative import.

import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// The columns the web client's mapMemberRow expects back. Mirrored in
// apps/web/src/supabase/memberRow.ts — a column in one and not the other arrives
// as `undefined` on the client rather than as an error anywhere.
export const MEMBER_COLUMNS =
  'user_id, name, email, role_id, created_at, deleted_at';

// Mirrors MEMBER_ROLE_TO_ROLE_ID in apps/web/src/supabase/memberRow.ts. `owner`
// is absent deliberately: it is not assignable from the dashboard, and leaving
// it out of this map is what makes that a rejection rather than a policy note.
export const ASSIGNABLE_ROLE_IDS: Record<string, number> = {
  admin: 2,
  supervisor: 3,
  viewer: 4,
};

// Only supervisors have a password: they are the ones who sign in to the mobile
// app with signInWithPassword. Everyone else uses the dashboard's emailed OTP.
export const SUPERVISOR_ROLE_ID = 3;

// Owners are not handed out or revoked from the dashboard at all; admins are,
// but only by an owner.
export const OWNER_ROLE_ID = 1;
export const ADMIN_ROLE_ID = 2;

// Does the caller sit strictly above this role, and so may act on someone who
// holds it — remove them, set their password, or grant them the role?
//
// Mirrors canManageMemberWithRole in apps/web/src/data/memberRoles.ts and the
// `role_id > public.get_current_user_role()` clause in
// ../../policies/user_to_role.sql. All three are the same rule, and all three
// depend on role_id being ordered by privilege (1 owner, 2 admin, 3 supervisor,
// 4 viewer) — renumbering the `roles` table silently inverts this.
//
// Callers must still have passed requireManagerCaller: a supervisor numerically
// outranks a viewer, and this function alone would say yes.
export function callerOutranksRole(
  callerRoleId: number,
  targetRoleId: number,
): boolean {
  return callerRoleId < targetRoleId;
}

// Stricter than GoTrue's own default floor of 6, so this is the limit users
// actually hit. Mirrored in AddMemberModal and EditMemberModal — a shorter
// password is rejected in the browser first, and here regardless.
export const PASSWORD_MIN_LENGTH = 8;

export function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

export function errorResponse(code: string, message: string, status: number) {
  return jsonResponse({ code, message }, status);
}

export type ManagerCaller = {
  // Service role client. Bypasses RLS entirely — every query made with it is
  // unguarded, so authorization has to have happened before you get one.
  admin: SupabaseClient;
  callerId: string;
  // 1 or 2, having passed the gate below. Handed back so a function can ask
  // callerOutranksRole about its own target: being a manager is necessary but
  // not sufficient, since admins may not act on other admins.
  callerRoleId: number;
};

// Everything both functions do before they diverge: prove there is a caller,
// and prove that caller is an owner or an admin.
//
// This is NOT redundant with the hidden buttons in the web app — it is the only
// thing standing between a hand-crafted request and a new admin account, or
// someone else's password being reset.
//
// Returns a Response on rejection so callers can write:
//
//   const gate = await requireManagerCaller(request);
//   if (gate instanceof Response) return gate;
export async function requireManagerCaller(
  request: Request,
): Promise<ManagerCaller | Response> {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader) {
    return errorResponse('unauthorized', 'Missing Authorization header.', 401);
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // A separate client carrying the caller's JWT, purely to resolve who they
  // are. The admin client above bypasses RLS and has no notion of a caller.
  const caller = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: callerUser, error: callerError } = await caller.auth.getUser();

  if (callerError || !callerUser.user) {
    return errorResponse('unauthorized', 'Not signed in.', 401);
  }

  const callerId = callerUser.user.id;

  const { data: callerRole, error: callerRoleError } = await admin
    .from('user_to_role')
    .select('role_id')
    .eq('user_id', callerId)
    .is('deleted_at', null)
    .maybeSingle();

  if (callerRoleError) {
    console.error('Error loading caller role:', callerRoleError);
    return errorResponse('server_error', 'Unable to verify your access.', 500);
  }

  if (
    !callerRole ||
    (callerRole.role_id !== OWNER_ROLE_ID && callerRole.role_id !== ADMIN_ROLE_ID)
  ) {
    return errorResponse(
      'forbidden',
      'Only owners and admins can manage members.',
      403,
    );
  }

  return { admin, callerId, callerRoleId: callerRole.role_id };
}

// GoTrue rejects a password that fails the project's own policy with this code.
// Recognising it turns a 500 into a field-level error, which matters because the
// project policy can be stricter than PASSWORD_MIN_LENGTH above and the browser
// has no way to know that.
export function isWeakPasswordError(error: { code?: string } | null): boolean {
  return error?.code === 'weak_password';
}

// Long enough to be permanent in practice. GoTrue has no "ban forever", only a
// duration, and `none` is how a ban is lifted — so this is the idiom rather than
// a guess at how long anyone stays removed.
const BAN_FOREVER = '876000h'; // ~100 years

// Locks an account out, or lets it back in.
//
// This is what makes removing a member mean anything to the mobile app. The soft
// delete only touches user_to_role; auth.users is untouched, so without this a
// removed supervisor still signs in with signInWithPassword and PowerSync still
// refreshes their token. Banning is what Supabase itself refuses to sign in.
//
// Deliberately not deleteUser: every foreign key into auth.users in this project
// is ON DELETE CASCADE, so a hard delete would take the user_to_role row (and
// its deleted_at/deleted_by trail), plus every project_to_user assignment, with
// it — and leave created_by/updated_by on all
// eight tables pointing at a user that no longer exists, since those columns
// carry no foreign key to complain. A ban is the reversible version.
export async function setUserBanned(
  admin: SupabaseClient,
  userId: string,
  banned: boolean,
): Promise<Response | null> {
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: banned ? BAN_FOREVER : 'none',
  });

  if (!error) {
    return null;
  }

  console.error(
    banned ? 'Error banning member:' : 'Error un-banning member:',
    error,
  );

  return errorResponse(
    'server_error',
    banned
      ? 'Unable to revoke this account.'
      : 'Unable to restore this account.',
    500,
  );
}

// Applies a password to an account that already exists.
//
// Used by set-member-password, and by the two branches of invite-member that
// skip createUser — reviving a removed supervisor, and adopting an auth account
// that existed without a role. Both of those would otherwise leave the admin's
// chosen password unset without saying so.
//
// Returns a Response on failure and null on success, so callers read:
//
//   const passwordError = await setUserPassword(admin, userId, password);
//   if (passwordError) return passwordError;
export async function setUserPassword(
  admin: SupabaseClient,
  userId: string,
  password: string,
): Promise<Response | null> {
  const { error } = await admin.auth.admin.updateUserById(userId, { password });

  if (!error) {
    return null;
  }

  if (isWeakPasswordError(error)) {
    return errorResponse('weak_password', error.message, 400);
  }

  console.error('Error setting member password:', error);
  return errorResponse('server_error', 'Unable to set the password.', 500);
}

// Marks an address confirmed without waiting for the invitee to click anything.
//
// inviteUserByEmail leaves email_confirmed_at null until the invite link is opened.
// That is harmless on a project that allows signups and fatal on this one, because
// GoTrue's MagicLink handler classifies an unconfirmed account as a brand new signup:
//
//     if user != nil { isNewUser = !user.IsConfirmed() }
//     if isNewUser { ...falls through to Signup... }
//
// and Signup refuses while "Allow new users to sign up" is off. So requesting a login
// code for someone who visibly has both an account and a member row answered
// 422 signup_disabled, "Signups not allowed for this instance". Note that is a
// *different* error from 422 otp_disabled, "Signups not allowed for otp", which is
// what a genuinely unknown address returns — the two read almost identically and are
// easy to confuse when debugging.
//
// Confirming costs nothing in access terms: admins and viewers sign in only with an
// emailed OTP, so control of the mailbox is proved on every single sign-in.
// Supervisors are already created with email_confirm: true for signInWithPassword.
//
// Caller beware: this clears the invite token. updateUserById({ email_confirm: true })
// runs user.Confirm(tx), which blanks confirmation_token and calls
// ClearAllOneTimeTokensForUser — so any link already emailed by inviteUserByEmail is
// dead afterwards. templates/invite.html therefore points at {{ .SiteURL }} rather
// than {{ .ConfirmationURL }}; do not reintroduce the latter.
//
// Mirrors setUserPassword: a Response on failure, null on success.
export async function confirmUserEmail(
  admin: SupabaseClient,
  userId: string,
): Promise<Response | null> {
  const { error } = await admin.auth.admin.updateUserById(userId, {
    email_confirm: true,
  });

  if (!error) {
    return null;
  }

  console.error('Error confirming member email:', error);
  return errorResponse('server_error', 'Unable to confirm this address.', 500);
}

// GoTrue's admin API has no get-user-by-email, so this pages through the user
// list. Fine at this organisation's scale (tens of users); if the dashboard
// ever grows to thousands, replace it with a lookup against a view over
// auth.users rather than raising the page count.
export async function findUserIdByEmail(
  admin: SupabaseClient,
  email: string,
): Promise<string | undefined> {
  const perPage = 200;

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });

    if (error) {
      console.error('Error listing users:', error);
      return undefined;
    }

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === email,
    );

    if (match) {
      return match.id;
    }

    if (data.users.length < perPage) {
      return undefined;
    }
  }

  return undefined;
}
