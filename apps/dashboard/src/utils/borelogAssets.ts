// The borelog's logos and legend patterns, served straight from packages/borelog/assets.
//
// Globbed rather than copied into public/: there are 202 legend PNGs, and a second copy
// would drift from the one `pnpm --filter @mmsb/borelog render` draws with.
//
// IMPORTANT: like downloadFieldlogPdf.ts, this module stays behind a dynamic `import()`.

import { FALLBACK_LEGEND_CODE, type BorelogAssets } from '@mmsb/borelog';

// `eager` resolves the URLs at build time instead of giving each PNG a JS chunk of its own.
// Most legends are under Vite's 4 kB inline limit, so their URL *is* the image (a `data:`
// URL, ~110 kB in all); the larger ones are emitted as hashed files. Either way this chunk
// loads only when someone prints, and `fetch` reads both kinds the same.
const assetUrls = import.meta.glob<string>(
  '../../../../packages/borelog/assets/*.png',
  { query: '?url', import: 'default', eager: true },
);
const legendUrls = import.meta.glob<string>(
  '../../../../packages/borelog/assets/legends/*.png',
  { query: '?url', import: 'default', eager: true },
);

const legendUrlByCode = new Map(
  Object.entries(legendUrls).map(([path, url]) => [
    path.slice(path.lastIndexOf('/') + 1, -'.png'.length),
    url,
  ]),
);

const bytesByUrl = new Map<string, Promise<Uint8Array>>();

function fetchBytes(url: string): Promise<Uint8Array> {
  let bytes = bytesByUrl.get(url);
  if (bytes === undefined) {
    bytes = fetch(url).then(async (response) => {
      if (!response.ok) {
        throw new Error(`Could not load ${url} (${response.status}).`);
      }
      return new Uint8Array(await response.arrayBuffer());
    });
    // A failed fetch is not cached, so the next borehole retries it.
    bytes.catch(() => bytesByUrl.delete(url));
    bytesByUrl.set(url, bytes);
  }
  return bytes;
}

async function loadAsset(fileName: string): Promise<Uint8Array> {
  const entry = Object.entries(assetUrls).find(([path]) =>
    path.endsWith(`/${fileName}`),
  );
  if (entry === undefined) {
    throw new Error(`The borelog asset ${fileName} is missing from the build.`);
  }
  return fetchBytes(entry[1]);
}

/**
 * The assets one borelog needs: both logos, the legends its geology names, and `999`,
 * which the renderer draws in place of any code that has no PNG.
 */
export async function loadBorelogAssets(
  legendCodes: readonly string[],
): Promise<BorelogAssets> {
  const legends = new Map<string, Uint8Array>();
  await Promise.all(
    [...new Set([...legendCodes, FALLBACK_LEGEND_CODE])].map(async (code) => {
      const url = legendUrlByCode.get(code);
      if (url !== undefined) {
        legends.set(code, await fetchBytes(url));
      }
    }),
  );

  const [companyLogo, footerLogo] = await Promise.all([
    loadAsset('company_logo.png'),
    loadAsset('footer_logo.png'),
  ]);
  return { companyLogo, footerLogo, legends };
}
