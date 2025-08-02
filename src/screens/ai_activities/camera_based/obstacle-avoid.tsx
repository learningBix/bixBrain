import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, PanResponder, TouchableOpacity } from 'react-native';
import dgram from 'react-native-udp';
import { Buffer } from 'buffer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const SensorControl = () => {
    const insets = useSafeAreaInsets();
    const [deviceStatus, setDeviceStatus] = useState('stopped'); // 'running' or 'stopped'
    const [slider1Value, setSlider1Value] = useState(30); // Speed slider value 0-100
    const [slider2Value, setSlider2Value] = useState(70); // Distance slider value 0-100
    const lastSentTime = useRef(0);
    const slider1Ref = useRef(null);
    const slider2Ref = useRef(null);
    const [slider1Width, setSlider1Width] = useState(0);
    const [slider2Width, setSlider2Width] = useState(0);
    const udpServerRef = useRef(null);

    // Hardware received data state
    const [currentHardwareValue, setCurrentHardwareValue] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'connected', 'disconnected', 'listening'
    const [lastReceivedTime, setLastReceivedTime] = useState(null);
    const [messageCount, setMessageCount] = useState(0);

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
                    console.log(`Received from ${remote.address}:${remote.port} - ${receivedMessage}`);
                    
                    const timestamp = Date.now();
                    
                    // Update the current hardware value (overwrite previous)
                    setCurrentHardwareValue({
                        value: receivedMessage,
                        sender: `${remote.address}:${remote.port}`,
                        timestamp: timestamp,
                        type: parseMessageType(receivedMessage)
                    });
                    
                    setLastReceivedTime(timestamp);
                    setConnectionStatus('connected');
                    setMessageCount(prev => prev + 1);
                    
                    // Auto-disconnect status after 5 seconds of no data
                    setTimeout(() => {
                        setConnectionStatus('listening');
                    }, 5000);

                } catch (error) {
                    console.error('Error processing received message:', error);
                }
            });

            server.on('error', (error) => {
                console.error('UDP Server Error:', error);
                setConnectionStatus('disconnected');
            });

            server.on('listening', () => {
                const address = server.address();
                console.log(`UDP Server listening on ${address.address}:${address.port}`);
                setConnectionStatus('listening');
            });

            // Bind to port 5001 for receiving data from hardware
            server.bind(5001, '0.0.0.0');

        } catch (error) {
            console.error('Failed to start UDP server:', error);
            setConnectionStatus('disconnected');
        }
    };

    const parseMessageType = (message) => {
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('distance')) return 'distance';
        if (lowerMessage.includes('sensor')) return 'sensor';
        if (lowerMessage.includes('measure')) return 'measurement';
        if (lowerMessage.includes('status')) return 'status';
        if (lowerMessage.includes('error')) return 'error';
        if (lowerMessage.includes('data')) return 'data';
        return 'general';
    };

    const getMessageTypeIcon = (type) => {
        switch (type) {
            case 'distance': return 'resize-outline';
            case 'measurement': return 'analytics';
            case 'sensor': return 'hardware-chip';
            case 'status': return 'information-circle';
            case 'error': return 'alert-circle';
            case 'data': return 'pulse';
            default: return 'radio';
        }
    };

    const getMessageTypeColor = (type) => {
        switch (type) {
            case 'distance': return '#00BFFF';
            case 'measurement': return '#00FF00';
            case 'sensor': return '#FFA500';
            case 'status': return '#00BFFF';
            case 'error': return '#FF6B6B';
            case 'data': return '#9370DB';
            default: return '#FFFFFF';
        }
    };

    const getConnectionStatusColor = () => {
        switch (connectionStatus) {
            case 'connected': return '#00FF00';
            case 'listening': return '#FFA500';
            case 'disconnected': return '#FF6B6B';
            default: return '#FFFFFF';
        }
    };

    const getConnectionStatusText = () => {
        switch (connectionStatus) {
            case 'connected': return 'Receiving Data';
            case 'listening': return 'Listening';
            case 'disconnected': return 'Disconnected';
            default: return 'Unknown';
        }
    };

    // UDP Command sending function
    const sendCommand = (command, speedValue, distanceValue) => {
        const now = Date.now();
        if (now - lastSentTime.current < 50) return; // Throttle commands
        lastSentTime.current = now;

        const client = dgram.createSocket('udp4');
        client.on('error', (err) => {
            console.error('UDP Socket Error:', err);
            client.close();
        });

        client.bind(0, () => {
            const commandString = `${command},${speedValue},${distanceValue}`;
            const message = Buffer.from(commandString, 'utf8');
            // Send to hardware on port 5000
            client.send(message, 0, message.length, 5000, '192.168.0.184', (error) => {
                if (error) {
                    console.error('UDP Send Error:', error);
                } else {
                    console.log(`Sent to hardware (port 5000): ${commandString}`);
                }
                client.close();
            });
        });
    };

    const handleStart = () => {
        setDeviceStatus('running');
        // Send DISTANCE_MEASURE command with both slider values
        sendCommand('DISTANCE_MEASURE', slider1Value, slider2Value);
    };

    const handleStop = () => {
        setDeviceStatus('stopped');
        // Send STOP_DISTANCE_MEASURE command
        sendCommand('STOP_DISTANCE_MEASURE', slider1Value, slider2Value);
    };

    const sendSliderUpdate = (speed, distance) => {
        const now = Date.now();
        if (now - lastSentTime.current < 50) return;
        lastSentTime.current = now;

        const client = dgram.createSocket('udp4');
        client.on('error', (err) => {
            console.error('UDP Socket Error:', err);
            client.close();
        });

        client.bind(0, () => {
            if (deviceStatus === 'running') {
                const commandString = `DISTANCE_UPDATE,${speed},${distance}`;
                const message = Buffer.from(commandString, 'utf8');
                // Send to hardware on port 5000
                client.send(message, 0, message.length, 5000, '192.168.0.184', (error) => {
                    if (error) {
                        console.error('UDP Send Error:', error);
                    } else {
                        console.log(`Sent to hardware (port 5000): ${commandString}`);
                    }
                    client.close();
                });
            }
        });
    };

    // Slider 1 functions (Speed)
    const updateSlider1Value = (xPosition) => {
        const relativeX = Math.max(0, Math.min(xPosition, slider1Width));
        const newValue = Math.round((relativeX / slider1Width) * 100);
        setSlider1Value(newValue);
        sendSliderUpdate(newValue, slider2Value);
    };

    const panResponder1 = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
            if (slider1Ref.current) {
                slider1Ref.current.measure((fx, fy, width, height, px, py) => {
                    const touchX = evt.nativeEvent.locationX;
                    updateSlider1Value(touchX);
                });
            }
        },
        onPanResponderMove: (evt, gestureState) => {
            if (slider1Ref.current) {
                slider1Ref.current.measure((fx, fy, width, height, px, py) => {
                    const touchX = gestureState.moveX - px;
                    updateSlider1Value(touchX);
                });
            }
        },
    });

    // Slider 2 functions (Distance)
    const updateSlider2Value = (xPosition) => {
        const relativeX = Math.max(0, Math.min(xPosition, slider2Width));
        const newValue = Math.round((relativeX / slider2Width) * 100);
        setSlider2Value(newValue);
        sendSliderUpdate(slider1Value, newValue);
    };

    const panResponder2 = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
            if (slider2Ref.current) {
                slider2Ref.current.measure((fx, fy, width, height, px, py) => {
                    const touchX = evt.nativeEvent.locationX;
                    updateSlider2Value(touchX);
                });
            }
        },
        onPanResponderMove: (evt, gestureState) => {
            if (slider2Ref.current) {
                slider2Ref.current.measure((fx, fy, width, height, px, py) => {
                    const touchX = gestureState.moveX - px;
                    updateSlider2Value(touchX);
                });
            }
        },
    });

    const getTimeDifference = (timestamp) => {
        const now = Date.now();
        const diff = Math.floor((now - timestamp) / 1000);
        if (diff < 60) return `${diff}s ago`;
        const minutes = Math.floor(diff / 60);
        return `${minutes}m ago`;
    };

    const clearReceivedData = () => {
        setCurrentHardwareValue(null);
        setMessageCount(0);
        setLastReceivedTime(null);
    };

    return (
        <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.contentWrapper}>
                <View style={styles.content}>
                    {/* Sliders Card - Left Panel */}
                    <View style={styles.slidersCard}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="settings" size={20} color="#FFA500" />
                            <Text style={styles.sectionTitle}>SPEED & DISTANCE</Text>
                        </View>
                        <View style={styles.divider} />

                        {/* Speed Slider */}
                        <View style={styles.sliderContainer}>
                            <View style={styles.sliderHeader}>
                                <Text style={styles.controlLabel}>Speed</Text>
                                <View style={styles.valueBox}>
                                    <Text style={styles.sliderValue}>{slider1Value}%</Text>
                                </View>
                            </View>

                            <View
                                style={styles.customSliderContainer}
                                ref={slider1Ref}
                                onLayout={(event) => {
                                    setSlider1Width(event.nativeEvent.layout.width);
                                }}
                                {...panResponder1.panHandlers}
                            >
                                <View style={styles.sliderTrack}>
                                    <View style={[styles.sliderFill, { width: `${slider1Value}%` }]} />
                                    <View style={[styles.sliderThumb, { left: `${slider1Value}%` }]} />
                                </View>
                            </View>
                        </View>

                        {/* Distance Slider */}
                        <View style={[styles.sliderContainer, { marginTop: 20 }]}>
                            <View style={styles.sliderHeader}>
                                <Text style={styles.controlLabel}>Distance</Text>
                                <View style={styles.valueBox}>
                                    <Text style={styles.sliderValue}>{slider2Value}%</Text>
                                </View>
                            </View>

                            <View
                                style={styles.customSliderContainer}
                                ref={slider2Ref}
                                onLayout={(event) => {
                                    setSlider2Width(event.nativeEvent.layout.width);
                                }}
                                {...panResponder2.panHandlers}
                            >
                                <View style={styles.sliderTrack}>
                                    <View style={[styles.sliderFill, { width: `${slider2Value}%` }]} />
                                    <View style={[styles.sliderThumb, { left: `${slider2Value}%` }]} />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Hardware Data Display - Middle Panel */}
                    <View style={styles.sensorCard}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="hardware-chip" size={20} color="#FFA500" />
                            <Text style={styles.sectionTitle}>HARDWARE DATA</Text>
                            <TouchableOpacity 
                                style={styles.clearButton}
                                onPress={clearReceivedData}
                            >
                                <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.divider} />

                        {/* Connection Status */}
                        <View style={styles.connectionStatus}>
                            <View style={[
                                styles.connectionIndicator, 
                                { backgroundColor: getConnectionStatusColor() }
                            ]} />
                            <Text style={styles.connectionText}>
                                {getConnectionStatusText()} {messageCount > 0 && `(${messageCount} messages)`}
                            </Text>
                        </View>

                        <View style={styles.sensorDisplay}>
                            {currentHardwareValue ? (
                                <View style={styles.sensorActive}>
                                    <View style={styles.currentValueContainer}>
                                        <View style={styles.valueHeader}>
                                            <View style={styles.dataTypeContainer}>
                                                <Ionicons 
                                                    name={getMessageTypeIcon(currentHardwareValue.type)} 
                                                    size={20} 
                                                    color={getMessageTypeColor(currentHardwareValue.type)} 
                                                />
                                                <Text style={[
                                                    styles.currentValueType, 
                                                    { color: getMessageTypeColor(currentHardwareValue.type) }
                                                ]} numberOfLines={1}>
                                                    {currentHardwareValue.type.toUpperCase()}
                                                </Text>
                                            </View>
                                            <Text style={styles.updateCount}>
                                                Updates: {messageCount}
                                            </Text>
                                        </View>
                                        
                                        <View style={styles.currentValueBoxWrapper}>
                                            <Text style={styles.valueLabel}>Current Value:</Text>
                                            <View style={styles.currentValueBox}>
                                                <Text style={styles.currentValueText}>
                                                    {currentHardwareValue.value}
                                                </Text>
                                            </View>
                                        </View>
                                        
                                        <View style={styles.valueFooter}>
                                            <Text style={styles.valueSender} numberOfLines={1}>
                                                From: {currentHardwareValue.sender}
                                            </Text>
                                            <Text style={styles.valueTimestamp}>
                                                {getTimeDifference(currentHardwareValue.timestamp)}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    {lastReceivedTime && (
                                        <View style={styles.lastUpdateContainer}>
                                            <View style={styles.pulseIndicator} />
                                            <Text style={styles.lastUpdateText}>
                                                Last update: {getTimeDifference(lastReceivedTime)}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            ) : (
                                <View style={styles.sensorInactive}>
                                    <Ionicons name="radio-outline" size={48} color="#8B5CF6" />
                                    <Text style={styles.inactiveText}>Hardware Monitor</Text>
                                    <Text style={styles.inactiveSubtext}>
                                        Listening on port 5001{'\n'}
                                        Waiting for hardware data...
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Control Buttons - Right Panel */}
                    <View style={styles.controlCard}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="power" size={20} color="#FFA500" />
                            <Text style={styles.sectionTitle}>SYSTEM CONTROL</Text>
                        </View>
                        <View style={styles.divider} />

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.controlButton,
                                    styles.startButton,
                                    deviceStatus === 'running' && styles.controlButtonActive
                                ]}
                                onPress={handleStart}
                                disabled={deviceStatus === 'running'}
                                activeOpacity={0.8}
                            >
                                <Ionicons 
                                    name="play" 
                                    size={20} 
                                    color={'#FFFFFF'} 
                                />
                                <Text style={[
                                    styles.controlButtonText,
                                    styles.startButtonText,
                                    deviceStatus === 'running' && styles.controlButtonTextActive
                                ]}>
                                    START
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.controlButton,
                                    styles.stopButton,
                                    deviceStatus === 'stopped' && styles.stopButtonActive
                                ]}
                                onPress={handleStop}
                                disabled={deviceStatus === 'stopped'}
                                activeOpacity={0.8}
                            >
                                <Ionicons 
                                    name="stop" 
                                    size={20} 
                                    color={'#FFFFFF'} 
                                />
                                <Text style={[
                                    styles.controlButtonText,
                                    styles.stopButtonText,
                                    deviceStatus === 'stopped' && styles.stopButtonTextActive
                                ]}>
                                    STOP
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.systemStatus}>
                            <Text style={styles.systemStatusLabel}>System Status</Text>
                            <View style={[
                                styles.systemStatusIndicator,
                                deviceStatus === 'running' ? styles.systemRunning : styles.systemStopped
                            ]}>
                                <View style={[
                                    styles.systemStatusDot,
                                    deviceStatus === 'running' ? styles.runningDot : styles.stoppedDot
                                ]} />
                                <Text style={[
                                    styles.systemStatusText,
                                    deviceStatus === 'running' ? styles.runningText : styles.stoppedText
                                ]}>
                                    {deviceStatus === 'running' ? 'RUNNING' : 'STOPPED'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#581C87',
    },
    contentWrapper: {
        flex: 1,
        width: '100%',
        padding: 16,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        gap: 12,
    },
    slidersCard: {
        flex: 2,
        backgroundColor: '#6B21A8',
        borderRadius: 20,
        padding: 12,
    },
    sensorCard: {
        flex: 2,
        backgroundColor: '#6B21A8',
        borderRadius: 20,
        padding: 12,
    },
    controlCard: {
        flex: 2,
        backgroundColor: '#6B21A8',
        borderRadius: 20,
        padding: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: 'bold',
        flex: 1,
    },
    clearButton: {
        padding: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#8A2BE2',
        marginBottom: 10,
    },
    
    // Slider Styles
    sliderContainer: {
        marginTop: 5,
    },
    sliderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    controlLabel: {
        fontSize: 14,
        color: '#FFFFFF',
    },
    valueBox: {
        backgroundColor: '#F14AA1',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 5,
    },
    sliderValue: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    customSliderContainer: {
        width: '100%',
        height: 35,
        justifyContent: 'center',
        paddingHorizontal: 10,
        marginTop: 5,
    },
    sliderTrack: {
        width: '100%',
        height: 12,
        backgroundColor: '#4C1D95',
        borderRadius: 6,
        position: 'relative',
        borderWidth: 1,
        borderColor: '#8B5CF6',
    },
    sliderFill: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: '#F14AA1',
        borderRadius: 6,
        minWidth: 2,
    },
    sliderThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 3,
        borderColor: '#F14AA1',
        position: 'absolute',
        top: -6,
        marginLeft: -12,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },

    // Hardware Data Styles
    connectionStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        padding: 6,
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderRadius: 6,
    },
    connectionIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    connectionText: {
        fontSize: 11,
        color: '#FFFFFF',
        fontWeight: '500',
        flex: 1,
    },
    sensorDisplay: {
        flex: 1,
        minHeight: 0,
    },
    sensorActive: {
        flex: 1,
        gap: 8,
    },
    currentValueContainer: {
        backgroundColor: 'rgba(139, 92, 246, 0.4)',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 165, 0, 0.3)',
        flex: 1,
        maxHeight: '85%',
    },
    valueHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        minHeight: 24,
    },
    dataTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    currentValueType: {
        fontSize: 12,
        fontWeight: 'bold',
        flex: 1,
    },
    updateCount: {
        fontSize: 9,
        color: 'rgba(255, 255, 255, 0.6)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
        minWidth: 50,
        textAlign: 'center',
    },
    currentValueBoxWrapper: {
        flex: 1,
        marginBottom: 8,
    },
    valueLabel: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 4,
        fontWeight: '500',
    },
    currentValueBox: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 165, 0, 0.5)',
        flex: 1,
        maxHeight: 120,
    },
    currentValueText: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: 'bold',
        textAlign: 'left',
        lineHeight: 18,
        flexWrap: 'wrap',
    },
    valueFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 20,
    },
    valueSender: {
        fontSize: 9,
        color: 'rgba(255, 255, 255, 0.5)',
        flex: 1,
        marginRight: 8,
    },
    valueTimestamp: {
        fontSize: 9,
        color: 'rgba(255, 255, 255, 0.6)',
        minWidth: 40,
        textAlign: 'right',
    },
    lastUpdateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: 6,
        backgroundColor: 'rgba(0, 255, 0, 0.1)',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 0, 0.3)',
        maxHeight: 32,
    },
    pulseIndicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#00FF00',
    },
    lastUpdateText: {
        fontSize: 10,
        color: '#00FF00',
        fontWeight: '500',
    },
    sensorInactive: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 15,
    },
    inactiveText: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    inactiveSubtext: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center',
        lineHeight: 16,
    },

    // Control Button Styles
    buttonContainer: {
        gap: 16,
        marginBottom: 20,
    },
    controlButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        gap: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        minHeight: 50,
    },
    startButton: {
        backgroundColor: '#F14AA1',
    },
    stopButton: {
        backgroundColor: '#F14AA1',
    },
    controlButtonActive: {
        backgroundColor: '#D1477A',
        elevation: 3,
        shadowOpacity: 0.25,
    },
    stopButtonActive: {
        backgroundColor: '#D1477A',
        elevation: 3,
        shadowOpacity: 0.25,
    },
    controlButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    startButtonText: {
        color: '#FFFFFF',
    },
    stopButtonText: {
        color: '#FFFFFF',
    },
    controlButtonTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    stopButtonTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    systemStatus: {
        alignItems: 'center',
        gap: 8,
    },
    systemStatusLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    systemStatusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    systemRunning: {
        backgroundColor: 'rgba(241, 74, 161, 0.3)',
    },
    systemStopped: {
        backgroundColor: 'rgba(241, 74, 161, 0.2)',
    },
    systemStatusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    runningDot: {
        backgroundColor: '#F14AA1',
    },
    stoppedDot: {
        backgroundColor: 'rgba(241, 74, 161, 0.6)',
    },
    systemStatusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    runningText: {
        color: '#F14AA1',
    },
    stoppedText: {
        color: 'rgba(241, 74, 161, 0.8)',
    },
});

export default SensorControl;