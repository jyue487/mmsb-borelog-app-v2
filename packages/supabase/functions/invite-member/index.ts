// invite-member
//
// Grants someone access to the app. Two different things depending on the role,
// because the two clients authenticate differently:
//
//   supervisor      -> createUser with a password. They are the field engineers
//                      who key data into the mobile app, which signs in with
//                      signInWithPassword. They get no email at all.
//   admin / viewer  -> inviteUserByEmail. They only ever use the dashboard,
//                      which signs in with an emailed OTP and no password.
//
// This exists as an edge function rather than an insert in the browser because
// LoginPage signs in with `shouldCreateUser: false` — the dashboard is
// invite-only, so an `auth.users` record has to exist before anyone can receive
// an OTP. Creating one requires the service role key, which must never be
// shipped in the Vite bundle. Supabase injects it here instead.
//
// The password is never logged. Every console.error below takes an error
// object, not the request body — keep it that way when debugging.
//
// Deploy: supabase functions deploy invite-member
// `verify_jwt` stays at its default (on), so unauthenticated requests never
// reach this handler.

import {
  ASSIGNABLE_ROLE_IDS,
  CORS_HEADERS,
  errorResponse,
  findUserIdByEmail,
  isWeakPasswordError,
  jsonResponse,
  MEMBER_COLUMNS,
  PASSWORD_MIN_LENGTH,
  requireManagerCaller,
  setUserBanned,
  setUserPassword,
  SUPERVISOR_ROLE_ID,
} from '../_shared/members.ts';

