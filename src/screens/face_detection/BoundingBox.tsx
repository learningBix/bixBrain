import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function BoundingBox({ face }) {
  const { topLeft, bottomRight } = face;

  return (
    <View
      style={[
        styles.box,
        {
          left: topLeft[0],
          top: topLeft[1],
          width: bottomRight[0] - topLeft[0],
          height: bottomRight[1] - topLeft[1],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'red',
  },
});
