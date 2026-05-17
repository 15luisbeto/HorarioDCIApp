import Constants from 'expo-constants';

export const GOOGLE_CALENDAR_REDIRECT_SCHEME = 'horariodciapp';

export const GOOGLE_CALENDAR_SCOPES = [
  'openid',
  'profile',
  'email',
  'https://www.googleapis.com/auth/calendar.events',
] as const;

export type GoogleCalendarConfig = {
  androidClientId: string;
  apiBaseUrl: string;
  iosClientId: string;
  scopes: readonly string[];
  timeZone: string;
  webClientId: string;
};

type GoogleCalendarExtra = Partial<GoogleCalendarConfig>;

function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

export function getScheduleTermValidationMessage(startDate: string, endDate: string) {
  if (!startDate || !endDate) {
    return 'Capturá la fecha de inicio y fin del semestre.';
  }

  if (!isIsoDate(startDate)) {
    return 'La fecha de inicio debe ser real y tener formato YYYY-MM-DD.';
  }

  if (!isIsoDate(endDate)) {
    return 'La fecha de fin debe ser real y tener formato YYYY-MM-DD.';
  }

  if (startDate > endDate) {
    return 'La fecha de inicio no puede ser posterior a la fecha de fin.';
  }

  return '';
}

export function hasValidScheduleTermDates(startDate: string, endDate: string) {
  return getScheduleTermValidationMessage(startDate, endDate) === '';
}

function getGoogleCalendarExtra(): GoogleCalendarExtra {
  return (Constants.expoConfig?.extra?.googleCalendar ?? {}) as GoogleCalendarExtra;
}

export function getGoogleCalendarConfig(): GoogleCalendarConfig {
  const extra = getGoogleCalendarExtra();

  return {
    androidClientId: extra.androidClientId ?? '',
    apiBaseUrl: extra.apiBaseUrl ?? 'https://www.googleapis.com/calendar/v3',
    iosClientId: extra.iosClientId ?? '',
    scopes: extra.scopes ?? GOOGLE_CALENDAR_SCOPES,
    timeZone: extra.timeZone ?? '',
    webClientId: extra.webClientId ?? '',
  };
}

export function hasGoogleCalendarTimeZoneConfig() {
  const config = getGoogleCalendarConfig();

  return Boolean(config.timeZone);
}

export function hasGoogleCalendarClientId(platform: 'android' | 'ios' | 'web') {
  const config = getGoogleCalendarConfig();

  if (platform === 'android') {
    return Boolean(config.androidClientId);
  }

  if (platform === 'ios') {
    return Boolean(config.iosClientId);
  }

  return Boolean(config.webClientId);
}
