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
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import dgram from 'react-native-udp';

// Declare global type for projectIP
declare global {
  var projectIP: string;
}

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  IPConfig: { ssid: string; password: string };
  Home: undefined;
};

type IPConfigScreenNavigationProp = StackNavigationProp<RootStackParamList, 'IPConfig'>;
type IPConfigScreenRouteProp = RouteProp<RootStackParamList, 'IPConfig'>;

const IPConfigScreen: React.FC = () => {
  const navigation = useNavigation<IPConfigScreenNavigationProp>();
  const route = useRoute<IPConfigScreenRouteProp>();
  const [ipAddress, setIpAddress] = useState('192.168.4.1'); // Static default IP

  const { ssid, password } = route.params;

  const validateIPAddress = (ip: string) => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  const sendWiFiCredentials = async (targetIP: string, ssid: string, password: string) => {
    try {
      const message = `SSID:${ssid};PASS:${password}`;
      
      // Create UDP socket and send data
      const socket = dgram.createSocket({ type: 'udp4' });
      
      return new Promise<{success: boolean, message: string}>((resolve) => {
        // Set timeout for UDP response
        const timeout = setTimeout(() => {
          socket.close();
          resolve({ success: false, message: 'No response from device. Please check the IP address and try again.' });
        }, 5000); // 5 second timeout
        
        // Send UDP packet
        socket.send(message, 0, message.length, 5000, targetIP, (error) => {
          if (error) {
            clearTimeout(timeout);
            socket.close();
            resolve({ success: false, message: 'Failed to send UDP packet. Please check the connection.' });
          } else {
            // UDP is fire-and-forget, so we consider it successful if no immediate error
            clearTimeout(timeout);
            socket.close();
            resolve({ success: true, message: 'WiFi credentials sent via UDP successfully!' });
          }
        });
      });
    } catch (error) {
      return { success: false, message: 'UDP communication failed. Please check the IP address and try again.' };
    }
  };

  const handleSubmit = async () => {
    if (!ipAddress.trim()) {
      Alert.alert('Error', 'Please enter IP address');
      return;
    }
    
    if (!validateIPAddress(ipAddress)) {
      Alert.alert('Error', 'Please enter a valid IP address (e.g., 192.168.4.1)');
      return;
    }

    // Update the global IP address for the entire project
    global.projectIP = ipAddress;
    console.log('🌐 Updated project IP to:', ipAddress);

        // Don't send credentials again - just update the IP for future communications
    Alert.alert(
      'IP Updated Successfully!',
      `New control IP set to: ${ipAddress}\n\nThis IP will be used for all future hardware control communications throughout the app.`,
      [
        {
          text: 'Continue',
          onPress: () => navigation.navigate('Home'),
        },
      ]
    );
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
            {/* IP Address Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Hardware Control IP Address</Text>
              <Text style={styles.inputDescription}>
                This IP will be used for controlling the hardware throughout the app
              </Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="192.168.4.1"
                  placeholderTextColor="#9CA3AF"
                  value={ipAddress}
                  onChangeText={setIpAddress}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="default"
                />
                <Text style={styles.inputIcon}>🔗</Text>
              </View>
            </View>



            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.buttonGradient}
              >
                <Text style={styles.submitButtonText}>Set Control IP</Text>
                <Text style={styles.arrowIcon}>🌐</Text>
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
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0E7FF',
    opacity: 0.8,
  },
  scrollContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  networkIcon: {
    fontSize: 80,
  },
  wifiInfoCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  wifiInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  wifiInfoText: {
    fontSize: 14,
    color: '#E0E7FF',
    marginBottom: 4,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: width * 0.04, // Reduced padding to decrease height
    width: '100%', // Full width
    maxWidth: 600, // Increased max width
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputContainer: {
    marginBottom: 16, // Reduced spacing between inputs
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  inputDescription: {
    fontSize: 14,
    color: '#E0E7FF',
    opacity: 0.8,
    marginBottom: 8,
    lineHeight: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 12,
  },
  inputIcon: {
    fontSize: 20,
    marginLeft: 8,
  },
  submitButton: {
    marginTop: 12, // Reduced top margin
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12, // Reduced vertical padding
    paddingHorizontal: 24,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  arrowIcon: {
    fontSize: 20,
  },
  helpCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  helpIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#E0E7FF',
    lineHeight: 20,
  },
});

export default IPConfigScreen; 