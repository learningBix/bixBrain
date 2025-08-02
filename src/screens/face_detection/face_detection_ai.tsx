import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { initializeUDP, onFrameReceived } from '../../utils/udpClient';
import { processFrame, loadBlazeFaceModel } from '../../utils/imageUtils';
import BoundingBox from './BoundingBox';

export default function FaceDetection() {
  const [imageUri, setImageUri] = useState(null);
  const [faces, setFaces] = useState([]);
  const [model, setModel] = useState(null);

  useEffect(() => {
    async function setup() {
      await loadBlazeFaceModel(setModel);
      initializeUDP();
      onFrameReceived(async (frameBuffer) => {
        const uri = await processFrame(frameBuffer);
        setImageUri(uri);

        if (model) {
          const predictions = await model.estimateFaces(await frameToTensor(uri));
          setFaces(predictions);
        }
      });
    }
    setup();
  }, [model]);

  return (
    <View style={styles.container}>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      {faces.map((face, index) => (
        <BoundingBox key={index} face={face} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { flex: 1 },
});
