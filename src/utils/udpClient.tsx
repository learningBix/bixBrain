import dgram from 'react-native-udp';
import { Buffer } from 'buffer';

const PORT = 8888;
const socket = dgram.createSocket('udp4');

export const initializeUDP = () => {
  socket.bind(PORT);
  console.log(`✅ Listening for MJPEG frames on port ${PORT}`);
};

export const onFrameReceived = (callback) => {
  socket.on('message', (msg) => {
    const frameBuffer = Buffer.from(msg);
    callback(frameBuffer);
  });
};
