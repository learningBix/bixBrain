import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LearnAndPlayScreen from './src/screens/learnandplay/LearnAndPlayScreen';
import HomeScreen from './src/screens/homescreen/homescreen';
import HallSensorScreen from './src/screens/hallsensor/hallsensor';
import StructureScreen from './src/screens/structure/structurescreen';
import HomeScreenSurveillance from './src/screens/homesurvillance/homesurvillence';
import DevicesIotScreen from './src/screens/iotdevices/iot';
import Dashboard from './src/screens/electriccycle/electriccycle';
import petfeeder from './src/screens/ai_pet_feeder/ai_pet_feeder';
import { MD3LightTheme as DefaultTheme, PaperProvider } from 'react-native-paper';
import safebox from './src/screens/ai_based_safe_box/ai_based_safe_box';
import AutomationScreen from './src/screens/automation/automation';
import NightLamp from './src/screens/automation/night_lamp';
import MorningAlarm from './src/screens/automation/morning_alarm';
import SmartIrrigation from './src/screens/automation/smart_irrigation';
import DoorAlarm from './src/screens/automation/door_alarm';
import WaterOverflowIndication from './src/screens/automation/water_overflow';
import PetFeeder from './src/screens/automation/pet_feeder';
import PersonCounter from './src/screens/automation/person_counter';
import HomeSecurity from './src/screens/automation/home_security_system';
import LiquedDispenser from './src/screens/automation/liqued_dispenser';
import IndoorPlant from './src/screens/automation/indoor_plant_monitor';
import WirelessDoorLock from './src/screens/automation/wireless_door_lock';
import OutputScreen from './src/screens/output/output';
import LEDControl from './src/screens/output/leb_rgb';
import VibrationMotor from './src/screens/output/vibration_motor';
import Buzzer from './src/screens/output/buzzer';
import Music from './src/screens/output/music';
import FanControl from './src/screens/output/fan_control';
import ServoControl from './src/screens/output/servo_motor';
import MotorControl from './src/screens/output/motor_control';
import OLEDDisplay from './src/screens/output/oled_output';
import RoboticsScreen from './src/screens/robotic_car/robotics_activity';
import RoboticCarController from './src/screens/robotic_car/robotics_car';
// import acleCarConobsttroller from './src/screens/robotic_car/obstacleavoidance';
import InputHiveStatus from './src/screens/input/input';
import SensorHiveStatus from './src/screens/sensor/sensor';
import AIScreen from './src/screens/ai_activities/ai_activities';
import FaceDetectionDoorAlarmScreen from './src/screens/ai_activities/camera_based/FaceDetectionDoorAlarmScreen';
import VoiceControllerOutputScreen from '././src/screens/ai_activities/voice_based/VoiceControllerOutputScreen'
import voice_controll_car from './src/screens/ai_activities/voice_based/VoiceControllerCar';
import FaceTractionCameraScreen from './src/screens/ai_activities/camera_based/FaceDetectionBotScreen';
import PortControlScreen from './src/screens/output/esp-001';
// Import your new components (remove .tsx extension)
import FaceMaskDetection from './src/screens/face_mask_detection/FaceMaskDetection';
import FireDetectionRobot from './src/screens/face_mask_detection/FireDetectionRobot';
import MultipleDigitalClassification from './src/screens/face_mask_detection/MultipleDigitalClassification';
import GenderDetection from './src/screens/face_mask_detection/GenderDetection';
import PetDetection from './src/screens/face_mask_detection/PetDetection';
import SensorControl from './src/screens/ai_activities/camera_based/obstacle-avoid';
import DPadControl from './src/screens/ai_activities/camera_based/obstacle-manual';
import LineFollowerScreen from './src/screens/face_mask_detection/lineFollower';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6750A4',
  },
};

