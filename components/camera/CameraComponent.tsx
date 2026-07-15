import { Modal, Pressable, ViewProps } from 'react-native';
import { CameraView, CameraType, useCameraPermissions, CameraMode } from 'expo-camera';
import { useRef, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from "expo-image";
import MaterialIcons from '@react-native-vector-icons/material-icons/static';

type Props = ViewProps & {

};

export function CameraComponent({ ...otherProps }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [useCamera, setUseCamera] = useState<boolean>(false);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={{
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        padding: 10,
      }}>
        <Text style={{ alignItems: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const takePicture = async () => {
    const photo = await ref.current?.takePictureAsync();
    if (photo?.uri) {
      setUri(photo.uri);
    }
  };

  const recordVideo = async () => {
    if (recording) {
      setRecording(false);
      ref.current?.stopRecording();
      return;
    }
    setRecording(true);
    const video = await ref.current?.recordAsync();
    console.log({ video });
  };

  const renderPicture = (uri: string) => {
    return (
      <>
        <Pressable
          onLongPress={() => setUri(null)}
          style={({ pressed }) => [
            { flexDirection: 'row' },
            pressed && { transform: [{ scale: 1.02 }], backgroundColor: 'white' },
          ]}>
          <Image
            source={{ uri }}
            contentFit="contain"
            style={{ width: '100%', aspectRatio: 1 }}
          />
        </Pressable>
      </>
    );
  };

  const renderCamera = () => {
    return (
      <Modal
        visible={useCamera}
        onRequestClose={() => setUseCamera(false)}
      >
        <CameraView
          style={{
            flex: 1,
          }}
          ref={ref}
          facing='back'
          mute={false}
          responsiveOrientationWhenOrientationLocked
        />
        <View style={styles.shutterContainer} >
          <Pressable onPress={takePicture}>
            {({ pressed }) => (
              <View
                style={[
                  styles.shutterBtn,
                  {
                    opacity: pressed ? 0.5 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.shutterBtnInner,
                  ]}
                />
              </View>
            )}
          </Pressable>
        </View>
        <View style={{ position: 'absolute', bottom: 53, left: 20 }}>
          <TouchableOpacity onPress={() => setUseCamera(false)}>
            <MaterialIcons
              name='keyboard-return'
              size={50}
              color='white'
            />
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };

  if (uri) {
    return (
      // <View style={styles.container}>
      renderPicture(uri)
      // {/* </View> */}
    );
  }

  if (!useCamera) {
    return (
      <TouchableOpacity
        style={{
          backgroundColor: 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
          height: 36,
          borderWidth: 1,
          borderColor: 'gray',
        }}
        onPress={() => setUseCamera(true)}>
        <MaterialIcons
          name='camera-alt'
          color='black'
          size={30}
        />
      </TouchableOpacity>
      // <Button title='Use Camera' onPress={() => setUseCamera(true)} />
    );
  }

  return renderCamera();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: "center",
    justifyContent: "center",
  },
  cameraContainer: StyleSheet.absoluteFillObject,
  camera: StyleSheet.absoluteFillObject,
  shutterContainer: {
    position: "absolute",
    bottom: 44,
    left: 0,
    width: "100%",
    alignItems: "center",
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: 'white',
  },
});