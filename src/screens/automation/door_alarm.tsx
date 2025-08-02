import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import Slider from '@react-native-community/slider';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 380;

const SmartIrrigationSystem = () => {
  const [isActive, setIsActive] = useState(false);
  const [dryThreshold, setDryThreshold] = useState(50);
  const [timeInterval, setTimeInterval] = useState(40);

  const handleStart = () => {
    setIsActive(true);
  };

  const handleStop = () => {
    setIsActive(false);
  };

  const PlantPot = () => (
    <View style={styles.plantContainer}>
      {/* Plant */}
      <View style={styles.plant}>
        <View style={styles.leafContainer}>
          {[...Array(5)].map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.leaf, 
                { 
                  transform: [{ rotate: `${i * 72}deg` }],
                  top: i % 2 === 0 ? -10 - (i * 3) : -15 - (i * 2),
                  left: i % 2 === 0 ? -10 + (i * 5) : -5 + (i * 4)
                }
              ]} 
            />
          ))}
        </View>
      </View>
      
      {/* Pot */}
      <View style={styles.pot}>
        <View style={styles.potFace}>
          <View style={styles.eyesContainer}>
            <View style={styles.eye}>
              <View style={styles.pupil} />
            </View>
            <View style={styles.eye}>
              <View style={styles.pupil} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Smart Irrigation System</Text>
        </View>

        <View style={styles.content}>
          {/* Left Section - Sliders */}
          <View style={styles.leftSection}>
            <View style={styles.controlsContainer}>
              {/* Settings Header */}
              <View style={styles.sectionHeader}>
                <Ionicons name="settings" size={20} color="#FFA500" />
                <Text style={styles.sectionTitle}>SETTINGS</Text>
              </View>
              <View style={styles.divider} />

              {/* Sliders */}
              <View style={styles.sliderSection}>
                {/* Dry Threshold Slider */}
                <View style={styles.sliderContainer}>
                  <View style={styles.sliderHeader}>
                    <View style={styles.sliderLabelRow}>
                      <Ionicons name="water-outline" size={16} color="#FFA500" />
                      <Text style={styles.sliderLabel}>Dry Threshold</Text>
                    </View>
                    <View style={styles.valueBox}>
                      <Text style={styles.sliderValue}>{Math.round(dryThreshold)}%</Text>
                    </View>
                  </View>

                  {/* Custom Speed Slider */}
                  <View style={styles.customSliderContainer}>
                    <View style={styles.sliderTrack}>
                      <View style={[styles.sliderFill, { width: `${dryThreshold}%` }]} />
                      <View style={[styles.sliderThumb, { left: `${dryThreshold}%` }]} />
                    </View>
                  </View>
                </View>

                {/* Time Interval Slider */}
                <View style={styles.sliderContainer}>
                  <View style={styles.sliderHeader}>
                    <View style={styles.sliderLabelRow}>
                      <Ionicons name="time-outline" size={16} color="#FFA500" />
                      <Text style={styles.sliderLabel}>Time Interval</Text>
                    </View>
                    <View style={styles.valueBox}>
                      <Text style={styles.sliderValue}>{Math.round(timeInterval)}m</Text>
                    </View>
                  </View>

                  {/* Custom Speed Slider */}
                  <View style={styles.customSliderContainer}>
                    <View style={styles.sliderTrack}>
                      <View style={[styles.sliderFill, { width: `${timeInterval}%` }]} />
                      <View style={[styles.sliderThumb, { left: `${timeInterval}%` }]} />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Right Section - Controls */}
          <View style={styles.rightSection}>
            <View style={styles.controlsContainer}>
              {/* System Status Header */}
              <View style={styles.sectionHeader}>
                <Ionicons name="water" size={20} color="#FFA500" />
                <Text style={styles.sectionTitle}>SYSTEM CONTROL</Text>
              </View>
              <View style={styles.divider} />

              {/* Start/Stop Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.controlButton,
                    isActive && styles.controlButtonActive
                  ]}
                  onPress={handleStart}
                >
                  <Ionicons 
                    name="play-circle" 
                    size={16} 
                    color={isActive ? '#FFA500' : '#FFFFFF'} 
                  />
                  <Text style={[
                    styles.controlButtonText,
                    isActive && styles.controlButtonTextActive
                  ]}>
                    Start System
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.controlButton,
                    !isActive && styles.controlButtonActive
                  ]}
                  onPress={handleStop}
                >
                  <Ionicons 
                    name="stop-circle" 
                    size={16} 
                    color={!isActive ? '#FFA500' : '#FFFFFF'} 
                  />
                  <Text style={[
                    styles.controlButtonText,
                    !isActive && styles.controlButtonTextActive
                  ]}>
                    Stop System
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#581C87',
    padding: isSmallScreen ? 12 : 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#6B21A8',
    borderRadius: 20,
    padding: isSmallScreen ? 12 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: isSmallScreen ? 16 : 20,
  },
  title: {
    fontSize: isSmallScreen ? 22 : 26,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  content: {
    flex: 1,
    flexDirection: width < 500 ? 'column' : 'row',
    gap: isSmallScreen ? 16 : 20,
  },
  leftSection: {
    flex: width < 500 ? undefined : 1,
    backgroundColor: '#6B21A8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  rightSection: {
    flex: width < 500 ? 1 : 1.2,
    backgroundColor: '#6B21A8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  controlsContainer: {
    padding: isSmallScreen ? 12 : 16,
    flex: 1,
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
    marginBottom: 12,
  },
  buttonContainer: {
    gap: 8,
    marginBottom: 15,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.4)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
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
  sliderSection: {
    flex: 1,
    gap: 16,
  },
  sliderContainer: {
    marginBottom: 8,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sliderLabel: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 13 : 14,
    fontWeight: '500',
  },
  valueBox: {
    backgroundColor: '#F14AA1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    minWidth: 45,
    alignItems: 'center',
  },
  sliderValue: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 12 : 13,
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
  
  // Plant pot styles (keeping original design but with theme colors)
  plantContainer: {
    alignItems: 'center',
    height: 120,
  },
  plant: {
    width: isSmallScreen ? 50 : 60,
    height: isSmallScreen ? 50 : 60,
    position: 'relative',
    top: 0,
    zIndex: 2,
  },
  leafContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  leaf: {
    position: 'absolute',
    width: isSmallScreen ? 20 : 25,
    height: isSmallScreen ? 28 : 32,
    backgroundColor: '#00FF88',
    borderRadius: 25,
    borderTopLeftRadius: 35,
    borderBottomRightRadius: 35,
    transform: [{ rotate: '30deg' }],
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  pot: {
    width: isSmallScreen ? 70 : 80,
    height: isSmallScreen ? 70 : 80,
    backgroundColor: '#F14AA1',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginTop: -20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFA500',
    overflow: 'hidden',
    shadowColor: '#F14AA1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  potFace: {
    width: isSmallScreen ? 50 : 60,
    height: isSmallScreen ? 35 : 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 12,
  },
  eyesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: isSmallScreen ? 30 : 35,
    position: 'absolute',
    top: isSmallScreen ? 8 : 10,
  },
  eye: {
    width: isSmallScreen ? 12 : 14,
    height: isSmallScreen ? 12 : 14,
    backgroundColor: '#581C87',
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pupil: {
    width: isSmallScreen ? 5 : 6,
    height: isSmallScreen ? 5 : 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
});

export default SmartIrrigationSystem;