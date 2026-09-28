/**
 * Kept in step with the mobile side — these characters break a file path.
 *
 * Lives in its own module rather than beside its first caller: `downloadBorelogPdf.ts`
 * has to stay behind a dynamic `import()` because pdf-lib and fontkit are ~1.1 MB, so
 * anything that statically imports from it drags that whole chunk into the main bundle.
 */
export function sanitiseFilename(value: string): string {
	return value
		.toUpperCase()
		.replace(/[/\\:*?"<>|]/g, '-')
		.replace(/\s+/g, ' ')
		.trim();
}
