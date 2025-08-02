import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

// Custom gradient background component
const GradientBackground = ({ children }) => {
  return (
    <View style={styles.container}>
      <View style={styles.gradientOverlay} />
      {children}
    </View>
  );
};

// Hexagon button component using SVG
const HexagonButton = ({ label, color, style }) => {
  return (
    <View style={[styles.hexagonContainer, style]}>
      <Svg height="100" width="100" viewBox="0 0 100 100">
        <Polygon
          points="50,10 90,30 90,70 50,90 10,70 10,30"
          fill={color}
          stroke="white"
          strokeWidth="3"
        />
      </Svg>
      <Text style={styles.hexagonText}>{label}</Text>
    </View>
  );
};

const LearnAndPlayScreen = () => {
  const [isPressed, setIsPressed] = useState(false);
  
  const handlePlayPress = () => {
    // Example action when Play Now is pressed
    Alert.alert('Play Now', 'Starting your adventure!');
    // Navigation could be handled here, e.g.:
    // navigation.navigate('GameScreen');
  };

  return (
    <GradientBackground>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoSquare} />
        <View style={styles.logoCircle} />
        <View style={styles.logoSquareBottom} />
        <View style={styles.logoHalfCircle} />
      </View>

      {/* Title */}
      <Text style={styles.title}>Lets Learn & Play !</Text>
      <Text style={styles.subtitle}>Adventure awaits you!</Text>

      {/* Play Button - with press feedback */}
      <TouchableOpacity 
        style={[
          styles.playButton,
          isPressed && styles.playButtonPressed
        ]}
        activeOpacity={0.7}
        onPress={handlePlayPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
      >
        <View style={styles.playIcon}>
          <View style={styles.playTriangle} />
        </View>
        <Text style={styles.playButtonText}>Play Now</Text>
      </TouchableOpacity>

      {/* Hexagon buttons */}
      <HexagonButton label="AI" color="#e57bb8" style={styles.aiHex} />
      <HexagonButton label="Robotic\ncar" color="#7be57b" style={styles.roboticHex} />
      <HexagonButton label="Automation" color="#e5b97b" style={styles.automationHex} />
      <HexagonButton label="Sensor" color="#7bcce5" style={styles.sensorHex} />
      <HexagonButton label="Input" color="#e57b7b" style={styles.inputHex} />
      <HexagonButton label="Output" color="#b57be5" style={styles.outputHex} />
      
      {/* Connection lines */}
      <View style={styles.connectorLine} />
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4c8bf5',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#63a4ff',
    opacity: 0.5,
  },
  logoContainer: {
    position: 'absolute',
    top: 40,
    left: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoSquare: {
    width: 30,
    height: 30,
    backgroundColor: '#ff7f50',
  },
  logoCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#7bcce5',
    marginLeft: -15,
  },
  logoSquareBottom: {
    width: 30,
    height: 30,
    backgroundColor: '#ff7f50',
    position: 'absolute',
    top: 25,
  },
  logoHalfCircle: {
    width: 30,
    height: 30,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: '#ff7f50',
    position: 'absolute',
    top: 25,
    left: 15,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 28,
    color: 'white',
    marginBottom: 40,
  },
  playButton: {
    flexDirection: 'row',
    backgroundColor: '#ff7f50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  playButtonPressed: {
    backgroundColor: '#e06e40', // Slightly darker when pressed
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    transform: [{ scale: 0.98 }],
  },
  playIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
    transform: [{ rotate: '90deg' }],
    marginLeft: 3,
  },
  playButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  hexagonContainer: {
    position: 'absolute',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hexagonText: {
    position: 'absolute',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    width: 80,
  },
  aiHex: {
    top: '25%',
    left: '15%',
  },
  roboticHex: {
    top: '45%',
    left: '10%',
  },
  automationHex: {
    top: '65%',
    left: '20%',
  },
  sensorHex: {
    top: '15%',
    right: '10%',
  },
  inputHex: {
    top: '40%',
    right: '15%',
  },
  outputHex: {
    top: '65%',
    right: '25%',
  },
  connectorLine: {
    position: 'absolute',
    width: '80%',
    height: '70%',
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 250,
    borderBottomWidth: 0,
    borderRightWidth: 0.5,
    borderLeftWidth: 0.5,
  },
});

export default LearnAndPlayScreen;