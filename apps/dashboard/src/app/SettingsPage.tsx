// SettingsPage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useAuth } from '../context/authContext';
import { supabase } from '../supabase/supabase.server';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { email } = useAuth();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error);
      setErrorMessage(error.message);
      setIsLoggingOut(false);
      return;
    }

    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-full bg-slate-100 px-4 py-8 text-slate-950 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            MMSB Dashboard
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Settings
          </h1>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Manage your account.
          </p>
        </header>

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
          >
            <span className="font-semibold">Something went wrong: </span>
            {errorMessage}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            Account
          </h2>

          <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Email
            </p>

            <p className="mt-1 break-words text-sm font-semibold text-slate-950 dark:text-slate-100">
              {email ?? 'Not signed in'}
            </p>
          </div>

          <div className="mt-5 flex justify-end border-t border-slate-200 pt-5 dark:border-slate-800">
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
              className="cursor-pointer inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950/50 dark:focus:ring-offset-slate-950"
            >
              {isLoggingOut ? 'Logging out...' : 'Log out'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
