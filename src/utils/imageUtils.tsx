import * as tf from '@tensorflow/tfjs-react-native';
import * as blazeface from '@tensorflow-models/blazeface';
import { ImageUtil } from 'react-native-opencv3';

let model = null;

export const loadBlazeFaceModel = async (setModel) => {
  await tf.ready();
  model = await blazeface.load();
  setModel(model);
  console.log('🚀 BlazeFace model loaded!');
};

export const processFrame = async (buffer) => {
  try {
    const imageUri = await ImageUtil.bufferToImageUri(buffer);
    return imageUri;
  } catch (error) {
    console.error('Error processing frame:', error);
  }
};

export const frameToTensor = async (uri) => {
  const imageTensor = await tf.browser.fromPixelsAsync({ uri });
  return imageTensor;
};
