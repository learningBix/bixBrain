import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import dgram from 'react-native-udp';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  WiFiConfig: undefined;
  IPConfig: { ssid: string; password: string };
  Home: undefined;
};

type WiFiConfigScreenNavigationProp = StackNavigationProp<RootStackParamList, 'WiFiConfig'>;

const WiFiConfigScreen: React.FC = () => {
  const navigation = useNavigation<WiFiConfigScreenNavigationProp>();
  const [ssid, setSsid] = useState('DemoWiFi'); // Default SSID
  const [password, setPassword] = useState('demo123456'); // Default password
  const [showPassword, setShowPassword] = useState(false);
  const [deviceIP, setDeviceIP] = useState('192.168.4.1');



  const sendWiFiCredentials = async (ssid: string, password: string, targetIP: string) => {
    try {
      const message = `SSID:${ssid};PASS:${password}`;
      
      console.log('🔧 Sending UDP packet to:', targetIP + ':5000');
      console.log('📤 Message:', message);
      console.log('📱 Using React Native UDP library');
      
      // Create UDP socket with explicit options
      const socket = dgram.createSocket({ 
        type: 'udp4',
        reusePort: false,
        debug: true
      });
      
      return new Promise<{success: boolean, message: string}>((resolve) => {
        // Bind to a random port for sending
        socket.bind(0, () => {
          console.log('🔗 Socket bound, sending packet...');
          
          const timeout = setTimeout(() => {
            console.log('⏰ UDP timeout - no response received');
            socket.close();
            resolve({ 
              success: false, 
              message: 'No response from device. Please check:\n1. Phone connected to hardware WiFi\n2. Hardware is powered on\n3. Hardware IP is 192.168.4.1' 
            });
          }, 5000);
          
          // Send UDP packet with explicit parameters
          socket.send(message, 0, message.length, 5000, targetIP, (error) => {
            if (error) {
              console.log('❌ UDP send error:', error);
              console.log('🔍 Error details:', error.message);
              clearTimeout(timeout);
              socket.close();
              resolve({ 
                success: false, 
                message: 'Failed to send UDP packet. Error: ' + error.message 
              });
            } else {
              console.log('✅ UDP packet sent successfully');
              console.log('📤 Packet details:');
              console.log('   - Target IP:', targetIP);
              console.log('   - Port:', 5000);
              console.log('   - Message length:', message.length);
              console.log('   - Message:', message);
              clearTimeout(timeout);
              socket.close();
              resolve({ success: true, message: 'WiFi credentials sent via UDP successfully!' });
            }
          });
        });
      });
    } catch (error) {
      console.log('💥 UDP communication error:', error);
      return { 
        success: false, 
        message: 'UDP communication failed. Error: ' + error.message 
      };
    }
  };

  const handleSubmit = async () => {
    if (!ssid.trim()) {
      Alert.alert('Error', 'Please enter SSID');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter password');
      return;
    }

    // Send credentials to the specified IP address
    const result = await sendWiFiCredentials(ssid, password, deviceIP);
    
    if (result.success) {
      Alert.alert(
        'Success!',
        `WiFi credentials sent successfully!\n\nSSID: ${ssid}\nIP: ${deviceIP}:5000\n\nMessage sent: SSID:${ssid};PASS:${password}`,
        [
          {
            text: 'Continue',
            onPress: () => navigation.navigate('IPConfig', { ssid, password }),
          },
        ]
      );
    } else {
      Alert.alert(
        'Connection Failed',
        result.message,
        [
          {
            text: 'Try Again',
            onPress: () => {}, // Stay on current screen
          },
          {
            text: 'Continue Anyway',
            onPress: () => navigation.navigate('Home'),
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#581C87" />
      
      <LinearGradient
        colors={['#581C87', '#7C3AED', '#A855F7']}
        style={styles.gradient}
      >
        {/* Centered Content Container */}
        <View style={styles.centerContainer}>
          {/* Form */}
          <View style={styles.formContainer}>
            {/* SSID Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Network Name (SSID)</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your WiFi network name"
                  placeholderTextColor="#9CA3AF"
                  value={ssid}
                  onChangeText={setSsid}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Text style={styles.inputIcon}>📡</Text>
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your WiFi password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIconText}>
                    {showPassword ? '👁️' : '🙈'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>





            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#F14AA1', '#E91E63']}
                style={styles.buttonGradient}
              >
                <Text style={styles.submitButtonText}>Send to Device</Text>
                <Text style={styles.arrowIcon}>📡</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#581C87',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    width: '100%',
    paddingHorizontal: width * 0.06,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: width * 0.04, // Reduced from 0.05 to 0.04
    width: '98%',
    maxWidth: 500,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputContainer: {
    marginBottom: height * 0.015, // Reduced from 0.025 to 0.015
  },
  inputLabel: {
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    minHeight: height * 0.05, // Reduced from 0.06 to 0.05
  },
  textInput: {
    flex: 1,
    fontSize: Math.min(width * 0.04, 16),
    color: '#1F2937',
    paddingVertical: 12,
  },
  inputIcon: {
    fontSize: Math.min(width * 0.05, 20),
    marginLeft: 8,
  },
  eyeIcon: {
    padding: 8,
    minWidth: 36, // Ensure adequate touch target
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeIconText: {
    fontSize: Math.min(width * 0.05, 20),
  },
  submitButton: {
    marginTop: height * 0.015, // Reduced from 0.02 to 0.015
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: width * 0.01,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.015, // Reduced from 0.02 to 0.015
    paddingHorizontal: 24,
    minHeight: height * 0.05, // Reduced from 0.06 to 0.05
  },
  submitButtonText: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  arrowIcon: {
    fontSize: Math.min(width * 0.05, 20),
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: width * 0.04,
    marginHorizontal: width * 0.02,
    marginTop: height * 0.01,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoIcon: {
    fontSize: Math.min(width * 0.05, 20),
    marginRight: 12,
    marginTop: 2, // Slight adjustment for better alignment
  },
  infoText: {
    flex: 1,
    fontSize: Math.min(width * 0.035, 14),
    color: '#E0E7FF',
    lineHeight: Math.min(width * 0.05, 20),
  },
});

export default WiFiConfigScreen