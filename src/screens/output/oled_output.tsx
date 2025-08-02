import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import dgram from 'react-native-udp';
import { Buffer } from 'buffer';

const ESP32_IP = 'esptest.local';
const ESP32_PORT = 8888;

const socket = dgram.createSocket('udp4');

socket.on('error', (err) => {
  console.error('Socket error:', err);
  socket.close();
});

socket.bind(ESP32_PORT);

export default function OLEDDisplay() {
  const [isOn, setIsOn] = useState(false);
  const [text, setText] = useState('');
  const [coordinates, setCoordinates] = useState({ x: '10', y: '20' });

  const sendUDPCommand = (command, data = '') => {
    let buffer;

    if (command === 0xD6) {
      const x = parseInt(coordinates.x) || 0;
      const y = parseInt(coordinates.y) || 0;
      buffer = Buffer.from([command, x, y]);
    } else if (command === 0xD7 && data) {
      const textBuffer = Buffer.from(data);
      buffer = Buffer.concat([Buffer.from([command]), textBuffer]);
    } else {
      buffer = Buffer.from([command]);
    }

    socket.send(buffer, 0, buffer.length, ESP32_PORT, ESP32_IP, (err) => {
      if (err) console.error('UDP Send Error:', err);
    });
  };

  const handlePowerToggle = (state) => {
    setIsOn(state);
    sendUDPCommand(state ? 0xD6 : 0xD9);
  };

  const handleDisplayText = () => {
    if (text && isOn) sendUDPCommand(0xD7, text);
  };

  const handleCoordinateChange = (axis, value) => {
    if (/^\d*$/.test(value)) {
      setCoordinates(prev => ({
        ...prev,
        [axis]: value
      }));
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.contentContainer}>
        <View style={styles.purpleContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>OLED</Text>
          </View>

          <View style={styles.controlsContainer}>
            <View style={styles.powerSection}>
              <View style={styles.powerIconContainer}>
                <Icon
                  name="power"
                  size={32}
                  color="#ff69b4"
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.powerLabel}>Power Buttons</Text>
              </View>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.onButton]}
                  onPress={() => handlePowerToggle(true)}
                >
                  <Text style={styles.buttonText}>ON</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.offButton]}
                  onPress={() => handlePowerToggle(false)}
                >
                  <Text style={styles.buttonText}>OFF</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.hexagonContainer}>
            <View style={styles.hexagonWrapper}>
              <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 100">
                <Polygon
                  points="25,0 75,0 100,50 75,100 25,100 0,50"
                  fill="#7CFC00"
                />
              </Svg>

              <View style={styles.hexagonContent}>
                <View style={styles.coordsContainer}>
                  <View style={styles.coordRow}>
                    <View style={styles.coordLabel}>
                      <Text style={styles.coordText}>x</Text>
                    </View>
                    <TextInput
                      style={styles.coordValue}
                      value={coordinates.x}
                      onChangeText={(value) => handleCoordinateChange('x', value)}
                      keyboardType="numeric"
                      maxLength={3}
                    />
                  </View>
                  <View style={styles.coordRow}>
                    <View style={styles.coordLabel}>
                      <Text style={styles.coordText}>y</Text>
                    </View>
                    <TextInput
                      style={styles.coordValue}
                      value={coordinates.y}
                      onChangeText={(value) => handleCoordinateChange('y', value)}
                      keyboardType="numeric"
                      maxLength={3}
                    />
                  </View>
                </View>

                <View style={styles.oledScreen} />

                <TextInput
                  style={styles.textInput}
                  value={text}
                  onChangeText={setText}
                  placeholder="Write something..."
                  placeholderTextColor="#ffd1e6"
                />

                <TouchableOpacity
                  style={styles.writeButton}
                  onPress={handleDisplayText}
                >
                  <Text style={styles.writeButtonText}>Send Text</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

// Keep all styles EXACTLY as original
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#4b0082',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  purpleContainer: {
    width: '90%',
    backgroundColor: '#663399',
    borderRadius: 30,
    padding: 20,
    flexDirection: 'row',
    position: 'relative',
  },
  headerContainer: {
    position: 'absolute',
    top: -22,
    left: '50%',
    transform: [{ translateX: -100 }],
    backgroundColor: '#ff69b4',
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 25,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  controlsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  powerSection: {
    alignItems: 'flex-start',
  },
  powerIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  powerLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 15,
    marginRight: 15,
  },
  onButton: {
    backgroundColor: '#ff69b4',
  },
  offButton: {
    backgroundColor: '#ff69b4',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  hexagonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hexagonWrapper: {
    width: 280,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hexagonContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  coordsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 15,
  },
  coordRow: {
    flexDirection: 'row',
    marginHorizontal: 5,
  },
  coordLabel: {
    backgroundColor: '#ff69b4',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coordValue: {
    backgroundColor: '#ff69b4',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginLeft: 5,
    minWidth: 40,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  coordText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  oledScreen: {
    width: 120,
    height: 70,
    backgroundColor: 'black',
    borderRadius: 5,
    marginVertical: 10,
  },
  textInput: {
    width: 200,
    height: 40,
    backgroundColor: '#ff69b4',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 8,
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ffffff80',
  },
  writeButton: {
    backgroundColor: '#ff69b4',
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  writeButtonText: {
    color: 'white',
    fontSize: 14,
  },
});