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

const localStorage = new ExpoFileSystemStorageAdapter();
const remoteStorage = new SupabaseRemoteStorageAdapter({
  client: supabase,
  bucket: 'Testing',
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
        return false; // Don't retry
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