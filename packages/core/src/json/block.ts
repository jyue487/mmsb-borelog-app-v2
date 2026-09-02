import { END_OF_BOREHOLE_BLOCK_TYPE_ID, type Block } from '../interfaces/Block';
import { parseUntilObject } from './parseUntilObject';
import { toDate } from './toDate';

// `blocks.payload` holds the whole block as JSON rather than as columns, so this is the
// single seam where an untyped row becomes a typed `Block`, for both clients.
//
// It used to be two implementations: this generic one on web, and 44 files of per-type
// deserializers under apps/mobile/src/json/**. Those turned out to do nothing a spread
// does not — every field was copied verbatim, and all 18 serializers were one line of
// JSON.stringify — so the only real work was reviving `Date`s, which is what this does.
// Being explicit about them was also the bug: a hand-written copy omits a new field
// silently, where a spread carries it.
//
// The `Date` surface across all 18 variants is closed and small, so it is enumerated
// here rather than sniffed from field names:
//   root                 createdAt, updatedAt          (BaseBlock)
//   dayWorkStatus.       startDate, startTime, endDate, endTime
//   EndOfBoreholeBlock   installationDate, installationTime  (both nullable)
// Adding a `Date` field to any block interface means adding it here too.

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

/**
 * The columns both clients read a block from. Postgres hands `block_type_id` over as a
 * number and mobile's local SQLite mirrors it as an integer, so the shapes already match.
 */
export type BlockRow = {
  id: string;
  block_type_id: number;
  payload: string;
  created_at: string | null;
  updated_at: string | null;
};

/**
 * The row's own columns win over the payload's copies of the same fields.
 */
export function parseBlock(row: BlockRow): Block {
  const payload = parseUntilObject<Record<string, unknown>>(row.payload);

  reviveDatesInPlace(payload);

  payload.id = row.id;
  payload.blockTypeId = row.block_type_id;
  payload.createdAt = toDate(row.created_at) ?? payload.createdAt;
  payload.updatedAt = toDate(row.updated_at);

  return payload as unknown as Block;
}

/**
 * `Date` fields serialise through `Date.prototype.toJSON` to ISO-8601 strings, which is
 * exactly what `parseBlock` reads back.
 */
export function serializeBlock(block: Block): string {
  return JSON.stringify(block);
}
