import React, { useState, useRef, useEffect } from 'react';
import { 
    ScrollView, 
    View, 
    Text, 
    StyleSheet, 
    SafeAreaView, 
    TouchableOpacity, 
    Image, 
    Dimensions,
    StatusBar,
    Animated,
    PanResponder,
    Platform
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type HomeScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85; // Increased to take more screen space
const CARD_HEIGHT = height * 0.6;

const categories = [
    { 
        name: "AI Kit", 
        image: require('../../structure/Structure.jpg'),
        description: "Build intelligent solutions with cutting-edge tools",
        color: '#667eea',
        accent: '#764ba2',
        icon: '🤖'
    },
    { 
        name: "Automation", 
        image: require('../../structure/Automation.png'),
        description: "Streamline workflows and boost productivity",
        color: '#f093fb',
        accent: '#f5576c',
        icon: '⚡'
    },
    { 
        name: "AI", 
        image: require('../../structure/AI.jpg'),
        description: "Explore the future of artificial intelligence",
        color: '#4facfe',
        accent: '#00f2fe',
        icon: '🧠'
    },
];

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
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
            switch (category) {
                case "AI Kit":
                    navigation.navigate('StructureScreen');
                    break;
                case "Automation":
                    navigation.navigate('AutomationScreen');
                    break;
                case "AI":
                    navigation.navigate('AIScreen');
                    break; 
                default:
                    console.log("No screen assigned for this category");
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
                                handleNavigation(item.name, index);
                            }}
                        >
                            <Text style={styles.actionButtonText}>Get Started</Text>
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
            <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />
            
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
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.welcomeText}>Welcome Back!</Text>
                        {/* <Text style={styles.headerTitle}>Choose Your Path</Text> */}
                    </View>
                    {/* <View style={styles.profileIcon}>
                        <Text style={styles.profileEmoji}>👋</Text>
                    </View> */}
                </View>
                {/* <Text style={styles.headerSubtitle}>
                    Discover powerful tools to enhance your workflow
                </Text> */}
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

            {/* Enhanced Bottom Section */}
           
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E1B4B',
    },
    backgroundGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#1E1B4B',
        // Create gradient effect with multiple layers
    },
    backgroundPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(102, 126, 234, 0.08)',
        // Add subtle noise pattern
    },
    geometricPattern1: {
        position: 'absolute',
        top: '12%',
        left: '8%',
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        borderWidth: 2,
        borderColor: 'rgba(102, 126, 234, 0.2)',
    },
    geometricPattern2: {
        position: 'absolute',
        top: '25%',
        right: '12%',
        width: 70,
        height: 70,
        backgroundColor: 'rgba(240, 147, 251, 0.08)',
        transform: [{ rotate: '45deg' }],
        borderWidth: 1,
        borderColor: 'rgba(240, 147, 251, 0.15)',
    },
    geometricPattern3: {
        position: 'absolute',
        bottom: '25%',
        left: '15%',
        width: 85,
        height: 85,
        borderRadius: 42.5,
        backgroundColor: 'rgba(79, 172, 254, 0.08)',
        borderWidth: 2,
        borderColor: 'rgba(79, 172, 254, 0.15)',
        borderStyle: 'dashed',
    },
    floatingOrb1: {
        position: 'absolute',
        top: '18%',
        right: '22%',
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
        elevation: 6,
    },
    floatingOrb2: {
        position: 'absolute',
        top: '55%',
        left: '8%',
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#f093fb',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 4,
    },
    floatingOrb3: {
        position: 'absolute',
        bottom: '30%',
        right: '12%',
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        shadowColor: '#4facfe',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
        elevation: 5,
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
        color: '#A5B4FC',
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
        color: '#CBD5E1',
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
        fontSize: 24,
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
        fontSize: 15,
        color: '#6B7280',
        fontWeight: '500',
        marginBottom: 20,
        lineHeight: 22,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 28,
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
        fontSize: 16,
        marginRight: 8,
    },
    arrowIcon: {
        color: '#FFFFFF',
        fontSize: 18,
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
        marginHorizontal: 6,
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
        color: '#CBD5E1',
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
        color: '#667eea',
        fontSize: 20,
        fontWeight: 'bold',
        marginRight: 12,
    },
    rightArrow: {
        color: '#667eea',
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

export default HomeScreen;