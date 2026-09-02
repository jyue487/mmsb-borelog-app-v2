// remove-member
//
// Revokes someone's access, everywhere.
//
// This used to be a soft delete sent straight from the browser, governed by the
// RLS policy on user_to_role. That was enough for the dashboard, which checks
// membership on every load, and not enough for the mobile app, which gates only
// on "is there a session". A removed supervisor kept signing in with
// signInWithPassword and kept syncing, because nothing had touched auth.users.
//
// So removal now does two things, and the second one needs the service role key
// — hence an edge function rather than a browser call:
//
//   1. ban the auth.users record   -> Supabase itself refuses the sign-in
//   2. soft-delete the user_to_role row -> they leave the members list
//
// Order matters. Banning first means a partial failure leaves someone locked out
// but still listed — visible, and fixed by pressing Remove again. The reverse
// would leave someone off the list but still able to log in, which is exactly
// the bug this function exists to close. Both steps are idempotent, so retrying
// is always safe.
//
// Ban rather than delete: every foreign key into auth.users here is ON DELETE
// CASCADE, so deleting would silently take the membership row, its audit trail,
// and every project/borehole assignment with it. See setUserBanned in
// ../_shared/members.ts.
//
// Deploy: supabase functions deploy remove-member
// `verify_jwt` stays at its default (on).

import {
  callerOutranksRole,
  CORS_HEADERS,
  errorResponse,
  jsonResponse,
  OWNER_ROLE_ID,
  requireManagerCaller,
  setUserBanned,
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

  const { admin, callerId, callerRoleId } = gate;

  let body: { userId?: unknown };

  try {
    body = await request.json();
  } catch {
    return errorResponse('invalid_request', 'Expected a JSON body.', 400);
  }

  const userId = typeof body.userId === 'string' ? body.userId.trim() : '';

  if (!userId) {
    return errorResponse('invalid_request', 'A member is required.', 400);
  }

  // The disabled Edit buttons in the members table are the affordance; these are
  // the invariants. They are checked here rather than left to RLS because the
  // admin client below bypasses RLS entirely.
  if (userId === callerId) {
    return errorResponse(
      'invalid_target',
      'You cannot remove your own membership.',
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
    // Already removed, or never a member. Not an error worth alarming anyone
    // about — the caller's intent is satisfied either way.
    return errorResponse('not_found', 'That member no longer exists.', 404);
  }

  if (target.role_id === OWNER_ROLE_ID) {
    return errorResponse(
      'invalid_target',
      'Owners are managed in the database, not from the dashboard.',
      400,
    );
  }

  // An admin may not remove another admin. Kept after the owner branch above,
  // which this would otherwise swallow — nobody outranks an owner, and "Owners
  // are managed in the database" says more than "only owners can remove
  // admins" does.
  //
  // Note where this sits: ahead of setUserBanned. A refused request must not
  // leave the target banned but still listed.
  if (!callerOutranksRole(callerRoleId, target.role_id)) {
    return errorResponse('forbidden', 'Only owners can remove admins.', 403);
  }

  const banError = await setUserBanned(admin, userId, true);

  if (banError) {
    return banError;
  }

  const nowIso = new Date().toISOString();

  const { error: deleteError } = await admin
    .from('user_to_role')
    .update({
      deleted_at: nowIso,
      deleted_by: callerId,
      updated_at: nowIso,
      updated_by: callerId,
    })
    .eq('user_id', userId)
    // Makes a double submit a no-op rather than overwriting the original
    // removal's audit trail with a later timestamp and a different remover.
    .is('deleted_at', null);

  if (deleteError) {
    console.error('Error removing member:', deleteError);
    // The ban above already landed, so they are locked out even though this
    // failed. Saying so is better than a bare "try again" — the admin needs to
    // know the list is stale, not that nothing happened.
    return errorResponse(
      'server_error',
      'Their access was revoked, but the member list could not be updated. Please try again.',
      500,
    );
  }

  return jsonResponse({ ok: true }, 200);
});
