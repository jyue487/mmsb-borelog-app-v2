import { MainDriveRefusalBlows } from '@mmsb/core';
import React, { createContext, ReactNode, useContext, useMemo } from 'react';

/**
 * Per-project settings that change how blocks are entered and displayed.
 *
 * Provided once by the borehole screen, which has already loaded the project, and read with
 * `useProjectConfig()` by the components several levels down (the SPT entry form under both
 * the add and the edit flows, and the SPT block's read-only view) rather than threaded
 * through every block type's props. The values come from the project row (`spt_n_max`, set from
 * the dashboard), which the fieldlog, the AGS export and the dashboard read too, so the clients
 * cannot disagree.
 */
export type ProjectConfig = {
  /** SPT main-drive refusal limit: 50, or 100 for some clients. */
  mainDriveRefusalBlows: MainDriveRefusalBlows;
};

// No default: a component rendered outside the provider would otherwise silently get the
// 50-blow standard on a 100-blow project.
const ProjectConfigContext = createContext<ProjectConfig | null>(null);

export function ProjectConfigProvider({ sptNMax, children }: { sptNMax: MainDriveRefusalBlows; children: ReactNode }) {
  const config = useMemo(() => ({ mainDriveRefusalBlows: sptNMax }), [sptNMax]);
  return (
    <ProjectConfigContext.Provider value={config}>
      {children}
    </ProjectConfigContext.Provider>
  );
}

export function useProjectConfig(): ProjectConfig {
  const config = useContext(ProjectConfigContext);
  if (config === null) {
    throw new Error('useProjectConfig must be used inside a ProjectConfigProvider.');
  }
  return config;
}
