// RequireRole.tsx
//
// A pathless layout route that admits only certain roles, for the routes where
// "signed in and still a member" is not enough. ProtectedRoute stays binary;
// this composes on top of it.
//
// Mount it INSIDE AppLayout, not outside, so the sidebar stays put while the
// redirect happens.

import type { MemberRole } from '@mmsb/core';
import { Navigate, Outlet } from 'react-router';

import { useAuth } from '../context/authContext';

type RequireRoleProps = {
  // Takes the predicate rather than a role list so the rule lives in
  // src/data/memberRoles.ts next to the others, each of which documents the RLS
  // policy it mirrors.
  allow: (role: MemberRole | null) => boolean;
};

export function RequireRole({ allow }: RequireRoleProps) {
  const { role } = useAuth();

  if (!allow(role)) {
    // To /projects rather than /: main.tsx declares no index route and no
    // catch-all, so / matches nothing and renders a blank page. `replace` keeps
    // the Back button from bouncing straight back into the blocked route.
    return <Navigate to="/projects" replace />;
  }

  return <Outlet />;
}
