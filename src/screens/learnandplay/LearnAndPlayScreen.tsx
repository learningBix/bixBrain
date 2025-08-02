import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, SafeAreaView } from 'react-native';
import Svg, { Polygon, Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  LearnAndPlay: undefined;
  Home: undefined;
};

type LearnAndPlayScreenNavigationProp = StackNavigationProp<RootStackParamList, 'LearnAndPlay'>;

const FloatingShape = ({ children, delay = 0 }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000 + delay,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000 + delay,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };

    setTimeout(() => animate(), delay);
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <Animated.View style={{ transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};

const ModernHexagonButton = ({ label, color, emoji, style, onPress }) => {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    setIsPressed(true);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsPressed(false);
      if (onPress) onPress();
    });
  };

  const hexSize = Math.min(width * 0.25, 100);

  return (
    <FloatingShape delay={Math.random() * 1000}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <Animated.View style={[styles.modernHexagonContainer, style, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.hexagonShadow} />
          <Svg height={hexSize} width={hexSize} viewBox="0 0 100 100">
            <Polygon
              points="50,8 88,28 88,72 50,92 12,72 12,28"
              fill={color}
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          </Svg>
          <View style={styles.hexagonContent}>
            <Text style={styles.hexagonEmoji}>{emoji}</Text>
            <Text style={styles.modernHexagonText}>{label}</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </FloatingShape>
  );
};

const SparkleEffect = ({ style }) => {
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };
    animate();
  }, []);

  const opacity = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  const scale = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1.2, 0.5],
  });

  return (
    <Animated.View style={[style, { opacity, transform: [{ scale }] }]}>
      <Text style={styles.sparkle}>✨</Text>
    </Animated.View>
  );
};

