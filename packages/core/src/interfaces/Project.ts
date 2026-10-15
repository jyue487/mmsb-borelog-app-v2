import type { MainDriveRefusalBlows } from '../constants/sptStandard';

export interface Project {
  id: string; // must
  code: string; // must
  title: string; //must
  location: string;
  client: string;
  consultant: string;
  // Free-text workspace: line breaks, blank lines and indentation are
  // significant and must be preserved verbatim. Web-only for now — the mobile
  // copy of this interface deliberately omits it (see apps/mobile/src/interfaces/Project.ts).
  terminationCriteria: string;
  // SPT main-drive refusal limit, `projects.spt_n_max`. See constants/sptStandard.ts.
  sptNMax: MainDriveRefusalBlows;
}

export type AddProjectParams = Omit<Project, 'id'>;
export type EditProjectParams = Omit<Project, 'code'>;