import { useAuth } from '@/src/context/AuthContextProvider';
import { fetchAllBlockPhotoUrlsByBlockId } from '@/src/db/blockPhotos/fetchAllBlockPhotoUrlsByBlockId';
import { Block } from '@/src/interfaces/Block';
import { BLOCK_PHOTOS_TABLE } from '@/src/powersync/AppSchema';
import { photoAttachmentQueue } from '@/src/storage/SupabaseRemoteStorageAdapter';
import { randomUUID } from 'expo-crypto';
import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Alert, Button, View, ViewProps } from 'react-native';
import { BlockPhoto } from '../blockPhotos/BlockPhoto';

export type ImageInfo = {
  id: string;
  uri: string;
  isNew: boolean;
  deletedAt: Date | null;
};

type Props = ViewProps & {
  inputBlock: Block | null;
  setBlockPhotosOnConfirmAsync: React.Dispatch<React.SetStateAction<((newBlockId: string) => Promise<void>) | null>>;
};

export function CameraComponent({ inputBlock, setBlockPhotosOnConfirmAsync, ...otherProps }: Props) {
  const { userId } = useAuth()
  const [allImageInfos, setAllImageInfos] = useState<ImageInfo[]>([]);

  const blockPhotosOnConfirmAsync = async (newBlockId: string) => {
    // The queue will:
    // 1. Save file locally immediately
    // 2. Create attachment record with state QUEUED_UPLOAD
    // 3. Update user record in same transaction
    // 4. Automatically upload file in background
    // 5. Update state to SYNCED when complete
    console.log('blockPhotosOnConfirmAsync running');

    for (const imageInfo of allImageInfos.filter((imageInfo) => imageInfo.isNew && imageInfo.deletedAt === null)) {
      const imageUri = imageInfo.uri;
      console.log(`uploading imageUri: ${imageUri}`);
      const imageFile = new File(imageUri);
      const arrayBuffer = await imageFile.arrayBuffer();
      await photoAttachmentQueue.saveFile({
        data: arrayBuffer,
        fileExtension: 'jpg',
        mediaType: 'image/jpeg',
        id: imageInfo.id,
        // updateHook runs in same transaction, ensuring atomicity
        updateHook: async (tx, attachment) => {
          await tx.execute(
            `
            INSERT INTO ${BLOCK_PHOTOS_TABLE} (
              id, block_id, uri, created_by
            ) VALUES (?, ?, ?, ?)
            `,
            [attachment.id, newBlockId, '', userId]
          );
        }
      });
    }

    for (const imageInfo of allImageInfos.filter((imageInfo) => !imageInfo.isNew && imageInfo.deletedAt !== null)) {
      console.log(`deleting photo: ${imageInfo.id}`);
      await photoAttachmentQueue.deleteFile({
        id: imageInfo.id,

        // updateHook ensures atomic deletion
        updateHook: async (tx, attachment) => {
          await tx.execute(
            'DELETE FROM block_photos WHERE id = ?',
            [attachment.id]
          );
        }
      });
    }
  };

  const takePhoto = async () => {
    const response = await ImagePicker.requestCameraPermissionsAsync();
    if (!response.granted) {
      Alert.alert("Permission Required", "You must allow camera access to take photos.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ mediaTypes: 'images', quality: 0.1 });
    if (result.canceled || result.assets.length === 0) {
      return;
    }

    const rawImage = result.assets[0];
    console.log(rawImage);
    setAllImageInfos([...allImageInfos, { id: randomUUID(), uri: rawImage.uri, isNew: true, deletedAt: null }]);
  };

  const deletePhoto = (id: string, uri: string) => {
    console.log(`deleting photo ${id}`);
    setAllImageInfos(allImageInfos.map((imageInfo: ImageInfo): ImageInfo => (imageInfo.id !== id) ? imageInfo : { ...imageInfo, deletedAt: new Date() }));
  };



  useEffect(() => {
    const downloadPhotosAsync = async () => {
      console.log('downloadPhotoAsync running');
      if (inputBlock === null) {
        return;
      }
      const allBlockPhotoInfos = await fetchAllBlockPhotoUrlsByBlockId(inputBlock.id);
      console.log(`allBlockPhotoInfos.length: ${allBlockPhotoInfos.length}`);
      setAllImageInfos(allBlockPhotoInfos.map((info) => ({ id: info.id, uri: info.localUri, isNew: false, deletedAt: null })));
    };
    downloadPhotosAsync();
  }, [inputBlock?.id]);

  useEffect(() => {
    setBlockPhotosOnConfirmAsync(() => blockPhotosOnConfirmAsync);
  }, [allImageInfos]);

  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      {allImageInfos.filter((imageInfo: ImageInfo) => imageInfo.deletedAt === null).map((imageInfo: ImageInfo) => {
        return <BlockPhoto key={imageInfo.id} id={imageInfo.id} uri={imageInfo.uri} deletePhoto={deletePhoto} />;
      })}
      <Button title='Use Camera' onPress={takePhoto} />
    </View>
  );
}