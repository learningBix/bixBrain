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

interface StructureScreenProps {
  navigation: any;
}

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85; // Increased to take more screen space
const CARD_HEIGHT = height * 0.6;

const categories = [
  {
    name: "Free Run",
    image: require('../../structure_home/robo.png'),
    description: "Control your robot freely with manual commands",
    color: '#F14AA1',
    accent: '#E91E63',
    icon: '🤖'
  },
  {
    name: "Face Tracking",
    image: require('../../structure_home/kyuaaar.jpg'),
    description: "Advanced facial recognition and tracking",
    color: '#FECA57',
    accent: '#FF9800',
    icon: '👤'
  },
  {
    name: "QR Tracking",
    image: require('../../structure_home/kyuaaar.jpg'),
    description: "Follow QR codes automatically with precision",
    color: '#F14AA1',
    accent: '#E91E63',
    icon: '📱'
  },
  {
    name: "Colour Detection",
    image: require('../../structure_home/HallSecurityCam.jpeg'),
    description: "Detect and track colors in real-time",
    color: '#45B7D1',
    accent: '#2196F3',
    icon: '🎨'
  },
  {
    name: "Object Detection",
    image: require('../../structure_home/ElectricCycle.jpg'),
    description: "Smart object recognition and classification",
    color: '#96CEB4',
    accent: '#4CAF50',
    icon: '👁️'
  },
  {
    name: "Tag Tracker",
    image: require('../../structure_home/ai-pet-feeder.jpg'),
    description: "Automated tag tracking system",
    color: '#FECA57',
    accent: '#FF9800',
    icon: '🏷️'
  },
  {
    name: "Face Mask Detection",
    image: require('../../structure_home/HallSecurityCam.jpeg'),
    description: "Detect face masks in real-time",
    color: '#FF6B6B',
    accent: '#F44336',
    icon: '😷'
  },
  {
    name: "Fire Detection Robot",
    image: require('../../structure_home/robo.png'),
    description: "Autonomous fire detection and alert system",
    color: '#FF4757',
    accent: '#FF3838',
    icon: '🔥'
  },
  {
    name: "Multiple Digital Classification",
    image: require('../../structure_home/ElectricCycle.jpg'),
    description: "Advanced multi-class digit recognition",
    color: '#3742FA',
    accent: '#3F51B5',
    icon: '🔢'
  },
  {
    name: "Gender Detection",
    image: require('../../structure_home/kyuaaar.jpg'),
    description: "AI-powered gender identification system",
    color: '#2ED573',
    accent: '#4CAF50',
    icon: '👥'
  },
  {
    name: "Pet Detection",
    image: require('../../structure_home/ai-pet-feeder.jpg'),
    description: "Smart pet recognition and monitoring",
    color: '#FFA502',
    accent: '#FF9800',
    icon: '🐕'
  },
  {
    name: "Line Follower Car",
    image: require('../../structure_home/ai-pet-feeder.jpg'),
    description: "Follow lines on the floor using infrared sensors",
    color: '#00B894',
    accent: '#00CEC9',
    icon: '🚗'
  }
];

