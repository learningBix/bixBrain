import React, { useState, useEffect, useRef } from 'react';
import { getGlobalIP } from '../../utils/networkUtils';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import dgram from 'react-native-udp';
import { Buffer } from 'buffer';

const { width } = Dimensions.get('window');

// Enhanced custom icon components with subtle animations
const TemperatureIcon = () => {
  const pulseAnimation = new Animated.Value(1);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.iconContainer}>
      <Animated.View style={[
        styles.thermometer,
        { transform: [{ scale: pulseAnimation }] }
      ]}>
        <View style={styles.thermometerBulb} />
        <View style={styles.thermometerStem} />
        <View style={styles.thermometerScale} />
      </Animated.View>
    </View>
  );
};

const HumidityIcon = () => {
  const dropAnimation = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.timing(dropAnimation, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <View style={styles.iconContainer}>
      <Animated.View style={[
        styles.droplet,
        {
          transform: [
            { rotate: '45deg' },
            { 
              translateY: dropAnimation.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, -2, 0],
              })
            }
          ]
        }
      ]} />
    </View>
  );
};

const WindIcon = () => {
  const windAnimation = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.timing(windAnimation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <View style={styles.iconContainer}>
      <Animated.View style={[
        styles.windLine1,
        {
          transform: [{
            translateX: windAnimation.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 2, 0],
            })
          }]
        }
      ]} />
      <Animated.View style={[
        styles.windLine2,
        {
          transform: [{
            translateX: windAnimation.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 1.5, 0],
            })
          }]
        }
      ]} />
      <Animated.View style={[
        styles.windLine3,
        {
          transform: [{
            translateX: windAnimation.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 1, 0],
            })
          }]
        }
      ]} />
    </View>
  );
};

const SunIcon = () => {
  const rotateAnimation = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnimation, {
        toValue: 1,
        duration: 6000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <View style={styles.iconContainer}>
      <Animated.View style={[
        styles.sun,
        {
          transform: [{
            rotate: rotateAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            })
          }]
        }
      ]}>
        <View style={styles.sunRay1} />
        <View style={styles.sunRay2} />
        <View style={styles.sunRay3} />
        <View style={styles.sunRay4} />
      </Animated.View>
    </View>
  );
};

const RefreshIcon = ({ spinning = false }) => {
  const spinAnimation = new Animated.Value(0);

  useEffect(() => {
    if (spinning) {
      Animated.loop(
        Animated.timing(spinAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnimation.setValue(0);
    }
  }, [spinning]);

  return (
    <Animated.View style={[
      styles.refreshIcon,
      spinning && {
        transform: [{
          rotate: spinAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
          })
        }]
      }
    ]}>
      <View style={styles.refreshCircle} />
      <View style={styles.refreshArrow} />
    </Animated.View>
  );
};

