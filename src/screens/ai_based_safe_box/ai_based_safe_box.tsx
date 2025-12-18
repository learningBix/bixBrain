import React, { useState, useRef } from 'react';
import { getGlobalIP } from '../../utils/networkUtils';
import { View, Text, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import { Switch } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import dgram from 'react-native-udp';
import { Buffer } from 'buffer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const safebox: React.FC = () => {
    const insets = useSafeAreaInsets();
    const [toggleEnabled, setToggleEnabled] = useState(false);
    const [sliderValue, setSliderValue] = useState(180);
    const lastSentTime = useRef<number>(0); 

    const handleToggle = () => setToggleEnabled((prev) => !prev);

    const sendServoCommand = (angle: number) => {
        const now = Date.now();

        if (now - lastSentTime.current < 50) {

            return;
        }

        lastSentTime.current = now; // Update last sent time

        const client = dgram.createSocket('udp4');

        client.on('error', (err) => {
            console.error('UDP Socket Error:', err);
            client.close();
        });

        client.bind(0, () => {
            const message = Buffer.from([0xC3, angle]);
            client.send(message, 0, message.length, 8888, getGlobalIP(), (error) => {
                if (error) {
                    console.error('UDP Send Error:', error);
                }
                client.close();
            });
        });
    };

    const handleSliderChange = (value: number) => {
        setSliderValue(value);
        sendServoCommand(Math.round(value)); // Send immediately with rate limit
    };
    return (
        <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.content}>
                <View style={styles.cameraCard}>
                    {toggleEnabled ? (
                        <WebView
                            source={{ uri: `http://${getGlobalIP()}:81/stream` }}
                            style={styles.webview}
                            allowsFullscreenVideo={false}
                            scrollEnabled={false}
                        />
                    ) : (
                        <View style={styles.cameraOff}>
                            <Ionicons name="videocam-off" size={32} color="#616161" />
                            <Text style={styles.cameraOffText}>Camera Feed Disabled</Text>
                        </View>
                    )}
                </View>

                <View style={styles.controlsCard}>
                    <View style={styles.controlGroup}>
                        <View style={styles.controlHeader}>
                            <Ionicons name="power" size={20} color="#424242" />
                            <Text style={styles.controlTitle}>Stream Controls</Text>
                        </View>
                        <View style={styles.toggleContainer}>
                            <Text style={styles.controlLabel}>Toggle</Text>
                            <Switch
                                value={toggleEnabled}
                                onValueChange={handleToggle}
                                color="#4CAF50"
                                trackColor={{ false: '#BDBDBD', true: '#E8F5E9' }}
                            />
                        </View>
                    </View>

                    <View style={styles.controlGroup}>
                        <View style={styles.controlHeader}>
                            <Ionicons name="settings" size={20} color="#424242" />
                            <Text style={styles.controlTitle}>Servo Control</Text>
                        </View>
                        <View style={styles.sliderContainer}>
                            <View style={styles.sliderHeader}>
                                <Text style={styles.controlLabel}>set time </Text>
                                <View style={styles.valueBadge}>
                                    <Text style={styles.valueText}>{sliderValue.toFixed(0)} sec</Text>
                                </View>
                            </View>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={180}
                                step={1}
                                value={sliderValue}
                                onValueChange={handleSliderChange} 
                                minimumTrackTintColor="#4CAF50"
                                maximumTrackTintColor="#E0E0E0"
                                thumbTintColor="#4CAF50"
                            />

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
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#212121',
        letterSpacing: 0.5,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 16,
        marginLeft:16
    },
    statusText: {
        fontSize: 14,
        color: '#616161',
    },
    content: {
        flex: 1,
        flexDirection: width > 600 ? 'row' : 'column',
        padding: 16,
        gap: 16,
    },
    cameraCard: {
        flex: 3,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
       
        // shadowOffset: { width: 0, height: 4 },
        // shadowOpacity: 0.05,
        // shadowRadius: 8,
        elevation: 2,
        // overflow: 'hidden',
    },
    webview: {
        flex: 1,
        backgroundColor: '#000',
    },
    cameraOff: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        gap: 8,
    },
    cameraOffText: {
        fontSize: 16,
        color: '#9E9E9E',
    },
    controlsCard: {
        flex: 2,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 4 },
        // shadowOpacity: 0.05,
        // shadowRadius: 8,
        // elevation: 2,
        gap: 24,
    },
    controlGroup: {
        gap: 16,
    },
    controlHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    controlTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#424242',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    controlLabel: {
        fontSize: 14,
        color: '#616161',
    },
    sliderContainer: {
        gap: 12,
    },
    sliderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    valueBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    valueText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2E7D32',
    },
    slider: {
        height: 40,
    },
    thumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    track: {
        height: 6,
        borderRadius: 3,
    },
    sliderScale: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    scaleText: {
        fontSize: 12,
        color: '#9E9E9E',
    },
});

export default safebox;

