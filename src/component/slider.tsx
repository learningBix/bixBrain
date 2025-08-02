import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';

const CustomSlider = ({ 
  value, 
  onValueChange, 
  minimumValue = 0, 
  maximumValue = 100,
  trackColor = '#FFEB3B',
  backgroundColor = '#483285',
  thumbColor = 'white',
  style = {}
}) => {
  const [sliderWidth, setSliderWidth] = useState(0);
  const sliderRef = useRef(null);

  const updateValue = (xPosition) => {
    const trackWidth = sliderWidth - 10; // Subtracting padding (5px each side)
    const effectiveX = Math.max(0, Math.min(xPosition, trackWidth));
    const percentage = effectiveX / trackWidth;
    const newValue = Math.round(percentage * (maximumValue - minimumValue) + minimumValue);
    onValueChange(newValue);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      if (sliderRef.current) {
        sliderRef.current.measure((fx, fy, width, height, px, py) => {
          const touchX = evt.nativeEvent.locationX;
          updateValue(touchX);
        });
      }
    },
    onPanResponderMove: (evt, gestureState) => {
      if (sliderRef.current) {
        sliderRef.current.measure((fx, fy, width, height, px, py) => {
          const touchX = gestureState.moveX - px;
          updateValue(touchX);
        });
      }
    },
  });

  const trackWidth = sliderWidth > 0 ? ((value - minimumValue) / (maximumValue - minimumValue)) * (sliderWidth - 10) : 0;
  const thumbPosition = sliderWidth > 0 ? ((value - minimumValue) / (maximumValue - minimumValue)) * (sliderWidth - 10) : 0;

  return (
    <View
      style={[styles.sliderContainer, style]}
      ref={sliderRef}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setSliderWidth(width);
      }}
      {...panResponder.panHandlers}
    >
      <View style={[styles.slider, { backgroundColor }]}>
        <View 
          style={[
            styles.sliderTrack, 
            { 
              width: trackWidth,
              backgroundColor: trackColor 
            }
          ]} 
        />
        <View 
          style={[
            styles.sliderThumb, 
            { 
              left: thumbPosition,
              backgroundColor: thumbColor 
            }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sliderContainer: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  slider: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    position: 'relative',
  },
  sliderTrack: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 4,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    top: -6,
    marginLeft: -10,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomSlider;