import React, { useState, useRef, useEffect } from 'react';
import { getGlobalIP } from '../../utils/networkUtils';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, PanResponder, TouchableOpacity } from 'react-native';
import dgram from 'react-native-udp';
import { Buffer } from 'buffer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const LineFollowerControl = () => {
    const insets = useSafeAreaInsets();
    const [followingStatus, setFollowingStatus] = useState('deactive'); // 'active' or 'deactive'
    const [speedValue, setSpeedValue] = useState(50); // Speed from 0 to 100
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
        if (lowerMessage.includes('line') || lowerMessage.includes('follow')) return 'line';
        if (lowerMessage.includes('car') || lowerMessage.includes('robot')) return 'car';
        if (lowerMessage.includes('motor') || lowerMessage.includes('wheel')) return 'motor';
        if (lowerMessage.includes('sensor') || lowerMessage.includes('ir')) return 'sensor';
        if (lowerMessage.includes('speed') || lowerMessage.includes('velocity')) return 'speed';
        if (lowerMessage.includes('direction') || lowerMessage.includes('turn')) return 'direction';
        if (lowerMessage.includes('tracking') || lowerMessage.includes('track')) return 'tracking';
        if (lowerMessage.includes('path') || lowerMessage.includes('route')) return 'path';
        if (lowerMessage.includes('navigation') || lowerMessage.includes('navigate')) return 'navigation';
        if (lowerMessage.includes('control') || lowerMessage.includes('command')) return 'control';
        if (lowerMessage.includes('status')) return 'status';
        if (lowerMessage.includes('error')) return 'error';
        if (lowerMessage.includes('data')) return 'data';
        return 'general';
    };

    const getMessageTypeIcon = (type) => {
        switch (type) {
            case 'line': return 'remove';
            case 'car': return 'car';
            case 'motor': return 'settings';
            case 'sensor': return 'hardware-chip';
            case 'speed': return 'speedometer';
            case 'direction': return 'compass';
            case 'tracking': return 'locate';
            case 'path': return 'trail-sign';
            case 'navigation': return 'navigate';
            case 'control': return 'game-controller';
            case 'status': return 'information-circle';
            case 'error': return 'alert-circle';
            case 'data': return 'analytics';
            default: return 'radio';
        }
    };

    const getMessageTypeColor = (type) => {
        switch (type) {
            case 'line': return '#00FF00';
            case 'car': return '#FFA500';
            case 'motor': return '#FF69B4';
            case 'sensor': return '#87CEEB';
            case 'speed': return '#FFD700';
            case 'direction': return '#32CD32';
            case 'tracking': return '#9370DB';
            case 'path': return '#00BFFF';
            case 'navigation': return '#FF6347';
            case 'control': return '#00CED1';
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
    const sendCarCommand = (command, speedLevel) => {
        const now = Date.now();
        if (now - lastSentTime.current < 50) return; // Throttle commands
        lastSentTime.current = now;

        const client = dgram.createSocket('udp4');
        client.on('error', (err) => {
            console.error('UDP Socket Error:', err);
            client.close();
        });

        client.bind(0, () => {
            const commandString = `${command},${speedLevel}`;
            const message = Buffer.from(commandString, 'utf8');
            // Send to hardware on port 5000
            client.send(message, 0, message.length, 5000, getGlobalIP(), (error) => {
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
        setFollowingStatus('active');
        // Send LINE_FOLLOW command with current speed value
        sendCarCommand('LINE_FOLLOW', speedValue);
    };

    const handleStop = () => {
        setFollowingStatus('deactive');
        // Send STOP_FOLLOW command with current speed value
        sendCarCommand('STOP_FOLLOW', speedValue);
    };

    const sendSpeedCommand = (speed) => {
        const now = Date.now();
        if (now - lastSentTime.current < 50) return;
        lastSentTime.current = now;

        const client = dgram.createSocket('udp4');
        client.on('error', (err) => {
            console.error('UDP Socket Error:', err);
            client.close();
        });

        client.bind(0, () => {
            // Send speed update if line following is active
            if (followingStatus === 'active') {
                const commandString = `SET_SPEED,${speed}`;
                const message = Buffer.from(commandString, 'utf8');
                // Send to hardware on port 5000
                client.send(message, 0, message.length, 5000, getGlobalIP(), (error) => {
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
        setSpeedValue(newValue);
        sendSpeedCommand(newValue);
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
                        {/* Line Following Controls */}
                        <View style={styles.sectionHeader}>
                            <Ionicons name="car" size={20} color="#FFA500" />
                            <Text style={styles.sectionTitle}>LINE FOLLOWER</Text>
                        </View>
                        <View style={styles.divider} />

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.controlButton,
                                    followingStatus === 'active' && styles.controlButtonActive
                                ]}
                                onPress={handleStart}
                            >
                                <Ionicons 
                                    name="play-circle" 
                                    size={16} 
                                    color={followingStatus === 'active' ? '#FFA500' : '#FFFFFF'} 
                                />
                                <Text style={[
                                    styles.controlButtonText,
                                    followingStatus === 'active' && styles.controlButtonTextActive
                                ]}>
                                    Start Following
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.controlButton,
                                    followingStatus === 'deactive' && styles.controlButtonActive
                                ]}
                                onPress={handleStop}
                            >
                                <Ionicons 
                                    name="stop-circle" 
                                    size={16} 
                                    color={followingStatus === 'deactive' ? '#FFA500' : '#FFFFFF'} 
                                />
                                <Text style={[
                                    styles.controlButtonText,
                                    followingStatus === 'deactive' && styles.controlButtonTextActive
                                ]}>
                                    Stop Following
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Speed Controls */}
                        <View style={[styles.sectionHeader, { marginTop: 15 }]}>
                            <Ionicons name="speedometer" size={20} color="#FFA500" />
                            <Text style={styles.sectionTitle}>SPEED</Text>
                        </View>
                        <View style={styles.divider} />

                        <View style={styles.sliderContainer}>
                            <View style={styles.sliderHeader}>
                                <Text style={styles.controlLabel}>Speed</Text>
                                <View style={styles.valueBox}>
                                    <Text style={styles.sliderValue}>{speedValue}%</Text>
                                </View>
                            </View>

                            {/* Custom Speed Slider */}
                            <View
                                style={styles.customSliderContainer}
                                ref={sliderRef}
                                onLayout={(event) => {
                                    setSliderWidth(event.nativeEvent.layout.width);
                                }}
                                {...panResponder.panHandlers}
                            >
                                <View style={styles.sliderTrack}>
                                    <View style={[styles.sliderFill, { width: `${speedValue}%` }]} />
                                    <View style={[styles.sliderThumb, { left: `${speedValue}%` }]} />
                                </View>
                            </View>
                        </View>
                    </View>



                    {/* Status Display - Right Panel */}
                    <View style={styles.statusCard}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="analytics" size={20} color="#FFA500" />
                            <Text style={styles.sectionTitle}>FOLLOWING STATUS</Text>
                        </View>
                        <View style={styles.divider} />

                        <View style={styles.statusDisplay}>
                            {followingStatus === 'active' ? (
                                <View style={styles.statusActive}>
                                    <View style={styles.statusIndicatorContainer}>
                                        <View style={styles.activeIndicator} />
                                        <Text style={styles.statusActiveText}>Active</Text>
                                    </View>
                                    
                                    <View style={styles.configInfo}>
                                        <View style={styles.configItem}>
                                            <Ionicons name="speedometer" size={12} color="#FFA500" />
                                            <Text style={styles.configText}>Speed: {speedValue}%</Text>
                                        </View>
                                        <View style={styles.configItem}>
                                            <Ionicons name="pulse" size={12} color="#00FF00" />
                                            <Text style={styles.configText}>Status: Following</Text>
                                        </View>
                                    </View>
                                    
                                    <View style={styles.instructionBox}>
                                        <Text style={styles.instructionText}>
                                            Line following active
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
        flex: 1,
        backgroundColor: '#6B21A8',
        borderRadius: 20,
        padding: 12,
    },
    statusCard: {
        flex: 1,
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

export default LineFollowerControl;