const WeatherStation = () => {
  const [cityData, setCityData] = useState({
    temperature: '28°C',
    humidity: '65%',
    wind: '12 km/h',
    condition: 'Sunny',
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  const [roomData, setRoomData] = useState({
    temperature: '24°C',
    humidity: '58%',
    pressure: '1013 hPa',
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connected');
  const cardScale = new Animated.Value(1);
  const udpServerRef = useRef(null);
  const lastSentTime = useRef(0);
  
  // New states for UDP communication
  const [hardwareConnectionStatus, setHardwareConnectionStatus] = useState('disconnected');
  const [lastReceivedTime, setLastReceivedTime] = useState(null);
  const [receivedWeatherData, setReceivedWeatherData] = useState(null);

  // Initialize UDP server for receiving data
  useEffect(() => {
    startUDPServer();
    return () => {
      if (udpServerRef.current) {
        udpServerRef.current.close();
      }
    };
  }, []);

  const startUDPServer = () => {
    try {
      const server = dgram.createSocket('udp4');
      udpServerRef.current = server;

      server.on('message', (message, remote) => {
        try {
          const receivedMessage = message.toString('utf8');
          console.log(`Weather data received from ${remote.address}:${remote.port} - ${receivedMessage}`);
          
          const timestamp = Date.now();
          setReceivedWeatherData(receivedMessage);
          setLastReceivedTime(timestamp);
          setHardwareConnectionStatus('connected');
          
          // Parse and update room data with received weather data
          parseWeatherData(receivedMessage, timestamp);
          
          // Auto-disconnect status after 10 seconds of no data
          setTimeout(() => {
            setHardwareConnectionStatus('listening');
          }, 10000);

        } catch (error) {
          console.error('Error processing received weather message:', error);
        }
      });

      server.on('error', (error) => {
        console.error('UDP Server Error:', error);
        setHardwareConnectionStatus('disconnected');
      });

      server.on('listening', () => {
        const address = server.address();
        console.log(`UDP Server listening on ${address.address}:${address.port}`);
        setHardwareConnectionStatus('listening');
      });

      // Bind to port 5001 for receiving data from hardware
      server.bind(5001, '0.0.0.0');

    } catch (error) {
      console.error('Failed to start UDP server:', error);
      setHardwareConnectionStatus('disconnected');
    }
  };

  const parseWeatherData = (data, timestamp) => {
    try {
      // Try to parse JSON format
      if (data.startsWith('{') && data.endsWith('}')) {
        const parsed = JSON.parse(data);
        setRoomData({
          temperature: parsed.temperature || 'N/A',
          humidity: parsed.humidity || 'N/A',
          pressure: parsed.pressure || 'N/A',
          lastUpdated: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      } else {
        // Parse comma-separated values format like "25.6,68,1015"
        const values = data.split(',');
        if (values.length >= 3) {
          setRoomData({
            temperature: values[0] + '°C',
            humidity: values[1] + '%',
            pressure: values[2] + ' hPa',
            lastUpdated: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
        } else {
          // If it's just raw text, display as received
          setRoomData({
            temperature: data.includes('temp') ? data : roomData.temperature,
            humidity: data.includes('hum') ? data : roomData.humidity,
            pressure: data.includes('press') ? data : roomData.pressure,
            lastUpdated: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
        }
      }
    } catch (error) {
      console.error('Error parsing weather data:', error);
      // If parsing fails, just update the timestamp
      setRoomData(prev => ({
        ...prev,
        lastUpdated: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
    }
  };

  const sendWeatherCommand = () => {
    const now = Date.now();
    if (now - lastSentTime.current < 1000) return; // Throttle commands to 1 second
    lastSentTime.current = now;

    const client = dgram.createSocket('udp4');
    client.on('error', (err) => {
      console.error('UDP Socket Error:', err);
      client.close();
    });

    client.bind(0, () => {
      const commandString = 'WEATHER_DATA';
      const message = Buffer.from(commandString, 'utf8');
      // Send to hardware on port 5000
      client.send(message, 0, message.length, 5000, getGlobalIP(), (error) => {
        if (error) {
          console.error('UDP Send Error:', error);
        } else {
          console.log(`Sent weather command to hardware (port 5000): ${commandString}`);
        }
        client.close();
      });
    });
  };

  const getConnectionStatusColor = () => {
    switch (hardwareConnectionStatus) {
      case 'connected': return '#00FF00';
      case 'listening': return '#FFA500';
      case 'disconnected': return '#FF6B6B';
      default: return '#FFFFFF';
    }
  };

  const getConnectionStatusText = () => {
    switch (hardwareConnectionStatus) {
      case 'connected': return 'Hardware Connected';
      case 'listening': return 'Listening for Data';
      case 'disconnected': return 'Hardware Disconnected';
      default: return 'Unknown';
    }
  };

  const fetchRoomData = () => {
    setLoading(true);
    setConnectionStatus('Fetching...');
    
    // Add subtle button press animation
    Animated.sequence([
      Animated.timing(cardScale, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Send UDP command to hardware
    sendWeatherCommand();

    // Set a timeout to stop loading if no response received
    setTimeout(() => {
      setConnectionStatus('Connected');
      setLoading(false);
    }, 5000); // 5 second timeout
  };

  // Stop loading when data is received
  useEffect(() => {
    if (receivedWeatherData && loading) {
      setLoading(false);
      setConnectionStatus('Connected');
    }
  }, [receivedWeatherData, loading]);

  const getTimeDifference = (timestamp) => {
    const now = Date.now();
    const diff = Math.floor((now - timestamp) / 1000);
    if (diff < 60) return `${diff}s ago`;
    const minutes = Math.floor(diff / 60);
    return `${minutes}m ago`;
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.card,
        { transform: [{ scale: cardScale }] }
      ]}>
        {/* Enhanced Header */}
     

        <View style={styles.content}>
          {/* Enhanced City Weather Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.headerContent}>
                <Text style={styles.sectionTitle}>City Weather</Text>
                <Text style={styles.locationText}>Jaipur, Rajasthan</Text>
              </View>
              <Text style={styles.timestampText}>{cityData.lastUpdated}</Text>
            </View>
            <View style={styles.dataContainer}>
              <View style={styles.enhancedDataRow}>
                <View style={styles.dataItem}>
                  <TemperatureIcon />
                  <View style={styles.dataInfo}>
                    <Text style={styles.dataLabel}>Temperature</Text>
                    <Text style={styles.dataValue}>{cityData.temperature}</Text>
                  </View>
                </View>
                <View style={styles.dividerLine} />
                <View style={styles.dataItem}>
                  <HumidityIcon />
                  <View style={styles.dataInfo}>
                    <Text style={styles.dataLabel}>Humidity</Text>
                    <Text style={styles.dataValue}>{cityData.humidity}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.enhancedDataRow}>
                <View style={styles.dataItem}>
                  <WindIcon />
                  <View style={styles.dataInfo}>
                    <Text style={styles.dataLabel}>Wind Speed</Text>
                    <Text style={styles.dataValue}>{cityData.wind}</Text>
                  </View>
                </View>
                <View style={styles.dividerLine} />
                <View style={styles.dataItem}>
                  <SunIcon />
                  <View style={styles.dataInfo}>
                    <Text style={styles.dataLabel}>Condition</Text>
                    <Text style={styles.dataValue}>{cityData.condition}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Enhanced Room Weather Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.headerContent}>
                <Text style={styles.sectionTitle}>Room Weather</Text>
                <Text style={styles.locationText}>Hardware Sensors</Text>
              </View>
              <Text style={styles.timestampText}>{roomData.lastUpdated}</Text>
            </View>
            <View style={styles.dataContainer}>
              {/* Raw data display if available */}
              {receivedWeatherData && (
                <View style={styles.rawDataContainer}>
                  <Text style={styles.rawDataLabel}>Received Data:</Text>
                  <Text style={styles.rawDataText}>{receivedWeatherData}</Text>
                </View>
              )}
              
              <View style={styles.enhancedDataRow}>
                <View style={styles.dataItem}>
                  <TemperatureIcon />
                  <View style={styles.dataInfo}>
                    <Text style={styles.dataLabel}>Temperature</Text>
                    <Text style={styles.dataValue}>{roomData.temperature}</Text>
                  </View>
                </View>
                <View style={styles.dividerLine} />
                <View style={styles.dataItem}>
                  <HumidityIcon />
                  <View style={styles.dataInfo}>
                    <Text style={styles.dataLabel}>Humidity</Text>
                    <Text style={styles.dataValue}>{roomData.humidity}</Text>
                  </View>
                </View>
              </View>
              
              <View style={[styles.enhancedDataRow, { marginBottom: 12 }]}>
                <View style={styles.dataItem}>
                  <View style={styles.iconContainer}>
                    <View style={styles.pressureIcon} />
                  </View>
                  <View style={styles.dataInfo}>
                    <Text style={styles.dataLabel}>Pressure</Text>
                    <Text style={styles.dataValue}>{roomData.pressure}</Text>
                  </View>
                </View>
              </View>
              
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonLoading]}
                onPress={fetchRoomData}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <RefreshIcon spinning={loading} />
                    <Text style={styles.buttonText}>Fetch Data</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#581C87',
    padding: width < 380 ? 6 : 8,
  },
  card: {
    flex: 1,
    backgroundColor: '#6B21A8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(241, 74, 161, 0.3)',
    padding: width < 380 ? 10 : 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  header: {
    marginBottom: width < 380 ? 12 : 16,
  },
  // Connection Status Styles
  connectionStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 8,
  },
  connectionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionStatusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
  },
  lastReceivedText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },
  titleSection: {
    alignItems: 'center',
  },
  title: {
    fontSize: width < 380 ? 20 : 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    fontFamily: 'System',
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    flexDirection: width < 500 ? 'column' : 'row',
    gap: width < 380 ? 8 : 12,
  },
  section: {
    flex: 1,
    backgroundColor: '#F8BBD9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(241, 74, 161, 0.3)',
    overflow: 'hidden',
    marginBottom: width < 500 ? 8 : 0,
  },
  sectionHeader: {
    paddingVertical: width < 380 ? 8 : 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F14AA1',
    backgroundColor: '#E91E63',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: width < 380 ? 14 : 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
  locationText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginTop: 1,
  },
  timestampText: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },
  dataContainer: {
    padding: width < 380 ? 8 : 12,
  },
  // Raw data display styles
  rawDataContainer: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  rawDataLabel: {
    fontSize: 10,
    color: '#2A0C4E',
    fontWeight: '600',
    marginBottom: 4,
  },
  rawDataText: {
    fontSize: 12,
    color: '#581C87',
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  enhancedDataRow: {
    flexDirection: 'row',
    marginBottom: width < 380 ? 8 : 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(233, 30, 99, 0.2)',
  },
  dataItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dataInfo: {
    flex: 1,
  },
  dividerLine: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(233, 30, 99, 0.3)',
    marginHorizontal: 8,
  },
  dataLabel: {
    fontSize: width < 380 ? 10 : 11,
    color: '#2A0C4E',
    fontFamily: 'System',
    fontWeight: '500',
    marginBottom: 1,
  },
  dataValue: {
    fontSize: width < 380 ? 14 : 16,
    fontWeight: '700',
    color: '#581C87',
    fontFamily: 'System',
  },
  button: {
    backgroundColor: '#F14AA1',
    paddingVertical: width < 380 ? 10 : 12,
    paddingHorizontal: width < 380 ? 16 : 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    flexDirection: 'row',
    gap: 6,
  },
  buttonLoading: {
    backgroundColor: 'rgba(241, 74, 161, 0.7)',
  },
  buttonText: {
    fontSize: width < 380 ? 12 : 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
  iconContainer: {
    width: width < 380 ? 18 : 20,
    height: width < 380 ? 18 : 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Temperature icon
  thermometer: {
    alignItems: 'center',
  },
  thermometerBulb: {
    width: width < 380 ? 8 : 10,
    height: width < 380 ? 8 : 10,
    borderRadius: width < 380 ? 4 : 5,
    backgroundColor: '#581C87',
    marginTop: 2,
  },
  thermometerStem: {
    width: width < 380 ? 3 : 4,
    height: width < 380 ? 12 : 14,
    backgroundColor: '#581C87',
    marginTop: -4,
    borderTopLeftRadius: width < 380 ? 1.5 : 2,
    borderTopRightRadius: width < 380 ? 1.5 : 2,
  },
  thermometerScale: {
    position: 'absolute',
    right: -2,
    top: 8,
    width: 1,
    height: 8,
    backgroundColor: '#FFA500',
  },
  // Humidity icon
  droplet: {
    width: width < 380 ? 12 : 14,
    height: width < 380 ? 12 : 14,
    borderRadius: width < 380 ? 6 : 7,
    backgroundColor: '#581C87',
    borderBottomRightRadius: 0,
  },
  // Wind icon
  windLine1: {
    width: width < 380 ? 16 : 18,
    height: width < 380 ? 2 : 3,
    backgroundColor: '#581C87',
    borderRadius: width < 380 ? 1 : 1.5,
    marginBottom: 3,
  },
  windLine2: {
    width: width < 380 ? 12 : 14,
    height: width < 380 ? 2 : 3,
    backgroundColor: '#581C87',
    borderRadius: width < 380 ? 1 : 1.5,
    marginBottom: 3,
  },
  windLine3: {
    width: width < 380 ? 8 : 10,
    height: width < 380 ? 2 : 3,
    backgroundColor: '#581C87',
    borderRadius: width < 380 ? 1 : 1.5,
  },
  // Sun icon
  sun: {
    width: width < 380 ? 10 : 12,
    height: width < 380 ? 10 : 12,
    borderRadius: width < 380 ? 5 : 6,
    backgroundColor: '#581C87',
    position: 'relative',
  },
  sunRay1: {
    position: 'absolute',
    width: width < 380 ? 10 : 12,
    height: width < 380 ? 2 : 2,
    backgroundColor: '#581C87',
    top: width < 380 ? -5 : -6,
    left: 0,
  },
  sunRay2: {
    position: 'absolute',
    width: width < 380 ? 10 : 12,
    height: width < 380 ? 2 : 2,
    backgroundColor: '#581C87',
    bottom: width < 380 ? -5 : -6,
    left: 0,
  },
  sunRay3: {
    position: 'absolute',
    width: width < 380 ? 2 : 2,
    height: width < 380 ? 10 : 12,
    backgroundColor: '#581C87',
    left: width < 380 ? -5 : -6,
    top: 0,
  },
  sunRay4: {
    position: 'absolute',
    width: width < 380 ? 2 : 2,
    height: width < 380 ? 10 : 12,
    backgroundColor: '#581C87',
    right: width < 380 ? -5 : -6,
    top: 0,
  },
  // Pressure icon
  pressureIcon: {
    width: width < 380 ? 14 : 16,
    height: width < 380 ? 14 : 16,
    borderWidth: 2,
    borderColor: '#581C87',
    borderRadius: width < 380 ? 7 : 8,
    backgroundColor: 'transparent',
  },
  // Refresh icon
  refreshIcon: {
    width: width < 380 ? 16 : 20,
    height: width < 380 ? 16 : 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshCircle: {
    width: width < 380 ? 14 : 16,
    height: width < 380 ? 14 : 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: width < 380 ? 7 : 8,
    borderTopColor: 'transparent',
  },
  refreshArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: width < 380 ? 3 : 4,
    borderRightWidth: width < 380 ? 3 : 4,
    borderBottomWidth: width < 380 ? 4 : 6,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
    position: 'absolute',
    top: width < 380 ? -1 : -2,
    right: 0,
  },
});

export default WeatherStation;