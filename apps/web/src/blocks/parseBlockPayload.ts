import { END_OF_BOREHOLE_BLOCK_TYPE_ID, type Block } from '@mmsb/core';

// `blocks.payload` holds the whole block as JSON rather than as columns, so this
// is the single seam where an untyped row becomes a typed `Block`. Mobile does the
// same job with 18 hand-written per-type deserializers under
// apps/mobile/src/json/**; web reads blocks but never writes them, so one generic
// parser is enough — provided the `Date` revival is exhaustive, which is the only
// part `JSON.parse` cannot do on its own.
//
// The `Date` surface across all 18 variants is closed and small, so it is
// enumerated here rather than sniffed from field names:
//   root                 createdAt, updatedAt          (BaseBlock)
//   dayWorkStatus.       startDate, startTime, endDate, endTime
//   EndOfBoreholeBlock   installationDate, installationTime  (both nullable)
// Adding a `Date` field to any block interface means adding it here too.

/**
 * Recursively parses while the value is still a string. Payloads can be
 * double-encoded, so a single `JSON.parse` is not enough — mirrors
 * `parseUntilObject` in apps/mobile/src/utils/json/parseUntilObject.ts.
 */
function parseUntilObject(input: unknown): Record<string, unknown> {
  let parsed: unknown = input;

  while (typeof parsed === 'string') {
    parsed = JSON.parse(parsed.trim()) as unknown;
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Block payload did not parse to an object.');
  }

  return parsed as Record<string, unknown>;
}

function toDate(value: unknown): Date | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== 'string' && typeof value !== 'number') {
    return null;
  }

  const date = new Date(value);

  // An unparseable timestamp yields an Invalid Date, which renders as "NaN/NaN/NaN"
  // rather than failing. Treat it as absent so the field is simply omitted.
  return Number.isNaN(date.getTime()) ? null : date;
}

function reviveDatesInPlace(payload: Record<string, unknown>): void {
  payload.createdAt = toDate(payload.createdAt);
  payload.updatedAt = toDate(payload.updatedAt);

  const dayWorkStatus = payload.dayWorkStatus;

  if (typeof dayWorkStatus === 'object' && dayWorkStatus !== null) {
    const status = dayWorkStatus as Record<string, unknown>;

    status.startDate = toDate(status.startDate);
    status.startTime = toDate(status.startTime);
    status.endDate = toDate(status.endDate);
    status.endTime = toDate(status.endTime);
  }

  if (payload.blockTypeId === END_OF_BOREHOLE_BLOCK_TYPE_ID) {
    payload.installationDate = toDate(payload.installationDate);
    payload.installationTime = toDate(payload.installationTime);
  }
}

export type BlockPayloadSource = {
  id: string;
  block_type_id: number;
  payload: string;
  created_at: string | null;
  updated_at: string | null;
};

/**
 * The row's own columns win over the payload's copies of the same fields, which
 * is what apps/mobile/src/db/blocks/fetchAllBlocksByBoreholeIdDbAsync.ts does.
 */
export function parseBlockPayload(row: BlockPayloadSource): Block {
  const payload = parseUntilObject(row.payload);

  reviveDatesInPlace(payload);

  payload.id = row.id;
  payload.blockTypeId = row.block_type_id;
  payload.createdAt = toDate(row.created_at) ?? payload.createdAt;
  payload.updatedAt = toDate(row.updated_at);

  return payload as unknown as Block;
}
