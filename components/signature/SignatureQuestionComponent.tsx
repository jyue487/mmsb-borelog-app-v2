import React, { useRef, useState } from 'react';
import { Alert, Button, Image, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import SignatureCanvas from 'react-native-signature-canvas';

// Local imports
import { styles } from '@/constants/styles';
import { Borehole, EditBoreholeParams } from '@/interfaces/Borehole';
import { stringIsFloat, stringToDecimalPoint } from '@/utils/numbers';

type Props = {
  verifierSignatureBase64: string; setVerifierSignatureBase64: React.Dispatch<React.SetStateAction<string>>;
};

export function SignatureQuestionComponent({
  verifierSignatureBase64, setVerifierSignatureBase64
}: Props) {
  
  const [showSignatureCanvas, setShowSignatureCanvas] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef(null);

  const handleSignature = (signature: string) => {
    console.log('Signature captured:', signature);
    setVerifierSignatureBase64(signature);
    setIsLoading(false);
    setShowSignatureCanvas(false);
  };

  const handleEmpty = () => {
    console.log('Signature is empty');
    setIsLoading(false);
  };

  const handleClear = () => {
    console.log('Signature cleared');
    setVerifierSignatureBase64('');
  };

  const handleError = (error: any) => {
    console.error('Signature pad error:', error);
    setIsLoading(false);
  };

  const handleEnd = () => {
    console.log('End');
    setIsLoading(false);
    console.log(`ref.current: ${ref.current}`);
    // ref.current?.readSignature();
  };

  return (
    <>
      <Pressable
        onLongPress={() => setShowSignatureCanvas(true)}
        style={({ pressed }) => [
          styles.projectAndBoreholeTextInput,
          { backgroundColor: pressed ? 'rgb(222, 246, 255)' : 'white' }
        ]}>
        {(!verifierSignatureBase64) ? <Text style={{ textAlign: 'center' }}>Hold to Add Verifier Signature</Text> : (
          <Image
            resizeMode="contain"
            source={{ uri: verifierSignatureBase64 }}
            style={{ width: '100%', height: 100, backgroundColor: 'white' }}
          />
        )}
      </Pressable>
      <Modal visible={showSignatureCanvas} transparent={true}>
        <View 
          style={{ 
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)", // 👈 darken background
            justifyContent: "center",
            alignItems: "center",
          }}>
          <SignatureCanvas
            ref={ref}
            onEnd={handleEnd}
            onOK={handleSignature}
            onEmpty={handleEmpty}
            onClear={handleClear}
            onError={handleError}
            autoClear={true}
            descriptionText="Please Sign"
            clearText="Clear"
            confirmText={isLoading ? "Processing..." : "Save"}
            penColor="#000000"
            // backgroundColor="rgba(255, 255, 255, 0)"
            style={{ width: '90%', height: 360, position: 'absolute' }}
            webviewProps={{
              // Custom WebView optimization
              cacheEnabled: true,
              androidLayerType: "hardware",
            }}
          />
        </View>
      </Modal>
    </>
  );
}