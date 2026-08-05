// AppSidebar.tsx

import { Layers, Settings } from 'lucide-react';
import { NavLink, useMatch } from 'react-router';

import { useAuth } from '../context/AuthContextProvider';

const ACTIVE_CLASSES =
  'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300';

const IDLE_CLASSES =
  'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white';

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
    isActive ? ACTIVE_CLASSES : IDLE_CLASSES
  }`;

const childLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `block truncate rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive ? ACTIVE_CLASSES : IDLE_CLASSES
  }`;

type AppSidebarProps = {
  onNavigate?: () => void;
};

export default function AppSidebar({ onNavigate }: AppSidebarProps) {
  const { email } = useAuth();

  // Derived from the URL alone, so the tree needs no data fetching. Params
  // arrive already decoded, so they are display-ready but must be re-encoded
  // when building links back out.
  const projectMatch = useMatch('/projects/:projectCode/*');
  const boreholeMatch = useMatch(
    '/projects/:projectCode/boreholes/:boreholeName',
  );

  const projectCode = projectMatch?.params.projectCode;
  const boreholeName = boreholeMatch?.params.boreholeName;

  return (
    <div className="flex h-full min-h-0 flex-col bg-white dark:bg-slate-900">
      <div className="shrink-0 px-5 py-5">
        <p className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
          MMSB
        </p>

        <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Dashboard
        </p>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3">
        <ul className="space-y-1">
          <li>
            <NavLink
              to="/projects"
              end
              onClick={onNavigate}
              className={navLinkClassName}
            >
              <Layers className="size-4 shrink-0" aria-hidden="true" />
              Projects
            </NavLink>

            {projectCode && (
              <ul className="ml-5 mt-1 space-y-1 border-l border-slate-200 pl-2 dark:border-slate-700">
                <li>
                  <NavLink
                    to={`/projects/${encodeURIComponent(projectCode)}`}
                    end
                    onClick={onNavigate}
                    title={projectCode}
                    className={childLinkClassName}
                  >
                    {projectCode}
                  </NavLink>

                  {boreholeName && (
                    <ul className="ml-3 mt-1 border-l border-slate-200 pl-2 dark:border-slate-700">
                      {/* Rendered as a label, not a link: this entry only ever
                          appears while you are already on that borehole. */}
                      <li
                        title={boreholeName}
                        aria-current="page"
                        className={`truncate rounded-lg px-3 py-2 text-sm font-semibold ${ACTIVE_CLASSES}`}
                      >
                        {boreholeName}
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
            )}
          </li>

          <li>
            <NavLink
              to="/settings"
              onClick={onNavigate}
              className={navLinkClassName}
            >
              <Settings className="size-4 shrink-0" aria-hidden="true" />
              Settings
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="mt-auto shrink-0 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Signed in as
        </p>

        <p
          title={email ?? undefined}
          className="mt-1 truncate text-sm font-semibold text-slate-950 dark:text-slate-100"
        >
          {email ?? '—'}
        </p>
      </div>
    </div>
  );
}
