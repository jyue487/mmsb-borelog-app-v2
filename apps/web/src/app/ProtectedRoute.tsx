// ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../context/authContext";
import { supabase } from "../supabase/supabase.server";

// Signed in, but with no live `user_to_role` row — either removed from the
// dashboard, or an auth account that was never granted access.
//
// This deliberately renders in place rather than redirecting to /login:
// LoginPage navigates to /projects whenever `userId` is set, so a redirect here
// would bounce a still-authenticated user between the two routes forever.
// Signing out is the only way forward, so it is the only thing offered.
function AccessRevoked() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Your access has been removed
        </h1>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          This account is signed in but no longer has access to the MMSB
          dashboard. Ask an owner or admin to add you back.
        </p>

        <button
          type="button"
          onClick={() => void supabase.auth.signOut()}
          className="mt-6 w-full cursor-pointer rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export function ProtectedRoute() {
  const { userId, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;
  if (!userId) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!role) return <AccessRevoked />;
  return <Outlet />;
}
