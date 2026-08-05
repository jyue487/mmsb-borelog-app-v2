import { supabase } from '../supabase/supabase.server';
import React, { createContext, useContext, useEffect, useState } from 'react';

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

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
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
      } else {
        setUserId(data.user.id);
        setEmail(data.user.email ?? null);
      }

      setLoading(false);
    };

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user;

      setUserId(user?.id ?? null);
      setEmail(user?.email ?? null);
      setLoading(false);

      if (event === 'SIGNED_IN') {
        setIsSignIn(true);
      }
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
