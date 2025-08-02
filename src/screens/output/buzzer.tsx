// import React, { useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   PanResponder,
//   Dimensions,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import dgram from 'react-native-udp';
// import { Buffer } from 'buffer';

// const ESP32_IP = 'esptest.local';
// const ESP32_PORT = 8888;
// const { width } = Dimensions.get('window');

// export default function BuzzerControl() {
//   const [isOn, setIsOn] = useState(false);
//   const [volume, setVolume] = useState(0);
//   const sliderRef = useRef(null);
//   const [sliderWidth, setSliderWidth] = useState(0);
//   const lastSentTime = useRef(0);

//   const sendUDPCommand = (value) => {
//     const now = Date.now();
//     if (now - lastSentTime.current < 50) return;
//     lastSentTime.current = now;

//     const client = dgram.createSocket('udp4');
//     const volumeValue = parseInt(value.replace('D1', ''), 10);
//     const message = Buffer.from([0xD1, volumeValue]);

//     client.on('error', (err) => {
//       console.error('UDP Error:', err);
//       client.close();
//     });

//     client.bind(0, () => {
//       client.send(
//         message,
//         0,
//         message.length,
//         ESP32_PORT,
//         ESP32_IP,
//         (err) => {
//           if (err) console.error('Send Failed:', err);
//           client.close();
//         }
//       );
//     });
//   };

//   const updateVolume = (xPosition) => {
//     const relativeX = Math.max(0, Math.min(xPosition, sliderWidth));
//     const newValue = Math.round((relativeX / sliderWidth) * 100);
//     setVolume(newValue);
//     if (newValue > 0 && !isOn) handlePowerOn();
//     if (isOn) sendUDPCommand(`D1${Math.round(newValue * 2.55)}`);
//   };

//   const panResponder = PanResponder.create({
//     onStartShouldSetPanResponder: () => true,
//     onMoveShouldSetPanResponder: () => true,
//     onPanResponderGrant: (evt) => {
//       if (sliderRef.current) {
//         sliderRef.current.measure((fx, fy, width, height, px, py) => {
//           const touchX = evt.nativeEvent.locationX;
//           updateVolume(touchX);
//         });
//       }
//     },
//     onPanResponderMove: (evt, gestureState) => {
//       if (sliderRef.current) {
//         sliderRef.current.measure((fx, fy, width, height, px, py) => {
//           const touchX = gestureState.moveX - px;
//           updateVolume(touchX);
//         });
//       }
//     },
//   });

//   const handlePowerOn = () => {
//     setIsOn(true);
//     const sendValue = volume === 0 ? 50 : volume;
//     if (volume === 0) setVolume(sendValue);
//     sendUDPCommand(`D1${Math.round(sendValue * 2.55)}`);
//   };

//   const handlePowerOff = () => {
//     setIsOn(false);
//     sendUDPCommand('D10');
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.controlsWrapper}>
//         <View style={styles.headerPill}>
//           <Icon name="notifications" size={24} color="white" />
//           <Text style={styles.headerText}>BUZZER CONTROL</Text>
//         </View>

