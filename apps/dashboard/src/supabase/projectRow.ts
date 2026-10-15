import { parseSptNMax, type Project } from "@mmsb/core";

// Single source of truth for the projects columns every query selects. There
// are no generated DB types, so a column missing from one of these lists fails
// silently as `undefined` rather than at compile time.
export const PROJECT_COLUMNS =
  "id, code, title, location, client, consultant, termination_criteria, spt_n_max";

type ProjectRow = {
  id: string;
  code: string;
  title: string | null;
  location: string | null;
  client: string | null;
  consultant: string | null;
  termination_criteria: string | null;
  spt_n_max: number | null;
};

export function mapProjectRow(row: ProjectRow): Project {
  return {
    id: row.id,
    code: row.code,
    title: row.title ?? "",
    location: row.location ?? "",
    client: row.client ?? "",
    consultant: row.consultant ?? "",
    terminationCriteria: row.termination_criteria ?? "",
    sptNMax: parseSptNMax(row.spt_n_max),
  };
}
