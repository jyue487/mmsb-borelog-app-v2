// The one interface mobile still declares for itself. Every other file that used to
// live in this directory now comes from @mmsb/core; this one cannot, because core's
// Project has a `terminationCriteria` field that mobile must not gain. The projects
// table has a `termination_criteria` column, but only the web dashboard reads or
// writes it, and AppSchema.ts does not sync it. Adding it here would be a compile
// error today rather than a data loss — addProjectDbAsync and editProjectDbAsync both
// name their columns explicitly — but the moment someone widened that SET list the
// UPDATE would sync an empty string back and wipe what the office entered.
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