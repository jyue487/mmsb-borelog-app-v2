import { ExpoFileSystemStorageAdapter } from '@powersync/attachments-storage-react-native';
import { AttachmentQueue, AttachmentRecord, RemoteStorageAdapter, WatchedAttachmentItem } from '@powersync/react-native';
import { SupabaseClient } from '@supabase/supabase-js';

import { supabase } from '@/src/db/supabase';
import { BLOCK_PHOTOS_TABLE } from '@/src/powersync/AppSchema';
import { logger, powersync } from '@/src/powersync/system';

export interface SupabaseRemoteStorageAdapterOptions {
  client: SupabaseClient;
  bucket: string;
}

/**
 * SupabaseRemoteStorageAdapter implements RemoteStorageAdapter for Supabase Storage.
 * Handles upload, download, and deletion of files from Supabase Storage buckets.
 */
export class SupabaseRemoteStorageAdapter implements RemoteStorageAdapter {
  constructor(private options: SupabaseRemoteStorageAdapterOptions) { }

  async uploadFile(fileData: ArrayBuffer, attachment: AttachmentRecord): Promise<void> {
    console.log(`SupabaseRemoteStorageAdapter.uploadFile running`);
    const mediaType = attachment.mediaType ?? 'application/octet-stream';

    const { error } = await this.options.client.storage
      .from(this.options.bucket)
      .upload(attachment.filename, fileData, { contentType: mediaType });

    if (error) {
      console.log(`SupabaseRemoteStorageAdapter.uploadFile error: ${error}`);
      throw error;
    }
  }

  async downloadFile(attachment: AttachmentRecord): Promise<ArrayBuffer> {
    console.log(`SupabaseRemoteStorageAdapter.downloadFile running`);
    const { data, error } = await this.options.client.storage.from(this.options.bucket).download(attachment.filename);

    if (error) {
      console.log(`SupabaseRemoteStorageAdapter.downloadFile error: ${error}`);
      throw error;
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as ArrayBuffer);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(data);
    });
  }

  async deleteFile(attachment: AttachmentRecord): Promise<void> {
    console.log(`SupabaseRemoteStorageAdapter.deleteFile running`);
    const { error } = await this.options.client.storage.from(this.options.bucket).remove([attachment.filename]);

    if (error) {
      console.debug('Failed to delete file from Supabase Storage', error);
      throw error;
    }
  }
}

/**
 * How long a download 404 is read as "not uploaded yet" rather than "gone for good".
 *
 * Generous on purpose: the uploading device has to regain signal before either queue
 * drains, and a multi-megabyte photo on site connectivity is not quick. Bounded so that
 * a block_photos row whose object never arrived — a device lost or wiped before its
 * upload queue drained — stops costing a request every sync cycle, forever.
 */
const DOWNLOAD_NOT_FOUND_GRACE_MS = 24 * 60 * 60 * 1000;

const localStorage = new ExpoFileSystemStorageAdapter();
const remoteStorage = new SupabaseRemoteStorageAdapter({
  client: supabase,
  bucket: 'block-photos',
});
export const photoAttachmentQueue = new AttachmentQueue({
  db: powersync,
  localStorage: localStorage,
  remoteStorage: remoteStorage,
  // Determine what attachments the queue should handle
  watchAttachments: async (onUpdate, signal) => {
    const watcher = powersync.watch(
      `SELECT id FROM ${BLOCK_PHOTOS_TABLE}`,
      [],
      {
        signal
      }
    );

    for await (const result of watcher) {
      const attachments: WatchedAttachmentItem[] = (result.rows?._array ?? []).map((row: any) => ({
        id: row.id,
        fileExtension: 'jpg'
      }));
      await onUpdate(attachments);
    }
  },
  errorHandler: {
    onDownloadError: async (attachment: AttachmentRecord, error: Error) => {
      if (error.toString() === 'StorageApiError: Object not found') {
        // A 404 has two causes and they are indistinguishable from here: the object was
        // deleted, or the device that took the photo has not finished uploading it yet.
        // The second is routine rather than exotic — the block_photos row and the JPEG
        // travel by different queues (the row through PowerSync's CRUD queue, the file
        // straight to Supabase Storage), and the small row wins the race. A photo taken
        // offline therefore reaches other devices before its bytes exist.
        //
        // Archiving on the first 404 made that permanent: ARCHIVED is excluded from
        // getActiveAttachments(), so the 30s sync loop never revisits it, and the only
        // route back is an unrelated change to block_photos re-emitting the watch.
        // Retry instead, until the record is old enough that a pending upload is no
        // longer a plausible explanation.
        const age = Date.now() - (attachment.timestamp ?? Date.now());
        return age < DOWNLOAD_NOT_FOUND_GRACE_MS;
      }
      return true; // Retry
    },
    onUploadError: async (attachment: AttachmentRecord, error: Error) => {
      if (error.toString() === 'StorageApiError: The resource already exists') {
        return false; // Don't retry
      }
      return true; // Retry uploads by default
    },
    onDeleteError: async (attachment: AttachmentRecord, error: Error) => {
      return true; // Retry deletes by default
    }
  },
  logger: logger,
});