//         <View style={styles.controlsContainer}>
//           <View style={styles.controlRow}>
//             {/* Power Section */}
//             <View style={styles.powerSection}>
//               <Text style={styles.sectionTitle}>
//                 <Icon name="power-settings-new" size={18} color="#ffeb3b" /> Power
//               </Text>
//               <View style={styles.powerButtonsRow}>
//                 <TouchableOpacity
//                   style={[styles.smallButton, isOn && styles.activeButton]}
//                   onPress={handlePowerOn}
//                 >
//                   <Icon name="toggle-on" size={16} color="white" />
//                   <Text style={styles.smallButtonText}>ON</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[styles.smallButton, !isOn && styles.activeButton]}
//                   onPress={handlePowerOff}
//                 >
//                   <Icon name="toggle-off" size={16} color="white" />
//                   <Text style={styles.smallButtonText}>OFF</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             {/* Volume Section */}
//             <View style={styles.volumeSection}>
//               <View style={styles.volumeHeader}>
//                 <Text style={styles.sectionTitle}>
//                   <Icon name="volume-up" size={18} color="#ffeb3b" /> Volume
//                 </Text>
//                 <View style={styles.volumeValue}>
//                   <Icon name="graphic-eq" size={14} color="white" />
//                   <Text style={styles.volumeValueText}>{volume}%</Text>
//                 </View>
//               </View>
//               <View 
//                 style={styles.sliderContainer}
//                 ref={sliderRef}
//                 onLayout={(event) => {
//                   const { width } = event.nativeEvent.layout;
//                   setSliderWidth(width);
//                 }}
//                 {...panResponder.panHandlers}
//               >
//                 <View style={styles.slider}>
//                   <View style={[styles.sliderTrack, { width: `${volume}%` }]} />
//                   <View style={[styles.sliderThumb, { left: `${volume}%` }]}>
//                     {/* <Icon name="adjust" size={14} color="#673ab7" /> */}
//                   </View>
//                 </View>
//               </View>
//             </View>
//           </View>
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#4a148c',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 30,
//   },
//   controlsWrapper: {
//     width: '100%',
//     alignItems: 'center',
//     position: 'relative',
//   },
//   headerPill: {
//     position: 'absolute',
//     top: -20,
//     backgroundColor: '#f06292',
//     paddingVertical: 10,
//     paddingHorizontal: 30,
//     borderRadius: 30,
//     elevation: 5,
//     zIndex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//   },
//   headerText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   controlsContainer: {
//     backgroundColor: '#673ab7',
//     borderRadius: 30,
//     padding: 30,
//     width: '100%',
//     elevation: 5,
//     paddingTop: 40,
//     alignItems: 'center',
//   },
//   controlRow: {
//     flexDirection: 'row',
//     gap: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   powerSection: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     height: 150,
//   },
//   powerButtonsRow: {
//     flexDirection: 'row',
//     gap: 12,
//     marginTop: 10,
//   },
//   smallButton: {
//     backgroundColor: '#f06292',
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//     borderRadius: 12,
//     elevation: 3,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//   },
//   smallButtonText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
//   activeButton: {
//     backgroundColor: '#e91e63',
//   },
//   volumeSection: {
//     flex: 2,
//     height: 190,
//     justifyContent: 'center',
//   },
//   sectionTitle: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 12,
//   },
//   volumeHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   volumeValue: {
//     backgroundColor: '#f06292',
//     paddingVertical: 4,
//     paddingHorizontal: 10,
//     borderRadius: 8,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 5,
//   },
//   volumeValueText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
//   sliderContainer: {
//     width: '100%',
//     height: 40,
//     justifyContent: 'center',
//     paddingHorizontal: 5,
//   },
//   slider: {
//     width: '100%',
//     height: 8,
//     backgroundColor: '#9575cd',
//     borderRadius: 4,
//     position: 'relative',
//   },
//   sliderTrack: {
//     position: 'absolute',
//     left: 0,
//     top: 0,
//     bottom: 0,
//     backgroundColor: '#ffeb3b',
//     borderRadius: 4,
//   },
//   sliderThumb: {
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     backgroundColor: 'white',
//     position: 'absolute',
//     top: -6,
//     marginLeft: -10,
//     elevation: 4,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });




import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import dgram from 'react-native-udp';
import { Buffer } from 'buffer';

const PORT = 8888;
const HOST = 'esptest.local'; // Change this to match your ESP32 IP

// Create and bind the UDP socket
const socket = dgram.createSocket('udp4');

socket.on('error', (err) => {
  console.error('Socket error:', err);
  socket.close();
});

