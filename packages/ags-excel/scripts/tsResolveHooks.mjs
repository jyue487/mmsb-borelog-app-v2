/**
 * Lets Node resolve the extensionless relative imports used across @mmsb/core
 * (`import ... from './interfaces/Project'`).
 *
 * Vite and Metro both do extension resolution, so core's import style is correct for its
 * real consumers; Node's ESM resolver is the strict one. Rather than rewrite ~30 files in
 * core to suit a dev script, this hook tries the same candidates a bundler would.
 */
export async function resolve(specifier, context, nextResolve) {
	try {
		return await nextResolve(specifier, context);
	} catch (error) {
		if (!specifier.startsWith('.') && !specifier.startsWith('/')) {
			throw error;
		}
		for (const candidate of [`${specifier}.ts`, `${specifier}/index.ts`, `${specifier}.tsx`]) {
			try {
				return await nextResolve(candidate, context);
			} catch {
				// try the next candidate
			}
		}
		throw error;
	}
}
