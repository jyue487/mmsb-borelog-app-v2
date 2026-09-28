// chunk.ts

/**
 * Splits `items` into runs of at most `size`.
 *
 * Exists because of one recurring constraint rather than as a general utility: PostgREST
 * serialises `.in()` into the query string, so a filter carrying a few hundred UUIDs pushes the
 * URL past the ~8 KB header limit in front of the API and the request is rejected outright. At
 * 37 bytes per id that ceiling is around 200 ids, which a large site investigation reaches — so
 * every `.in()` over a list that grows with the size of a project is chunked.
 *
 * Note this is a separate concern from paging the response. Chunking bounds the ids going out;
 * `.range()` bounds the rows coming back. A query over a long id list needs both.
 */
export function chunk<T>(items: readonly T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

/**
 * How many ids go into one `.in()` filter. Sized well under the URL ceiling described above
 * rather than at it, so that a longer column name or an extra filter cannot quietly push a
 * request over.
 */
export const IDS_PER_REQUEST = 100;
