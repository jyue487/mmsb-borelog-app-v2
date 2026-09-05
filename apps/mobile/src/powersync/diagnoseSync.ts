// [DIAG] Temporary diagnostic - delete once the empty project list is fixed.
//
// Differential probe. Every request below goes to the SAME host, path, method
// and client; the only thing that varies is whether the RESPONSE is a short
// complete body or an open chunked stream. That isolates "can the device talk
// to PowerSync" from "can the device receive a streaming response".
import { fetch as expoFetch } from 'expo/fetch';

import { supabase } from '@/src/db/supabase';

const POWERSYNC_URL = process.env.EXPO_PUBLIC_POWERSYNC_URL;
const BAD_TOKEN = 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ4In0.AAAA';

/** Two unrelated endpoints that answer with Transfer-Encoding: chunked and send
 *  data straight away. Two, so that one host being unreachable on this network
 *  does not read as "the device cannot stream". */
const PUBLIC_STREAMS: [string, string][] = [
  ['wikimedia-sse', 'https://stream.wikimedia.org/v2/stream/recentchange'],
  ['httpbin-drip', 'https://httpbin.org/drip?duration=5&numbytes=100&delay=0'],
];

/** Never let a probe hang the app the way the last one did. */
function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T | 'TIMEOUT'> {
  return Promise.race([
    p,
    new Promise<'TIMEOUT'>((r) => setTimeout(() => r('TIMEOUT'), ms)),
  ]).catch((e) => {
    console.log(`[NET] ${label} THREW:`, String(e));
    return 'TIMEOUT' as const;
  });
}

export async function diagnoseSync() {
  console.log('[NET] --- differential probe ---');
  if (!POWERSYNC_URL) {
    console.log('[NET] FATAL: EXPO_PUBLIC_POWERSYNC_URL undefined');
    return;
  }

  // A. Short complete response, expo/fetch, POST, with a deliberately invalid
  //    token. The server answers 401 immediately. If this is fast, then the
  //    device, expo/fetch, POST, TLS and the route are all working.
  const t0 = Date.now();
  const bad = await withTimeout(
    expoFetch(`${POWERSYNC_URL}/sync/stream`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${BAD_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ buckets: [], include_checksum: true, raw_data: true }),
    }),
    20_000,
    'A(bad-token)',
  );
  if (bad === 'TIMEOUT') {
    console.log(`[NET] A bad-token POST: TIMED OUT after ${Date.now() - t0}ms`);
  } else {
    console.log(`[NET] A bad-token POST: ${bad.status} in ${Date.now() - t0}ms ->`, (await bad.text()).slice(0, 200));
  }

  // C. A chunked stream from a host that has nothing to do with PowerSync, read
  //    with the same expo/fetch. A alone cannot tell whether "no headers" is the
  //    device refusing to surface a stream or the server declining to start one;
  //    this can, because these endpoints send their first bytes immediately.
  for (const [label, url] of PUBLIC_STREAMS) {
    const t = Date.now();
    const res = await withTimeout(expoFetch(url, { method: 'GET' }), 15_000, `C(${label})`);
    if (res === 'TIMEOUT') {
      console.log(`[NET] C ${label}: NO HEADERS after ${Date.now() - t}ms`);
      continue;
    }
    console.log(`[NET] C ${label}: ${res.status} headers in ${Date.now() - t}ms`);
    if (!res.ok || !res.body) {
      console.log(`[NET] C ${label}: no readable body (ok=${res.ok}, body=${!!res.body})`);
      continue;
    }
    const reader = res.body.getReader();
    const chunk = await withTimeout(reader.read(), 10_000, `C(${label} first-chunk)`);
    if (chunk === 'TIMEOUT') {
      console.log(`[NET] C ${label}: headers arrived but NO CHUNK in 10000ms`);
    } else if (chunk.done) {
      console.log(`[NET] C ${label}: stream closed with no data`);
    } else {
      console.log(`[NET] C ${label}: first chunk (+${Date.now() - t}ms), ${chunk.value.byteLength} bytes`);
    }
    reader.cancel();
  }

  // B. The same call with a VALID token. Only difference: the server answers
  //    200 and holds the response open as a chunked stream.
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { console.log('[NET] no session'); return; }

  const t1 = Date.now();
  const good = await withTimeout(
    expoFetch(`${POWERSYNC_URL}/sync/stream`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ buckets: [], include_checksum: true, raw_data: true }),
    }),
    20_000,
    'B(good-token)',
  );
  if (good === 'TIMEOUT') {
    console.log(`[NET] B good-token POST: NO HEADERS after ${Date.now() - t1}ms  <-- streaming blocked`);
    console.log('[NET] --- probe done ---');
    return;
  }
  console.log(`[NET] B good-token POST: ${good.status} headers in ${Date.now() - t1}ms`);
  if (!good.ok) {
    console.log('[NET] B error body:', (await good.text()).slice(0, 300));
    console.log('[NET] --- probe done ---');
    return;
  }

  const reader = good.body!.getReader();
  const decoder = new TextDecoder();
  const chunk = await withTimeout(reader.read(), 15_000, 'B(first-chunk)');
  if (chunk === 'TIMEOUT') {
    console.log('[NET] B first chunk: TIMED OUT - headers arrived but no data');
  } else if (chunk.done) {
    console.log('[NET] B first chunk: stream closed immediately');
  } else {
    console.log(`[NET] B first chunk (+${Date.now() - t1}ms):`, decoder.decode(chunk.value).slice(0, 400));
  }
  reader.cancel();
  console.log('[NET] --- probe done ---');
}
