// invokeError.ts
//
// Decoding a failure from one of the member-management edge functions, for both
// AddMemberModal and EditMemberModal.
//
// `functions.invoke` reports a non-2xx as a FunctionsHttpError whose `.message`
// is only ever the generic "Edge Function returned a non-2xx status code" — the
// body the function actually sent is behind `error.context`, and reading it is
// async.

export type InvokeFailure = {
  // The function's own error code (`duplicate`, `weak_password`, `forbidden`,
  // …), or null when the request never reached the function or came back
  // without a JSON body. Callers route on this: a weak password belongs under
  // the password field, not in the modal-wide banner.
  code: string | null;
  message: string;
};

// The message is taken straight from the function rather than translated
// through a code -> copy map here. Every message these functions return is a
// hand-written user-facing sentence, so a map would have been the same strings
// twice, in two languages' worth of drift risk.
export async function readInvokeError(
  error: unknown,
  fallbackMessage: string,
): Promise<InvokeFailure> {
  // `context` is a Response, so its body can only be read once. Do not call
  // this twice on the same error.
  const context = (error as { context?: Response }).context;

  if (context && typeof context.json === 'function') {
    try {
      const body = (await context.json()) as {
        code?: string;
        message?: string;
      };

      if (body.message) {
        return { code: body.code ?? null, message: body.message };
      }
    } catch {
      // Not a JSON body (a gateway error page, say) — fall through.
    }
  }

  return {
    code: null,
    // A network-level failure (FunctionsFetchError) does carry a useful
    // message; the generic HTTP one only surfaces when the body was unreadable,
    // which is already the exceptional case.
    message: error instanceof Error ? error.message : fallbackMessage,
  };
}
