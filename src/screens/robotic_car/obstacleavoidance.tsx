import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import { WebView } from 'react-native-webview';
import dgram from 'react-native-udp';
import { Buffer } from 'buffer';

const { width, height } = Dimensions.get('window');

const ESP32_IP = 'esptest.local';
const ESP32_PORT = 8888;
const STREAM_URL = 'http://esptest.local:81/stream';

export default function RoboticCarController() {
    const [isOn, setIsOn] = useState(false);
    const [sliderValue, setSliderValue] = useState(0.5);
    const [turningDistance, setTurningDistance] = useState(0.5);
    const lastSentTime = useRef(0);

    // Generic UDP command sender with optional header override
    const sendUDPCommand = (value1, value2, headerOverride = null) => {
        const now = Date.now();
        if (now - lastSentTime.current < 50) return;
        lastSentTime.current = now;

        const client = dgram.createSocket('udp4');
        // Scale slider values to percentage (0–100) before rounding
        const v1 = Math.round(value1 * 100);
        const v2 = Math.round(value2 * 100);
        const header = headerOverride !== null ? headerOverride : (v1 === 0 && v2 === 0 ? 0xC0 : 0xE1);
        const message = Buffer.from([header, v1, v2]);

        client.on('error', err => {
            console.error('UDP Socket Error:', err);
            client.close();
        });

        client.bind(0, () => {
            client.send(message, 0, message.length, ESP32_PORT, ESP32_IP, err => {
                if (err) console.error('Send Error:', err);
                client.close();
            });
        });

        console.log(`📡 Sent UDP: 0x${header.toString(16).toUpperCase()} ${v1} ${v2}`);
    };

    // Toggle stream and send corresponding UDP command
    const handleTogglePress = () => {
        const newState = !isOn;
        setIsOn(newState);
        if (newState) {
            console.log('Play pressed: sending header 0xC8');
            sendUDPCommand(sliderValue, turningDistance, 0xC8);
        } else {
            console.log('Stop pressed: sending header 0xC0');
            sendUDPCommand(sliderValue, turningDistance, 0xC0);
        }
    };

    // Send override command on Set
    const handleSetPress = () => {
        console.log('Set pressed: sending header 0xC8');
        sendUDPCommand(sliderValue, turningDistance, 0xC7);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.mainContent}>

                    {/* Stream Panel */}
                    <View style={styles.streamContainer}>
                        <View style={styles.streamPanelOuter}>
                        
                                {isOn ? (
                                    <WebView
                                        source={{ uri: STREAM_URL }}
                                        style={styles.streamView}
                                        onError={error => console.error('WebView Error:', error)}
                                    />
                                ) : (
                                    <View style={styles.streamPlaceholder}>
                                        <Text style={styles.streamText}>Stream is OFF</Text>
                                    </View>
                                )}
                            
                        </View>
                    </View>

                    {/* Controls Panel */}
                    <View style={styles.controlsPanel}>

                        {/* Distance Slider */}
                        <View style={styles.sliderContainer}>
                            <View style={styles.sliderLabelContainer}>
                                <View style={styles.labelWrapper}>
                                    <Icon name="speedometer-outline" size={20} color="white" />
                                    <Text style={styles.sliderLabel}>Distance</Text>
                                </View>
                                <View style={styles.valueContainer}>
                                    <Text style={styles.valueText}>{Math.round(sliderValue * 100)} cm</Text>
                                </View>
                            </View>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={1}
                                value={sliderValue}
                                onValueChange={setSliderValue}
                                minimumTrackTintColor="#FFD700"
                                maximumTrackTintColor="#FFFACD"
                                thumbTintColor="#FFFF00"
                            />
                        </View>

                        {/* Turning Distance Slider */}
                        <View style={styles.sliderContainer}>
                            <View style={styles.sliderLabelContainer}>
                                <View style={styles.labelWrapper}>
                                    <Icon name="git-branch-outline" size={20} color="white" />
                                    <Text style={styles.sliderLabel}>Turning Distance</Text>
                                </View>
                                <View style={styles.valueContainer}>
                                    <Text style={styles.valueText}>{Math.round(turningDistance * 100)} ms</Text>
                                </View>
                            </View>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={1}
                                value={turningDistance}
                                onValueChange={setTurningDistance}
                                minimumTrackTintColor="#52CADE"
                                maximumTrackTintColor="#FFFACD"
                                thumbTintColor="#52CADE"
                            />
                        </View>

                        {/* Buttons */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.playButton, { backgroundColor: isOn ? '#E84B8A' : '#52CADE' }]}
                                onPress={handleTogglePress}
                            >
                                <Text style={styles.buttonText}>{isOn ? 'Stop' : 'Play'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.stopButton}
                                onPress={handleSetPress}
                            >
                                <Text style={styles.buttonText}>Set</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#4A237A' },
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    mainContent: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center' },
    streamContainer: { flex: 6, alignItems: 'center' },
    streamPanelOuter: {  width: '95%', 
        height: height * 0.65, backgroundColor: '#E84B8A', borderRadius: 25, padding: 15, elevation: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.38, shadowRadius: 16 },
    streamPanelInner: { flex: 1, backgroundColor: 'white', borderRadius: 15, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
    streamView: {  flex: 1,  // Add this
        width: '100%', 
        height: '100%'  },
    streamPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    streamText: { fontSize: 32, fontWeight: 'bold', color: '#193498' },
    controlsPanel: { flex: 4, backgroundColor: '#6D55B0', borderRadius: 30, padding: 20, justifyContent: 'space-between', marginLeft: 20 },
    sliderContainer: { marginVertical: 10 },
    sliderLabelContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
    labelWrapper: { flexDirection: 'row', alignItems: 'center' },
    sliderLabel: { color: 'white', fontSize: 18, fontWeight: '600', marginLeft: 8 },
    valueContainer: { backgroundColor: '#E84B8A', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
    valueText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    slider: { width: '100%', height: 40 },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    playButton: { flex: 1, paddingVertical: 15, borderRadius: 30, alignItems: 'center', marginRight: 10 },
    stopButton: { flex: 1, backgroundColor: '#FFD700', paddingVertical: 15, borderRadius: 30, alignItems: 'center' },
    buttonText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
});