socket.on('message', (msg, rinfo) => {
  console.log(`Received message: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

socket.bind(PORT, () => {
  console.log(`Socket bound to port ${PORT}`);
});

function sendUDPCommand(commandByte, value) {
  const message = Buffer.from([commandByte, value]);
  socket.send(message, 0, message.length, PORT, HOST, (err) => {
    if (err) {
      console.error('UDP Send Error:', err);
    } else {
      console.log(`Message sent to ${HOST}:${PORT}`);
    }
  });
}

export default function LEDControl() {
  const [isOn, setIsOn] = useState(false);
  const [brightness, setBrightness] = useState(0);
  const sliderRef = useRef(null);
  const [sliderWidth, setSliderWidth] = useState(0);

  const updateBrightness = (xPosition) => {
    const relativeX = Math.max(0, Math.min(xPosition, sliderWidth));
    const newValue = Math.round((relativeX / sliderWidth) * 100);
    setBrightness(newValue);
    if (newValue > 0 && !isOn) setIsOn(true);
    if (newValue === 0 && isOn) setIsOn(false);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      if (sliderRef.current) {
        sliderRef.current.measure((fx, fy, width, height, px, py) => {
          const touchX = evt.nativeEvent.locationX;
          updateBrightness(touchX);
        });
      }
    },
    onPanResponderMove: (evt, gestureState) => {
      if (sliderRef.current) {
        sliderRef.current.measure((fx, fy, width, height, px, py) => {
          const touchX = gestureState.moveX - px;
          updateBrightness(touchX);
        });
      }
    },
  });

  const handlePowerOn = () => {
    setIsOn(true);
    if (brightness === 0) setBrightness(50);
  };

  const handlePowerOff = () => {
    setIsOn(false);
    setBrightness(0);
  };

  const handleSetPress = () => {
    sendUDPCommand(0xD1, Math.round(brightness));
  };

  return (
    <View style={styles.container}>
      <View style={styles.controlsWrapper}>
        <View style={styles.headerPill}>
          <Icon name="notifications" size={24} color="white" />
          <Text style={styles.headerText}>Buzzer</Text>
        </View>

        <View style={styles.controlsContainer}>
          <View style={styles.controlRow}>
            <View style={styles.powerSection}>
              <Text style={styles.sectionTitle}>
                <Icon name="power-settings-new" size={18} color="#ffeb3b" /> Power button
              </Text>
              <View style={styles.powerButtonsRow}>
                <TouchableOpacity
                  style={[styles.smallButton, isOn && styles.activeButton]}
                  onPress={handlePowerOn}
                >
                  <Icon name="toggle-on" size={16} color="white" />
                  <Text style={styles.smallButtonText}>ON</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.smallButton, !isOn && styles.activeButton]}
                  onPress={handlePowerOff}
                >
                  <Icon name="toggle-off" size={16} color="white" />
                  <Text style={styles.smallButtonText}>OFF</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.brightnessSection}>
              <View style={styles.brightnessHeader}>
                <Text style={styles.sectionTitle}>
                  <Icon name="notifications" size={18} color="#ffeb3b" /> Sound
                </Text>
                <View style={styles.brightnessValue}>
                  <Icon name="brightness-7" size={14} color="white" />
                  <Text style={styles.brightnessValueText}>{brightness}%</Text>
                </View>
              </View>
              <View
                style={styles.sliderContainer}
                ref={sliderRef}
                onLayout={(event) => {
                  const { width } = event.nativeEvent.layout;
                  setSliderWidth(width);
                }}
                {...panResponder.panHandlers}
              >
                <View style={styles.slider}>
                  <View style={[styles.sliderTrack, { width: `${brightness}%` }]} />
                  <View style={[styles.sliderThumb, { left: `${brightness}%` }]} />
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.setButton} onPress={handleSetPress}>
        <Icon name="send" size={18} color="white" />
        <Text style={styles.setButtonText}>SET</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4a148c',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  controlsWrapper: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  headerPill: {
    position: 'absolute',
    top: -20,
    backgroundColor: '#f06292',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 5,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  controlsContainer: {
    backgroundColor: '#673ab7',
    borderRadius: 30,
    padding: 30,
    width: '100%',
    elevation: 5,
    paddingTop: 40,
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    gap: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  powerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },
  powerButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  smallButton: {
    backgroundColor: '#f06292',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 12,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  smallButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeButton: {
    backgroundColor: '#e91e63',
  },
  brightnessSection: {
    flex: 2,
    height: 190,
    justifyContent: 'center',
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  brightnessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  brightnessValue: {
    backgroundColor: '#f06292',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  brightnessValueText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sliderContainer: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  slider: {
    width: '100%',
    height: 8,
    backgroundColor: '#9575cd',
    borderRadius: 4,
    position: 'relative',
  },
  sliderTrack: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#ffeb3b',
    borderRadius: 4,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    position: 'absolute',
    top: -6,
    marginLeft: -10,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#f06292',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    elevation: 5,
  },
  setButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
