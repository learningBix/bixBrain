import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function FaceDetectionDoorAlarmScreen() {
    const [faceDetected, setFaceDetected] = useState(false);
    const [movementState, setMovementState] = useState('no_face');
    const [lastUpdate, setLastUpdate] = useState(Date.now());

    // Map movement states to emojis
    const movementEmojis = {
        'stop': '🛑',
        'left': '⬅️',
        'right': '➡️',
        'forward': '⬆️',
        'backward': '⬇️',
        'no_face': '❌'
    };

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const [faceResponse, movementResponse] = await Promise.all([
                    fetch('http://98.70.77.148:5999/face_status'),
                    fetch('http://98.70.77.148:5999/movement')
                ]);
                const faceData = await faceResponse.arrayBuffer();
                const faceStatus = new Uint8Array(faceData)[0] === 0xD1;
                setFaceDetected(faceStatus);
                const movementText = await movementResponse.text();
                setMovementState(movementText);
                setLastUpdate(Date.now());

            } catch (error) {
                console.error('Polling error:', error);
                setMovementState('connection_error');
            }
        };
        const intervalId = setInterval(checkStatus, 500);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.webviewContainer}>
          <WebView
            source={{ uri: 'http://98.70.77.148:5999/video_feed' }}
            style={styles.webview}
            androidHardwareAccelerationEnabled
            allowsInlineMediaPlayback={true}
          />
        </View>

        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            faceDetected ? styles.statusSuccess : styles.statusError
          ]}>
            <Text style={styles.statusText}>
              {faceDetected ? 'FACE DETECTED 👤' : 'NO FACE DETECTED 👤'}
            </Text>
          </View>

          <View style={styles.movementCard}>
            <Text style={styles.movementEmoji}>
              {movementEmojis[movementState] || '❓'}
            </Text>
            <Text style={styles.movementDirection}>
              {movementState.replace(/_/g, ' ').toUpperCase()}
            </Text>
            <Text style={styles.updateText}>
              Updated {Math.floor((Date.now() - lastUpdate) / 1000)}s ago
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#F9FAFB',
    },
    container: {
      flex: 1,
      padding: 24,
      alignItems: 'center',
    },
    webviewContainer: {
      width: '100%',
      height: '55%',
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 24,
      backgroundColor: '#1F2937',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    webview: {
      flex: 1,
    },
    statusContainer: {
      width: '100%',
      gap: 16,
    },
    statusBadge: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusSuccess: {
      backgroundColor: '#D1FAE5',
      borderColor: '#34D399',
      borderWidth: 2,
    },
    statusError: {
      backgroundColor: '#FEE2E2',
      borderColor: '#F87171',
      borderWidth: 2,
    },
    statusText: {
      fontSize: 18,
      fontWeight: '700',
      color: '#1F2937',
    },
    movementCard: {
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },
    movementEmoji: {
      fontSize: 48,
      marginBottom: 8,
    },
    movementDirection: {
      fontSize: 20,
      fontWeight: '600',
      color: '#1E40AF',
      marginBottom: 4,
      textTransform: 'capitalize',
    },
    updateText: {
      fontSize: 12,
      color: '#6B7280',
      fontWeight: '500',
    },
  });