const StructureScreen: React.FC<StructureScreenProps> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showIndicator, setShowIndicator] = useState(true);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const headerAnim = useRef(new Animated.Value(-50)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

    // Arrow sliding animation
    const arrowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnim, {
          toValue: 15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(arrowAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Pulse animation for indicator
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    if (showIndicator) {
      arrowAnimation.start();
      pulseAnimation.start();

      // Hide indicator after 5 seconds
      const timer = setTimeout(() => {
        setShowIndicator(false);
        arrowAnimation.stop();
        pulseAnimation.stop();
      }, 5000);

      return () => {
        clearTimeout(timer);
        arrowAnimation.stop();
        pulseAnimation.stop();
      };
    }
  }, [showIndicator]);

  const handleNavigation = (category: string, index: number) => {
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
      const categoryKey = category.toLowerCase().replace(/\s+/g, '');
      console.log('Navigating to:', categoryKey);

      switch (categoryKey) {
        case "freerun":
          navigation.navigate('HomeScreenSurveillance');
          break;
        case "facetracking":
          navigation.navigate('NightLamp');
          break;
        case "colourdetection":
          navigation.navigate('HallSensorScreen');
          break;
        case "qrtracking":
          navigation.navigate('DevicesIotScreen');
          break;
        case "objectdetection":
          navigation.navigate('Dashboard');
          break;
        case "tagtracker":
          navigation.navigate('petfeeder');
          break;
        case "facemaskdetection":
          navigation.navigate('FaceMaskDetectionScreen');
          break;
        case "firedetectionrobot":
          navigation.navigate('FireDetectionRobotScreen');
          break;
        case "multipledigitalclassification":
          navigation.navigate('MultipleDigitalClassificationScreen');
          break;
        case "genderdetection":
          navigation.navigate('GenderDetectionScreen');
          break;
        case "petdetection":
          navigation.navigate('PetDetectionScreen');
          break;
        case "linefollowercar":
          navigation.navigate('LineFollowerScreen');
          break;
        default:
          console.log("No screen assigned for this category:", categoryKey);
          break;
      }
    }, 200);
  };

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const contentOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffset / width);
        setCurrentIndex(index);

        // Hide indicator when user starts swiping
        if (showIndicator && contentOffset > 10) {
          setShowIndicator(false);
        }
      }
    }
  );

  const renderCard = (item: any, index: number) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp',
    });

    const translateX = scrollX.interpolate({
      inputRange,
      outputRange: [width * 0.1, 0, -width * 0.1],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        key={index}
        style={[
          styles.cardContainer,
          {
            transform: [{ scale }, { translateX }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleNavigation(item.name, index)}
          style={styles.card}
          activeOpacity={0.9}
        >
          {/* Dynamic Background Gradient */}
          <View style={[styles.cardBackground, { backgroundColor: item.color }]} />

          {/* Floating Icon */}
          <View style={styles.floatingIcon}>
            <Text style={styles.iconText}>{item.icon}</Text>
          </View>

          {/* NEW Badge */}
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>AI</Text>
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

            {/* Status Indicator */}
            <View style={styles.statusRow}>
              <View style={styles.statusIndicator}>
                <View style={[styles.readyDot, { backgroundColor: '#00FF88' }]} />
                <Text style={styles.statusText}>Ready</Text>
              </View>

              {/* Enhanced Action Button - NOW WITH NAVIGATION */}
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: item.accent }]}
                activeOpacity={0.8}
                onPress={(e) => {
                  e.stopPropagation(); // Prevent parent TouchableOpacity from firing
                  handleNavigation(item.name, index);
                }}
              >
                <Text style={styles.actionButtonText}>Get Started</Text>
                <Text style={styles.playIcon}>▶</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Decorative Elements */}
          <View style={[styles.decorativeCircle1, { backgroundColor: `${item.color}20` }]} />
          <View style={[styles.decorativeCircle2, { backgroundColor: `${item.color}15` }]} />

          {/* Shimmer Effect */}
          <View style={styles.shimmerOverlay} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#581C87" />

      {/* Enhanced Background with Gradients and Patterns */}
      <View style={styles.backgroundGradient}>
        <View style={styles.backgroundPattern} />
        <View style={styles.geometricPattern1} />
        <View style={styles.geometricPattern2} />
        <View style={styles.geometricPattern3} />
        <View style={styles.floatingOrb1} />
        <View style={styles.floatingOrb2} />
        <View style={styles.floatingOrb3} />
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
        <Text style={styles.headerSubtitle}>
          Discover cutting-edge AI and robotics projects
        </Text>
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
          snapToInterval={width}
          snapToAlignment="center"
          decelerationRate="fast"
          contentContainerStyle={styles.scrollView}
          pagingEnabled={true}
        >
          {categories.map(renderCard)}
        </ScrollView>
      </Animated.View>

      {/* Slide Indicator */}
      {showIndicator && (
        <Animated.View
          style={[
            styles.slideIndicator,
            {
              opacity: fadeAnim,
              transform: [{ scale: pulseAnim }]
            }
          ]}
        >
          <View style={styles.indicatorContent}>
            <Text style={styles.indicatorText}>Swipe to explore AI projects</Text>
            <Animated.View
              style={[
                styles.arrowContainer,
                { transform: [{ translateX: arrowAnim }] }
              ]}
            >
              <Text style={styles.leftArrow}>←</Text>
              <View style={styles.dotsContainer}>
                {categories.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      {
                        backgroundColor: index === currentIndex ? '#F14AA1' : 'rgba(255,255,255,0.3)',
                        transform: [{ scale: index === currentIndex ? 1.2 : 1 }]
                      }
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.rightArrow}>→</Text>
            </Animated.View>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#581C87',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#581C87',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  geometricPattern1: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(241, 74, 161, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(241, 74, 161, 0.2)',
  },
  geometricPattern2: {
    position: 'absolute',
    top: '30%',
    right: '15%',
    width: 60,
    height: 60,
    backgroundColor: 'rgba(254, 202, 87, 0.08)',
    transform: [{ rotate: '45deg' }],
    borderWidth: 1,
    borderColor: 'rgba(254, 202, 87, 0.15)',
  },
  geometricPattern3: {
    position: 'absolute',
    bottom: '20%',
    left: '20%',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(69, 183, 209, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(69, 183, 209, 0.15)',
    borderStyle: 'dashed',
  },
  floatingOrb1: {
    position: 'absolute',
    top: '15%',
    right: '25%',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#F14AA1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  floatingOrb2: {
    position: 'absolute',
    top: '60%',
    left: '5%',
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#FECA57',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
  },
  floatingOrb3: {
    position: 'absolute',
    bottom: '35%',
    right: '10%',
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    shadowColor: '#45B7D1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
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
    paddingHorizontal: 0,
  },
  cardContainer: {
    width: width,
    height: CARD_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
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
  newBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
    marginTop: 10,
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
    marginBottom: 16,
    lineHeight: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
  },
  readyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#00AA5A',
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
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
    marginRight: 6,
  },
  playIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    top: -20,
    right: -20,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    bottom: 10,
    left: -10,
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
  slideIndicator: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  indicatorContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  indicatorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftArrow: {
    color: '#F14AA1',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 12,
  },
  rightArrow: {
    color: '#F14AA1',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default StructureScreen;