const LearnAndPlayScreen: React.FC = () => {
  const navigation = useNavigation<LearnAndPlayScreenNavigationProp>();
  const [isPressed, setIsPressed] = useState(false);
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const bounce = () => {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => bounce());
    };
    bounce();
  }, []);

  const handlePlayPress = () => {
    console.log("Start Adventure button pressed - navigating to Home");
    navigation.navigate('Home');
  };

  const handleHexagonPress = (label) => {
    console.log(`${label} hexagon pressed`);
    // Add navigation or action for each hexagon
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Sparkle Effects */}
        <SparkleEffect style={[styles.sparklePosition, { top: '10%', left: '10%' }]} />
        <SparkleEffect style={[styles.sparklePosition, { top: '15%', right: '15%' }]} />
        <SparkleEffect style={[styles.sparklePosition, { bottom: '20%', left: '20%' }]} />
        <SparkleEffect style={[styles.sparklePosition, { bottom: '25%', right: '10%' }]} />

        {/* Modern Logo */}
        <View style={styles.modernLogoContainer}>
          <LinearGradient
            colors={['#ff9a9e', '#fecfef']}
            style={styles.logoSquare}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <LinearGradient
            colors={['#a8edea', '#fed6e3']}
            style={styles.logoCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.logoAccent} />
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Let's Learn & Play! 🚀</Text>
          <Text style={styles.modernSubtitle}>Amazing tech adventures await!</Text>
        </View>

        {/* Modern Play Button */}
        <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
          <TouchableOpacity
            style={[
              styles.modernPlayButton,
              isPressed && styles.playButtonPressed
            ]}
            activeOpacity={0.9}
            onPress={() => {
              setIsPressed(true);
              setTimeout(() => {
                setIsPressed(false);
                handlePlayPress();
              }, 150);
            }}
          >
            <LinearGradient
              colors={['#ff6b6b', '#ee5a24']}
              style={styles.playButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.modernPlayIcon}>
                <Text style={styles.playIconText}>▶</Text>
              </View>
              <Text style={styles.modernPlayButtonText}>Start Adventure!</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Modern Hexagon buttons */}
        <ModernHexagonButton 
          label="Smart AI" 
          emoji="🤖" 
          color="rgba(255, 107, 107, 0.9)" 
          style={styles.aiHex}
          onPress={() => handleHexagonPress('Smart AI')}
        />
        <ModernHexagonButton 
          label="Cool Robots" 
          emoji="🦾" 
          color="rgba(123, 229, 123, 0.9)" 
          style={styles.roboticHex}
          onPress={() => handleHexagonPress('Cool Robots')}
        />
        <ModernHexagonButton 
          label="Auto Magic" 
          emoji="⚡" 
          color="rgba(255, 193, 7, 0.9)" 
          style={styles.automationHex}
          onPress={() => handleHexagonPress('Auto Magic')}
        />
        <ModernHexagonButton 
          label="Super Sensors" 
          emoji="👁️" 
          color="rgba(74, 144, 226, 0.9)" 
          style={styles.sensorHex}
          onPress={() => handleHexagonPress('Super Sensors')}
        />
        <ModernHexagonButton 
          label="Fun Input" 
          emoji="🎮" 
          color="rgba(156, 39, 176, 0.9)" 
          style={styles.inputHex}
          onPress={() => handleHexagonPress('Fun Input')}
        />
        <ModernHexagonButton 
          label="Cool Output" 
          emoji="📱" 
          color="rgba(255, 87, 34, 0.9)" 
          style={styles.outputHex}
          onPress={() => handleHexagonPress('Cool Output')}
        />
        
        {/* Modern Connection Effect */}
        <View style={styles.modernConnector}>
          <Svg height="100%" width="100%" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <Circle
              cx={width * 0.5}
              cy={height * 0.52}
              r={Math.min(width, height) * 0.18}
              fill="none"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="2"
              strokeDasharray="10,5"
            />
          </Svg>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparklePosition: {
    position: 'absolute',
  },
  sparkle: {
    fontSize: 16,
    color: '#FFD700',
  },
  modernLogoContainer: {
    position: 'absolute',
    top: Math.max(height * 0.05, 30),
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  logoSquare: {
    width: 30,
    height: 30,
    borderRadius: 6,
  },
  logoCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: -8,
  },
  logoAccent: {
    width: 16,
    height: 16,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    marginLeft: -12,
    marginTop: -8,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: height * 0.04,
    marginTop: height * 0.08,
    paddingHorizontal: 20,
  },
  mainTitle: {
    fontSize: Math.min(width * 0.08, 32),
    fontWeight: '900',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  modernSubtitle: {
    fontSize: Math.min(width * 0.045, 18),
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textAlign: 'center',
  },
  modernPlayButton: {
    marginBottom: height * 0.06,
    borderRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 20,
  },
  playButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonPressed: {
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    transform: [{ scale: 0.98 }],
  },
  modernPlayIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  playIconText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  modernPlayButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
  modernHexagonContainer: {
    position: 'absolute',
    width: Math.min(width * 0.25, 100),
    height: Math.min(width * 0.25, 100),
    alignItems: 'center',
    justifyContent: 'center',
  },
  hexagonShadow: {
    position: 'absolute',
    width: Math.min(width * 0.22, 90),
    height: Math.min(width * 0.22, 90),
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: Math.min(width * 0.11, 45),
    top: 3,
    left: 3,
  },
  hexagonContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hexagonEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  modernHexagonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  aiHex: {
    top: height * 0.3,
    left: width * 0.08,
  },
  roboticHex: {
    top: height * 0.48,
    left: width * 0.03,
  },
  automationHex: {
    top: height * 0.68,
    left: width * 0.12,
  },
  sensorHex: {
    top: height * 0.28,
    right: width * 0.03,
  },
  inputHex: {
    top: height * 0.46,
    right: width * 0.08,
  },
  outputHex: {
    top: height * 0.66,
    right: width * 0.12,
  },
  modernConnector: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.3,
    zIndex: 1,
    pointerEvents: 'none',
  },
});

export default LearnAndPlayScreen;




// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Animated,
//   Dimensions,
//   SafeAreaView,
//   ScrollView
// } from 'react-native';
// import Svg, { 
//   Polygon, 
//   Circle, 
//   Defs, 
//   LinearGradient as SvgLinearGradient, 
//   Stop, 
//   G 
// } from 'react-native-svg';
// import LinearGradient from 'react-native-linear-gradient';

// const { width, height } = Dimensions.get('window');

// const FloatingParticle = ({ delay = 0, size = 'small' }) => {
//   const animatedValue = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     const animate = () => {
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(animatedValue, {
//             toValue: 1,
//             duration: 8000 + Math.random() * 4000,
//             useNativeDriver: true,
//           }),
//           Animated.timing(animatedValue, {
//             toValue: 0,
//             duration: 0,
//             useNativeDriver: true,
//           }),
//         ])
//       ).start();
//     };

//     setTimeout(() => animate(), delay);
//   }, [delay]);

//   const translateY = animatedValue.interpolate({
//     inputRange: [0, 0.5, 1],
//     outputRange: [height + 50, height * 0.5, -100],
//   });

//   const translateX = animatedValue.interpolate({
//     inputRange: [0, 0.5, 1],
//     outputRange: [0, 20, -10],
//   });

//   const opacity = animatedValue.interpolate({
//     inputRange: [0, 0.2, 0.8, 1],
//     outputRange: [0, 1, 1, 0],
//   });

//   const particleSize = size === 'large' ? 8 : 4;

//   return (
//     <Animated.View
//       style={[
//         styles.particle,
//         {
//           width: particleSize,
//           height: particleSize,
//           left: Math.random() * width,
//           transform: [{ translateY }, { translateX }],
//           opacity,
//         },
//       ]}
//     />
//   );
// };

// const CircuitLine = ({ style }) => (
//   <View style={[styles.circuitLine, style]} />
// );

// const TechHexagon = ({ label, color, emoji, style, isMainTech = false, onPress }) => {
//   const [isPressed, setIsPressed] = useState(false);
//   const scaleAnim = useRef(new Animated.Value(1)).current;
//   const glowAnim = useRef(new Animated.Value(0.3)).current;

//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(glowAnim, {
//           toValue: 0.6,
//           duration: 2000,
//           useNativeDriver: false,
//         }),
//         Animated.timing(glowAnim, {
//           toValue: 0.3,
//           duration: 2000,
//           useNativeDriver: false,
//         }),
//       ])
//     ).start();
//   }, []);

//   const handlePress = () => {
//     setIsPressed(true);
//     Animated.sequence([
//       Animated.timing(scaleAnim, {
//         toValue: 1.1,
//         duration: 100,
//         useNativeDriver: true,
//       }),
//       Animated.timing(scaleAnim, {
//         toValue: 1,
//         duration: 100,
//         useNativeDriver: true,
//       }),
//     ]).start(() => {
//       setIsPressed(false);
//       onPress?.();
//     });
//   };

//   const hexSize = isMainTech ? 120 : 90;

//   return (
//     <TouchableOpacity
//       style={[styles.hexagonContainer, style]}
//       onPress={handlePress}
//       activeOpacity={0.8}
//     >
//       <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
//         {/* Glow effect */}
//         <Animated.View
//           style={[
//             styles.hexagonGlow,
//             {
//               width: hexSize + 20,
//               height: hexSize + 20,
//               backgroundColor: color,
//               opacity: glowAnim,
//             },
//           ]}
//         />

//         {/* Hexagon SVG */}
//         <Svg height={hexSize} width={hexSize} viewBox="0 0 100 100" style={styles.hexagonSvg}>
//           <Polygon
//             points="50,8 88,28 88,72 50,92 12,72 12,28"
//             fill={color}
//             stroke="#ffffff"
//             strokeWidth="2"
//           />
//         </Svg>

//         {/* Content */}
//         <View style={styles.hexagonContent}>
//           <Text style={[styles.hexagonEmoji, { fontSize: isMainTech ? 30 : 22 }]}>
//             {emoji}
//           </Text>
//           <Text style={[styles.hexagonText, { fontSize: isMainTech ? 12 : 10 }]}>
//             {label}
//           </Text>
//         </View>
//       </Animated.View>
//     </TouchableOpacity>
//   );
// };

// const MatrixRain = ({ delay = 0 }) => {
//   const animatedValue = useRef(new Animated.Value(-100)).current;

//   useEffect(() => {
//     const animate = () => {
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(animatedValue, {
//             toValue: height + 100,
//             duration: 3000,
//             useNativeDriver: true,
//           }),
//           Animated.timing(animatedValue, {
//             toValue: -100,
//             duration: 0,
//             useNativeDriver: true,
//           }),
//         ])
//       ).start();
//     };

//     setTimeout(() => animate(), delay);
//   }, [delay]);

//   const binaryString = Array.from({ length: 20 }, () => (Math.random() > 0.5 ? '1' : '0')).join('');

//   return (
//     <Animated.View
//       style={[
//         styles.matrixRain,
//         {
//           left: Math.random() * width,
//           transform: [{ translateY: animatedValue }],
//         },
//       ]}
//     >
//       <Text style={styles.matrixText}>{binaryString}</Text>
//     </Animated.View>
//   );
// };

// const HiveStructure = () => {
//   const glowAnim = useRef(new Animated.Value(0.6)).current;

//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(glowAnim, {
//           toValue: 1,
//           duration: 1500,
//           useNativeDriver: false,
//         }),
//         Animated.timing(glowAnim, {
//           toValue: 0.6,
//           duration: 1500,
//           useNativeDriver: false,
//         }),
//       ])
//     ).start();
//   }, []);

//   return (
//     <View style={styles.hiveContainer}>
//       <Svg width="80" height="90" viewBox="0 0 80 90">
//         <G fill="none" stroke="#a855f7" strokeWidth="2">
//           {/* Top row */}
//           <Polygon points="20,10 30,5 40,10 40,20 30,25 20,20" fill="rgba(168, 85, 247, 0.3)" />
//           <Polygon points="40,10 50,5 60,10 60,20 50,25 40,20" fill="rgba(168, 85, 247, 0.4)" />
          
//           {/* Middle row */}
//           <Polygon points="10,25 20,20 30,25 30,35 20,40 10,35" fill="rgba(168, 85, 247, 0.2)" />
//           <Polygon points="30,25 40,20 50,25 50,35 40,40 30,35" fill="rgba(168, 85, 247, 0.6)" />
//           <Polygon points="50,25 60,20 70,25 70,35 60,40 50,35" fill="rgba(168, 85, 247, 0.3)" />
          
//           {/* Bottom row */}
//           <Polygon points="20,40 30,35 40,40 40,50 30,55 20,50" fill="rgba(168, 85, 247, 0.4)" />
//           <Polygon points="40,40 50,35 60,40 60,50 50,55 40,50" fill="rgba(168, 85, 247, 0.5)" />
          
//           {/* Bottom single */}
//           <Polygon points="30,55 40,50 50,55 50,65 40,70 30,65" fill="rgba(168, 85, 247, 0.3)" />
//         </G>
        
//         {/* Glow effect - using regular G instead of Animated.G */}
//         <G fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.8">
//           <Polygon points="30,25 40,20 50,25 50,35 40,40 30,35" />
//         </G>
//       </Svg>
//     </View>
//   );
// };

// const HIVECoverPage = () => {
//   const [isPressed, setIsPressed] = useState(false);
//   const titleGlowAnim = useRef(new Animated.Value(1)).current;

//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(titleGlowAnim, {
//           toValue: 1.2,
//           duration: 3000,
//           useNativeDriver: false,
//         }),
//         Animated.timing(titleGlowAnim, {
//           toValue: 1,
//           duration: 3000,
//           useNativeDriver: false,
//         }),
//       ])
//     ).start();
//   }, []);

//   const handleExplorePress = () => {
//     console.log('Explore HIVE platform pressed');
//   };

//   const handleHexagonPress = (label) => {
//     console.log(`${label} hexagon pressed`);
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <LinearGradient
//         colors={['#1e1b4b', '#312e81', '#6366f1', '#8b5cf6', '#a855f7']}
//         style={styles.gradient}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//       >
//         <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
//           {/* Animated Background Elements */}
//           {Array.from({ length: 10 }, (_, i) => (
//             <FloatingParticle key={i} delay={i * 200} size={i % 3 === 0 ? 'large' : 'small'} />
//           ))}

//           {Array.from({ length: 5 }, (_, i) => (
//             <MatrixRain key={i} delay={i * 500} />
//           ))}

//           {/* Circuit Lines */}
//           <CircuitLine style={{ top: height * 0.2, left: width * 0.1, width: width * 0.3 }} />
//           <CircuitLine style={{ top: height * 0.6, right: width * 0.15, width: width * 0.25 }} />
//           <CircuitLine style={{ bottom: height * 0.3, left: width * 0.2, width: width * 0.4 }} />

//           {/* LearningBix Logo */}
//           <View style={styles.logoContainer}>
//             <View style={styles.logoIconContainer}>
//               <LinearGradient
//                 colors={['#a855f7', '#ec4899']}
//                 style={styles.logoSquare}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 1 }}
//               />
//               <LinearGradient
//                 colors={['#6366f1', '#8b5cf6']}
//                 style={styles.logoCircle}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 1 }}
//               />
//               <View style={styles.logoAccent} />
//             </View>
//             <View style={styles.logoTextContainer}>
//               <Text style={styles.logoTitle}>LearningBix</Text>
//               <Text style={styles.logoSubtitle}>Future Learning</Text>
//             </View>
//           </View>

//           {/* Main Content */}
//           <View style={styles.mainContent}>
//             {/* Hero Title */}
//             <View style={styles.heroSection}>
//               <View style={styles.titleContainer}>
//                 <HiveStructure />
//                 <Animated.Text style={[styles.mainTitle, { opacity: titleGlowAnim }]}>
//                   HIVE
//                 </Animated.Text>
//               </View>
//               <Text style={styles.subtitle}>The Future of Intelligent Learning</Text>
//               <View style={styles.titleUnderline} />
//             </View>

//             {/* Main Action Button */}
//             <TouchableOpacity
//               style={[styles.mainButton, isPressed && styles.mainButtonPressed]}
//               onPress={() => {
//                 setIsPressed(true);
//                 setTimeout(() => setIsPressed(false), 200);
//                 handleExplorePress();
//               }}
//               activeOpacity={0.9}
//             >
//               <LinearGradient
//                 colors={['#8b5cf6', '#a855f7', '#d946ef']}
//                 style={styles.buttonGradient}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 1 }}
//               >
//                 <Text style={styles.buttonEmoji}>🚀</Text>
//                 <Text style={styles.buttonText}>Enter the HIVE</Text>
//                 <Text style={styles.buttonArrow}>→</Text>
//               </LinearGradient>
//             </TouchableOpacity>

//             {/* Tech Categories - Hexagon Layout */}
//             <View style={styles.hexagonLayout}>
//               {/* Central HIVE Core */}
//               <TechHexagon
//                 label="HIVE CORE"
//                 emoji="🧠"
//                 color="rgba(168, 85, 247, 0.9)"
//                 style={styles.centralHex}
//                 isMainTech={true}
//                 onPress={() => handleHexagonPress('HIVE CORE')}
//               />

//               {/* Surrounding Technologies */}
//               <TechHexagon
//                 label="Machine Learning"
//                 emoji="🤖"
//                 color="rgba(139, 92, 246, 0.8)"
//                 style={styles.topLeftHex}
//                 onPress={() => handleHexagonPress('Machine Learning')}
//               />
//               <TechHexagon
//                 label="Neural Networks"
//                 emoji="🧬"
//                 color="rgba(124, 58, 237, 0.8)"
//                 style={styles.topRightHex}
//                 onPress={() => handleHexagonPress('Neural Networks')}
//               />
//               <TechHexagon
//                 label="Computer Vision"
//                 emoji="👁️"
//                 color="rgba(109, 40, 217, 0.8)"
//                 style={styles.leftHex}
//                 onPress={() => handleHexagonPress('Computer Vision')}
//               />
//               <TechHexagon
//                 label="Robotics"
//                 emoji="🦾"
//                 color="rgba(147, 51, 234, 0.8)"
//                 style={styles.rightHex}
//                 onPress={() => handleHexagonPress('Robotics')}
//               />
//               <TechHexagon
//                 label="Deep Learning"
//                 emoji="⚡"
//                 color="rgba(126, 34, 206, 0.8)"
//                 style={styles.bottomLeftHex}
//                 onPress={() => handleHexagonPress('Deep Learning')}
//               />
//               <TechHexagon
//                 label="Automation"
//                 emoji="⚙️"
//                 color="rgba(159, 18, 218, 0.8)"
//                 style={styles.bottomRightHex}
//                 onPress={() => handleHexagonPress('Automation')}
//               />
//             </View>

//             {/* Connection Web */}
//             <View style={styles.connectionWeb}>
//               <Svg width={width} height={height * 0.6} style={styles.connectionSvg}>
//                 <Defs>
//                   <SvgLinearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
//                     <Stop offset="0%" stopColor="#a855f7" />
//                     <Stop offset="100%" stopColor="#ec4899" />
//                   </SvgLinearGradient>
//                 </Defs>
//                 <Circle
//                   cx={width / 2}
//                   cy={height * 0.3}
//                   r={width * 0.25}
//                   fill="none"
//                   stroke="url(#connectionGradient)"
//                   strokeWidth="1"
//                   strokeDasharray="5,10"
//                   opacity="0.6"
//                 />
//                 <Circle
//                   cx={width / 2}
//                   cy={height * 0.3}
//                   r={width * 0.35}
//                   fill="none"
//                   stroke="url(#connectionGradient)"
//                   strokeWidth="1"
//                   strokeDasharray="10,15"
//                   opacity="0.3"
//                 />
//               </Svg>
//             </View>

//             {/* Tech Stats Footer */}
//             <View style={styles.statsContainer}>
//               <View style={styles.statItem}>
//                 <Text style={styles.statNumber}>1000+</Text>
//                 <Text style={styles.statLabel}>Learning Modules</Text>
//               </View>
//               <View style={styles.statDivider} />
//               <View style={styles.statItem}>
//                 <Text style={styles.statNumber}>500+</Text>
//                 <Text style={styles.statLabel}>Interactive Projects</Text>
//               </View>
//               <View style={styles.statDivider} />
//               <View style={styles.statItem}>
//                 <Text style={styles.statNumber}>24/7</Text>
//                 <Text style={styles.statLabel}>Smart Learning</Text>
//               </View>
//             </View>
//           </View>
//         </ScrollView>
//       </LinearGradient>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#1e1b4b',
//   },
//   gradient: {
//     flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//     minHeight: height,
//   },
//   particle: {
//     position: 'absolute',
//     backgroundColor: '#c4b5fd',
//     borderRadius: 2,
//     opacity: 0.6,
//   },
//   circuitLine: {
//     position: 'absolute',
//     height: 1,
//     backgroundColor: '#a855f7',
//     opacity: 0.2,
//   },
//   logoContainer: {
//     position: 'absolute',
//     top: 40,
//     left: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     zIndex: 20,
//   },
//   logoIconContainer: {
//     position: 'relative',
//     width: 48,
//     height: 48,
//   },
//   logoSquare: {
//     width: 48,
//     height: 48,
//     borderRadius: 8,
//     transform: [{ rotate: '45deg' }],
//   },
//   logoCircle: {
//     position: 'absolute',
//     top: 8,
//     left: 8,
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//   },
//   logoAccent: {
//     position: 'absolute',
//     top: -4,
//     right: -4,
//     width: 16,
//     height: 16,
//     backgroundColor: '#fbbf24',
//     borderRadius: 8,
//   },
//   logoTextContainer: {
//     marginLeft: 16,
//   },
//   logoTitle: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   logoSubtitle: {
//     color: '#c4b5fd',
//     fontSize: 12,
//   },
//   mainContent: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 20,
//     paddingTop: 100,
//   },
//   heroSection: {
//     alignItems: 'center',
//     marginBottom: 60,
//     zIndex: 10,
//   },
//   titleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   hiveContainer: {
//     marginRight: 24,
//   },
//   mainTitle: {
//     fontSize: width * 0.15,
//     fontWeight: '900',
//     color: 'white',
//     textShadowColor: '#a855f7',
//     textShadowOffset: { width: 0, height: 0 },
//     textShadowRadius: 20,
//   },
//   subtitle: {
//     fontSize: 20,
//     color: '#e0e7ff',
//     fontWeight: '300',
//     marginBottom: 24,
//     textAlign: 'center',
//   },
//   titleUnderline: {
//     width: 96,
//     height: 4,
//     backgroundColor: '#a855f7',
//     borderRadius: 2,
//   },
//   mainButton: {
//     marginBottom: 64,
//     borderRadius: 25,
//     elevation: 10,
//     shadowColor: '#a855f7',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.4,
//     shadowRadius: 15,
//     zIndex: 20,
//   },
//   mainButtonPressed: {
//     elevation: 5,
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.2,
//     transform: [{ scale: 0.95 }],
//   },
//   buttonGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 20,
//     paddingHorizontal: 48,
//     borderRadius: 25,
//   },
//   buttonEmoji: {
//     fontSize: 20,
//     marginRight: 12,
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   buttonArrow: {
//     color: 'white',
//     fontSize: 20,
//     marginLeft: 12,
//   },
//   hexagonLayout: {
//     width: width * 0.9,
//     height: height * 0.5,
//     position: 'relative',
//     marginBottom: 40,
//   },
//   hexagonContainer: {
//     position: 'absolute',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   hexagonGlow: {
//     position: 'absolute',
//     borderRadius: 50,
//     top: -10,
//     left: -10,
//   },
//   hexagonSvg: {
//     position: 'absolute',
//   },
//   hexagonContent: {
//     position: 'absolute',
//     alignItems: 'center',
//     justifyContent: 'center',
//     zIndex: 10,
//   },
//   hexagonEmoji: {
//     marginBottom: 4,
//   },
//   hexagonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     textAlign: 'center',
//     textShadowColor: 'rgba(0,0,0,0.8)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 2,
//   },
//   centralHex: {
//     top: '40%',
//     left: '50%',
//     marginLeft: -60,
//     marginTop: -60,
//   },
//   topLeftHex: {
//     top: '10%',
//     left: '20%',
//   },
//   topRightHex: {
//     top: '15%',
//     right: '20%',
//   },
//   leftHex: {
//     top: '45%',
//     left: '5%',
//   },
//   rightHex: {
//     top: '40%',
//     right: '10%',
//   },
//   bottomLeftHex: {
//     bottom: '15%',
//     left: '25%',
//   },
//   bottomRightHex: {
//     bottom: '10%',
//     right: '25%',
//   },
//   connectionWeb: {
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//     zIndex: 0,
//   },
//   connectionSvg: {
//     position: 'absolute',
//     opacity: 0.2,
//   },
//   matrixRain: {
//     position: 'absolute',
//     opacity: 0.2,
//   },
//   matrixText: {
//     color: '#a855f7',
//     fontSize: 12,
//     fontFamily: 'monospace',
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 40,
//     paddingBottom: 40,
//   },
//   statItem: {
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   statNumber: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   statLabel: {
//     color: '#c4b5fd',
//     fontSize: 12,
//     marginTop: 4,
//   },
//   statDivider: {
//     width: 1,
//     height: 32,
//     backgroundColor: '#8b5cf6',
//     opacity: 0.5,
//   },
// });

// export default HIVECoverPage;