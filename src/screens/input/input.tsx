import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Dimensions,
  Modal
} from 'react-native';
import dgram from 'react-native-udp';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Buffer } from 'buffer';

const ESP32_IP = 'esptest.local';
const ESP32_PORT = 8888;
const LISTEN_PORT = 12345;

// Two display modes only (UI selection; not used for on/off codes any more)
const sensorCommands = {
  'Momentary Button': 0xA1,
  'On/Off Button':    0xA9
};
const sensorOptions = Object.keys(sensorCommands);

const SensorHiveStatus = () => {
  const [rawSensorValue, setRawSensorValue] = useState(0);
  const [selectedSensor, setSelectedSensor] = useState(sensorOptions[0]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSensorActive, setIsSensorActive] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = dgram.createSocket('udp4');
    socketRef.current = socket;

    socket.bind(LISTEN_PORT, () => {
      console.log(`Listening on port ${LISTEN_PORT}`);
    });

    socket.on('message', (msg) => {
      try {
        const rawValue = msg.readUInt8(0);
        console.log(`Raw value received: ${rawValue}`);
        setRawSensorValue(rawValue);
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });

    return () => {
      if (socket) {
        console.log('Closing socket');
        socket.close();
      }
    };
  }, []);

  const sendCommand = (command) => {
    const socket = socketRef.current;
    if (socket) {
      const message = Buffer.from([command]);
      socket.send(message, 0, message.length, ESP32_PORT, ESP32_IP, (err) => {
        if (err) console.error('Send error:', err);
        else console.log(`Sent command: 0x${command.toString(16)}`);
      });
    }
  };

  const handleSensorChange = (sensor) => {
    setSelectedSensor(sensor);
    setIsModalVisible(false);
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const handleTurnOn = () => {
    setIsSensorActive(true);
    console.log('Turn On clicked → sending 0xA1');
    sendCommand(0xA1);
  };

  const handleTurnOff = () => {
    setIsSensorActive(false);
    console.log('Turn Off clicked → sending 0xC0');
    sendCommand(0xC0);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.layeredCardContainer}>
            <View style={styles.sectionHeader}>
              <Icon name="touch-app" size={24} color="#fff" style={styles.headerIcon} />
              <Text style={styles.sectionHeaderText}>{selectedSensor.replace("Button" , "")}</Text>
            </View>

            <View style={styles.rowContainer}>
              <View style={[styles.sensorCard, styles.sideBySideCard]}>
                <Text style={[styles.cardTitle, styles.centeredText]}>Mode</Text>
                <TouchableOpacity style={styles.selectedSensorButton} onPress={toggleModal}>
                  <Text style={[styles.selectedSensorText, styles.centeredText]}>
                    {selectedSensor}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.sensorCard, styles.sideBySideCard]}>
                <Text style={[styles.cardTitle, styles.centeredText]}>Last Value</Text>
                <View style={styles.readingContainer}>
                  <View style={styles.readingPill}>
                    <Text style={[styles.readingValue, styles.centeredText]}>
                      {rawSensorValue != null ? rawSensorValue : 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.toggleButtonsContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, styles.turnOnButton]}
                onPress={handleTurnOn}
              >
                <Icon name="power-settings-new" size={24} color="#fff" />
                <Text style={[styles.toggleButtonText, styles.centeredText]}>Turn On</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, styles.turnOffButton]}
                onPress={handleTurnOff}
              >
                <Icon name="power-off" size={24} color="#fff" />
                <Text style={[styles.toggleButtonText, styles.centeredText]}>Turn Off</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={toggleModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={[styles.modalTitle, styles.centeredText]}>Select Mode</Text>
              <ScrollView contentContainerStyle={styles.modalScrollContainer}>
                {sensorOptions.map((sensor) => (
                  <TouchableOpacity
                    key={sensor}
                    style={styles.modalOptionButton}
                    onPress={() => handleSensorChange(sensor)}
                  >
                    <Text style={[styles.modalOptionText, styles.centeredText]}>
                      {sensor}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.modalCloseButton} onPress={toggleModal}>
                <Text style={[styles.modalCloseText, styles.centeredText]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default SensorHiveStatus;

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3F0D70',
  },
  container: {
    flex: 1,
    backgroundColor: '#3F0D70',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
    width: '100%',
    minHeight: height - 40,
  },
  sectionHeader: {
    position: 'absolute',
    top: -25,
    left: '50%',
    transform: [{ translateX: -50 }],
    flexDirection: 'row',
    backgroundColor: '#F36B99',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    zIndex: 1,
  },
  headerIcon: {
    marginRight: 10,
    color: '#fff',
  },
  sectionHeaderText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  layeredCardContainer: {
    backgroundColor: '#5E2D89',
    borderRadius: 30,
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
    width: '90%',
    position: 'relative',
    marginTop: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  sensorCard: {
    backgroundColor: '#7B43A1',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  sideBySideCard: {
    width: '48%',
  },
  cardTitle: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  readingContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  readingPill: {
    backgroundColor: '#F36B99',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 50,
    alignItems: 'center',
  },
  readingValue: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  centeredText: {
    textAlign: 'center',
  },
  selectedSensorButton: {
    backgroundColor: '#F36B99',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 10,
    width: '100%',
  },
  selectedSensorText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#5E2D89',
    borderRadius: 30,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalScrollContainer: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  modalOptionButton: {
    backgroundColor: '#7B43A1',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 5,
    width: '100%',
  },
  modalOptionText: {
    color: '#fff',
    fontSize: 18,
  },
  modalCloseButton: {
    backgroundColor: '#F36B99',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 15,
    width: '100%',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 20,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 120,
    justifyContent: 'center',
  },
  turnOnButton: {
    backgroundColor: '#7B43A1',
  },
  turnOffButton: {
    backgroundColor: '#F36B99',
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
});
