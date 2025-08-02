import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface AutomationScreenProps {
  navigation: any;
}

const automationCategories = [
  { 
    name: "Robo Car", 
    image: require('./assets/roboticCar.png'), // Replace with actual import
    screen: "robocar"
  },
  { 
    name: "Smart Avoid", 
    image: require('./assets/obstacle_avoider.jpg'), // Replace with actual import
    screen: "obstacleavoid"
  },
];

const RoboticsScreen: React.FC<AutomationScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollWrapper}>
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
              <Image 
                source={item.image} 
                style={styles.image}
                resizeMode="cover"
              />
              <Text style={styles.boxText}>{item.name}</Text>
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
  scrollWrapper: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    paddingHorizontal: 20,
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
    backgroundColor: '#fff', // White card background
    elevation: 8,
    shadowColor: '#581C87', // Deep purple shadow
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: '95%',
    height: '70%',
    borderRadius: 10,
    resizeMode: 'cover',
  },
});

export default RoboticsScreen;
