/** @type {import('expo/config').ExpoConfig} */

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ||
  'https://dreamdanceapp.onrender.com';

module.exports = {
  expo: {
    name: 'GrooveX',
    /** Must match the slug of the Expo project for `extra.eas.projectId` (EAS build fails if mismatched). */
    slug: 'dreamdanceapp',
    version: '1.0.0',
    orientation: 'portrait',
    platforms: ['android'],
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    scheme: 'groovex',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#0a0e18',
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#0a0e18',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      package: 'com.groovex.app',
      predictiveBackGestureEnabled: false,
      usesCleartextTraffic: true,
    },
    plugins: ['expo-secure-store'],
    extra: {
      eas: {
        projectId: '4c709f6d-7181-443f-8967-f9ea6ef4e374',
      },
      apiBaseUrl: API_BASE_URL,
    },
  },
};
