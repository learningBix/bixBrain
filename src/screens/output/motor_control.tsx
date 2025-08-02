// import React, { useState, useRef } from 'react';
// import { View, Text, StyleSheet, Switch, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
// import dgram from 'react-native-udp';
// import { Buffer } from 'buffer';

// const ESP32_IP = 'esptest.local';
// const ESP32_PORT = 8888;

// export default function MotorDrive() {
//   const [isPoweredOn, setIsPoweredOn] = useState(false);
//   const [motor1State, setMotor1State] = useState('stop');
//   const [motor2State, setMotor2State] = useState('stop');
//   const [botState, setBotState] = useState('stop');
//   const lastSentTime = useRef(0);

//   const sendUDPCommand = (command) => {
//     const now = Date.now();
//     if (now - lastSentTime.current < 50) return;
//     lastSentTime.current = now;

//     const client = dgram.createSocket('udp4');
//     const message = Buffer.from([0xD8, command]);

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

//   const toggleSwitch = () => {
//     const newState = !isPoweredOn;
//     setIsPoweredOn(newState);
    
//     if (!newState) {
//       // Send stop commands when turning off
//       sendUDPCommand(0x02); // For Motor 1
//       sendUDPCommand(0x05); // For Motor 2
//       sendUDPCommand(0x00); // For BOT
//       setMotor1State('stop');
//       setMotor2State('stop');
//       setBotState('stop');
//     }
//   };

//   const handleMotor1Command = (direction) => {
//     if (!isPoweredOn) return;

//     let command;
//     switch(direction) {
//       case 'clockwise': command = 0x00; break;
//       case 'anticlockwise': command = 0x01; break;
//       case 'stop': command = 0x02; break;
//       default: command = 0x02;
//     }

//     setMotor1State(direction);
//     sendUDPCommand(command);
//   };

//   const handleMotor2Command = (direction) => {
//     if (!isPoweredOn) return;

//     let command;
//     switch(direction) {
//       case 'clockwise': command = 0x03; break;
//       case 'anticlockwise': command = 0x04; break;
//       case 'stop': command = 0x05; break;
//       default: command = 0x05;
//     }

//     setMotor2State(direction);
//     sendUDPCommand(command);
//   };

//   const handleBotCommand = (direction) => {
//     if (!isPoweredOn) return;

//     let command;
//     switch(direction) {
//       case 'forward': command = 0x00; break;
//       case 'backward': command = 0x01; break;
//       case 'stop': command = 0x02; break; // Using same command as forward for stop
//       default: command = 0x00;
//     }

//     setBotState(direction);
//     sendUDPCommand(command);
//   };

//   return (
//     <View style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         <View style={styles.header}>
//           <Text style={styles.title}>⚙️ Hey this is Motor Drive Activity!</Text>
//           <Switch 
//             trackColor={{ false: '#ff9999', true: '#99ff99' }}
//             thumbColor={'#ffffff'}
//             onValueChange={toggleSwitch}
//             value={isPoweredOn}
//             style={styles.switch}
//           />
//         </View>

