/**
 * Recursively parses a string until it is no longer a JSON-formatted string.
 * It strictly returns an object or array if parsing succeeds, or the fallback value.
 */
export function parseUntilObjectNoError<T extends Record<string, any> | any[]>(input: unknown): T | null {
  let parsed = input;

  try {
    // 1. Loop while the data remains a string
    while (typeof parsed === 'string') {
      const trimmed = parsed.trim();
      parsed = JSON.parse(trimmed);
    }
  } catch (error) {
    // Fallback if a syntax error hits mid-stream
    console.error("Failed parsing deep JSON string:", error);
    return null;
  }

  // 2. Ensure final result is a structural object (and not null, numbers, or strings)
  if (typeof parsed === 'object' && parsed !== null) {
    return parsed as T;
  }

  return null;
}

export function parseUntilObject<T extends Record<string, any> | any[]>(input: unknown): T {
  const result = parseUntilObjectNoError(input);
  if (result === null) {
    throw new Error("Failed while parsing object");
  }
  return result as T;
}