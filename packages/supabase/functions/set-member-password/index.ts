// set-member-password
//
// Replaces a supervisor's mobile-app password.
//
// Separate from invite-member rather than another branch inside it: different
// verb, different target, and "invite" would start lying about what it does.
// It exists as an edge function at all because admin.auth.admin.updateUserById
// needs the service role key, which must never reach the Vite bundle.
//
// There is no read counterpart, and there cannot be one. Supabase stores a
// bcrypt hash, so an existing password cannot be shown back to anyone — the
// dashboard says so plainly instead of pretending otherwise.
//
// Note this does NOT separately exclude the caller's own row. An owner or admin
// is by definition not a supervisor, so the role check below already rejects
// self-service; a second guard would be dead code.
//
// The password is never logged. The console.error paths take error objects, not
// the request body — keep it that way when debugging.
//
// Deploy: supabase functions deploy set-member-password
// `verify_jwt` stays at its default (on), so unauthenticated requests never
// reach this handler.

import {
  CORS_HEADERS,
  errorResponse,
  jsonResponse,
  PASSWORD_MIN_LENGTH,
  requireManagerCaller,
  setUserPassword,
  SUPERVISOR_ROLE_ID,
} from '../_shared/members.ts';

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

  const { admin } = gate;

  let body: { userId?: unknown; password?: unknown };

  try {
    body = await request.json();
  } catch {
    return errorResponse('invalid_request', 'Expected a JSON body.', 400);
  }

  const userId = typeof body.userId === 'string' ? body.userId.trim() : '';
  // Not trimmed: leading and trailing spaces are legitimate password characters,
  // and silently stripping them would set something other than what was typed.
  const password = typeof body.password === 'string' ? body.password : '';

  if (!userId) {
    return errorResponse('invalid_request', 'A member is required.', 400);
  }

  if (!password) {
    return errorResponse('invalid_request', 'A password is required.', 400);
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return errorResponse(
      'weak_password',
      `Use at least ${PASSWORD_MIN_LENGTH} characters.`,
      400,
    );
  }

  const { data: target, error: targetError } = await admin
    .from('user_to_role')
    .select('role_id')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .maybeSingle();

  if (targetError) {
    console.error('Error loading target member:', targetError);
    return errorResponse('server_error', 'Unable to find that member.', 500);
  }

  if (!target) {
    return errorResponse('not_found', 'That member no longer exists.', 404);
  }

  // The rule that actually holds. The password section only renders for
  // supervisors in EditMemberModal, but that is an affordance — this is what
  // stops a hand-crafted request setting a password on an admin's account.
  if (target.role_id !== SUPERVISOR_ROLE_ID) {
    return errorResponse(
      'invalid_target',
      'Only supervisors have a password.',
      400,
    );
  }

  const passwordError = await setUserPassword(admin, userId, password);

  if (passwordError) {
    return passwordError;
  }

  return jsonResponse({ ok: true }, 200);
});