// Where the invite link lands. Must also be listed under Authentication ->
// URL Configuration -> Redirect URLs in the Supabase dashboard, or the link
// silently falls back to the Site URL.
const INVITE_REDIRECT_URL = Deno.env.get('INVITE_REDIRECT_URL') ?? undefined;

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (request.method !== 'POST') {
    return errorResponse('method_not_allowed', 'Use POST.', 405);
  }

  const gate = await requireManagerCaller(request);

  if (gate instanceof Response) {
    return gate;
  }

  const { admin, callerId } = gate;

  let body: {
    name?: unknown;
    email?: unknown;
    role?: unknown;
    password?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return errorResponse('invalid_request', 'Expected a JSON body.', 400);
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email =
    typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const role = typeof body.role === 'string' ? body.role : '';
  // Not trimmed: leading and trailing spaces are legitimate password characters,
  // and silently stripping them would set something other than what was typed.
  const password = typeof body.password === 'string' ? body.password : '';

  if (!name) {
    return errorResponse('invalid_request', 'A name is required.', 400);
  }

  if (!email) {
    return errorResponse('invalid_request', 'An email is required.', 400);
  }

  const roleId = ASSIGNABLE_ROLE_IDS[role];

  if (roleId === undefined) {
    return errorResponse(
      'invalid_role',
      'That role cannot be assigned from the dashboard.',
      400,
    );
  }

  const isSupervisor = roleId === SUPERVISOR_ROLE_ID;

  if (isSupervisor) {
    if (!password) {
      return errorResponse(
        'password_required',
        'Supervisors need a password for the mobile app.',
        400,
      );
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      return errorResponse(
        'weak_password',
        `Use at least ${PASSWORD_MIN_LENGTH} characters.`,
        400,
      );
    }
  } else if (password) {
    // A tight contract rather than a shrug. Admins and viewers sign in with an
    // emailed OTP, so a password on their account is dead weight that nobody
    // knows exists — and nothing in the UI would ever show it back.
    return errorResponse(
      'invalid_request',
      'Only supervisors can be given a password.',
      400,
    );
  }

  // Deliberately does NOT filter on deleted_at — a soft-deleted row still holds
  // the primary key, so it has to be found and revived rather than inserted
  // over (which would fail with 23505).
  //
  // Not maybeSingle(): nothing constrains email to be unique, and maybeSingle
  // turns a second matching row into a PGRST116 error rather than something
  // this can reason about.
  const { data: existingRows, error: existingRowError } = await admin
    .from('user_to_role')
    .select('user_id, deleted_at')
    .eq('email', email);

  if (existingRowError) {
    console.error('Error looking up existing member:', existingRowError);
    return errorResponse('server_error', 'Unable to check for an existing member.', 500);
  }

  const nowIso = new Date().toISOString();
  const liveRow = (existingRows ?? []).find((row) => row.deleted_at === null);
  // Prefer a live row; otherwise revive whichever removed row we have.
  const existingRow = liveRow ?? (existingRows ?? [])[0];

  if (liveRow) {
    return errorResponse(
      'duplicate',
      'A member with this email already exists.',
      409,
    );
  }

  if (existingRow) {
    // Previously removed. Their auth.users record still exists — remove-member
    // bans it rather than deleting it — so no invite is needed. But it is still
    // banned, and lifting that is what makes re-adding somebody actually work.
    // Without this they would rejoin the members list and be unable to sign in,
    // with nothing in the UI explaining why.
    const unbanError = await setUserBanned(admin, existingRow.user_id, false);

    if (unbanError) {
      return unbanError;
    }

    // The account already existing is also why a supervisor's password has to be
    // pushed here. Nothing below would ever set it, and the admin would walk
    // away believing they had chosen a password that in fact never applied.
    if (isSupervisor) {
      const passwordError = await setUserPassword(
        admin,
        existingRow.user_id,
        password,
      );

      if (passwordError) {
        return passwordError;
      }
    }

    const { data: revived, error: reviveError } = await admin
      .from('user_to_role')
      .update({
        role_id: roleId,
        name,
        deleted_at: null,
        deleted_by: null,
        updated_at: nowIso,
        updated_by: callerId,
      })
      .eq('user_id', existingRow.user_id)
      .select(MEMBER_COLUMNS)
      .single();

    if (reviveError) {
      console.error('Error restoring member:', reviveError);
      return errorResponse('server_error', 'Unable to restore this member.', 500);
    }

    return jsonResponse({ member: revived, restored: true }, 200);
  }

  // The fork this whole function exists for. A supervisor gets a real password
  // and no email; everyone else gets an invite link and no password.
  //
  // `email_confirm: true` matters twice: it suppresses the confirmation email,
  // so a supervisor receives no dashboard mail at all, and it marks the address
  // verified — without which signInWithPassword on mobile fails outright if the
  // project has email confirmation switched on.
  const { data: authResult, error: authError } = isSupervisor
    ? await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })
    : await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo: INVITE_REDIRECT_URL,
      });

  let userId = authResult?.user?.id;

  if (authError) {
    if (isWeakPasswordError(authError)) {
      // The project's own password policy is stricter than PASSWORD_MIN_LENGTH.
      // The browser has no way to know that, so pass the reason through as a
      // field error rather than a 500.
      return errorResponse('weak_password', authError.message, 400);
    }

    // An auth account that exists but was never granted a role — most often
    // someone who was hard-deleted from user_to_role in the past, or added
    // straight through the Supabase dashboard. Not an error condition: adopt
    // the existing account instead of sending a second invite. GoTrue reports
    // it identically for createUser and inviteUserByEmail.
    const alreadyExists =
      authError.code === 'email_exists' ||
      authError.message?.toLowerCase().includes('already been registered');

    if (!alreadyExists) {
      console.error('Error creating member account:', authError);
      return errorResponse('server_error', authError.message, 500);
    }

    userId = await findUserIdByEmail(admin, email);

    if (!userId) {
      return errorResponse(
        'server_error',
        'That email already has an account, but it could not be located.',
        500,
      );
    }

    // Same reasoning as the revive branch: this account may be carrying a ban
    // from a previous removal whose user_to_role row was later hard-deleted, and
    // it is not obviously banned from anything visible in the dashboard.
    const unbanError = await setUserBanned(admin, userId, false);

    if (unbanError) {
      return unbanError;
    }

    // Adopting an account means createUser above failed rather than creating
    // anything, so the chosen password was never applied to the account we are
    // about to reuse — same trap as the revive branch.
    if (isSupervisor) {
      const passwordError = await setUserPassword(admin, userId, password);

      if (passwordError) {
        return passwordError;
      }
    }
  }

  if (!userId) {
    return errorResponse(
      'server_error',
      'Creating the account returned no user.',
      500,
    );
  }

  const { data: created, error: insertError } = await admin
    .from('user_to_role')
    .insert({
      user_id: userId,
      role_id: roleId,
      name,
      email,
      created_at: nowIso,
      created_by: callerId,
    })
    .select(MEMBER_COLUMNS)
    .single();

  if (insertError) {
    console.error('Error creating member row:', insertError);

    if (insertError.code === '23505') {
      return errorResponse(
        'duplicate',
        'A member with this email already exists.',
        409,
      );
    }

    return errorResponse('server_error', insertError.message, 500);
  }

  return jsonResponse({ member: created, restored: false }, 201);
});
