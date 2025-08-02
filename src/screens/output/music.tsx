import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import dgram from 'react-native-udp';
import { Buffer } from 'buffer';

// UDP Configuration
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

// UDP Command Function
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
  const [status, setStatus] = useState('Stopped');

  const handlePowerOn = () => {
    setIsOn(true);
    // Send power on command - using 0xA0 as the command byte for power
    sendUDPCommand(0xA0, 1);
  };

  const handlePowerOff = () => {
    setIsOn(false);
    setStatus('Stopped');
    // Send power off command
 
  };

  const handlePlay = () => {
    if (isOn) {
      setStatus('Playing');
      // Send play command - using 0xB1 as the command byte for play
      sendUDPCommand(0xD4, 1);
    }
  };

  const handleStop = () => {
    setStatus('Stopped');
    // Send stop command - using 0xB2 as the command byte for stop
    sendUDPCommand(0xC0, 0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.controlsWrapper}>
        <View style={styles.headerPill}>
          <Icon name="lightbulb" size={24} color="white" />
          <Text style={styles.headerText}>Music</Text>
        </View>

        <View style={styles.controlsContainer}>
          <View style={styles.controlRow}>
            {/* Power Section */}
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

            {/* Controls Section - replacing the brightness slider */}
            <View style={styles.controlsSection}>
              <Text style={styles.sectionTitle}>
                <Icon name="music-note" size={18} color="#ffeb3b" /> Controls
              </Text>
              <View style={styles.controlsButtonRow}>
                <TouchableOpacity
                  style={[styles.controlButton, styles.playButton, !isOn && styles.disabledButton]}
                  onPress={handlePlay}
                  disabled={!isOn}
                >
                  <Icon name="play-arrow" size={24} color="white" />
                  <Text style={styles.controlButtonText}>Play</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.controlButton, styles.stopButton]}
                  onPress={handleStop}
                >
                  <Icon name="stop" size={24} color="white" />
                  <Text style={styles.controlButtonText}>Stop</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {/* Status Display */}
          {/* <View style={styles.statusContainer}>
            <Text style={styles.statusText}>Status: {status}</Text>
          </View> */}
        </View>
      </View>
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
  controlsSection: {
    flex: 2,
    height: 190,
    justifyContent: 'center',
  },
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  controlsButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    gap: 15,
  },
  controlButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 8,
  },
  playButton: {
    backgroundColor: '#34e8f0', // Cyan/Turquoise
  },
  stopButton: {
    backgroundColor: '#ff5050', // Red/Coral
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  statusContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});