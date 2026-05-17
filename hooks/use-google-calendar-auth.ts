import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import {
  getGoogleCalendarConfig,
  GOOGLE_CALENDAR_REDIRECT_SCHEME,
  hasGoogleCalendarClientId,
} from '@/lib/google-calendar-config';

WebBrowser.maybeCompleteAuthSession();

type GoogleCalendarAuthPlatform = 'android' | 'ios' | 'web';

const GOOGLE_CLIENT_ID_PLACEHOLDER = 'missing-google-calendar-client-id.apps.googleusercontent.com';

function getAuthPlatform(): GoogleCalendarAuthPlatform {
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    return Platform.OS;
  }

  return 'web';
}

export function useGoogleCalendarAuth() {
  const config = getGoogleCalendarConfig();
  const platform = getAuthPlatform();
  const redirectUri = AuthSession.makeRedirectUri({ scheme: GOOGLE_CALENDAR_REDIRECT_SCHEME });
  const nativeRedirectUri = 'com.luisbeto.horariodciapp:/oauthredirect';
  const isConfigured = hasGoogleCalendarClientId(platform);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      androidClientId: config.androidClientId || GOOGLE_CLIENT_ID_PLACEHOLDER,
      iosClientId: config.iosClientId || GOOGLE_CLIENT_ID_PLACEHOLDER,
      redirectUri: platform === 'web' ? redirectUri : undefined,
      scopes: [...config.scopes],
      webClientId: config.webClientId || GOOGLE_CLIENT_ID_PLACEHOLDER,
    }
  );

  useEffect(() => {
    if (!response) {
      return;
    }

    if (response.type === 'success') {
      const nextAccessToken = response.authentication?.accessToken ?? null;
      setAccessToken(nextAccessToken);
      setErrorMessage(nextAccessToken ? null : 'Google no devolvió un token de acceso.');
      return;
    }

    if (response.type === 'error') {
      setAccessToken(null);
      setErrorMessage(response.error?.message ?? 'No se pudo completar la autenticación con Google.');
    }
  }, [response]);

  async function signIn() {
    if (!isConfigured || !request) {
      return;
    }

    setErrorMessage(null);

    try {
      await promptAsync();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo abrir el flujo de Google.');
    }
  }

  return {
    accessToken,
    errorMessage,
    isConfigured,
    isReady: Boolean(request),
    platform,
    redirectScheme: GOOGLE_CALENDAR_REDIRECT_SCHEME,
    redirectUri: platform === 'web' ? redirectUri : nativeRedirectUri,
    scopes: config.scopes,
    signIn,
  };
}
