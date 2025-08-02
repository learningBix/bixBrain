import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text, Surface } from "react-native-paper";
import Slider from "@react-native-community/slider";

const IndoorPlant = () => {
  const [isToggled, setIsToggled] = useState(false);
  const [lightIntensity, setLightIntensity] = useState(50);
  const [ledBrightness, setLedBrightness] = useState(50);

  return (
    <Surface style={styles.container}>
      <Text style={styles.title}>Morning Alarm</Text>

      <Button
        mode="contained"
        onPress={() => setIsToggled(!isToggled)}
        style={[styles.toggleButton, isToggled ? styles.buttonOn : styles.buttonOff]}
        labelStyle={styles.buttonText}
      >
        {isToggled ? "Turn Off" : "Turn On"}
      </Button>

      <View style={styles.sliderGroup}>
        <Text style={styles.label}>Light Intensity: {lightIntensity}%</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          value={lightIntensity}
          onValueChange={setLightIntensity}
          minimumTrackTintColor="#4CAF50"
          maximumTrackTintColor="#A5D6A7"
          thumbTintColor="#388E3C"
        />
      </View>

      <View style={styles.sliderGroup}>
        <Text style={styles.label}>Buzzer: {ledBrightness}%</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          value={ledBrightness}
          onValueChange={setLedBrightness}
          minimumTrackTintColor="#FFB300"
          maximumTrackTintColor="#FFD54F"
          thumbTintColor="#FF8F00"
        />
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FAFAFA",
    padding: 25,
    borderRadius: 12,
    elevation: 0,
    margin: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#2E7D32",
  },
  toggleButton: {
    alignSelf: "center",
    width: 160,
    borderRadius: 8,
    paddingVertical: 5,
    marginBottom: 20,
  },
  buttonOn: {
    backgroundColor: "#388E3C",
  },
  buttonOff: {
    backgroundColor: "#D32F2F",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  sliderGroup: {
    marginTop: 15,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#424242",
  },
  slider: {
    width: "100%",
  },
});

export default IndoorPlant ;
