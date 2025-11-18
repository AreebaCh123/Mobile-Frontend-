// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

// Screens
import ProfileSetup from './src/screens/ProfileSetup';
import CrisisSupport from './src/screens/CrisisSupport';
import AlertSent from './src/screens/AlertSent';
import Onboarding from './src/screens/Onboarding';
import Login from './src/screens/Login';
import Signup from './src/screens/Signup';
import ForgotPassword from './src/screens/ForgotPassword';
import Home from './src/screens/Home';
import Settings from './src/screens/Settings';
import EditProfile from './src/screens/EditProfile';
import EmergencyContact from './src/screens/EmergencyContact';
import DeleteAccount from './src/screens/DeleteAccount';
import JournalEntry from './src/screens/JournalEntry';
import Chatbot from './src/screens/Chatbot';
import JournalHistory from './src/screens/JournalHistory';
import MoodTracker from './src/screens/MoodTracker';
import MoodHistory from './src/screens/MoodHistory';
import Dashboard from './src/screens/Dashboard';
import Tasks from './src/screens/Tasks';
import AddTask from './src/screens/AddTask';
import Medications from './src/screens/Medications';
import AddMedication from './src/screens/AddMedication';
import SelfHelpTools from './src/screens/SelfHelpTools';
import ExerciseDetail from './src/screens/ExerciseDetail';
import Affirmations from './src/screens/Affirmations';
import Gratitude from './src/screens/Gratitude';
import Notification from './src/screens/Notification';
import TalkToDoctor from './src/screens/TalkToDoctor';

// Theme
import { colors } from './src/themes/tokens';
import { ThemeProvider } from './src/context/ThemeContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

import { ThemeContext } from './src/context/ThemeContext';

function HomeTabs() {
  const { isDark } = React.useContext(ThemeContext);
  const tabBg = isDark ? '#050509' : colors.bg;
  const activeColor = isDark ? colors.accent : colors.accent;
  const inactiveColor = isDark ? '#9CA3AF' : '#9AA0A6';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: { backgroundColor: tabBg, borderTopColor: '#222' },
        tabBarIcon: ({ color, size }) => {
          const iconMap = {
            HomeTab: 'home',
            Journal: 'book-open',
            Tasks: 'check-square',
            Chat: 'message-circle',
            Play: 'activity', // fixed to match tab name
          };
          const name = iconMap[route.name] || 'circle';
          return <Feather name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={Home} options={{ title: 'Home' }} />
      <Tab.Screen name="Journal" component={JournalEntry} />
      <Tab.Screen name="Tasks" component={Tasks} />
      <Tab.Screen name="Chat" component={Chatbot} />
      <Tab.Screen name="Play" component={SelfHelpTools} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false }}>
          {/* Entry flow */}
          <Stack.Screen name="Onboarding" component={Onboarding} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />

          {/* Main area: bottom tabs */}
          <Stack.Screen name="Home" component={HomeTabs} />
          <Stack.Screen name="ProfileSetup" component={ProfileSetup} />
          <Stack.Screen name="CrisisSupport" component={CrisisSupport} />
          <Stack.Screen name="AlertSent" component={AlertSent} />
          <Stack.Screen name="Chatbot" component={Chatbot} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="AddTask" component={AddTask} />
          <Stack.Screen name="Medications" component={Medications} />
          <Stack.Screen name="AddMedication" component={AddMedication} />
          <Stack.Screen name="SelfHelpTools" component={SelfHelpTools} />
          <Stack.Screen name="ExerciseDetail" component={ExerciseDetail} />
          <Stack.Screen name="Affirmations" component={Affirmations} />

          {/* Extra standalone screens */}
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="EmergencyContact" component={EmergencyContact} />
          <Stack.Screen name="DeleteAccount" component={DeleteAccount} />
          <Stack.Screen name="MoodTracker" component={MoodTracker} />
          <Stack.Screen name="MoodHistory" component={MoodHistory} />
          <Stack.Screen name="JournalHistory" component={JournalHistory} />
          <Stack.Screen name="Gratitude" component={Gratitude} />
          <Stack.Screen name="Notification" component={Notification} />
          <Stack.Screen name="TalkToDoctor" component={TalkToDoctor} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
