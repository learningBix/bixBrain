import React, { useState, useRef } from 'react';
import { getGlobalIP } from '../../utils/networkUtils';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import dgram from 'react-native-udp';
import { Buffer } from 'buffer';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

const ESP32_IP = 'esptest.local';
const ESP32_PORT = 8888;
const COMMAND_STOP = 0xB0;
const COMMANDS = {
  forward: 0xB1,
  backward: 0xB2,
  left: 0xB3,
  right: 0xB4,
};

const STREAM_URL = `http://${ESP32_IP}:81/stream`;

export default function RoboticCarController() {
  const [isOn, setIsOn] = useState(true);
  const [activeDirection, setActiveDirection] = useState(null);
  const lastSentTime = useRef(0);

  const sendUDPCommand = (cmd) => {
    const now = Date.now();
    if (now - lastSentTime.current < 50) return;
    lastSentTime.current = now;

    const client = dgram.createSocket('udp4');
    const message = Buffer.from([cmd]);

    client.on('error', err => {
      console.error('UDP Error:', err);
      client.close();
    });

    client.bind(0, () => {
      client.send(message, 0, message.length, ESP32_PORT, ESP32_IP, err => {
        if (err) console.error('Send Error:', err);
        client.close();
      });
    });
  };

  const handleDirectionPress = (dir) => {
    setActiveDirection(dir);
    sendUDPCommand(COMMANDS[dir]);
  };
  const handleDirectionRelease = () => {
    setActiveDirection(null);
    sendUDPCommand(COMMAND_STOP);
  };
  const togglePower = () => {
    setIsOn(on => !on);
    if (!isOn) sendUDPCommand(COMMAND_STOP);
  };

  const ControlButton = ({ direction, icon }) => (
    <TouchableOpacity
      style={[
        styles.controlButton,
        activeDirection === direction && styles.controlButtonActive
      ]}
      onPressIn={() => handleDirectionPress(direction)}
      onPressOut={handleDirectionRelease}
    >
      <Icon name={icon} size={36} color="#FFFFFF" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Left Controls */}
        <View style={styles.sidePanel}>
          <View style={styles.horizontalButtons}>
            <ControlButton direction="left" icon="chevron-back" />
            <View style={{ width: 20 }} />
            <ControlButton direction="right" icon="chevron-forward" />
          </View>
        </View>

        {/* Center Stream + Power */}
        <View style={styles.streamContainer}>
          <View style={styles.streamPanelOuter}>
            <View style={styles.streamPanelInner}>
              {isOn ? (
                <WebView
                  source={{ uri: STREAM_URL }}
                  style={styles.streamView}
                  javaScriptEnabled
                  domStorageEnabled
                />
              ) : (
                <View style={styles.streamPlaceholder}>
                  <Text style={styles.streamText}>Stream Here</Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity style={styles.powerButton} onPress={togglePower}>
            <Text style={styles.powerButtonText}>{isOn ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>
        </View>

        {/* Right Controls */}
        <View style={styles.sidePanel}>
          <ControlButton direction="forward" icon="chevron-up" />
          <View style={{ height: 40 }} />
          <ControlButton direction="backward" icon="chevron-down" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#4A237A',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  sidePanel: {
    width: width * 0.22,
    height: height * 0.45,           // ↑ bumped from 0.4 → 0.45
    backgroundColor: '#6D55B0',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 13.84,
  },
  horizontalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streamContainer: {
    flex: 3,
    alignItems: 'center',
    position: 'relative',
  },
  streamPanelOuter: {
    width: width * 0.50,
    height: height * 0.75,           // ↑ bumped from 0.65 → 0.75
    backgroundColor: '#E84B8A',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.38,
    shadowRadius: 16.00,
    overflow: 'hidden',
  },
  streamPanelInner: {
    flex: 1,
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
  },
  streamView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  streamPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streamText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#193498',
  },
  powerButton: {
    position: 'absolute',
    bottom: -20,
    alignSelf: 'center',
    backgroundColor: '#E84B8A',
    paddingHorizontal: 36,
    paddingVertical: 7,
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
  },
  powerButtonText: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
  },
  controlButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#52CADE',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
  },
  controlButtonActive: {
    backgroundColor: '#34A0A4',
  },
});
