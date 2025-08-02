import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView, Dimensions, Modal } from 'react-native';
import dgram from 'react-native-udp';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Buffer } from 'buffer';

const ESP32_IP = 'esptest.local';
const ESP32_PORT = 8888;
const LISTEN_PORT = 12345;

const sensorCommands = {
  'IR': 0xA0,
  'LDR': 0xA1,
  'PIR': 0xA2,
  'TILT': 0xA3,
  'SOUND': 0xA4,
  'MOISTURE': 0xA5,
  'MAGNET': 0xA6,
  'VIBRATION': 0xA7
};

const sensorOptions = Object.keys(sensorCommands);

const SensorHiveStatus = () => {
  const [rawSensorValue, setRawSensorValue] = useState(0);
  const [selectedSensor, setSelectedSensor] = useState('IR');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSensorActive, setIsSensorActive] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = dgram.createSocket('udp4');
    socketRef.current = socket;

    socket.bind(LISTEN_PORT, () => {
      console.log(`Listening on port ${LISTEN_PORT}`);
    });

    socket.on('message', (msg) => {
      try {
        const rawValue = msg.readUInt8(0);
        console.log(`Raw value received: ${rawValue}`);
        setRawSensorValue(rawValue);
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    socket.on('error', (err) => {
      console.error("Socket error:", err);
    });

    return () => {
      if (socket) {
        console.log("Closing socket");
        socket.close();
      }
    };
  }, []);

  const sendCommand = (command) => {
    const socket = socketRef.current;
    if (socket) {
      const message = Buffer.from([command]);
      socket.send(message, 0, message.length, ESP32_PORT, ESP32_IP, (err) => {
        if (err) console.error('Send error:', err);
        else console.log(`Sent command: 0x${command.toString(16)}`);
      });
    }
  };

  const handleSensorChange = (sensor) => {
    setSelectedSensor(sensor);
    sendCommand(sensorCommands[sensor]); // Send command immediately when sensor is changed
    setIsModalVisible(false);
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const handleTurnOn = () => {
    setIsSensorActive(true);
    console.log(`Sensor ${selectedSensor} turned on`);
    sendCommand(sensorCommands[selectedSensor]);
  };

  const handleTurnOff = () => {
    setIsSensorActive(false);
    console.log(`Sensor ${selectedSensor} turned off`);
    sendCommand(0xC0); // Turn-off command
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.layeredCardContainer}>
            <View style={styles.sectionHeader}>
              <Icon name="wifi" size={24} color="#fff" style={styles.headerIcon} />
              <Text style={styles.sectionHeaderText}>{selectedSensor}</Text>
            </View>

            <View style={styles.rowContainer}>
              <View style={[styles.sensorCard, styles.sideBySideCard]}>
                <Text style={[styles.cardTitle, styles.centeredText]}>Sensor Select</Text>
                <TouchableOpacity style={styles.selectedSensorButton} onPress={toggleModal}>
                  <Text style={[styles.selectedSensorText, styles.centeredText]}>{selectedSensor}</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.sensorCard, styles.sideBySideCard]}>
                <Text style={[styles.cardTitle, styles.centeredText]}>{selectedSensor} Detected</Text>
                <View style={styles.readingContainer}>
                  <View style={styles.readingPill}>
                    <Text style={[styles.readingValue, styles.centeredText]}>
                      {rawSensorValue !== '' ? rawSensorValue : 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.toggleButtonsContainer}>
              <TouchableOpacity style={[styles.toggleButton, styles.turnOnButton]} onPress={handleTurnOn}>
                <Icon name="power-settings-new" size={24} color="#fff" />
                <Text style={[styles.toggleButtonText, styles.centeredText]}>Turn On</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.toggleButton, styles.turnOffButton]} onPress={handleTurnOff}>
                <Icon name="power-off" size={24} color="#fff" />
                <Text style={[styles.toggleButtonText, styles.centeredText]}>Turn Off</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={toggleModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={[styles.modalTitle, styles.centeredText]}>Select a Sensor</Text>
              <ScrollView contentContainerStyle={styles.modalScrollContainer}>
                {sensorOptions.map((sensor) => (
                  <TouchableOpacity
                    key={sensor}
                    style={styles.modalOptionButton}
                    onPress={() => handleSensorChange(sensor)}
                  >
                    <Text style={[styles.modalOptionText, styles.centeredText]}>{sensor}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.modalCloseButton} onPress={toggleModal}>
                <Text style={[styles.modalCloseText, styles.centeredText]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default SensorHiveStatus;

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3F0D70',
  },
  container: {
    flex: 1,
    backgroundColor: '#3F0D70',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
    width: '100%',
    minHeight: height - 40,
  },
  sectionHeader: {
    position: 'absolute',
    top: -25,
    left: '50%',
    transform: [{ translateX: -50 }],
    flexDirection: 'row',
    backgroundColor: '#F36B99',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    zIndex: 1,
  },
  headerIcon: {
    marginRight: 10,
    color: '#fff',
  },
  sectionHeaderText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  layeredCardContainer: {
    backgroundColor: '#5E2D89',
    borderRadius: 30,
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
    width: '90%',
    position: 'relative',
    marginTop: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  sensorCard: {
    backgroundColor: '#7B43A1',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  sideBySideCard: {
    width: '48%',
  },
  cardTitle: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  readingContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  readingPill: {
    backgroundColor: '#F36B99',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 50,
    alignItems: 'center',
  },
  readingValue: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  centeredText: {
    textAlign: 'center',
  },
  selectedSensorButton: {
    backgroundColor: '#F36B99',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 10,
    width: '100%',
  },
  selectedSensorText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#5E2D89',
    borderRadius: 30,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalScrollContainer: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  modalOptionButton: {
    backgroundColor: '#7B43A1',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 5,
    width: '100%',
  },
  modalOptionText: {
    color: '#fff',
    fontSize: 18,
  },
  modalCloseButton: {
    backgroundColor: '#F36B99',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 15,
    width: '100%',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 20,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 120,
    justifyContent: 'center',
  },
  turnOnButton: {
    backgroundColor: '#7B43A1',
  },
  turnOffButton: {
    backgroundColor: '#F36B99',
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
});







// import React, { useState, useEffect, useRef } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ImageBackground, Animated } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import dgram from 'react-native-udp';
// import { Buffer } from 'buffer';

// const ESP32_IP = 'esptest.local';
// const ESP32_PORT = 8888;
// const LISTEN_PORT = 12345;

// // Sensor command mapping
// const sensorCommands = {
//   'IR': 0xA0,
//   'LDR': 0xA1,
//   'PIR': 0xA2,
//   'TILT': 0xA3,
//   'SOUND': 0xA4,
//   'MOIST': 0xA5,
//   'MAGNET': 0xA6,
//   'VIBRATION': 0xA7
// };

// export default function SensorHiveStatus() {
//   const [isPoweredOn, setIsPoweredOn] = useState(true);
//   const [hiveConnected, setHiveConnected] = useState(true);
//   const [fadeAnim] = useState(new Animated.Value(0));
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [selectedSensor, setSelectedSensor] = useState('IR');
//   const [rawSensorValue, setRawSensorValue] = useState(0);
//   const lastSentTime = useRef(0);

//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 1500,
//           useNativeDriver: true,
//         }),
//         Animated.timing(fadeAnim, {
//           toValue: 0,
//           duration: 1500,
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();
//   }, [fadeAnim]);

//   const sensors = Object.keys(sensorCommands);

//   const sendUDPCommand = async (command) => {
//     const now = Date.now();
//     if (now - lastSentTime.current < 50) return;
//     lastSentTime.current = now;

//     try {
//       const client = dgram.createSocket('udp4');
//       const message = Buffer.from([command]);

//       client.on('error', (err) => {
//         console.error('UDP Error:', err);
//         client.close();
//       });

//       await new Promise(resolve => {
//         client.bind(0, () => {
//           client.send(
//             message,
//             0,
//             message.length,
//             ESP32_PORT,
//             ESP32_IP,
//             (err) => {
//               if (err) console.error('Send Failed:', err);
//               client.close();
//               resolve();
//             }
//           );
//         });
//       });
//     } catch (error) {
//       console.error('Error sending UDP command:', error);
//     }
//   };

//   const handlePowerToggle = async (state) => {
//     setIsPoweredOn(state);
//     await sendUDPCommand(state ? 0xA0 : 0xD9);
//   };

//   useEffect(() => {
//     const server = dgram.createSocket('udp4');
  
//     server.on('message', (msg, rinfo) => {
//       try {
//         const rawValue = msg.readUInt8(0);
//         console.log('Raw sensor value:', rawValue);
//         setRawSensorValue(rawValue);
//         // setHiveConnected(true);
//       } catch (error) {
//         console.error('Error processing sensor data:', error);
//         setHiveConnected(false);
//       }
//     });
  
//     server.on('error', (err) => {
//       console.error('UDP error:', err);
//       setHiveConnected(false);
//     });
  
//     server.bind(LISTEN_PORT);
//     return () => server.close();
//   }, []);

//   const getSensorValue = () => {
//     switch(selectedSensor) {
//       case 'IR':
//       case 'MOIST':
//         return Math.round((rawSensorValue));
//       case 'LDR':
//         return rawSensorValue;
//       case 'PIR':
//         return rawSensorValue > 128 ? 'Motion Detected' : 'No Motion';
//       case 'TILT':
//         return rawSensorValue > 0 ? 'Tilted' : 'Level';
//       case 'SOUND':
//         return `${Math.round(rawSensorValue / 2.55)} dB`;
//       case 'MAGNET':
//         return rawSensorValue > 0 ? 'Magnetic Field' : 'No Field';
//       case 'VIBRATION':
//         return rawSensorValue > 128 ? 'Vibrating' : 'Stable';
//       default:
//         return 0;
//     }
//   };

//   const getUnit = () => {
//     if (['IR', 'MOIST'].includes(selectedSensor)) return '%';
//     if (selectedSensor === 'LDR') return 'lux';
//     if (selectedSensor === 'SOUND') return '';
//     return '';
//   };

//   const handleSensorSelect = (sensor) => {
//     setSelectedSensor(sensor);
//     setIsDropdownOpen(false);
//     sendUDPCommand(sensorCommands[sensor]);
//   };

//   return (
//     <ImageBackground source={require('../robotic_car/assets/cartoon-road.jpg')} style={styles.container}>
//       <View style={styles.headerContainer}>
//         <TouchableOpacity 
//           style={styles.dropdownContainer} 
//           onPress={() => setIsDropdownOpen(!isDropdownOpen)}
//         >
//           <Text style={styles.dropdownText}>{selectedSensor}</Text>
//           <Icon name="arrow-drop-down" size={15} color="black" />
//         </TouchableOpacity>
        
//         {isDropdownOpen && (
//           <View style={styles.dropdownOptions}>
//             {sensors.map(sensor => (
//               <TouchableOpacity 
//                 key={sensor} 
//                 style={styles.option} 
//                 onPress={() => handleSensorSelect(sensor)}
//               >
//                 <Text style={styles.optionText}>{sensor}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         )}
//       </View>

//       <View style={styles.rowContainer}>
//         <View style={styles.statusCard}>
//           <Text style={styles.title}>Power Control</Text>
//           <View style={styles.buttonContainer}>
//             <TouchableOpacity 
//               style={[styles.powerButton, !isPoweredOn ? styles.activeButton : styles.inactiveButton]}
//               onPress={() => handlePowerToggle(false)}
//             >
//               <View style={styles.buttonContent}>
//                 <Icon name="power-off" size={15} color="white" />
//                 <Text style={styles.buttonText}>Turn Off</Text>
//               </View>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={[styles.powerButton, isPoweredOn ? styles.activeButton : styles.inactiveButton]}
//               onPress={() => handlePowerToggle(true)}
//             >
//               <View style={styles.buttonContent}>
//                 <Icon name="power" size={15} color="white" />
//                 <Text style={styles.buttonText}>Turn On</Text>
//               </View>
//             </TouchableOpacity>
//           </View>
//         </View>

//         <View style={[styles.statusCard, styles.hiveCard]}>
//           <Text style={styles.title}>Hive Connection</Text>
//           <View style={styles.statusRow}>
//             <Animated.View 
//               style={[
//                 styles.ledIndicator, 
//                 hiveConnected ? styles.ledOn : styles.ledOff,
//                 { opacity: hiveConnected ? 1 : fadeAnim }
//               ]} 
//             />
//             <Text style={styles.statusText}>
//               {hiveConnected ? 'Connected' : 'Searching...'}
//             </Text>
//           </View>
//           <Text style={styles.hiveMessage}>
//             Hive Status: {hiveConnected ? 'Receiving Data' : 'No Connection'}
//           </Text>
//           {hiveConnected ? (
//             <Text style={styles.sensorValueText}>
//               {selectedSensor} Sensor: {getSensorValue()} {getUnit()}
//             </Text>
//           ) : (
//             <Text style={styles.searchingText}>
//               Trying to establish connection...
//             </Text>
//           )}
//         </View>
//       </View>
//     </ImageBackground>
//   );
// }



// const { width } = Dimensions.get('window');

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 20,
//   },
//   headerContainer: {
//     position: 'absolute',
//     top: 20,
//     right: 20,
//     zIndex: 10, // Set zIndex higher for the dropdown
//   },
//   dropdownContainer: {
//     backgroundColor: '#fff',
//     padding: 5,
//     borderRadius: 10,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 4,
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: 120, // Adjusted width
//     zIndex: 10, // Ensure dropdown container is above other elements
//   },
//   dropdownText: {
//     fontSize: 12,
//     marginRight: 5,
//   },
//   dropdownOptions: {
//     position: 'absolute',
//     top: 40,
//     right: 20,
//     backgroundColor: '#fff',
//     padding: 5,
//     borderRadius: 10,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 4,
//     width: 120, // Adjusted width
//     zIndex: 10, // Ensure dropdown options are above other elements
//   },
//   option: {
//     padding: 5,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ddd',
//     width: '100%', // Ensure option width matches dropdown width
//   },
//   optionText: {
//     fontSize: 12,
//   },
//   rowContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: width * 0.9,
//     marginTop: 100, // Adjusted for dropdown space
//   },
//   statusCard: {
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     width: width * 0.44,
//     borderRadius: 20,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 4,
//   },
//   hiveCard: {
//     backgroundColor: 'rgba(240,240,240,0.95)',
//    },
//    title:{
//        fontSize :18 ,
//        fontWeight :'bold',
//        color:'#1565C0',
//        marginBottom :10 ,
//        textAlign:'center'
//    },
//    buttonContainer:{
//        flexDirection:'column',
//        alignItems:'center'
//    },
//    powerButton:{
//        paddingVertical :10 ,
//        paddingHorizontal :15 ,
//        borderRadius :15 ,
//        alignItems:'center',
//        width:'100%',
//        marginBottom :10
//    },
//    activeButton:{
//        backgroundColor:'#87CEEB'
//    },
//    inactiveButton:{
//        backgroundColor:'#FF0000'
//    },
//    buttonContent:{
//        flexDirection:'row',
//        alignItems:'center'
//    },
//    buttonText:{
//        fontSize :14 ,
//        fontWeight :'bold',
//        color:'white' ,
//        marginLeft :5
//    },
//    statusRow:{
//        flexDirection:'row',
//        alignItems:'center',
//        justifyContent:'center' ,
//        marginVertical :10
//    },
//    ledIndicator:{
//        width :15 ,
//        height :15 ,
//        borderRadius :7.5 ,
//        marginRight :10
//    },
//    ledOn:{
//        backgroundColor:'#4CAF50'
//    },
//    ledOff:{
//        backgroundColor:'#F44336'
//    },
//    statusText:{
//        fontSize :14 ,
//        fontWeight :'bold' ,
//        color:'#37474F'
//    },
//    hiveMessage:{
//        fontSize :12 ,
//        color:'#1565C0' ,
//        textAlign:'center' ,
//        marginTop :10 ,
//        padding :8 ,
//        backgroundColor:'rgba(255 ,255 ,255 ,0.5)' ,
//        borderRadius :10
//    },
//    sensorValueText: {
//      fontSize: 12,
//      color: '#1565C0',
//      textAlign: 'center',
//      marginTop: 5,
//      padding: 8,
//      backgroundColor: 'rgba(255,255,255,0.5)',
//      borderRadius: 10,
//    },
//    searchingText:{
//       fontSize :10 ,
//       fontStyle :'italic' ,
//       color:'#777' ,
//       marginTop :5 ,
//       textAlign:'center'
//    }
// });