type RootStackParamList = {
  LearnAndPlay: undefined;
  Home: undefined;
  StructureScreen: undefined;
  HomeScreenSurveillance: undefined;
  HallSensorScreen: undefined;
  DevicesIotScreen: undefined;
  FaceMaskDetectionScreen: undefined;
  FireDetectionRobotScreen: undefined;
  MultipleDigitalClassificationScreen: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="LearnAndPlay" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="LearnAndPlay" component={LearnAndPlayScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="StructureScreen" component={StructureScreen} />
          <Stack.Screen name="AutomationScreen" component={AutomationScreen} />
          <Stack.Screen name="Roboticsscreen" component={RoboticsScreen} />
          <Stack.Screen name="InputHiveStatus" component={InputHiveStatus} />
          <Stack.Screen name="SensorHiveStatus" component={SensorHiveStatus} />
          <Stack.Screen name="AIScreen" component={AIScreen} />
          <Stack.Screen name="robocar" component={RoboticCarController} />
          {/* <Stack.Screen name="obstacleavoid" component={obstacleCarController} />  */}
          <Stack.Screen name="OutputScreen" component={OutputScreen} />
          <Stack.Screen name="OLEDBlockScreen" component={OLEDDisplay} />
          <Stack.Screen name="RGBLEDScreen" component={LEDControl} />
          <Stack.Screen name="VibrationMotorScreen" component={VibrationMotor} />
          <Stack.Screen name="BuzzerScreen" component={Buzzer} />
          <Stack.Screen name="MusicScreen" component={Music} />
          <Stack.Screen name="FanBlockScreen" component={FanControl} />
          <Stack.Screen name="MotorDriverScreen" component={MotorControl} />
          <Stack.Screen name="ServoMotorWiFiScreen" component={ServoControl} />
          <Stack.Screen name="NightLamp" component={NightLamp} />
          <Stack.Screen name="MorningAlarmScreen" component={MorningAlarm} />
          <Stack.Screen name="SmartIrrigationScreen" component={SmartIrrigation} />
          <Stack.Screen name="DoorAlarmScreen" component={DoorAlarm} />
          <Stack.Screen name="WaterOverflowScreen" component={WaterOverflowIndication} />
          <Stack.Screen name="PetFeederScreen" component={PetFeeder} />
          <Stack.Screen name="PersonCounterScreen" component={PersonCounter} />
          <Stack.Screen name="HomeSecurityScreen" component={HomeSecurity} />
          <Stack.Screen name="LiquidDispenserScreen" component={LiquedDispenser} />
          <Stack.Screen name="PlantMonitorScreen" component={IndoorPlant} />
          <Stack.Screen name="DoorLockScreen" component={WirelessDoorLock} />
          <Stack.Screen name="HomeScreenSurveillance" component={HomeScreenSurveillance} />
          <Stack.Screen name="HallSensorScreen" component={HallSensorScreen} options={{ title: 'Hall Sensor' }} />
          <Stack.Screen name="DevicesIotScreen" component={DevicesIotScreen} options={{ title: 'IoT Camera' }} />
          <Stack.Screen name="Dashboard" component={Dashboard} options={{ title: 'dashboard' }} />
          <Stack.Screen name="petfeeder" component={petfeeder} options={{ title: 'petfeeder' }} />
          <Stack.Screen name="safebox" component={safebox} options={{ title: 'safebox' }} />
          <Stack.Screen name="FaceDetectionDoorAlarmScreen" component={FaceDetectionDoorAlarmScreen} />
          <Stack.Screen name="VoiceControllerOutputScreen" component={VoiceControllerOutputScreen} />
          <Stack.Screen name="VoiceControllerCarScreen" component={voice_controll_car} />
          <Stack.Screen name="FaceDetectionBotScreen" component={FaceTractionCameraScreen} />
          <Stack.Screen name="ESPScreen" component={PortControlScreen} />
          <Stack.Screen name="FaceMaskDetectionScreen" component={FaceMaskDetection} options={{ title: 'Face Mask Detection' }} />
          <Stack.Screen name="FireDetectionRobotScreen" component={FireDetectionRobot} options={{ title: 'Fire Detection Robot' }} />
          <Stack.Screen name="GenderDetectionScreen" component={GenderDetection} options={{ title: 'Gender Detection' }} />
          <Stack.Screen name="PetDetectionScreen" component={PetDetection} options={{ title: 'Gender Detection' }} />
          <Stack.Screen name="SensorControl" component={SensorControl} />
          <Stack.Screen name="dpadControl" component={DPadControl} />
          <Stack.Screen name="MultipleDigitalClassificationScreen" component={MultipleDigitalClassification} />
          <Stack.Screen name="LineFollowerScreen" component={LineFollowerScreen}/>
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;