// AppLayout.tsx

import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router';

import AppSidebar from '../components/AppSidebar';

export default function AppLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDrawerOpen(false);
      }
    };

    window.addEventListener('keydown', closeOnEscape);

    return () => {
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isDrawerOpen]);

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-100 dark:bg-slate-950">
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 dark:border-slate-800 lg:block">
        <AppSidebar />
      </aside>

      {isDrawerOpen && (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/50"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="fixed inset-y-0 left-0 z-50 w-60 border-r border-slate-200 shadow-xl dark:border-slate-800"
          >
            <AppSidebar onNavigate={() => setIsDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setIsDrawerOpen(true)}
            className="cursor-pointer rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>

          <span className="font-bold tracking-tight text-slate-950 dark:text-white">
            MMSB
          </span>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
