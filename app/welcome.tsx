import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useGoogleCalendarAuth } from '@/hooks/use-google-calendar-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppPreferences } from '@/providers/app-preferences';

export default function WelcomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const googleCalendarAuth = useGoogleCalendarAuth();
  const { completeWelcome } = useAppPreferences();
  const canStartGoogleAuth = googleCalendarAuth.isConfigured && googleCalendarAuth.isReady;

  async function enterApp() {
    await completeWelcome();
    router.replace('/');
  }

  async function linkGoogleCalendar() {
    if (!canStartGoogleAuth) {
      Alert.alert(
        'Google Calendar no está listo',
        googleCalendarAuth.isConfigured
          ? 'El flujo de Google todavía se está preparando. Intentá de nuevo en unos segundos.'
          : 'Falta configurar el Client ID correspondiente. Podés entrar sin vincular y hacerlo después.'
      );
      return;
    }

    const didConnect = await googleCalendarAuth.signIn();

    if (didConnect) {
      await enterApp();
    }
  }

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}> 
        <View style={[styles.iconBadge, { backgroundColor: colors.tintSoft }]}> 
          <IconSymbol color={colors.tint} name="calendar.badge.clock" size={34} />
        </View>
        <ThemedText type="title" style={styles.title}>Bienvenido a Comunidad DCI</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textMuted }]}> 
          Generá horarios sin choques, guardá tus combinaciones favoritas y decidí después si querés exportarlas o enviarlas a Google Calendar.
        </ThemedText>

        <View style={[styles.choiceCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}> 
          <ThemedText type="subtitle">¿Querés vincular Google Calendar ahora?</ThemedText>
          <ThemedText style={{ color: colors.textMuted }}>
            La conexión solo habilita el envío de horarios guardados. También podés entrar sin vincular y configurarlo más tarde desde Exportar horarios.
          </ThemedText>
        </View>

        {googleCalendarAuth.errorMessage ? (
          <ThemedText style={{ color: colors.danger }}>{googleCalendarAuth.errorMessage}</ThemedText>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            disabled={!canStartGoogleAuth}
            onPress={() => void linkGoogleCalendar()}
            style={[
              styles.primaryButton,
              {
                backgroundColor: canStartGoogleAuth ? colors.tint : colors.surfaceStrong,
                opacity: canStartGoogleAuth ? 1 : 0.55,
              },
            ]}>
            <IconSymbol color={canStartGoogleAuth ? colors.tintContrast : colors.textMuted} name="paperplane.fill" size={18} />
            <ThemedText style={{ color: canStartGoogleAuth ? colors.tintContrast : colors.textMuted }}>
              Vincular Google Calendar
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => void enterApp()}
            style={[styles.secondaryButton, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}> 
            <ThemedText type="defaultSemiBold" style={{ color: colors.tint }}>Entrar sin vincular</ThemedText>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 32,
    padding: 24,
    gap: 18,
    shadowOpacity: 0.22,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  choiceCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 8,
  },
  actions: {
    gap: 10,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  secondaryButton: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
});