//         {/* Motor 1 Controls */}
//         <View style={styles.controlBox}>
//           <Text style={styles.sectionTitle}>🔧 Motor 1</Text>
//           <View style={styles.buttonRow}>
//             <TouchableOpacity 
//               style={[styles.button, motor1State === 'clockwise' && styles.activeButton]}
//               onPress={() => handleMotor1Command('clockwise')}
//               disabled={!isPoweredOn}
//             >
//               <Text style={styles.buttonText}>🔄 Clockwise</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={[styles.button, motor1State === 'anticlockwise' && styles.activeButton]}
//               onPress={() => handleMotor1Command('anticlockwise')}
//               disabled={!isPoweredOn}
//             >
//               <Text style={styles.buttonText}>↪️ Anti Clockwise</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={[styles.button, styles.stopButton, motor1State === 'stop' && styles.activeStop]}
//               onPress={() => handleMotor1Command('stop')}
//               disabled={!isPoweredOn}
//             >
//               <Text style={styles.buttonText}>🛑 Stop</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Motor 2 Controls */}
//         <View style={styles.controlBox}>
//           <Text style={styles.sectionTitle}>🔧 Motor 2</Text>
//           <View style={styles.buttonRow}>
//             <TouchableOpacity 
//               style={[styles.button, motor2State === 'clockwise' && styles.activeButton]}
//               onPress={() => handleMotor2Command('clockwise')}
//               disabled={!isPoweredOn}
//             >
//               <Text style={styles.buttonText}>🔄 Clockwise</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={[styles.button, motor2State === 'anticlockwise' && styles.activeButton]}
//               onPress={() => handleMotor2Command('anticlockwise')}
//               disabled={!isPoweredOn}
//             >
//               <Text style={styles.buttonText}>↪️ Anti Clockwise</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={[styles.button, styles.stopButton, motor2State === 'stop' && styles.activeStop]}
//               onPress={() => handleMotor2Command('stop')}
//               disabled={!isPoweredOn}
//             >
//               <Text style={styles.buttonText}>🛑 Stop</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* BOT Controls */}
//         <View style={styles.controlBox}>
//           <Text style={styles.sectionTitle}>🤖 BOT</Text>
//           <View style={styles.buttonRow}>
//             <TouchableOpacity 
//               style={[styles.button, botState === 'forward' && styles.activeButton]}
//               onPress={() => handleBotCommand('forward')}
//               disabled={!isPoweredOn}
//             >
//               <Text style={styles.buttonText}>⬆️ Forward</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={[styles.button, botState === 'backward' && styles.activeButton]}
//               onPress={() => handleBotCommand('backward')}
//               disabled={!isPoweredOn}
//             >
//               <Text style={styles.buttonText}>⬇️ Backward</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={[styles.button, styles.stopButton, botState === 'stop' && styles.activeStop]}
//               onPress={() => handleBotCommand('stop')}
//               disabled={!isPoweredOn}
//             >
//               <Text style={styles.buttonText}>🛑 Stop</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const { width } = Dimensions.get('window');

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#e3f2fd',
//   },
//   scrollContainer: {
//     paddingHorizontal: 10,
//     paddingVertical: 15,
//     alignItems: 'center',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     width: width * 0.9,
//     marginBottom: 10,
//     paddingHorizontal: 10,
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#3f51b5',
//     fontFamily: 'Arial Rounded MT Bold',
//   },
//   switch: {
//     transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
//   },
//   controlBox: {
//     backgroundColor: 'white',
//     borderRadius: 10,
//     padding: 10,
//     marginBottom: 10,
//     width: width * 0.9,
//     borderWidth: 1,
//     borderColor: 'rgba(0,0,0,0.1)',
//     alignItems: 'center',
//   },
//   sectionTitle: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#4a4a4a',
//     marginBottom: 8,
//     fontFamily: 'Arial Rounded MT Bold',
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     flexWrap: 'wrap',
//     gap: 5,
//   },
//   button: {
//     backgroundColor: '#f8f9fa',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 8,
//     minWidth: width * 0.25,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//   },
//   activeButton: {
//     backgroundColor: '#81b0ff',
//     borderColor: '#3f51b5',
//   },
//   stopButton: {
//     backgroundColor: '#ffe5e5',
//     borderColor: '#ff9999',
//   },
//   activeStop: {
//     backgroundColor: '#ff5252',
//     borderColor: '#cc0000',
//   },
//   buttonText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#333',
//     fontFamily: 'Arial Rounded MT Bold',
//   },
// });



import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView, StatusBar } from 'react-native';
import dgram from 'react-native-udp';
import { Buffer } from 'buffer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ESP32_IP = 'esptest.local';
const ESP32_PORT = 8888;

