import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, PanResponder, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import dgram from 'react-native-udp';
import { Buffer } from 'buffer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getGlobalIP } from '../../utils/networkUtils';

const { width, height } = Dimensions.get('window');

const FaceTrackerControl = () => {
    const insets = useSafeAreaInsets();
    const [deviceStatus, setDeviceStatus] = useState('deactive'); // 'active' or 'deactive'
    const [speedValue, setSpeedValue] = useState(127); // Speed from 0 to 255 (default to middle)
    const lastSentTime = useRef(0);
    const sliderRef = useRef(null);
    const [sliderWidth, setSliderWidth] = useState(0);

    // UDP Command sending function with optional sensitivity
    const sendTrackingCommand = (command, sensitivityValue = null) => {
        const now = Date.now();
        if (now - lastSentTime.current < 50) return; // Throttle commands
        lastSentTime.current = now;

        const client = dgram.createSocket('udp4');
        client.on('error', (err) => {
            console.error('UDP Socket Error:', err);
            client.close();
        });

        client.bind(0, () => {
            // Only append sensitivity if provided
            const commandString = sensitivityValue !== null ? `${command},${sensitivityValue}` : command;
            const message = Buffer.from(commandString, 'utf8');
            client.send(message, 0, message.length, 5000, getGlobalIP(), (error) => {
                if (error) {
                    console.error('UDP Send Error:', error);
                } else {
                    console.log(`Sent: ${commandString}`);
                }
                client.close();
            });
        });
    };

    const handleActivate = () => {
        setDeviceStatus('active');
        // Send FACE_TRACK command with current sensitivity value
        sendTrackingCommand('FACE_TRACK', speedValue);
    };

    const handleDeactivate = () => {
        setDeviceStatus('deactive');
        // Send STOP_FACE_TRACK command without sensitivity value
        sendTrackingCommand('STOP_FACE_TRACK');
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
            // Send sensitivity update if tracking is active
            if (deviceStatus === 'active') {
                const commandString = `SENSITIVITY_UPDATE,${speed}`;
                const message = Buffer.from(commandString, 'utf8');
                client.send(message, 0, message.length, 5000, getGlobalIP(), (error) => {
                    if (error) {
                        console.error('UDP Send Error:', error);
                    } else {
                        console.log(`Sent: ${commandString}`);
                    }
                    client.close();
                });
            }
        });
    };

    const updateSliderValue = (xPosition) => {
        const relativeX = Math.max(0, Math.min(xPosition, sliderWidth));
        const newValue = Math.round((relativeX / sliderWidth) * 255); // Changed to 255
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

    return (
        <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.contentWrapper}>
                <View style={styles.content}>
                    {/* Controls Card - Left Panel (moved from right) */}
                    <View style={styles.controlsCard}>
                        {/* Face Tracker Controls */}
                        <View style={styles.sectionHeader}>
                            <Ionicons name="face-man" size={20} color="#FFA500" />
                            <Text style={styles.sectionTitle}>FACE TRACKER</Text>
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
                                    Start Tracking
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
                                    Stop Tracking
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Tracking Controls */}
                        <View style={[styles.sectionHeader, { marginTop: 15 }]}>
                            <Ionicons name="speedometer" size={20} color="#FFA500" />
                            <Text style={styles.sectionTitle}>TRACKING SENSITIVITY</Text>
                        </View>
                        <View style={styles.divider} />

                        <View style={styles.sliderContainer}>
                            <View style={styles.sliderHeader}>
                                <Text style={styles.controlLabel}>Sensitivity</Text>
                                <View style={styles.valueBox}>
                                    <Text style={styles.sliderValue}>{speedValue}</Text>
                                </View>
                            </View>

                            {/* Custom Sensitivity Slider */}
                            <View
                                style={styles.customSliderContainer}
                                ref={sliderRef}
                                onLayout={(event) => {
                                    setSliderWidth(event.nativeEvent.layout.width);
                                }}
                                {...panResponder.panHandlers}
                            >
                                <View style={styles.sliderTrack}>
                                    <View style={[styles.sliderFill, { width: `${(speedValue / 255) * 100}%` }]} />
                                    <View style={[styles.sliderThumb, { left: `${(speedValue / 255) * 100}%` }]} />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Camera Card - Right Panel (moved from left) */}
                    <View style={styles.cameraCard}>
                        {deviceStatus === 'active' ? (
                            <View style={styles.webviewWrapper}>
                                <WebView
                                    source={{ uri: `http://${getGlobalIP()}:81/stream?time=${Date.now()}` }}
                                    style={styles.webview}
                                    allowsFullscreenVideo={false}
                                    scrollEnabled={false}
                                    originWhitelist={['*']}
                                    mixedContentMode="always"
                                    javaScriptEnabled={true}
                                    domStorageEnabled={true}
                                />
                            </View>
                        ) : (
                            <View style={styles.cameraOff}>
                                <Text style={styles.cameraOffText}>Face Tracking Camera</Text>
                            </View>
                        )}
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
        gap: 16,
    },
    controlsCard: {
        flex: 2,
        backgroundColor: '#6B21A8',
        borderRadius: 20,
        padding: 12,
    },
    cameraCard: {
        flex: 3,
        backgroundColor: '#2A0C4E',
        borderRadius: 20,
        minHeight: 300,
    },
    webviewWrapper: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    webview: {
        flex: 1,
        backgroundColor: 'black',
    },
    cameraOff: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
    },
    cameraOffText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#5C2E91',
        fontFamily: 'Roboto-Bold',
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
});

export default FaceTrackerControl;