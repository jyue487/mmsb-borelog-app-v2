/**
 * The AGS template every workbook is filled from.
 *
 * One template covers both SPT standards: the SPT sheet's refusal tests (`AB` and `AL`) compare
 * against `'Project - AGS'!D13` (SPT-N Max) rather than a literal 50 or 100. The exporter writes
 * the project's limit into D13 and hands `computeSptResult` the same value, so the "Reported
 * Result" cache agrees with what Excel computes the moment it recalculates.
 *
 * `template.xlsx` and `template-SPT100.xlsx`, which hardcoded 50 and 100, are no longer read.
 */
export const AGS_TEMPLATE_FILE_NAME = 'template_v2.xlsx';
