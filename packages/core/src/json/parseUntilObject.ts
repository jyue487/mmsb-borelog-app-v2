/**
 * Recursively parses while the value is still a string, because a payload can be
 * double-encoded — a single `JSON.parse` is not enough.
 *
 * Throws rather than logging: this package is compiled with no node and no DOM types, so
 * `console` is not in scope here, and a caller that wants to degrade rather than fail can
 * catch. The original `SyntaxError` is folded into the message rather than passed as
 * `cause`, which @mmsb/ags-excel's ES2020 target does not have.
 */
export function parseUntilObject<T extends Record<string, any> | any[]>(input: unknown): T {
  let parsed: unknown = input;

  try {
    while (typeof parsed === 'string') {
      parsed = JSON.parse(parsed.trim());
    }
  } catch (error) {
    throw new Error(`Failed while parsing object: ${String(error)}`);
  }

  // A structural object only — not null, and not a number that survived the loop.
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Block payload did not parse to an object.');
  }

  return parsed as T;
}
