import * as FileSystem from 'expo-file-system';

export async function safeRenameFileAsync(
  fromUri: string, 
  toUri: string, 
  retries = 3
): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Ensure destination directory exists
      const dir = toUri.substring(0, toUri.lastIndexOf('/'));
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });

      // Try copying (safer than moveAsync)
      await FileSystem.copyAsync({ from: fromUri, to: toUri });

      // Delete old file if copy succeeded
      await FileSystem.deleteAsync(fromUri, { idempotent: true });
      return toUri;

    } catch (err) {
      console.log(`safeRenameFile attempt ${attempt} failed: ${err}`);
      await new Promise(res => setTimeout(res, 200)); // wait 200ms
    }
  }
  throw new Error('Failed to rename file after retries');
}
