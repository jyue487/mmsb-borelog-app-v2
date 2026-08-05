// NOTE: this interface intentionally diverges from @mmsb/core's copy — core has
// a `terminationCriteria` field that mobile does not. The projects table has a
// `termination_criteria` column, but only the web dashboard reads or writes it.
// Do not add it here without also handling it in editProjectDbAsync: that
// UPDATE would otherwise sync an empty string back and wipe what the office
// entered.
export interface Project {
    id: string; // must
    code: string; // must
    title: string; //must
    location: string;
    client: string;
    consultant: string;
}

export type AddProjectParams = Omit<Project, 'id'>;
export type EditProjectParams = Omit<Project, 'code'>;