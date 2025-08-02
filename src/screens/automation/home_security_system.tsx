// import React, { useState } from "react";
// import { View, StyleSheet } from "react-native";
// import { Button, Text, Surface } from "react-native-paper";
// import Slider from "@react-native-community/slider";

// const HomeSecurity = () => {
//   const [isToggled, setIsToggled] = useState(false);
//   const [lightIntensity, setLightIntensity] = useState(50);
//   const [ledBrightness, setLedBrightness] = useState(50);

//   return (
//     <Surface style={styles.container}>
//       <Text style={styles.title}>Morning Alarm</Text>

//       <Button
//         mode="contained"
//         onPress={() => setIsToggled(!isToggled)}
//         style={[styles.toggleButton, isToggled ? styles.buttonOn : styles.buttonOff]}
//         labelStyle={styles.buttonText}
//       >
//         {isToggled ? "Turn Off" : "Turn On"}
//       </Button>

//       <View style={styles.sliderGroup}>
//         <Text style={styles.label}>Light Intensity: {lightIntensity}%</Text>
//         <Slider
//           style={styles.slider}
//           minimumValue={0}
//           maximumValue={100}
//           value={lightIntensity}
//           onValueChange={setLightIntensity}
//           minimumTrackTintColor="#4CAF50"
//           maximumTrackTintColor="#A5D6A7"
//           thumbTintColor="#388E3C"
//         />
//       </View>

//       <View style={styles.sliderGroup}>
//         <Text style={styles.label}>Buzzer: {ledBrightness}%</Text>
//         <Slider
//           style={styles.slider}
//           minimumValue={0}
//           maximumValue={100}
//           value={ledBrightness}
//           onValueChange={setLedBrightness}
//           minimumTrackTintColor="#FFB300"
//           maximumTrackTintColor="#FFD54F"
//           thumbTintColor="#FF8F00"
//         />
//       </View>
//     </Surface>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: "#FAFAFA",
//     padding: 25,
//     borderRadius: 12,
//     elevation: 0,
//     margin: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 20,
//     color: "#2E7D32",
//   },
//   toggleButton: {
//     alignSelf: "center",
//     width: 160,
//     borderRadius: 8,
//     paddingVertical: 5,
//     marginBottom: 20,
//   },
//   buttonOn: {
//     backgroundColor: "#388E3C",
//   },
//   buttonOff: {
//     backgroundColor: "#D32F2F",
//   },
//   buttonText: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#FFFFFF",
//   },
//   sliderGroup: {
//     marginTop: 15,
//     paddingHorizontal: 10,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 5,
//     color: "#424242",
//   },
//   slider: {
//     width: "100%",
//   },
// });

// export default HomeSecurity;



import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Switch, Dimensions, Button } from 'react-native';
import Slider from '@react-native-community/slider';
import dgram from 'react-native-udp';
import { Buffer } from 'buffer';

const ESP32_IP = 'esptest.local'; // Change this to your ESP32 IP
const ESP32_PORT = 8888;

export default function HomeSecurity() {
  const [isOn, setIsOn] = useState(false);
  const [lightIntensity, setLightIntensity] = useState(50);
  const [buzzerTime, setBuzzerTime] = useState(50);
  const lastSentTime = useRef(0);

  const sendUDPCommand = (light, buzzer) => {
    const now = Date.now();
    if (now - lastSentTime.current < 50) return;
    lastSentTime.current = now;

    const client = dgram.createSocket('udp4');
    const lightValue = Math.round(light);
    const buzzerValue = Math.round(buzzer);
    const message = Buffer.from([0xE7, lightValue, buzzerValue]);

    client.on('error', (err) => {
      console.error('UDP Socket Error:', err);
      client.close();
    });

    client.bind(0, () => {
      client.send(message, 0, message.length, ESP32_PORT, ESP32_IP, (err) => {
        if (err) console.error('Send Error:', err);
        client.close();
      });
    });

    console.log(`📡 Sent UDP: E3 ${lightValue} ${buzzerValue}`);
  };

  const sendOffCommand = () => {
    const now = Date.now();
    if (now - lastSentTime.current < 50) return;
    lastSentTime.current = now;

    const client = dgram.createSocket('udp4');
    const message = Buffer.from([0xD9]);

    client.on('error', (err) => {
      console.error('UDP Socket Error:', err);
      client.close();
    });

    client.bind(0, () => {
      client.send(message, 0, message.length, ESP32_PORT, ESP32_IP, (err) => {
        if (err) console.error('Send Error:', err);
        client.close();
      });
    });

    console.log('📡 Sent UDP: D9');
  };

  const handleToggle = () => {
    const newState = !isOn;
    setIsOn(newState);
    if (newState) {
      sendUDPCommand(lightIntensity, buzzerTime);
    } else {
      sendOffCommand();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.controlsBox}>
        <View style={styles.topRow}>
          <View style={styles.controlGroup}>
            <Text style={styles.label}>🚪 <Text style={styles.boldText}>Home Security {isOn ? 'ON' : 'OFF'}</Text></Text>
            <Switch
              trackColor={{ false: '#ff9999', true: '#99ff99' }}
              thumbColor={'#ffffff'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={handleToggle}
              value={isOn}
              style={styles.switch}
            />
          </View>
          <Text style={[styles.icon, isOn && styles.activeIcon]}>🔔</Text>
        </View>

        <View style={styles.controlGroup}>
          <Text style={styles.label}>💡 Light Intensity: {lightIntensity}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={lightIntensity}
            onValueChange={setLightIntensity}
            minimumTrackTintColor="#4CAF50"
            maximumTrackTintColor="#A5D6A7"
            thumbTintColor="#388E3C"
          />
        </View>

        <View style={styles.controlGroup}>
          <Text style={styles.label}>⏲️ Buzzer: {buzzerTime}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={buzzerTime}
            onValueChange={setBuzzerTime}
            minimumTrackTintColor="#2196F3"
            maximumTrackTintColor="#90CAF9"
            thumbTintColor="#1565C0"
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Set Values"
            onPress={() => sendUDPCommand(lightIntensity, buzzerTime)}
            color="#4CAF50"
          />
        </View>

      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 20,
  },
  controlsBox: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: width * 0.9,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlGroup: {
    marginVertical: 10,
  },
  label: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4A4A4A',
    marginBottom: 10,
  },
  boldText: {
    fontWeight: 'bold',
  },
  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
  slider: {
    width: '100%',
    height: 40,
  },
  icon: {
    fontSize: 50,
    opacity: 0.3,
  },
  activeIcon: {
    opacity: 1,
    color: '#2196F3',
    textShadowColor: '#1565C0',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  buttonContainer: {
    marginTop: 20,
  },
});
