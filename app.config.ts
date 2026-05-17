import type { ExpoConfig } from 'expo/config';

import appJson from './app.json';

declare const process: {
  env: Record<string, string | undefined>;
};

const GOOGLE_CALENDAR_SCOPES = [
  'openid',
  'profile',
  'email',
  'https://www.googleapis.com/auth/calendar.events',
] as const;

const baseConfig = appJson.expo as ExpoConfig & {
  extra?: Record<string, unknown>;
};

const config: ExpoConfig = {
  ...baseConfig,
  android: {
    ...baseConfig.android,
    package: 'com.luisbeto.horariodciapp',
  },
  extra: {
    ...baseConfig.extra,
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
  ios: {
    ...baseConfig.ios,
    bundleIdentifier: 'com.luisbeto.horariodciapp',
  },
};

export default config;
