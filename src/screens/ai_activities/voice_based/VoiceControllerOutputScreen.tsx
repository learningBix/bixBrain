import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ToastAndroid,
  PermissionsAndroid, Platform, StyleSheet, SafeAreaView, Dimensions
} from 'react-native';
import SpeechAndroid from 'react-native-android-voice';
import dgram from 'react-native-udp';
import { Buffer } from 'buffer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const ESP32_IP = 'esptest.local'; // Change this to your ESP32 IP
const ESP32_PORT = 8888;

const COMMANDS = {
  'led on': [0xD5, 100],
  'led off': [0xD5, 0],
  'fan on': [0xD2, 100],
  'fan off': [0xD2, 0],
  'motor on': [0xD3, 100],
  'motor off': [0xD3, 0],
};

const VoiceControlScreen = () => {
  const [spokenText, setSpokenText] = useState('');
  const [ledStatus, setLedStatus] = useState('OFF');
  const [fanStatus, setFanStatus] = useState('OFF');
  const [motorStatus, setMotorStatus] = useState('OFF');
  const lastSentTime = useRef(0);

  const sendUDPCommand = (commandBytes) => {
    const now = Date.now();
    if (now - lastSentTime.current < 50) return;
    lastSentTime.current = now;

    const client = dgram.createSocket('udp4');
    const message = Buffer.from(commandBytes);

    client.on('error', (err) => {
      console.error('UDP Error:', err);
      client.close();
    });

    client.bind(0, () => {
      client.send(message, 0, message.length, ESP32_PORT, ESP32_IP, (err) => {
        if (err) console.error('Send Error:', err);
        client.close();
      });
    });

    if (commandBytes[0] === 0xD5) {
      setLedStatus(commandBytes[1] > 0 ? 'ON' : 'OFF');
    } else if (commandBytes[0] === 0xD2) {
      setFanStatus(commandBytes[1] > 0 ? 'ON' : 'OFF');
    } else if (commandBytes[0] === 0xD3) {
      setMotorStatus(commandBytes[1] > 0 ? 'ON' : 'OFF');
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'App needs microphone access for voice commands',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleVoiceCommand = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      ToastAndroid.show('Permission denied!', ToastAndroid.LONG);
      return;
    }

    try {
      const result = await SpeechAndroid.startSpeech('Say command:', SpeechAndroid.ENGLISH);
      const cleanCommand = result.toLowerCase().trim();
      setSpokenText(cleanCommand);

      let foundCommand = null;
      for (const key of Object.keys(COMMANDS)) {
        if (cleanCommand.includes(key)) {
          foundCommand = key;
          break;
        }
      }
      if (foundCommand) {
        sendUDPCommand(COMMANDS[foundCommand]);
        ToastAndroid.show(`Sent: ${foundCommand.toUpperCase()}`, ToastAndroid.SHORT);
      } else {
        ToastAndroid.show('Unknown command', ToastAndroid.SHORT);
      }
    } catch (error) {
      handleSpeechError(error);
    }
  };

  const handleSpeechError = (error) => {
    switch (error) {
      case SpeechAndroid.E_VOICE_CANCELLED:
        ToastAndroid.show('Voice cancelled', ToastAndroid.LONG);
        break;
      case SpeechAndroid.E_NO_MATCH:
        ToastAndroid.show('No command recognized', ToastAndroid.LONG);
        break;
      case SpeechAndroid.E_SERVER_ERROR:
        ToastAndroid.show('Server error', ToastAndroid.LONG);
        break;
      default:
        ToastAndroid.show(`Error: ${error}`, ToastAndroid.LONG);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Command Section */}
        <View style={styles.commandSection}>
          <Text style={styles.commandLabel}>🎙️ Last Command</Text>
          <Text style={styles.commandText}>{spokenText}</Text>

          <TouchableOpacity style={styles.micButton} onPress={handleVoiceCommand}>
            <View style={styles.micIconCircle}>
              <Icon name="microphone" size={24} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Cards Container */}
        <View style={styles.cardsContainer}>
          {/* RGB LED */}
          <View style={styles.card}>
            <Icon name="lightbulb" size={36} color="white" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>RGB LED</Text>
            <Text style={styles.commandInstruction}>Say: "LED on"</Text>
            <Text style={styles.commandInstruction}>Say: "LED off"</Text>
          </View>

          {/* Fan */}
          <View style={styles.card}>
            <Icon name="fan" size={36} color="white" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Fan</Text>
            <Text style={styles.commandInstruction}>Say: "Fan on"</Text>
            <Text style={styles.commandInstruction}>Say: "Fan off"</Text>
          </View>

          {/* Motor */}
          <View style={styles.card}>
            <Icon name="cog" size={36} color="white" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Motor</Text>
            <Text style={styles.commandInstruction}>Say: "Motor on"</Text>
            <Text style={styles.commandInstruction}>Say: "Motor off"</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5D2F91',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    width: '90%',
    alignItems: 'center',
  },
  commandSection: {
    width: '100%',
    padding: 20,
    backgroundColor: '#6B3FA0',
    borderRadius: 16,
    marginBottom: 24,
    position: 'relative',
  },
  commandLabel: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  commandText: {
    fontSize: 16,
    color: 'white',
    marginTop: 6,
    marginRight: 70,
  },
  micButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -25,
  },
  micIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F14AA1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  card: {
    width: '30%',
    backgroundColor: '#F14AA1',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    height: 170,
  },
  cardIcon: {
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  commandInstruction: {
    fontSize: 13,
    color: 'white',
    textAlign: 'center',
  },
});

export default VoiceControlScreen;
