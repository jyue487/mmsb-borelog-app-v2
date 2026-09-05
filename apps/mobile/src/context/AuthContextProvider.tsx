import { supabase } from '@/src/db/supabase';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type AuthContextType = {
  userId: string | null;
  email: string | null;
  isSignIn: boolean;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  userId: null,
  email: null,
  isSignIn: false,
  loading: true,
});

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isSignIn, setIsSignIn] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        setUserId(null);
        setEmail(null);
        setIsSignIn(false);
      } else {
        setUserId(data.user.id);
        setEmail(data.user.email ?? null);
        setIsSignIn(true);
      }

      setLoading(false);
    };

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Never log `session` itself - it carries the access and refresh tokens.
      console.log('auth event', event);
      const user = session?.user;

      setUserId(user?.id ?? null);
      setEmail(user?.email ?? null);
      setLoading(false);

      // Derive from whether a session exists rather than from one event name.
      // A warm start with a stored session emits INITIAL_SESSION, not SIGNED_IN,
      // so keying off 'SIGNED_IN' left isSignIn false for the whole session and
      // the project list never waited for the first sync. This also clears the
      // flag on SIGNED_OUT, which the old branch never did.
      setIsSignIn(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ userId, email, isSignIn, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}