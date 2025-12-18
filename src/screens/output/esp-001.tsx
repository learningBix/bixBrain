import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, PanResponder } from 'react-native';
import { Button, Surface } from 'react-native-paper';
import dgram from 'react-native-udp';
import { Buffer } from 'buffer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getGlobalIP } from '../../utils/networkUtils';

const UDP_PORT = 8888;
// Use global IP address
const ESP32_HOST = getGlobalIP(); // Updated to use global IP

const PortControlScreen = () => {
    const insets = useSafeAreaInsets();
    const [port1Enabled, setPort1Enabled] = useState(false);
    const [port2Enabled, setPort2Enabled] = useState(false);
    const [sliderValue, setSliderValue] = useState(0);
    const sliderRef = useRef(null);
    const [sliderWidth, setSliderWidth] = useState(0);
    const socketRef = useRef(null);

    // Initialize UDP socket
    // Updated socket initialization in useEffect
    useEffect(() => {
        const socket = dgram.createSocket({ type: 'udp4' });

        // Add explicit error handling
        socket.on('error', (err) => {
            console.error('Socket error:', err.message, err.stack);
        });

        // Fix: Use proper binding syntax
        socket.bind(UDP_PORT, '0.0.0.0', () => {
            const addr = socket.address();
            console.log(`Successfully bound to: ${addr.address}:${addr.port}`);
            socketRef.current = socket;
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.close(() => {
                    console.log('Socket properly closed');
                });
            }
        };
    }, []);
    // Updated toggle handlers for ports
    const handlePort1Toggle = () => {
        const newState = !port1Enabled;
        setPort1Enabled(newState);
        // Send RELAY command (0xA3) with 1/0 value
        sendUDPCommand(0xA3, newState ? 1 : 0);
    };

    const handlePort2Toggle = () => {
        const newState = !port2Enabled;
        setPort2Enabled(newState);
        // Send BUZZER command (0xA4) with 1/0 value
        sendUDPCommand(0xA4, newState ? 1 : 0);
    };

    // UDP sending function remains the same
    const sendUDPCommand = (commandByte, value) => {
        if (!socketRef.current) {
            console.error('Socket not initialized');
            return;
        }

        const message = Buffer.from([commandByte, value]);
        socketRef.current.send(message, 0, message.length, UDP_PORT, ESP32_HOST, (err) => {
            if (err) console.error('UDP Send Error:', err);
        });
    };
    const updateSliderValue = (xPosition) => {
        const relativeX = Math.max(0, Math.min(xPosition, sliderWidth));
        const newValue = Math.round((relativeX / sliderWidth) * 180);
        setSliderValue(newValue);
        sendUDPCommand(0xA1, newValue);
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

    // Design theme colors
    const designTheme = {
        background: '#372659',
        cardLeftBg: '#F52C82',
        cardRightBg: '#4A2266',
        textHeading: '#FFFFFF',
        textBody: '#FCE4F2',
        buttonActive: '#FF78B7',
        buttonInactive: '#EAA2D6',
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: designTheme.background, paddingTop: insets.top }]}>
            <View style={styles.container}>
                <View style={styles.row}>
                    {/* Left Card: "Port Controls" */}
                    <Surface style={[styles.leftCard, { backgroundColor: designTheme.cardLeftBg }]}>
                        <Text style={[styles.cardTitle, { color: designTheme.textHeading }]}>
                            Port Controls
                        </Text>
                        <View style={styles.portSection}>
                            <Text style={styles.portLabel}>Port 1</Text>
                            <View style={styles.portControls}>
                                <Button
                                    mode="contained"
                                    onPress={handlePort1Toggle}
                                    style={[
                                        styles.portButton,
                                        { backgroundColor: port1Enabled ? designTheme.buttonActive : designTheme.buttonInactive }
                                    ]}
                                    labelStyle={styles.buttonLabel}
                                >
                                    {port1Enabled ? 'On' : 'Off'}
                                </Button>
                                <Icon
                                    name={port1Enabled ? 'power-plug' : 'power-plug-off'}
                                    size={24}
                                    color={designTheme.textHeading}
                                />
                            </View>
                        </View>

                        <View style={styles.portSection}>
                            <Text style={styles.portLabel}>Port 2</Text>
                            <View style={styles.portControls}>
                                <Button
                                    mode="contained"
                                    onPress={handlePort2Toggle}
                                    style={[
                                        styles.portButton,
                                        { backgroundColor: port2Enabled ? designTheme.buttonActive : designTheme.buttonInactive }
                                    ]}
                                    labelStyle={styles.buttonLabel}
                                >
                                    {port2Enabled ? 'On' : 'Off'}
                                </Button>
                                <Icon
                                    name={port2Enabled ? 'power-plug' : 'power-plug-off'}
                                    size={24}
                                    color={designTheme.textHeading}
                                />
                            </View>
                        </View>
                    </Surface>

                    {/* Right Card: "Servo Control" */}
                    <Surface style={[styles.rightCard, { backgroundColor: designTheme.cardRightBg }]}>
                        <Text style={[styles.cardTitle, { color: designTheme.textHeading }]}>
                            Servo Control
                        </Text>

                        <View style={styles.sliderContainer}>
                            <View style={styles.sliderHeader}>
                                <Text style={styles.sliderLabel}>Servo Angle</Text>
                                <View style={styles.valueBox}>
                                    <Text style={styles.sliderValue}>{sliderValue}°</Text>
                                </View>
                            </View>

                            {/* Custom Slider Implementation */}
                            <View
                                style={styles.customSliderContainer}
                                ref={sliderRef}
                                onLayout={(event) => {
                                    setSliderWidth(event.nativeEvent.layout.width);
                                }}
                                {...panResponder.panHandlers}
                            >
                                <View style={styles.sliderTrack}>
                                    <View style={[styles.sliderFill, { width: `${(sliderValue / 180) * 100}%` }]} />
                                    <View style={[styles.sliderThumb, { left: `${(sliderValue / 180) * 100}%` }]} />
                                </View>
                            </View>
                        </View>

                        {/* Preset buttons */}
                        
                    </Surface>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { flex: 1, padding: 16 },
    row: { flexDirection: 'row', flex: 1, gap: 16 },
    leftCard: { flex: 1, borderRadius: 24, marginRight: 8, padding: 20 },
    rightCard: { width: 280, borderRadius: 24, padding: 20 },
    cardTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    portSection: { marginBottom: 24 },
    portLabel: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
    portControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
    portButton: { borderRadius: 16, paddingHorizontal: 20 },
    buttonLabel: { fontSize: 16, fontWeight: 'bold' },
    sliderContainer: { marginTop: 20 },
    sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sliderLabel: { fontSize: 16, color: '#FCE4F2' },
    valueBox: { backgroundColor: '#6A4A89', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
    sliderValue: { color: '#FFFFFF', fontWeight: 'bold' },
    customSliderContainer: { height: 40, justifyContent: 'center' },
    sliderTrack: { height: 8, backgroundColor: '#B69ACF', borderRadius: 4, position: 'relative' },
    sliderFill: { position: 'absolute', height: 8, backgroundColor: '#FFD1EB', borderRadius: 4, left: 0 },
    sliderThumb: { position: 'absolute', width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF', top: -8 },
    presetContainer: { marginTop: 24 },
    presetTitle: { fontSize: 16, color: '#FCE4F2', marginBottom: 8 },
    presetButtons: { flexDirection: 'row', justifyContent: 'space-between' },
    presetButton: { flex: 1, marginHorizontal: 4, backgroundColor: '#FF78B7' },
    presetButtonLabel: { fontSize: 14, fontWeight: 'bold' }
});

export default PortControlScreen;