import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import dgram from 'react-native-udp';
import CustomSlider from '../../component/slider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Buffer } from 'buffer';

const { width } = Dimensions.get('window');

// UDP setup
const SEND_PORT = 8888;
const SEND_HOST = 'esptest.local'; // Your ESP32's IP
const LISTEN_PORT = 12345;         // Separate listening port

export default function PersonCounter() {
  const [count, setCount] = useState(0);
  const [distance, setDistance] = useState(50);
  const [isToggled, setIsToggled] = useState(false);
  const socketRef = useRef(null);
  const lastSentTime = useRef(0);

  // Initialize UDP socket for **listening** only once
  useEffect(() => {
    const udpSocket = dgram.createSocket('udp4');
    socketRef.current = udpSocket;

    udpSocket.bind(LISTEN_PORT, () => {
      console.log(`📡 Listening for UDP on port ${LISTEN_PORT}`);
    });

    udpSocket.on('message', (msg, rinfo) => {
      // 1) log raw buffer + sender info
      console.log('📥 Raw UDP packet:', msg, 'from', rinfo);

      let parsedValue;
      // 2) try binary parse
      try {
        parsedValue = msg.readUInt8(0);
        console.log('⚙️  Parsed as UInt8 →', parsedValue);
      } catch (e) {
        // fallback to text parse
        const text = msg.toString('utf8').trim();
        parsedValue = parseInt(text, 10);
        console.log('⚙️  Parsed as string →', text);
      }

      // 3) update state if valid
      if (!isNaN(parsedValue)) {
        setCount(parsedValue);
      }
    });

    udpSocket.on('error', (err) => {
      console.error('🔴 UDP socket error:', err);
      udpSocket.close();
    });

    return () => {
      udpSocket.close();
    };
  }, []);

  // Send UDP command with 0xE6+distance when toggled ON, 0xC0 when OFF
  const sendToggleCommand = () => {
    const now = Date.now();
    if (now - lastSentTime.current < 50) return;
    lastSentTime.current = now;

    const newState = !isToggled;
    setIsToggled(newState);

    const client = dgram.createSocket('udp4');
    const dist = Math.round(distance);
    const message = newState
      ? Buffer.from([0xE6, dist])
      : Buffer.from([0xC0]);

    client.bind(0, () => {
      client.send(message, 0, message.length, SEND_PORT, SEND_HOST, (err) => {
        if (err) console.error('🔴 Send error:', err);
        client.close();
      });
    });

    console.log(`📡 Sent UDP → ${newState ? `E6 ${dist}` : 'C0'}`);
  };

  // Send distance updates when slider changes (only when ON)
  const handleDistanceChange = (value) => {
    setDistance(value);
    if (!isToggled) return;

    const now = Date.now();
    if (now - lastSentTime.current < 50) return;
    lastSentTime.current = now;

    const client = dgram.createSocket('udp4');
    const dist = Math.round(value);
    const message = Buffer.from([0xE6, dist]);

    client.bind(0, () => {
      client.send(message, 0, message.length, SEND_PORT, SEND_HOST, (err) => {
        if (err) console.error('🔴 Send error:', err);
        client.close();
      });
    });

    console.log(`📡 Sent UDP → E6 ${dist}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Icon name="account" size={24} color="white" style={styles.headerIcon} />
          <Text style={styles.headerText}>Person Counter</Text>
        </View>

        {/* **Count Display (and parsed/raw data)** */}
        <View style={styles.counterContainer}>
          <View style={styles.counterBorder}>
            <View style={[styles.counterCircle, styles.shiftedCounter]}>
              <Text style={styles.counterText}>{count}</Text>
            </View>
          </View>
        </View>

        {/* Distance Slider */}
        <View style={styles.sliderContainer}>
          <View style={styles.sliderHeader}>
            <View style={styles.distanceLabel}>
              <Icon name="tape-measure" size={24} color="white" style={styles.distanceLabelIcon} />
              <Text style={styles.distanceLabelText}>Distance (cm)</Text>
            </View>
            <View style={styles.distanceValue}>
              <Text style={styles.distanceValueText}>{distance}</Text>
            </View>
          </View>

          <CustomSlider
            value={distance}
            onValueChange={handleDistanceChange}
            minimumValue={0}
            maximumValue={100}
            trackColor="#FFEB3B"
            backgroundColor="#483285"
            thumbColor="white"
          />
        </View>

        {/* Toggle Button */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={sendToggleCommand}>
            <View style={[styles.setButton, { backgroundColor: '#e85b96' }]}>
              <Text style={styles.setButtonText}>{isToggled ? 'ON' : 'OFF'}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4d208c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: width * 0.85,
    backgroundColor: '#5c2b9e',
    borderRadius: 24,
    paddingTop: 25,
    paddingBottom: 25,
    paddingHorizontal: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
    transform: [{ translateY: -4 }],
  },
  header: {
    backgroundColor: '#e85b96',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 20,
    position: 'absolute',
    top: -15,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  headerIcon: { marginRight: 8 },
  headerText: { color: 'white', fontSize: 20, fontWeight: 'bold' },

  counterContainer: { alignItems: 'center', marginVertical: 10 },
  counterBorder: {
    width: width * 0.13,
    height: width * 0.13,
    borderRadius: width * 0.065,
    backgroundColor: '#e85b96',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterCircle: {
    width: width * 0.11,
    height: width * 0.11,
    borderRadius: width * 0.055,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shiftedCounter: { marginTop: 10 },
  counterText: { fontSize: width * 0.05, color: 'white', fontWeight: 'bold' },

  sliderContainer: { width: '100%', marginBottom: 20 },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  distanceLabel: { flexDirection: 'row', alignItems: 'center' },
  distanceLabelIcon: { marginRight: 8 },
  distanceLabelText: { color: 'white', fontSize: 16 },
  distanceValue: {
    backgroundColor: '#e85b96',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  distanceValueText: { color: 'white', fontSize: 14, fontWeight: 'bold' },

  footer: {
    position: 'absolute',
    bottom: -15,
    alignSelf: 'center',
    zIndex: 1,
  },
  setButton: { paddingVertical: 10, paddingHorizontal: 30, borderRadius: 20 },
  setButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
