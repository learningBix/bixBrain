import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, PanResponder, TouchableOpacity } from 'react-native';
import dgram from 'react-native-udp';
import { Buffer } from 'buffer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const FaceMaskDetection = () => {
    const insets = useSafeAreaInsets();
    const [deviceStatus, setDeviceStatus] = useState('deactive'); // 'active' or 'deactive'
    const [sensitivityValue, setSensitivityValue] = useState(50); // Sensitivity from 0 to 100
    const lastSentTime = useRef(0);
    const sliderRef = useRef(null);
    const [sliderWidth, setSliderWidth] = useState(0);
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
        if (lowerMessage.includes('mask')) return 'mask';
        if (lowerMessage.includes('face')) return 'face';
        if (lowerMessage.includes('nomask') || lowerMessage.includes('no_mask') || lowerMessage.includes('without')) return 'nomask';
        if (lowerMessage.includes('withmask') || lowerMessage.includes('with_mask') || lowerMessage.includes('wearing')) return 'withmask';
        if (lowerMessage.includes('detect') || lowerMessage.includes('detection')) return 'detection';
        if (lowerMessage.includes('medical') || lowerMessage.includes('surgical')) return 'medical';
        if (lowerMessage.includes('n95') || lowerMessage.includes('respirator')) return 'n95';
        if (lowerMessage.includes('cloth') || lowerMessage.includes('fabric')) return 'cloth';
        if (lowerMessage.includes('compliance') || lowerMessage.includes('safety')) return 'compliance';
        if (lowerMessage.includes('sensitivity') || lowerMessage.includes('threshold')) return 'sensitivity';
        if (lowerMessage.includes('confidence') || lowerMessage.includes('accuracy')) return 'confidence';
        if (lowerMessage.includes('person') || lowerMessage.includes('people')) return 'person';
        if (lowerMessage.includes('sensor')) return 'sensor';
        if (lowerMessage.includes('status')) return 'status';
        if (lowerMessage.includes('error')) return 'error';
        if (lowerMessage.includes('data')) return 'data';
        return 'general';
    };

    const getMessageTypeIcon = (type) => {
        switch (type) {
            case 'mask': return 'medical';
            case 'face': return 'happy';
            case 'nomask': return 'close-circle';
            case 'withmask': return 'checkmark-circle';
            case 'detection': return 'scan';
            case 'medical': return 'medical';
            case 'n95': return 'shield-checkmark';
            case 'cloth': return 'shirt';
            case 'compliance': return 'shield';
            case 'sensitivity': return 'settings';
            case 'confidence': return 'analytics';
            case 'person': return 'person';
            case 'sensor': return 'hardware-chip';
            case 'status': return 'information-circle';
            case 'error': return 'alert-circle';
            case 'data': return 'analytics';
            default: return 'radio';
        }
    };

    const getMessageTypeColor = (type) => {
        switch (type) {
            case 'mask': return '#FFA500';
            case 'face': return '#FFD700';
            case 'nomask': return '#FF6B6B';
            case 'withmask': return '#00FF00';
            case 'detection': return '#FFA500';
            case 'medical': return '#00BFFF';
            case 'n95': return '#4169E1';
            case 'cloth': return '#8B4513';
            case 'compliance': return '#32CD32';
            case 'sensitivity': return '#9370DB';
            case 'confidence': return '#00CED1';
            case 'person': return '#FF69B4';
            case 'sensor': return '#00FF00';
            case 'status': return '#00BFFF';
            case 'error': return '#FF6B6B';
            case 'data': return '#FFFFFF';
            default: return '#CCCCCC';
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
    const sendDetectionCommand = (command, sensitivityLevel) => {
        const now = Date.now();
        if (now - lastSentTime.current < 50) return; // Throttle commands
        lastSentTime.current = now;

        const client = dgram.createSocket('udp4');
        client.on('error', (err) => {
            console.error('UDP Socket Error:', err);
            client.close();
        });

        client.bind(0, () => {
            const commandString = `${command},${sensitivityLevel}`;
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

    const handleActivate = () => {
        setDeviceStatus('active');
        // Send MASK_DETECT command with current sensitivity value
        sendDetectionCommand('MASK_DETECT', sensitivityValue);
    };

    const handleDeactivate = () => {
        setDeviceStatus('deactive');
        // Send STOP_MASK_DETECT command with current sensitivity value
        sendDetectionCommand('STOP_MASK_DETECT', sensitivityValue);
    };

    const sendSensitivityCommand = (sensitivity) => {
        const now = Date.now();
        if (now - lastSentTime.current < 50) return;
        lastSentTime.current = now;

        const client = dgram.createSocket('udp4');
        client.on('error', (err) => {
            console.error('UDP Socket Error:', err);
            client.close();
        });

        client.bind(0, () => {
            // Send sensitivity update if detection is active
            if (deviceStatus === 'active') {
                const commandString = `DETECTION_SENSITIVITY,${sensitivity}`;
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

    const updateSliderValue = (xPosition) => {
        const relativeX = Math.max(0, Math.min(xPosition, sliderWidth));
        const newValue = Math.round((relativeX / sliderWidth) * 100);
        setSensitivityValue(newValue);
        sendSensitivityCommand(newValue);
    };

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
            if (sliderRef.current) {
                sliderRef.current.measure((fx, fy, width, height, px, py) => {
                    const touchX = evt.nativeEvent.locationX;
                    updateSliderValue(touchX);
                });
            }
        },
        onPanResponderMove: (evt, gestureState) => {
            if (sliderRef.current) {
                sliderRef.current.measure((fx, fy, width, height, px, py) => {
                    const touchX = gestureState.moveX - px;
                    updateSliderValue(touchX);
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
                    {/* Controls Card - Left Panel */}
                    <View style={styles.controlsCard}>
                        {/* Face Mask Detection Controls */}
                        <View style={styles.sectionHeader}>
                            <Ionicons name="medical" size={20} color="#FFA500" />
                            <Text style={styles.sectionTitle}>MASK DETECTION</Text>
                        </View>
                        <View style={styles.divider} />

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.controlButton,
                                    deviceStatus === 'active' && styles.controlButtonActive
                                ]}
                                onPress={handleActivate}
                            >
                                <Ionicons 
                                    name="play-circle" 
                                    size={16} 
                                    color={deviceStatus === 'active' ? '#FFA500' : '#FFFFFF'} 
                                />
                                <Text style={[
                                    styles.controlButtonText,
                                    deviceStatus === 'active' && styles.controlButtonTextActive
                                ]}>
                                    Start Detection
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.controlButton,
                                    deviceStatus === 'deactive' && styles.controlButtonActive
                                ]}
                                onPress={handleDeactivate}
                            >
                                <Ionicons 
                                    name="stop-circle" 
                                    size={16} 
                                    color={deviceStatus === 'deactive' ? '#FFA500' : '#FFFFFF'} 
                                />
                                <Text style={[
                                    styles.controlButtonText,
                                    deviceStatus === 'deactive' && styles.controlButtonTextActive
                                ]}>
                                    Stop Detection
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Detection Controls */}
                        <View style={[styles.sectionHeader, { marginTop: 15 }]}>
                            <Ionicons name="settings" size={20} color="#FFA500" />
                            <Text style={styles.sectionTitle}>SENSITIVITY</Text>
                        </View>
                        <View style={styles.divider} />

                        <View style={styles.sliderContainer}>
                            <View style={styles.sliderHeader}>
                                <Text style={styles.controlLabel}>Sensitivity</Text>
                                <View style={styles.valueBox}>
                                    <Text style={styles.sliderValue}>{sensitivityValue}%</Text>
                                </View>
                            </View>

                            {/* Custom Detection Sensitivity Slider */}
                            <View
                                style={styles.customSliderContainer}
                                ref={sliderRef}
                                onLayout={(event) => {
                                    setSliderWidth(event.nativeEvent.layout.width);
                                }}
                                {...panResponder.panHandlers}
                            >
                                <View style={styles.sliderTrack}>
                                    <View style={[styles.sliderFill, { width: `${sensitivityValue}%` }]} />
                                    <View style={[styles.sliderThumb, { left: `${sensitivityValue}%` }]} />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Hardware Data Display - Middle Panel */}
                    <View style={styles.dataCard}>
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

                        <View style={styles.dataDisplay}>
                            {currentHardwareValue ? (
                                <View style={styles.dataActive}>
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
                                <View style={styles.dataInactive}>
                                    <Ionicons name="radio-outline" size={48} color="#8B5CF6" />
                                    <Text style={styles.inactiveText}>Hardware Monitor</Text>
                                    <Text style={styles.inactiveSubtext}>
                                        Listening on port 5001{'\n'}
                                        Waiting for mask detection data...
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Status Display - Right Panel */}
                    <View style={styles.statusCard}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="analytics" size={20} color="#FFA500" />
                            <Text style={styles.sectionTitle}>DETECTION STATUS</Text>
                        </View>
                        <View style={styles.divider} />

                        <View style={styles.statusDisplay}>
                            {deviceStatus === 'active' ? (
                                <View style={styles.statusActive}>
                                    <View style={styles.statusIndicatorContainer}>
                                        <View style={styles.activeIndicator} />
                                        <Text style={styles.statusActiveText}>Active</Text>
                                    </View>
                                    
                                    <View style={styles.configInfo}>
                                        <View style={styles.configItem}>
                                            <Ionicons name="settings" size={12} color="#FFA500" />
                                            <Text style={styles.configText}>Sensitivity: {sensitivityValue}%</Text>
                                        </View>
                                        <View style={styles.configItem}>
                                            <Ionicons name="pulse" size={12} color="#00FF00" />
                                            <Text style={styles.configText}>Status: Running</Text>
                                        </View>
                                    </View>
                                    
                                    <View style={styles.instructionBox}>
                                        <Text style={styles.instructionText}>
                                            Mask detection active
                                        </Text>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.statusInactive}>
                                    <Ionicons name="pause-circle" size={32} color="#8B5CF6" />
                                    <Text style={styles.inactiveText}>Stopped</Text>
                                    <Text style={styles.inactiveSubtext}>
                                        Press start to begin
                                    </Text>
                                    
                                    <View style={styles.readyIndicator}>
                                        <Text style={styles.readyText}>Ready</Text>
                                    </View>
                                </View>
                            )}
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
    controlsCard: {
        flex: 2,
        backgroundColor: '#6B21A8',
        borderRadius: 20,
        padding: 12,
    },
    dataCard: {
        flex: 2,
        backgroundColor: '#6B21A8',
        borderRadius: 20,
        padding: 12,
    },
    statusCard: {
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
    buttonContainer: {
        gap: 8,
        marginBottom: 15,
    },
    controlButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(139, 92, 246, 0.4)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        gap: 8,
    },
    controlButtonActive: {
        backgroundColor: '#F14AA1',
    },
    controlButtonText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
    controlButtonTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    controlLabel: {
        fontSize: 14,
        color: '#FFFFFF',
    },
    sliderContainer: {
        marginTop: 5,
    },
    sliderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
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
    dataDisplay: {
        flex: 1,
        minHeight: 0,
    },
    dataActive: {
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
    dataInactive: {
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

    // Status Display Styles
    statusDisplay: {
        flex: 1,
        minHeight: 0,
    },
    statusActive: {
        flex: 1,
        gap: 10,
        paddingVertical: 5,
    },
    statusIndicatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 8,
        backgroundColor: 'rgba(0, 255, 0, 0.1)',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 0, 0.3)',
    },
    activeIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#00FF00',
    },
    statusActiveText: {
        fontSize: 12,
        color: '#00FF00',
        fontWeight: 'bold',
    },
    configInfo: {
        gap: 6,
    },
    configItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 2,
    },
    configText: {
        fontSize: 11,
        color: '#FFFFFF',
        fontWeight: '500',
        flex: 1,
    },
    instructionBox: {
        padding: 8,
        backgroundColor: 'rgba(139, 92, 246, 0.3)',
        borderRadius: 6,
        marginTop: 5,
    },
    instructionText: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
    },
    statusInactive: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
    },
    readyIndicator: {
        backgroundColor: 'rgba(139, 92, 246, 0.3)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 8,
    },
    readyText: {
        fontSize: 10,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});

export default FaceMaskDetection;