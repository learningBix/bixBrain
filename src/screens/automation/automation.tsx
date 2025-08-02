import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';

interface AutomationScreenProps {
  navigation: any;
}

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const CARD_HEIGHT = height * 0.6;

const automationCategories = [
  // { 
  //   name: 'Morning Alarm', 
  //   image: require('../../main/MorningAlarm.png'), 
  //   screen: 'MorningAlarmScreen',
  //   description: 'Smart wake-up solutions for better mornings',
  //   color: '#FF6B6B',
  //   accent: '#FF5252',
  //   icon: '⏰'
  // },
  { 
    name: 'Weather Radar', 
    image: require('../../main/SmartIrigation.jpg'), 
    screen: 'SmartIrrigationScreen',
    description: 'Automated watering for healthy plants',
    color: '#4ECDC4',
    accent: '#26A69A',
    icon: '🌱'
  },
  { 
    name: 'Smart Irrigation ', 
    image: require('../../main/doorAlarm.jpg'), 
    screen: 'DoorAlarmScreen',
    description: 'Secure your home with smart alerts',
    color: '#45B7D1',
    accent: '#2196F3',
    icon: '🚪'
  },

  
];

const AutomationScreen: React.FC<AutomationScreenProps> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const headerAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(headerAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleNavigation = (screen: string, index: number) => {
    // Add haptic feedback simulation with scale animation
    const cardScale = new Animated.Value(1);
    Animated.sequence([
      Animated.timing(cardScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      navigation.navigate(screen);
    }, 200);
  };

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { 
      useNativeDriver: false,
      listener: (event: any) => {
        const contentOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffset / CARD_WIDTH);
        setCurrentIndex(index);
      }
    }
  );

  const renderCard = (item: any, index: number) => {
    const inputRange = [
      (index - 1) * CARD_WIDTH,
      index * CARD_WIDTH,
      (index + 1) * CARD_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    const rotateY = scrollX.interpolate({
      inputRange,
      outputRange: ['45deg', '0deg', '-45deg'],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        key={index}
        style={[
          styles.cardContainer,
          {
            transform: [{ scale }, { rotateY }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleNavigation(item.screen, index)}
          style={styles.card}
          activeOpacity={0.9}
        >
          {/* Dynamic Background Gradient */}
          <View style={[styles.cardBackground, { backgroundColor: item.color }]} />
          
          {/* Floating Icon */}
          <View style={styles.floatingIcon}>
            <Text style={styles.iconText}>{item.icon}</Text>
          </View>
          
          {/* Image with Parallax Effect */}
          <View style={styles.imageContainer}>
            <Image source={item.image} style={styles.image} />
            <View style={[styles.imageOverlay, { backgroundColor: `${item.color}40` }]} />
          </View>
          
          {/* Content with Glass Effect */}
          <View style={styles.cardContent}>
            <View style={styles.contentHeader}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <View style={[styles.statusDot, { backgroundColor: item.accent }]} />
            </View>
            <Text style={styles.cardDescription}>{item.description}</Text>
            
            {/* Enhanced Action Button - NOW WITH NAVIGATION */}
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: item.accent }]}
              activeOpacity={0.8}
              onPress={(e) => {
                e.stopPropagation(); // Prevent parent TouchableOpacity from firing
                handleNavigation(item.screen, index);
              }}
            >
              <Text style={styles.actionButtonText}>Configure</Text>
              <Text style={styles.arrowIcon}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Shimmer Effect */}
          <View style={styles.shimmerOverlay} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6B21A8" />
      
      {/* Enhanced Background with Gradients and Patterns */}
      <View style={styles.backgroundGradient}>
        <View style={styles.backgroundPattern} />
        <View style={styles.geometricPattern1} />
        <View style={styles.geometricPattern2} />
        <View style={styles.geometricPattern3} />
        <View style={styles.geometricPattern4} />
        <View style={styles.floatingOrb1} />
        <View style={styles.floatingOrb2} />
        <View style={styles.floatingOrb3} />
        <View style={styles.floatingOrb4} />
      </View>
      
      {/* Enhanced Header */}
      <Animated.View 
        style={[
          styles.headerContainer,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: headerAnim }]
          }
        ]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>Automation Hub</Text>
     
          </View>
       
        </View>
      
      </Animated.View>

      {/* Main Content with Animation */}
      <Animated.View 
        style={[
          styles.contentContainer,
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          snapToInterval={CARD_WIDTH}
          snapToAlignment="center"
          decelerationRate="fast"
          contentContainerStyle={styles.scrollView}
        >
          {automationCategories.map(renderCard)}
        </ScrollView>
      </Animated.View>

      {/* Enhanced Bottom Section */}
     
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6B21A8',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#6B21A8',
    // Create gradient effect with multiple layers
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 107, 107, 0.06)',
    // Add subtle noise pattern
  },
  geometricPattern1: {
    position: 'absolute',
    top: '8%',
    left: '5%',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  geometricPattern2: {
    position: 'absolute',
    top: '20%',
    right: '8%',
    width: 65,
    height: 65,
    backgroundColor: 'rgba(78, 205, 196, 0.08)',
    transform: [{ rotate: '45deg' }],
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.15)',
  },
  geometricPattern3: {
    position: 'absolute',
    bottom: '28%',
    left: '12%',
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: 'rgba(69, 183, 209, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(69, 183, 209, 0.15)',
    borderStyle: 'dashed',
  },
  geometricPattern4: {
    position: 'absolute',
    top: '45%',
    right: '15%',
    width: 55,
    height: 55,
    backgroundColor: 'rgba(255, 234, 167, 0.08)',
    transform: [{ rotate: '30deg' }],
    borderWidth: 1,
    borderColor: 'rgba(255, 234, 167, 0.15)',
  },
  floatingOrb1: {
    position: 'absolute',
    top: '12%',
    right: '20%',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  floatingOrb2: {
    position: 'absolute',
    top: '35%',
    left: '8%',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
  },
  floatingOrb3: {
    position: 'absolute',
    bottom: '20%',
    right: '25%',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    shadowColor: '#45B7D1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  floatingOrb4: {
    position: 'absolute',
    bottom: '40%',
    left: '25%',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    shadowColor: '#FFEAA7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 9,
    elevation: 3,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#E0E7FF',
    fontWeight: '500',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 34,
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileEmoji: {
    fontSize: 20,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0E7FF',
    fontWeight: '400',
    opacity: 0.8,
    lineHeight: 22,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollView: {
    paddingVertical: 20,
    paddingHorizontal: (width - CARD_WIDTH) / 2,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginHorizontal: 8,
  },
  card: {
    flex: 1,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  cardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
    opacity: 0.1,
  },
  floatingIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  iconText: {
    fontSize: 24,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    opacity: 0.3,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 18,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginRight: 8,
  },
  arrowIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: -100,
    width: 100,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
  },
  bottomSection: {
    paddingBottom: 30,
    paddingTop: 20,
    paddingHorizontal: 24,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#E0E7FF',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 16,
  },
});

export default AutomationScreen;