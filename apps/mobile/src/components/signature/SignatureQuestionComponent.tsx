import React, { useRef, useState } from 'react';
import { Alert, Button, Image, Modal, Pressable, Text, View } from "react-native";
import SignatureCanvas, { type SignatureViewRef } from 'react-native-signature-canvas';

// Local imports
import { styles } from '@/src/constants/styles';

type Props = {
  /** Shown on the empty pad, e.g. 'Hold to Add Checker Signature'. */
  label: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
};

/**
 * The footer draws each signature into a box at most ~113pt wide, aspect-fitted
 * (packages/report/src/build/buildFooter.ts and pdfLibBackend.ts's 'image' case). 640px on
 * the long edge is past 400dpi across that box — beyond what any printer or zoom level
 * resolves.
 */
const SIGNATURE_MAX_EDGE_PX = 640;

/**
 * Caps the resolution of the captured signature, inside the pad's own WebView.
 *
 * signature_pad sizes its canvas at CSS size x devicePixelRatio, so the pad hands back a
 * ~1000px PNG for an image printed at ~100pt — and that PNG is stored base64 in a synced
 * Postgres column that every field device then replicates in full. The library exposes no
 * resolution prop, but it sets no `injectedJavaScript` of its own (its pad script is embedded
 * in the HTML source) and its in-page bridge helper looks `postMessage` up on `window` at
 * every call rather than binding it early — so wrapping the method here catches the data URI
 * on its way out, after `trimWhitespace` has already cropped it.
 *
 * Non-image messages (BEGIN / END / EMPTY / getData JSON) pass straight through, and every
 * failure path posts the original rather than losing the signature. The trailing `true;` is
 * required: RN WebView warns when an injected script's last expression is not a boolean.
 */
const CAP_SIGNATURE_RESOLUTION_JS = `
(function () {
  var bridge = window.ReactNativeWebView;
  if (!bridge || bridge.__mmsbSignatureCapInstalled) { return; }
  bridge.__mmsbSignatureCapInstalled = true;

  var MAX_EDGE_PX = ${SIGNATURE_MAX_EDGE_PX};
  var post = bridge.postMessage.bind(bridge);

  bridge.postMessage = function (data) {
    if (typeof data !== 'string' || data.lastIndexOf('data:image/', 0) !== 0) {
      post(data);
      return;
    }
    var image = new Image();
    image.onload = function () {
      try {
        var longEdge = Math.max(image.width, image.height);
        if (longEdge <= MAX_EDGE_PX) { post(data); return; }
        var scale = MAX_EDGE_PX / longEdge;
        var canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        var context = canvas.getContext('2d');
        context.imageSmoothingEnabled = true;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        post(canvas.toDataURL('image/png'));
      } catch (error) {
        post(data);
      }
    };
    image.onerror = function () { post(data); };
    image.src = data;
  };
})();
true;
`;

export function SignatureQuestionComponent({
  label, value, setValue
}: Props) {
  
  const [showSignatureCanvas, setShowSignatureCanvas] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const signatureRef = useRef<SignatureViewRef>(null);

  const handleConfirm = () => {
    signatureRef.current?.readSignature();
  };
  const handleSignature = (signature: string) => {
    // The length, not the blob: the whole data URI used to be logged, which pushed tens of
    // kilobytes across the bridge on every capture. The number is also what tells you
    // whether trimWhitespace and the resolution cap are doing their job.
    console.log(`Signature captured: ${signature.length} chars`);
    setValue(signature);
    setIsLoading(false);
    setShowSignatureCanvas(false);
  };
  const handleEmpty = () => {
    console.log('Signature is empty');
    setIsLoading(false);
  };
  const handleCancel = () => {
    console.log('Signature cancelled');
    setShowSignatureCanvas(false);
  };
  const handleClear = () => {
    console.log('Signature cleared');
    setValue('');
  };
  /**
   * Goes through the pad rather than calling `setValue('')` directly, so the canvas and the
   * stored value cannot drift apart: `clearSignature()` wipes the ink and posts CLEAR back out
   * of the WebView, which is what runs `handleClear` above. That handler was unreachable until
   * this button existed — nothing else in the app calls `clearSignature()`, and `readSignature()`
   * with `autoClear` clears the pad in-page without posting CLEAR, so confirming a signature
   * still cannot wipe the capture it just made.
   *
   * The modal stays open, which makes the same button 'start over' while drawing. An empty
   * `value` means there is nothing saved to lose, so only a real signature gets the prompt.
   */
  const handleClearButtonPress = () => {
    if (value.length === 0) {
      signatureRef.current?.clearSignature();
      return;
    }
    Alert.alert(
      'Delete Signature',
      'Are you sure you want to delete this signature?',
      [
        { text: 'No, go back', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => signatureRef.current?.clearSignature() },
      ],
      { cancelable: true }
    );
  };
  const handleError = (error: any) => {
    console.error('Signature pad error:', error);
    setIsLoading(false);
  };
  const handleEnd = () => {
    console.log('End');
    setIsLoading(false);
    console.log(`ref.current: ${signatureRef.current}`);
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
        {(!value) ? <Text style={{ textAlign: 'center' }}>{label}</Text> : (
          <Image
            resizeMode="contain"
            source={{ uri: value }}
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
          <View
            style={{
              position: "absolute",
              width: "90%",
              height: 360,
            }}>
            <SignatureCanvas
              ref={signatureRef}
              onEnd={handleEnd}
              onOK={handleSignature}
              onEmpty={handleEmpty}
              onClear={handleClear}
              onError={handleError}
              autoClear={true}
              penColor="#000000"
              // Crops to the ink bounding box on an offscreen canvas before posting, so the
              // stored PNG is the signature rather than a mostly-empty pad. It also makes the
              // printed signature bigger: the footer aspect-fits whatever it is given, so any
              // blank margin around the ink was scaling the ink itself down.
              trimWhitespace={true}
              webviewProps={{
                // Custom WebView optimization
                cacheEnabled: true,
                androidLayerType: "hardware",
                injectedJavaScript: CAP_SIGNATURE_RESOLUTION_JS,
              }}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}>
              <Button 
                title='Cancel'
                color={styles.cancelButton.color}
                onPress={handleCancel}
              />
              <Button 
                title='Clear'
                color={styles.deleteButton.color}
                onPress={handleClearButtonPress}
              />
              <Button 
                title='Confirm'
                color={styles.confirmButton.color}
                onPress={handleConfirm}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
