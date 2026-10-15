/**
 * Stage 0 spike — the gate for the whole pdf-lib migration.
 *
 * This module must stay platform-free: no expo-*, no react-native, no fs, no fetch.
 * The three hosts (mobile / web / node) hand in bytes and take bytes back. If the
 * same call produces the same bytes in all three, the migration is viable.
 *
 * What it exercises, in the order the real renderer will need it:
 *   - fontkit registration + embedding a real TTF (the thing most likely to fail on Hermes)
 *   - subsetting, so we learn the output size early
 *   - widthOfTextAtSize, which is the whole reason we are leaving HTML
 *   - rotated text, for the vertical SCALE header
 *   - 90 ruler ticks at exact derived offsets, the constant the px/mm split was breaking
 *   - deterministic metadata, so output can be compared with shasum
 */
import { PDFDocument, degrees, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

/** A4 portrait in PostScript points. */
export const A4_WIDTH_PT = 595.276;
export const A4_HEIGHT_PT = 841.89;

/** The report's domain constant: 9 m per page at 0.1 m per tick. */
export const TICKS_PER_PAGE = 90;

/** pdf-lib accepts raw bytes or a base64/data-URI string for fonts and images. */
export type AssetBytes = Uint8Array | string;

export interface SpikeAssets {
  fontRegular: AssetBytes;
  logoPng: AssetBytes;
}

export interface SpikeResult {
  bytes: Uint8Array;
  /**
   * The measurement that must agree across hosts. If Hermes, V8 and JavaScriptCore
   * disagree here, every downstream layout decision diverges and the approach is dead.
   */
  measuredWidthPt: number;
  embeddedFontByteLength: number;
}

const MEASURE_SPECIMEN = 'Firm silty CLAY, light grey, with occasional gravel';
const MEASURE_SIZE_PT = 6.5;

export async function buildSpikePdf(assets: SpikeAssets): Promise<SpikeResult> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  // subset:false is deliberate. pdf-lib's runtime subsetter produces broken glyph
  // mappings for NotoSans (most characters render as .notdef boxes) — see
  // scripts/subsetFonts.sh. The fonts are pre-subsetted offline instead, which is
  // both smaller and metric-identical to the full face.
  const font = await doc.embedFont(assets.fontRegular, { subset: false });
  const logo = await doc.embedPng(assets.logoPng);

  const page = doc.addPage([A4_WIDTH_PT, A4_HEIGHT_PT]);

  // Page frame, 10mm margins all round (10mm = 28.346pt).
  const margin = 28.346;
  const contentW = A4_WIDTH_PT - margin * 2;
  const contentH = A4_HEIGHT_PT - margin * 2;
  page.drawRectangle({
    x: margin,
    y: margin,
    width: contentW,
    height: contentH,
    borderWidth: 0.5,
    borderColor: rgb(0, 0, 0),
  });

  const logoDims = logo.scaleToFit(120, 34);
  page.drawImage(logo, {
    x: margin + 4,
    y: A4_HEIGHT_PT - margin - 4 - logoDims.height,
    width: logoDims.width,
    height: logoDims.height,
  });

  page.drawText('MAXI MEKAR SDN BHD', {
    x: margin + 132,
    y: A4_HEIGHT_PT - margin - 26,
    size: 13,
    font,
  });

  // The vertical SCALE label — replaces `writing-mode: vertical-lr; transform: rotate(180deg)`.
  // pdf-lib rotates about the (x, y) anchor and text extends in +y, so centring is manual.
  page.drawText('SCALE', {
    x: A4_WIDTH_PT - margin - 10,
    y: 500,
    size: 7,
    font,
    rotate: degrees(90),
  });

  // 90 ticks at a pitch DERIVED from the body height, not hardcoded in px.
  // This is the constant the old renderer expressed as `height: 7px`.
  const bodyTopY = A4_HEIGHT_PT - margin - 120;
  const bodyBottomY = margin + 160;
  const tickPitchPt = (bodyTopY - bodyBottomY) / TICKS_PER_PAGE;
  const rulerX = A4_WIDTH_PT - margin - 24;

  for (let i = 0; i <= TICKS_PER_PAGE; i++) {
    const y = bodyTopY - i * tickPitchPt;
    const isMetre = i % 10 === 0;
    page.drawLine({
      start: { x: isMetre ? rulerX - 12 : rulerX, y },
      end: { x: rulerX + 14, y },
      thickness: isMetre ? 0.5 : 0.35,
    });
    if (isMetre) {
      const label = String(i / 10);
      page.drawText(label, {
        x: rulerX - 12 - font.widthOfTextAtSize(label, 4.5) - 1.5,
        y: y + 1,
        size: 4.5,
        font,
      });
    }
  }

  // The measurement that decides everything.
  const measuredWidthPt = font.widthOfTextAtSize(MEASURE_SPECIMEN, MEASURE_SIZE_PT);
  page.drawText(MEASURE_SPECIMEN, { x: margin + 6, y: bodyBottomY - 24, size: MEASURE_SIZE_PT, font });
  page.drawText(`widthOfTextAtSize = ${measuredWidthPt.toFixed(6)}pt`, {
    x: margin + 6,
    y: bodyBottomY - 40,
    size: 8,
    font,
  });
  page.drawText(`tickPitch = ${tickPitchPt.toFixed(6)}pt  |  90 ticks = ${(tickPitchPt * 90).toFixed(3)}pt`, {
    x: margin + 6,
    y: bodyBottomY - 54,
    size: 8,
    font,
  });

  // Determinism: without these, every save differs and shasum comparison is impossible.
  // This is what turns "font size differs per device" into a falsifiable equality.
  doc.setTitle('MMSB Borelog Spike');
  doc.setProducer('mmsb-report');
  doc.setCreator('mmsb-report');
  doc.setCreationDate(new Date(0));
  doc.setModificationDate(new Date(0));

  const bytes = await doc.save();

  return {
    bytes,
    measuredWidthPt,
    embeddedFontByteLength: typeof assets.fontRegular === 'string'
      ? assets.fontRegular.length
      : assets.fontRegular.byteLength,
  };
}
