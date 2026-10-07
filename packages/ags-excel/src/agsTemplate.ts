import { getMainDriveRefusalBlows } from '@mmsb/core';

/**
 * Which AGS template a project's workbook must be filled from.
 *
 * The two templates differ only in the SPT sheet's refusal tests — `K7=50`/`AG7<>50` against
 * `K7=100`/`AG7<>100` — and `computeSptResult` writes the cache those formulas would produce.
 * Filling one with the other's limit leaves a "Reported Result" that Excel would contradict
 * the moment it recalculates, so the choice lives here, next to the code that relies on it,
 * rather than in each host.
 */
export function agsTemplateFileName(projectCode: string): 'template.xlsx' | 'template-SPT100.xlsx' {
	return getMainDriveRefusalBlows(projectCode) === 100 ? 'template-SPT100.xlsx' : 'template.xlsx';
}
