/**
 * Parses a stored timestamp, or `null` when there is nothing to parse.
 *
 * `new Date(null)` is 1970-01-01 rather than an error, so a nullable `Date` field
 * parsed with the constructor alone comes back as the epoch and quietly contradicts
 * its own type — which is what `apps/mobile/src/json/deserializeDateTime.ts` used to
 * do (docs/follow-ups.md item 3). Every nullable timestamp in either client goes
 * through here instead.
 */
export function toDate(value: unknown): Date | null {
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
