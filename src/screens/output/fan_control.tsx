// import React, { useState, useRef, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   PanResponder,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import dgram from 'react-native-udp';
// import { Buffer } from 'buffer';

// const ESP32_IP = 'esptest.local';
// const ESP32_PORT = 8888;

// export default function FanControl() {
//   const [isOn, setIsOn] = useState(false);
//   const [speed, setSpeed] = useState(0);
//   const sliderRef = useRef(null);
//   const [sliderWidth, setSliderWidth] = useState(0);
//   const lastSentTime = useRef(0);

//   // Send UDP command with debouncing
//   const sendUDPCommand = (value) => {
//     const now = Date.now();
//     if (now - lastSentTime.current < 50) {
//       console.log('Debounced UDP send skipped');
//       return;
//     }
//     lastSentTime.current = now;

//     console.log('Sending UDP command:', value);

//     const client = dgram.createSocket('udp4');
//     const speedValue = parseInt(value.replace('D2', ''), 10);
//     const message = Buffer.from([0xD2, speedValue]);

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
//           else console.log('UDP command sent successfully');
//           client.close();
//         }
//       );
//     });
//   };

//   // Update speed based on slider drag
//   const updateSpeed = (xPosition) => {
//     if (sliderWidth === 0) {
//       console.log('Slider width is zero, cannot update speed');
//       return;
//     }
//     const relativeX = Math.max(0, Math.min(xPosition, sliderWidth));
//     const newValue = Math.round((relativeX / sliderWidth) * 100);
//     console.log('updateSpeed newValue:', newValue);
//     setSpeed(newValue);
//     if (newValue > 0 && !isOn) handlePowerOn();
//     if (isOn) sendUDPCommand(`D2${Math.round(newValue * 2.55)}`);
//   };

//   // PanResponder for slider drag
//   const panResponder = PanResponder.create({
//     onStartShouldSetPanResponder: () => true,
//     onMoveShouldSetPanResponder: () => true,
//     onPanResponderGrant: (evt) => {
//       if (sliderRef.current) {
//         sliderRef.current.measure((fx, fy, width, height, px, py) => {
//           const touchX = evt.nativeEvent.locationX;
//           console.log('PanResponderGrant touchX:', touchX, 'sliderWidth:', width);
//           updateSpeed(touchX);
//         });
//       } else {
//         console.log('sliderRef.current not available on grant');
//       }
//     },
//     onPanResponderMove: (evt, gestureState) => {
//       if (sliderRef.current) {
//         sliderRef.current.measure((fx, fy, width, height, px, py) => {
//           const touchX = gestureState.moveX - px;
//           console.log('PanResponderMove touchX:', touchX, 'sliderWidth:', width);
//           updateSpeed(touchX);
//         });
//       } else {
//         console.log('sliderRef.current not available on move');
//       }
//     },
//   });

//   // Power ON handler
//   const handlePowerOn = () => {
//     console.log('Power ON pressed');
//     setIsOn(true);
//     if (speed === 0) {
//       setSpeed(50);
//       sendUDPCommand(`D2${Math.round(50 * 2.55)}`);
//     } else {
//       sendUDPCommand(`D2${Math.round(speed * 2.55)}`);
//     }
//   };

//   // Power OFF handler
//   const handlePowerOff = () => {
//     console.log('Power OFF pressed');
//     setIsOn(false);
//     setSpeed(0);
//     sendUDPCommand('D20');
//   };

//   useEffect(() => {
//     console.log('FanControl: isOn=', isOn, ' speed=', speed);
//   }, [isOn, speed]);

//   return (
//     <View style={styles.container}>
//       <View style={styles.controlsWrapper}>
//         <View style={styles.headerPill}>
//           <Icon name="toys" size={24} color="white" />
//           <Text style={styles.headerText}>FAN CONTROL</Text>
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

//             {/* Speed Section */}
//             <View style={styles.speedSection}>
//               <View style={styles.speedHeader}>
//                 <Text style={styles.sectionTitle}>
//                   <Icon name="speed" size={18} color="#ffeb3b" /> Speed
//                 </Text>
//                 <View style={styles.speedValue}>
//                   <Icon name="toys" size={14} color="white" />
//                   <Text style={styles.speedValueText}>{speed}%</Text>
//                 </View>
//               </View>
//               <View
//                 style={styles.sliderContainer}
//                 ref={sliderRef}
//                 onLayout={(event) => {
//                   const { width } = event.nativeEvent.layout;
//                   console.log('Slider width:', width);
//                   setSliderWidth(width);
//                 }}
//                 {...panResponder.panHandlers}
//               >
//                 <View style={styles.slider}>
//                   <View style={[styles.sliderTrack, { width: `${speed}%` }]} />
//                   <View style={[styles.sliderThumb, { left: `${speed}%` }]} />
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
//   speedSection: {
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
//   speedHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   speedValue: {
//     backgroundColor: '#f06292',
//     paddingVertical: 4,
//     paddingHorizontal: 10,
//     borderRadius: 8,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 5,
//   },
//   speedValueText: {
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
    if (err) console.error('UDP Send Error:', err);
    else console.log(`Message sent to ${HOST}:${PORT}`);
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
    sendUDPCommand(0xD5, Math.round(brightness));
  };

  return (
    <View style={styles.container}>
      <View style={styles.controlsWrapper}>
        <View style={styles.headerPill}>
          <Icon name="toys" size={24} color="white" />
          <Text style={styles.headerText}>FAN CONTROL</Text>
        </View>

        <View style={styles.controlsContainer}>
          <View style={styles.controlRow}>
            <View style={styles.powerSection}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <Icon name="power-settings-new" size={18} color="#ffeb3b" />
                <Text style={styles.sectionTitle}>Power</Text>
              </View>
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Icon name="speed" size={18} color="#ffeb3b" />
                  <Text style={styles.sectionTitle}>Speed</Text>
                </View>
                <View style={styles.brightnessValue}>
                  <Icon name="percent" size={14} color="white" />
                  <Text style={styles.brightnessValueText}>{brightness}%</Text>
                </View>
              </View>

              <View
                style={styles.sliderContainer}
                ref={sliderRef}
                onLayout={(event) => setSliderWidth(event.nativeEvent.layout.width)}
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
    fontSize: 16,
    fontWeight: 'bold',
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

