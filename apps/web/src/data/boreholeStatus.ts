// boreholeStatus.ts
//
// How far along a borehole's log is, and how that is presented in the web UI.
//
// The status is *derived* from the borehole's blocks on every read rather than
// stored on the borehole row. The main writer of blocks is the offline mobile
// app draining PowerSync's CRUD queue, so a stored copy would have to be kept
// true through that queue (or a trigger plus a backfill), and a borehole whose
// last sync failed would sit there labelled wrong with nothing to notice.

export const BOREHOLE_STATUS_LIST = [
  'completed',
  'inProgress',
  'notStarted',
] as const;

export type BoreholeStatus = (typeof BOREHOLE_STATUS_LIST)[number];

// Keyed by BoreholeStatus, the same discipline as MEMBER_ROLE_LABELS in
// memberRoles.ts: a status added to the list above is a compiler error in every
// map below rather than a silently missing label.
export const BOREHOLE_STATUS_LABELS: Record<BoreholeStatus, string> = {
  completed: 'Completed',
  inProgress: 'In progress',
  notStarted: 'Not started',
};

export const BOREHOLE_STATUS_BADGE_CLASSES: Record<BoreholeStatus, string> = {
  completed:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400',
  inProgress:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400',
  notStarted:
    'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400',
};

// Shared by the table badge and the pending placeholder, so the column does not
// change size when the statuses arrive.
export const BOREHOLE_STATUS_BADGE_BASE_CLASSES =
  'inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold';

// Tallies for the progress panel. Counts every status so the tiles always sum
// to the borehole count, including statuses nothing on the page displays yet.
export function countBoreholeStatuses(
  statuses: Iterable<BoreholeStatus>,
): Record<BoreholeStatus, number> {
  const counts: Record<BoreholeStatus, number> = {
    completed: 0,
    inProgress: 0,
    notStarted: 0,
  };

  for (const status of statuses) {
    counts[status] += 1;
  }

  return counts;
}