export default function MotorDrive() {
  const [motor1State, setMotor1State] = useState('off');
  const [motor2State, setMotor2State] = useState('off');
  const [combineState, setCombineState] = useState('off');
  const [isPoweredOn, setIsPoweredOn] = useState(false);
  const lastSentTime = useRef(0);

  const sendUDPCommand = (command) => {
    const now = Date.now();
    if (now - lastSentTime.current < 50) return;
    lastSentTime.current = now;

    const client = dgram.createSocket('udp4');
    const message = Buffer.from([0xD8, command]);

    client.on('error', (err) => {
      console.error('UDP Error:', err);
      client.close();
    });

    client.bind(0, () => {
      client.send(
        message,
        0,
        message.length,
        ESP32_PORT,
        ESP32_IP,
        (err) => {
          if (err) console.error('Send Failed:', err);
          client.close();
        }
      );
    });
  };

  // Motor 1 Controls
  const toggleMotor1 = (newState) => {
    let command;
    switch(newState) {
      case 'off': command = 0x02; break;
      case 'clockwise': command = 0x00; break;
      case 'anticlockwise': command = 0x01; break;
      default: command = 0x02;
    }
    setMotor1State(newState);
    sendUDPCommand(command);
  };

  // Motor 2 Controls
  const toggleMotor2 = (newState) => {
    let command;
    switch(newState) {
      case 'off': command = 0x05; break;
      case 'clockwise': command = 0x03; break;
      case 'anticlockwise': command = 0x04; break;
      default: command = 0x05;
    }
    setMotor2State(newState);
    sendUDPCommand(command);
  };

  // Combine Controls
  const toggleCombine = (newState) => {
    let command;
    switch(newState) {
      case 'off': command = 0x08; break;
      case 'clockwise': command = 0x06; break;
      case 'anticlockwise': command = 0x07; break;
      default: command = 0x08;
    }
    setCombineState(newState);
    sendUDPCommand(command);
  };

  const togglePower = () => {
    const newState = !isPoweredOn;
    setIsPoweredOn(newState);

    if (!newState) {
      toggleMotor1('off');
      toggleMotor2('off');
      toggleCombine('off');
    }
  };

  const renderControlColumn = (title, state, toggleFunction) => (
    <View style={styles.controlColumn}>
      <Text style={styles.columnTitle}>{title}</Text>
      <TouchableOpacity
        style={[styles.button, state === 'off' && styles.activeButton]}
        onPress={() => toggleFunction('off')}
      >
        <Text style={styles.buttonText}>OFF</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, state === 'clockwise' && styles.activeButton]}
        onPress={() => toggleFunction('clockwise')}
      >
        <Text style={styles.buttonText}>Clockwise</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, state === 'anticlockwise' && styles.activeButton]}
        onPress={() => toggleFunction('anticlockwise')}
      >
        <Text style={styles.buttonText}>Anticlockwise</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#5e35b1" />
      <View style={styles.container}>
        <View style={styles.mainCard}>
          <View style={styles.titleBadge}>
            <View style={styles.titleContainer}>
              <Icon name="robot-industrial" size={24} color="white" style={styles.icon} />
              <Text style={styles.title}>Motor Driver</Text>
            </View>
          </View>

          {/* <TouchableOpacity style={styles.powerBadge} onPress={togglePower}>
            <View style={styles.powerContent}>
              <Icon 
                name={isPoweredOn ? "power-plug" : "power-plug-off"} 
                size={20} 
                color="white" 
              />
              <Text style={styles.powerText}>{isPoweredOn ? ' POWER ON' : ' POWER OFF'}</Text>
            </View>
          </TouchableOpacity> */}

          <View style={styles.controlsContainer}>
            {renderControlColumn('Motor 1', motor1State, toggleMotor1)}
            {renderControlColumn('Motor 2', motor2State, toggleMotor2)}
            {renderControlColumn('Combine', combineState, toggleCombine)}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#5e35b1',
  },
  container: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainCard: {
    backgroundColor: '#5e35b1',
    borderRadius: 20,
    padding: 20,
    paddingTop: 30,
    width: '100%',
    alignItems: 'center',
    elevation: 5,
    borderWidth: 1,
    borderColor: '#ffffff20',
    marginTop: 20,
    position: 'relative',
  },
  titleBadge: {
    backgroundColor: '#ec407a',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 30,
    position: 'absolute',
    top: -20,
    alignSelf: 'center',
    elevation: 6,
    borderWidth: 2,
    borderColor: '#ffffff30',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
    marginBottom: 20,
  },
  controlColumn: {
    backgroundColor: '#5e35b1',
    borderRadius: 15,
    padding: 15,
    width: '31%',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ffffff10',
    elevation: 2,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#ec407a',
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
    width: '95%',
    alignItems: 'center',
    elevation: 1,
  },
  activeButton: {
    backgroundColor: '#ff80ab',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  powerBadge: {
    backgroundColor: '#ec407a',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    position: 'absolute',
    bottom: -20,
    alignSelf: 'center',
    elevation: 6,
    borderWidth: 2,
    borderColor: '#ffffff30',
  },
  powerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  powerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 5,
  },
});

