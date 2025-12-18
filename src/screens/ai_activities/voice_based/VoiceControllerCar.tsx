import React, { useState, useRef } from 'react';
import { getGlobalIP } from '../../../utils/networkUtils';
  // Import ScrollView
import {
  View,
  Text,
  TouchableOpacity,
  ToastAndroid,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  SafeAreaView,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import SpeechAndroid from 'react-native-android-voice';
import dgram from 'react-native-udp';
import { Buffer } from 'buffer';
import WebView from 'react-native-webview';

const ESP32_IP = getGlobalIP(); // ESP32 IP address
const ESP32_PORT = 8888;

const VoiceControlCar = () => {
  const [spokenText, setSpokenText] = useState('');
  const [streamActive, setStreamActive] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const lastSentTime = useRef(0);

  const COMMANDS = {
    forward: 0xB1,
    backward: 0xB2,
    left: 0xB3,
    right: 0xB4,
    stop: 0xB0,
    'stream on': 0xC1,
    'stream off': 0xC0,
  };

  const sendUDPCommand = (commandByte, commandKey) => {
    const now = Date.now();
    if (now - lastSentTime.current < 50) return;
    lastSentTime.current = now;

    const client = dgram.createSocket('udp4');
    const message = Buffer.from([commandByte]);

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

    console.log(`📡 Sent UDP: 0x${commandByte.toString(16).toUpperCase()}`);

    if (commandKey === 'stream on' || commandKey === 'forward') {
      setStreamActive(true);
    } else if (commandKey === 'stream off' || commandKey === 'stop') {
      setStreamActive(false);
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

      const commandKey = Object.keys(COMMANDS).find(key => cleanCommand.includes(key));
      if (commandKey) {
        sendUDPCommand(COMMANDS[commandKey], commandKey);
        ToastAndroid.show(`Sent: ${commandKey.toUpperCase()}`, ToastAndroid.SHORT);
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
      <View style={styles.content}>
        {/* Video Stream Panel */}
        <View style={styles.streamPanel}>
          <View style={styles.streamContainer}>
            {streamActive ? (
              <WebView
                source={{ uri: `http://${ESP32_IP}:81/stream` }}
                style={styles.webview}
                javaScriptEnabled
                domStorageEnabled
                originWhitelist={['*']}
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
              />
            ) : (
              <Text style={styles.streamText}>Stream Off</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.micButton}
            onPress={handleVoiceCommand}
          >
            <Text style={styles.micButtonText}>⦿</Text>
          </TouchableOpacity>
        </View>

        {/* Command Display Panel */}
        <View style={styles.commandPanel}>
          <View style={styles.commandContainer}>
            {spokenText ? (
              <View style={styles.commandBubble}>
                <Text style={styles.commandText}>{spokenText}</Text>
              </View>
            ) : (
              <Text style={styles.placeholderText}>Say a command...</Text>
            )}
          </View>

          <TouchableOpacity style={styles.infoButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.infoButtonText}>i</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal for Command Info */}
      <Modal
  animationType="fade"
  transparent={true}
  visible={modalVisible}
  onRequestClose={() => setModalVisible(false)}
>
  <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
    <View style={styles.modalOverlay}>
      <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
        <View style={styles.modalCard}>
          <Text style={styles.modalHeader}>Voice Commands</Text>
          <ScrollView 
            style={styles.commandScrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            indicatorStyle="white"
            bounces={true}
            overScrollMode="always"
            keyboardShouldPersistTaps="handled"
          >
            {Object.keys(COMMANDS).map((cmd) => (
              <View key={cmd} style={styles.commandItem}>
                <View style={styles.commandBadge}>
                  <Text style={styles.commandBadgeText}>
                    {cmd === 'stream on' ? '⦿' : 
                     cmd === 'stream off' ? '◯' : 
                     cmd === 'forward' ? '▲' :
                     cmd === 'backward' ? '▼' :
                     cmd === 'left' ? '◄' :
                     cmd === 'right' ? '►' :
                     cmd === 'stop' ? '■' : '●'}
                  </Text>
                </View>
                <Text style={styles.commandItemText}>{cmd.toUpperCase()}</Text>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setModalVisible(false)}
            activeOpacity={0.7}
          >
            <Text style={styles.closeModalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </View>
  </TouchableWithoutFeedback>
</Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#5D2F91' },
  content: { flex: 1, flexDirection: 'row', padding: 20 },
  streamPanel: {
    flex: 3,
    backgroundColor: '#F14AA1',
    padding: 20,
    borderRadius: 8,
    marginRight: 10,
    position: 'relative',
  },
  streamContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
  },
  webview: { flex: 1 },
  streamText: {
    fontSize: 32,
    color: '#5D2F91',
    fontWeight: 'bold',
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
  },
  micButton: {
    position: 'absolute',
    bottom: -15,
    alignSelf: 'center',
    backgroundColor: '#FFCC33',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    elevation: 5,
  },
  micButtonText: { fontSize: 30 },
  commandPanel: {
    flex: 1,
    backgroundColor: '#6B3FA0',
    borderRadius: 8,
    padding: 15,
    position: 'relative',
    justifyContent: 'flex-start',
  },
  commandContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commandBubble: {
    backgroundColor: '#8C65B5',
    borderRadius: 18,
    padding: 12,
    minWidth: '80%',
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#9B7AC4',
  },
  commandText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#B19DD0',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  infoButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#F14AA1',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // New Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(93, 47, 145, 0.85)', // #5D2F91 with opacity
  },
  modalCard: {
    backgroundColor: '#6B3FA0',
    borderRadius: 12,
    padding: 16,
    width: '85%',
    maxHeight: '70%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F14AA1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  commandScrollView: {
    width: '100%',
    maxHeight: 200,
  },
  scrollContent: {
    paddingRight: 5,
  },
  commandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  commandBadge: {
    backgroundColor: '#F14AA1',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  commandBadgeText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    lineHeight: 22,
  },
  commandItemText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  closeModalButton: {
    marginTop: 16,
    backgroundColor: '#FFCC33',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  closeModalButtonText: {
    color: '#5D2F91',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default VoiceControlCar;