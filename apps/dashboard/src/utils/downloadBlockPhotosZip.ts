// Bundles every photo of a borehole into one zip.
//
// IMPORTANT: fflate stays behind a dynamic `import()`, the same discipline
// downloadBorelogPdf.ts follows for pdf-lib. It is far smaller than pdf-lib, but there is
// still no reason for a page that never downloads photos to carry a zip encoder.

export type DownloadablePhoto = {
	filename: string;
	signedUrl: string;
};

/**
 * Enough to keep the connection busy without opening a socket per photo on a borehole with
 * a hundred of them.
 */
const MAX_CONCURRENT_FETCHES = 6;

/**
 * Fetches the photos, calling `onCompleted` as each one lands.
 *
 * Zipping needs the actual bytes, so this reads the signed URLs directly rather than going
 * through the `download` query parameter — the name is applied to the zip entry instead.
 * Note this is a cross-origin `fetch` rather than an `<img>` load, so it is subject to the
 * bucket's CORS configuration in a way that rendering a thumbnail is not.
 */
async function fetchPhotoBytes(
	photos: DownloadablePhoto[],
	onCompleted: () => void,
): Promise<Record<string, Uint8Array>> {
	const files: Record<string, Uint8Array> = {};
	let nextIndex = 0;

	const worker = async () => {
		while (nextIndex < photos.length) {
			const photo = photos[nextIndex];
			nextIndex += 1;

			const response = await fetch(photo.signedUrl);

			if (!response.ok) {
				throw new Error(`Could not download ${photo.filename} (${response.status})`);
			}

			files[photo.filename] = new Uint8Array(await response.arrayBuffer());
			onCompleted();
		}
	};

	await Promise.all(
		Array.from(
			{ length: Math.min(MAX_CONCURRENT_FETCHES, photos.length) },
			() => worker(),
		),
	);

	return files;
}

export async function downloadBlockPhotosZip(
	zipFilename: string,
	photos: DownloadablePhoto[],
	onProgress: (completed: number, total: number) => void,
): Promise<void> {
	let completed = 0;

	const files = await fetchPhotoBytes(photos, () => {
		completed += 1;
		onProgress(completed, photos.length);
	});

	const { zip } = await import('fflate');

	const archive = await new Promise<Uint8Array>((resolve, reject) => {
		// `level: 0` stores rather than deflates. These are already JPEGs, so re-compressing
		// dozens of them costs CPU and saves close to nothing.
		zip(files, { level: 0 }, (error, data) => {
			if (error) {
				reject(error);
				return;
			}

			resolve(data);
		});
	});

	// Same idiom as downloadBorelogPdf.ts.
	const url = URL.createObjectURL(
		new Blob([archive as BlobPart], { type: 'application/zip' }),
	);

	try {
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = zipFilename;
		anchor.click();
	} finally {
		URL.revokeObjectURL(url);
	}
}
