import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

// Import your images
import buzzerImage from '../../Output(s3)/buzzer.png';
import fanImage from '../../Output(s3)/fan.png';
import LEDImage from '../../Output(s3)/buzzer.png';
import motorImage from '../../Output(s3)/motor.png';
import OLEDImage from '../../Output(s3)/OLED.png';
import RGBImage from '../../Output(s3)/RGB.png';
import servoImage from '../../Output(s3)/servo.png';
import vibrationImage from '../../Output(s3)/vibration.png';
import music from '../../Output(s3)/music.png';
import wifi from '../../Output(s3)/wifi.png'

interface AutomationScreenProps {
  navigation: any;
}

const automationCategories = [
  { name: "RGB LED", image: RGBImage, screen: "RGBLEDScreen" },
  { name: "Vibration Motor", image: vibrationImage, screen: "VibrationMotorScreen" },
  { name: "Buzzer", image: buzzerImage, screen: "BuzzerScreen" },
  { name: "Music", image: music, screen: "MusicScreen" },
  { name: "Fan Block", image: fanImage, screen: "FanBlockScreen" },
  { name: "Servo Motor / WiFi", image: servoImage, screen: "ServoMotorWiFiScreen" },
  { name: "Motor Driver", image: motorImage, screen: "MotorDriverScreen" },
  { name: "OLED Block", image: OLEDImage, screen: "OLEDBlockScreen" },
  { name: "WIFI Block", image: wifi, screen: "ESPScreen" },
];

const OutputScreen: React.FC<AutomationScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centeredContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollView}
        >
          {automationCategories.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.box}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.85}
            >
              {item.image ? (
                <Image source={item.image} style={styles.image} />
              ) : (
                <Text>No Image</Text>
              )}
              <Text style={styles.boxText} numberOfLines={2} adjustsFontSizeToFit>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6B21A8', // Palette purple background
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  centeredContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  scrollView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  box: {
    width: 286,
    height: 260,
    marginHorizontal: 15,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#581C87', // Deep purple shadow
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // White card background
    padding: 10,
  },
  boxText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#581C87', // Deep purple text
    textAlign: 'center',
    marginTop: 12,
    textShadowColor: '#fff2',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  image: {
    width: '90%',
    height: '70%',
    borderRadius: 10,
    resizeMode: 'contain',
  },
});

export default OutputScreen;
