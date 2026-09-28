import type { MemberRole } from '@mmsb/core';
import { createContext, useContext } from 'react';

/**
 * The auth context and its hook, kept apart from the provider component.
 *
 * Not a stylistic split: Fast Refresh can only hot-swap a module whose exports are all
 * components, so a `useAuth` sitting beside `AuthContextProvider` made every edit to that
 * file a full page reload — which signs you out mid-change. `auth.tsx` now exports the
 * provider alone.
 */
export type AuthContextType = {
  userId: string | null;
  email: string | null;
  // The signed-in user's role, from their live `user_to_role` row. `null` means
  // either signed out or *revoked* — an auth account with no membership. That
  // second case is what ProtectedRoute turns into a blocked page, so removing a
  // member is real revocation rather than just a row disappearing from a list.
  role: MemberRole | null;
  isSignIn: boolean;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  userId: null,
  email: null,
  role: null,
  isSignIn: false,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}
