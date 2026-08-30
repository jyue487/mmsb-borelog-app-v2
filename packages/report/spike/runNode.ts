/**
 * Node host for the Stage 0 spike.
 *
 * Node 24 strips TypeScript natively, so this runs with no build step and no test
 * runner — which is the point: it gives the migration a headless feedback loop that
 * needs neither a device nor a browser.
 *
 *   pnpm --filter @mmsb/report spike
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { buildSpikePdf } from './spike.ts';

const here = dirname(fileURLToPath(import.meta.url));
const reportAssets = resolve(here, '../assets');

const fontRegular = new Uint8Array(readFileSync(resolve(reportAssets, 'NotoSans-Regular.ttf')));
const logoPng = new Uint8Array(readFileSync(resolve(reportAssets, 'mmsb-logo.png')));

const started = Date.now();
const { bytes, measuredWidthPt } = await buildSpikePdf({ fontRegular, logoPng });
const elapsedMs = Date.now() - started;

const out = resolve(here, 'out-node.pdf');
writeFileSync(out, bytes);

const sha = createHash('sha256').update(bytes).digest('hex');

console.log(`host                 node ${process.version}`);
console.log(`output               ${out}`);
console.log(`size                 ${(bytes.byteLength / 1024).toFixed(1)} KB`);
console.log(`elapsed              ${elapsedMs} ms`);
console.log(`widthOfTextAtSize    ${measuredWidthPt.toFixed(6)} pt   <-- must match on every host`);
console.log(`sha256               ${sha}`);
