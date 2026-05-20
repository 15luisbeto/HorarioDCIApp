import type { ExpoConfig } from 'expo/config';

declare const process: {
  env: Record<string, string | undefined>;
};

const GOOGLE_CALENDAR_SCOPES = [
  'openid',
  'profile',
  'email',
  'https://www.googleapis.com/auth/calendar.events',
] as const;

const config: ExpoConfig = {
  name: 'HorarioDCIApp',
  slug: 'HorarioDCIApp',
  version: '1.1.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'com.luisbeto.horariodciapp',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    edgeToEdgeEnabled: true,
    package: 'com.luisbeto.horariodciapp',
    predictiveBackGestureEnabled: false,
    versionCode: 3,
  },
  extra: {
    eas: {
      projectId: '24ad306c-b677-45e2-8607-bd18334f68fe',
    },
    googleCalendar: {
      androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
      apiBaseUrl: 'https://www.googleapis.com/calendar/v3',
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
      scopes: GOOGLE_CALENDAR_SCOPES,
      timeZone: process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_TIME_ZONE ?? '',
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
    },
  },
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  ios: {
    bundleIdentifier: 'com.luisbeto.horariodciapp',
    supportsTablet: true,
  },
  plugins: [
    'expo-router',
    'expo-sqlite',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: {
          backgroundColor: '#000000',
        },
      },
    ],
  ],
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
};

export default config;
