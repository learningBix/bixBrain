import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Switch,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SERVER_URL = 'http://98.70.77.148:5999';

const MovementTrackingViewer = () => {
  const [movement, setMovement] = useState('');
  const [isScreenOn, setIsScreenOn] = useState(false);

  useEffect(() => {
    let movementInterval;

    if (isScreenOn) {
      movementInterval = setInterval(() => {
        fetch(`${SERVER_URL}/movement`)
          .then((response) => response.text())
          .then((data) => setMovement(data))
          .catch((error) => console.error('Movement fetch error:', error));
      }, 100);
    }

    return () => clearInterval(movementInterval);
  }, [isScreenOn]);

  const getMovementText = () => {
    const map = {
      left: '← Left',
      right: '→ Right',
      forward: '↑ Forward',
      backward: '↓ Back',
      stop: '■ Stop',
      no_face: 'No Face',
    };
    return map[movement] || 'Waiting...';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* LEFT PANE */}
        <View style={styles.leftPane}>
          {/* <Text style={styles.panelTitle}>
            <Icon name="motion-sensor" size={24} color="#fff" /> Movement
          </Text> */}

          

          <View style={styles.card}>
            <Icon
              name={isScreenOn ? 'television' : 'television-off'}
              size={26}
              color="#fff"
            />
            <Text style={styles.cardLabel}>Screen Toggle</Text>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>
                {isScreenOn ? 'Screen On' : 'Screen Off'}
              </Text>
              <Switch
                value={isScreenOn}
                onValueChange={setIsScreenOn}
                trackColor={{ false: '#888', true: '#4cd137' }}
                thumbColor={isScreenOn ? '#fbc531' : '#ccc'}
              />
            </View>
          </View>


          <View style={styles.card}>
            <Icon name="motion-play-outline" size={26} color="#fff" />
            <Text style={styles.cardLabel}>Direction</Text>
            <Text style={styles.cardValue}>{getMovementText()}</Text>
          </View>
        </View>

        {/* RIGHT PANE */}
        <View style={styles.rightPane}>
          {isScreenOn ? (
            <WebView
              source={{ uri: `${SERVER_URL}/video_feed` }}
              style={styles.videoStream}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          ) : (
            <View style={styles.offMessage}>
              <Text style={styles.offText}>Screen is off</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5D2F91',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
  },
  leftPane: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#6B3FA0',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  rightPane: {
    flex: 2,
    backgroundColor: '#F14AA1',
    borderRadius: 12,
    padding: 15,
  },
  panelTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#8C65B5',
    width: '100%',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#9B7AC4',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cardLabel: {
    fontSize: 16,
    color: '#eee',
    marginTop: 6,
    marginBottom: 4,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  toggleLabel: {
    color: '#fff',
    fontSize: 16,
    marginRight: 10,
  },
  videoStream: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  offMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default MovementTrackingViewer;
