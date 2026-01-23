import 'dotenv/config';

export default {
  expo: {
    name: 'MobileApp',
    slug: 'MobileApp',
    version: '1.0.0',
    scheme: 'mindmate',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      package: 'com.areebach.mindmate',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      usesCleartextTraffic: true,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-asset',
      'expo-font',
      "expo-web-browser",
      [
        "expo-notifications",
        {
          "icon": "./assets/icon.png",
          "color": "#ffffff",
          "sounds": [],
        }
      ],
      [
        "expo-speech-recognition",
        {
          "microphonePermission": "Allow MindMate to use the microphone for voice messages",
          "speechRecognitionPermission": "Allow MindMate to use speech recognition for voice messages"
        }
      ]
    ],
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      google: {
        expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      },
      eas: {
        projectId: 'ad806ab7-46b8-41cb-b3ef-0ea353b9f4b5',
      },
    },
  },
};
