import type { MemberRole } from '@mmsb/core';
import React, { useEffect, useState } from 'react';

import { AuthContext } from './authContext';
import { memberRoleFromRoleId } from '../supabase/memberRow';
import { supabase } from '../supabase/supabase.server';

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isSignIn, setIsSignIn] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // The role *and* the user it was fetched for, stored together so the two can
  // never disagree. Which user it belongs to is what makes `loading` below
  // gapless — see the comment there.
  const [resolvedRole, setResolvedRole] = useState<{
    userId: string;
    role: MemberRole | null;
  } | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        setUserId(null);
        setEmail(null);
      } else {
        setUserId(data.user.id);
        setEmail(data.user.email ?? null);
      }

      setIsAuthLoading(false);
    };

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user;

      setUserId(user?.id ?? null);
      setEmail(user?.email ?? null);
      setIsAuthLoading(false);

      if (event === 'SIGNED_IN') {
        setIsSignIn(true);
      }

      if (event === 'SIGNED_OUT') {
        setIsSignIn(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // No state reset for the signed-out case: `role` below is derived, so a
    // leftover value for a previous user is already ignored. Clearing it here
    // would be a synchronous setState in an effect body and a cascading render.
    if (userId === null) {
      return;
    }

    // Guards against a slow fetch for a previous user landing after a faster
    // one for the current user (sign out and straight back in as someone else).
    let isCancelled = false;

    const loadRole = async () => {
      const { data, error } = await supabase
        .from('user_to_role')
        .select('role_id')
        .eq('user_id', userId)
        .is('deleted_at', null)
        // maybeSingle, not single: zero rows is the revoked case, which is a
        // legitimate state to be in, not a query error.
        .maybeSingle();

      if (isCancelled) {
        return;
      }

      if (error) {
        // Deliberately falls through to `role = null`, which ProtectedRoute
        // treats as no access. A failed lookup must not grant anything.
        console.error('Error fetching member role:', error);
      }

      setResolvedRole({
        userId,
        role: data ? memberRoleFromRoleId(data.role_id, `user ${userId}`) : null,
      });
    };

    void loadRole();

    return () => {
      isCancelled = true;
    };
  }, [userId]);

  // Derived from *which* user the role belongs to rather than from an
  // `isRoleLoading` flag. A flag would read false in the gap between the user
  // resolving and the effect above running, and ProtectedRoute would see a
  // signed-in user with a null role and block them on every page load.
  const isRoleResolved = userId === null || resolvedRole?.userId === userId;
  const loading = isAuthLoading || !isRoleResolved;

  // Never expose a role fetched for somebody else.
  const role = resolvedRole?.userId === userId ? resolvedRole.role : null;

  return (
    <AuthContext.Provider value={{ userId, email, role, isSignIn, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
