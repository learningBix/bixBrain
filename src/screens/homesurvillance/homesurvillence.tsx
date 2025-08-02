import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity, PanResponder } from 'react-native';
import { WebView } from 'react-native-webview';
import dgram from 'react-native-udp';
import { Buffer } from 'buffer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');


const CustomSlider = ({
  value = 50,
  onValueChange,
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  label = "Value",
  showValueBox = true,
  trackColor = '#4C1D95',
  fillColor = '#F14AA1',
  thumbColor = '#FFFFFF',
  thumbBorderColor = '#F14AA1',
  trackBorderColor = '#8B5CF6',
  labelColor = '#FFFFFF',
  valueBoxColor = '#FF69B4',
  containerStyle,
  trackStyle,
  thumbStyle,
}) => {
  const [sliderWidth, setSliderWidth] = useState(0);
  const sliderRef = useRef(null);
  const lastUpdateTime = useRef(0);

  const updateSliderValue = (xPosition) => {
    const now = Date.now();
    if (now - lastUpdateTime.current < 16) return; // Throttle to ~60fps
    lastUpdateTime.current = now;

    const relativeX = Math.max(0, Math.min(xPosition, sliderWidth));
    const percentage = relativeX / sliderWidth;
    const range = maximumValue - minimumValue;
    const rawValue = minimumValue + (percentage * range);
    const steppedValue = Math.round(rawValue / step) * step;
    const clampedValue = Math.max(minimumValue, Math.min(maximumValue, steppedValue));
    
    if (onValueChange && clampedValue !== value) {
      onValueChange(clampedValue);
    }
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

  const percentage = ((value - minimumValue) / (maximumValue - minimumValue)) * 100;

  return (
    <View style={[styles.sliderContainer, containerStyle]}>
      {(label || showValueBox) && (
        <View style={styles.sliderHeader}>
          {label && (
            <Text style={[styles.controlLabel, { color: labelColor }]}>
              {label}
            </Text>
          )}
          {showValueBox && (
            <View style={[styles.valueBox, { backgroundColor: valueBoxColor }]}>
              <Text style={styles.sliderValue}>
                {Math.round(value)}
              </Text>
            </View>
          )}
        </View>
      )}

      <View
        style={styles.customSliderContainer}
        ref={sliderRef}
        onLayout={(event) => {
          setSliderWidth(event.nativeEvent.layout.width);
        }}
        {...panResponder.panHandlers}
      >
        <View style={[
          styles.sliderTrack,
          { 
            backgroundColor: trackColor,
            borderColor: trackBorderColor 
          },
          trackStyle
        ]}>
          <View style={[
            styles.sliderFill, 
            { 
              width: `${percentage}%`,
              backgroundColor: fillColor 
            }
          ]} />
          <View style={[
            styles.sliderThumb, 
            { 
              left: `${percentage}%`,
              backgroundColor: thumbColor,
              borderColor: thumbBorderColor 
            },
            thumbStyle
          ]} />
        </View>
      </View>
    </View>
  );
};

const HomeScreenSurveillance = () => {
  const insets = useSafeAreaInsets();
  const [sliderValue, setSliderValue] = useState(90); // Default to 90 degrees
  const lastSentTime = useRef(0);
  const [isMoving, setIsMoving] = useState(false);
  const moveTimeoutRef = useRef(null);

  const sendServoCommand = (angle) => {
    const now = Date.now();
    if (now - lastSentTime.current < 50) return;
    lastSentTime.current = now;

    const client = dgram.createSocket('udp4');
    client.on('error', (err) => {
      console.error('UDP Socket Error:', err);
      client.close();
    });

    client.bind(0, () => {
      const message = Buffer.from([0xC3, angle]);
      client.send(message, 0, message.length, 8888, 'esptest.local', (error) => {
        if (error) {
          console.error('UDP Send Error:', error);
        } else {
          console.log(`Sent servo command: angle=${angle}`);
        }
        client.close();
      });
    });
  };

  const sendFreeRunCommand = (command) => {
    const client = dgram.createSocket('udp4');
    client.on('error', (err) => {
      console.error('UDP Socket Error:', err);
      client.close();
    });

    client.bind(0, () => {
      const commandString = command;
      const message = Buffer.from(commandString, 'utf8');
      
      // Send to the same address as your object detection (you can change this if needed)
      client.send(message, 0, message.length, 5000, '192.168.0.184', (error) => {
        if (error) {
          console.error('UDP Send Error:', error);
        } else {
          console.log(`Sent FREE_RUN command: ${command}`);
        }
        client.close();
      });
    });
  };

  const handleSliderChange = (value) => {
    setSliderValue(value);
    sendServoCommand(Math.round(value));
  };

  const handleDirectionalPress = (direction) => {

    if (moveTimeoutRef.current) {
      clearTimeout(moveTimeoutRef.current);
    }

    setIsMoving(true);


    const commands = {
      forward: 'FREE_RUN_FORWARD',
      backward: 'FREE_RUN_BACKWARD',
      left: 'FREE_RUN_LEFT',
      right: 'FREE_RUN_RIGHT'
    };

    sendFreeRunCommand(commands[direction]);


    moveTimeoutRef.current = setTimeout(() => {
      handleDirectionalRelease();
    }, 2000);
  };

  const handleDirectionalRelease = () => {

    if (moveTimeoutRef.current) {
      clearTimeout(moveTimeoutRef.current);
      moveTimeoutRef.current = null;
    }

    setIsMoving(false);
    sendFreeRunCommand('FREE_RUN_STOP');
  };

  const ControlButton = ({ direction, icon, style }) => (
    <TouchableOpacity
      style={[styles.controlButton, style]}
      onPressIn={() => handleDirectionalPress(direction)}
      onPressOut={handleDirectionalRelease}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={28} color="#FFFFFF" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.contentWrapper}>
        <View style={styles.content}>
          {/* Camera Card - Top Panel */}
          {/* You can uncomment this section if you want to add the camera back */}
          {/*
          <View style={styles.cameraCard}>
            <View style={styles.webviewWrapper}>
              <WebView
                source={{ uri: 'http://192.168.0.184:8080' }}
                style={styles.webview}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scalesPageToFit={true}
                mixedContentMode="compatibility"
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.error('WebView error: ', nativeEvent);
                }}
                renderError={() => (
                  <View style={styles.cameraOff}>
                    <Text style={styles.cameraOffText}>CAMERA OFF</Text>
                  </View>
                )}
              />
            </View>
          </View>
          */}

          {/* Bottom Controls Container */}
          <View style={styles.bottomControls}>
            {/* Left/Right Controls - Left Panel */}
            <View style={styles.controlsCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="swap-horizontal" size={20} color="#FFA500" />
                <Text style={styles.sectionTitle}>LEFT/RIGHT</Text>
              </View>
              <View style={styles.divider} />

              <View style={styles.horizontalControlsContainer}>
                <ControlButton
                  direction="left"
                  icon="chevron-back"
                  style={styles.horizontalButton}
                />
                <ControlButton
                  direction="right"
                  icon="chevron-forward"
                  style={styles.horizontalButton}
                />
              </View>
              
              {/* Active Movement Indicator */}
              {isMoving && (
                <View style={styles.activeIndicatorContainer}>
                  <View style={styles.activeIndicator}>
                    <Ionicons name="radio-button-on" size={20} color="#00FF00" />
                    <Text style={styles.activeText}>MOVING</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Slider Card - Middle Panel */}
            <View style={styles.sliderCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="settings" size={20} color="#FFA500" />
                <Text style={styles.sectionTitle}>SPEED</Text>
              </View>
              <View style={styles.divider} />

              <View style={styles.sliderWrapper}>
                <CustomSlider
                  value={sliderValue}
                  onValueChange={handleSliderChange}
                  minimumValue={0}
                  maximumValue={180}
                  step={1}
                  label="Speed"
                  showValueBox={true}
                  trackColor="#4C1D95"
                  fillColor="#F14AA1"
                  thumbColor="#FFFFFF"
                  thumbBorderColor="#F14AA1"
                  trackBorderColor="#8B5CF6"
                  labelColor="#FFFFFF"
                  valueBoxColor="#FF69B4"
                />
              </View>
            </View>

            {/* Forward/Backward Controls - Right Panel */}
            <View style={styles.controlsCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="swap-vertical" size={20} color="#FFA500" />
                <Text style={styles.sectionTitle}>FORWARD/BACK</Text>
              </View>
              <View style={styles.divider} />

              <View style={styles.verticalControlsContainer}>
                <ControlButton
                  direction="forward"
                  icon="chevron-up"
                  style={styles.verticalButton}
                />
                <ControlButton
                  direction="backward"
                  icon="chevron-down"
                  style={styles.verticalButton}
                />
              </View>
              
              {/* Active Movement Indicator */}
              {isMoving && (
                <View style={styles.activeIndicatorContainer}>
                  <View style={styles.activeIndicator}>
                    <Ionicons name="radio-button-on" size={20} color="#00FF00" />
                    <Text style={styles.activeText}>MOVING</Text>
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
    backgroundColor: '#3F1D68',
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    padding: 16,
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    gap: 16,
  },
  cameraCard: {
    flex: 2,
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
  bottomControls: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  controlsCard: {
    flex: 1,
    backgroundColor: '#652D90',
    borderRadius: 20,
    padding: 16,
    justifyContent: 'center',
  },
  sliderCard: {
    flex: 1,
    backgroundColor: '#652D90',
    borderRadius: 20,
    padding: 16,
    justifyContent: 'center',
  },
  sliderWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#8A2BE2',
    marginBottom: 16,
  },
  controlLabel: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  // Custom Slider Styles
  sliderContainer: {
    width: '100%',
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  valueBox: {
    backgroundColor: '#FF69B4',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sliderValue: {
    fontSize: 14,
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
  // Control Button Styles
  controlButton: {
    width: 80,
    height: 80,
    backgroundColor: '#F14AA1',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // Horizontal Controls (Left/Right)
  horizontalControlsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 12,
  },
  horizontalButton: {
    // Inherits from controlButton - no additional sizing needed
  },
  // Vertical Controls (Forward/Backward)
  verticalControlsContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 12,
  },
  verticalButton: {
    // Inherits from controlButton - no additional sizing needed
  },
  // Active Movement Indicator
  activeIndicatorContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00FF00',
  },
  activeText: {
    color: '#00FF00',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default HomeScreenSurveillance;