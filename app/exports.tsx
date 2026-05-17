import { Alert, Platform, Pressable, ScrollView, Share, StyleSheet, TextInput, View } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGoogleCalendarAuth } from '@/hooks/use-google-calendar-auth';
import { getGoogleCalendarConfig, getScheduleTermValidationMessage, hasValidScheduleTermDates } from '@/lib/google-calendar-config';
import { syncFavoriteToGoogleCalendar } from '@/lib/google-calendar-events';
import { buildFavoritePdfHtml, buildFavoritesPdfHtml, formatFavoriteExportText, type FavoriteSchedule } from '@/lib/schedules';
import { useAppPreferences } from '@/providers/app-preferences';

export default function ExportsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const {
    favorites,
    scheduleTermEndDate,
    scheduleTermStartDate,
    setScheduleTermDates,
  } = useAppPreferences();
  const googleCalendarAuth = useGoogleCalendarAuth();
  const googleCalendarConfig = getGoogleCalendarConfig();
  const [draftTermStartDate, setDraftTermStartDate] = useState(scheduleTermStartDate);
  const [draftTermEndDate, setDraftTermEndDate] = useState(scheduleTermEndDate);
  const [selectedFavoriteIds, setSelectedFavoriteIds] = useState<string[]>([]);
  const [syncingFavoriteId, setSyncingFavoriteId] = useState<string | null>(null);
  const scheduleTermValidationMessage = getScheduleTermValidationMessage(scheduleTermStartDate, scheduleTermEndDate);
  const draftScheduleTermValidationMessage = getScheduleTermValidationMessage(draftTermStartDate.trim(), draftTermEndDate.trim());
  const hasScheduleTermDates = hasValidScheduleTermDates(scheduleTermStartDate, scheduleTermEndDate);
  const canStartGoogleAuth = googleCalendarAuth.isConfigured && googleCalendarAuth.isReady;
  const canSyncGoogleCalendar = Boolean(googleCalendarAuth.accessToken && googleCalendarConfig.timeZone && hasScheduleTermDates);

  useEffect(() => {
    setDraftTermStartDate(scheduleTermStartDate);
    setDraftTermEndDate(scheduleTermEndDate);
  }, [scheduleTermEndDate, scheduleTermStartDate]);

  async function exportFavorite(favorite: FavoriteSchedule) {
    try {
      if (Platform.OS === 'web') {
        await Share.share({ title: favorite.title, message: formatFavoriteExportText(favorite) });
        return;
      }

      const { uri } = await Print.printToFileAsync({ html: buildFavoritePdfHtml(favorite), base64: false });
      const canShare = await Sharing.isAvailableAsync();

      if (!canShare) {
        Alert.alert('Exportación lista', `Se generó el PDF en:\n${uri}`);
        return;
      }

      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      Alert.alert('No pude exportar el horario', error instanceof Error ? error.message : 'Ocurrió un error inesperado.');
    }
  }

  async function exportMultipleFavorites() {
    const selectedFavorites = favorites.filter((favorite) => selectedFavoriteIds.includes(favorite.id));

    if (selectedFavorites.length === 0) {
      return;
    }

    try {
      if (Platform.OS === 'web') {
        await Share.share({
          title: 'Horarios favoritos',
          message: selectedFavorites.map((favorite) => formatFavoriteExportText(favorite)).join('\n\n----------------\n\n'),
        });
        return;
      }

      const { uri } = await Print.printToFileAsync({ html: buildFavoritesPdfHtml(selectedFavorites), base64: false });
      const canShare = await Sharing.isAvailableAsync();

      if (!canShare) {
        Alert.alert('Exportación lista', `Se generó el PDF en:\n${uri}`);
        return;
      }

      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      Alert.alert('No pude exportar los horarios', error instanceof Error ? error.message : 'Ocurrió un error inesperado.');
    }
  }

  function toggleSelection(favoriteId: string) {
    setSelectedFavoriteIds((current) =>
      current.includes(favoriteId) ? current.filter((id) => id !== favoriteId) : [...current, favoriteId]
    );
  }

  async function sendFavoriteToGoogleCalendar(favorite: FavoriteSchedule) {
    if (!googleCalendarAuth.accessToken) {
      Alert.alert('Google Calendar no está conectado', 'Conectá Google Calendar en esta sesión antes de enviar un horario.');
      return;
    }

    if (!hasScheduleTermDates) {
      Alert.alert('Periodo académico inválido', scheduleTermValidationMessage);
      return;
    }

    try {
      setSyncingFavoriteId(favorite.id);
      const createdEvents = await syncFavoriteToGoogleCalendar(favorite, googleCalendarAuth.accessToken, {
        termEndDate: scheduleTermEndDate,
        termStartDate: scheduleTermStartDate,
      });
      Alert.alert('Horario enviado', `Se crearon ${createdEvents} eventos en tu Google Calendar.`);
    } catch (error) {
      Alert.alert('No pude enviar el horario', error instanceof Error ? error.message : 'Ocurrió un error inesperado.');
    } finally {
      setSyncingFavoriteId(null);
    }
  }

  async function saveScheduleTermDates() {
    const normalizedStartDate = draftTermStartDate.trim();
    const normalizedEndDate = draftTermEndDate.trim();
    const validationMessage = getScheduleTermValidationMessage(normalizedStartDate, normalizedEndDate);

    if (validationMessage) {
      Alert.alert('Periodo académico inválido', validationMessage);
      return;
    }

    try {
      await setScheduleTermDates(normalizedStartDate, normalizedEndDate);
      Alert.alert('Periodo guardado', 'Ya podés enviar tus horarios favoritos a Google Calendar.');
    } catch (error) {
      Alert.alert('No pude guardar el periodo', error instanceof Error ? error.message : 'Ocurrió un error inesperado.');
    }
  }

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}> 
        <ThemedText type="title">Exportar horarios</ThemedText>
        <ThemedText style={{ color: colors.textMuted }}>
          Primero configurá la cuenta y el periodo. Después elegí qué favoritos exportar en PDF o enviar a Google Calendar.
        </ThemedText>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}> 
        <View style={styles.sectionTitleWrap}>
          <ThemedText type="subtitle">Conexión con Google</ThemedText>
          <ThemedText style={{ color: colors.textMuted }}>Configuración de cuenta para habilitar envíos a Google Calendar.</ThemedText>
        </View>

        <View style={styles.statsRow}>
          <StatPill label="Plataforma" value={formatGooglePlatformLabel(googleCalendarAuth.platform)} colors={colors} />
          <StatPill label="Client ID" value={googleCalendarAuth.isConfigured ? 'Configurado' : 'Pendiente'} colors={colors} />
        </View>

        <View style={[styles.oauthInfoCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}> 
          <ThemedText type="defaultSemiBold">Redirect URI</ThemedText>
          <ThemedText selectable style={[styles.monoText, { color: colors.textMuted }]}>{googleCalendarAuth.redirectUri}</ThemedText>
          <ThemedText style={{ color: colors.textMuted }}>
            En Android se valida con package + SHA-1. No registres este redirect como Web; usalo solo como referencia técnica del retorno a la app.
          </ThemedText>
        </View>

        <ThemedText style={{ color: googleCalendarAuth.accessToken ? colors.tint : colors.textMuted }}>
          Estado: {googleCalendarAuth.accessToken ? 'Conectado en esta sesión' : 'Sin conexión activa'}
        </ThemedText>
        {googleCalendarAuth.errorMessage ? <ThemedText style={{ color: colors.danger }}>{googleCalendarAuth.errorMessage}</ThemedText> : null}
        {!googleCalendarAuth.isConfigured ? (
          <ThemedText style={{ color: colors.textMuted }}>Falta completar el client ID correspondiente en `.env`. No uses credenciales reales dentro del código.</ThemedText>
        ) : null}

        <Pressable disabled={!canStartGoogleAuth} onPress={() => void googleCalendarAuth.signIn()} style={[styles.primaryButton, { backgroundColor: canStartGoogleAuth ? colors.tint : colors.surfaceStrong, opacity: canStartGoogleAuth ? 1 : 0.55 }]}> 
          <IconSymbol color={canStartGoogleAuth ? colors.tintContrast : colors.textMuted} name="paperplane.fill" size={16} />
          <ThemedText style={{ color: canStartGoogleAuth ? colors.tintContrast : colors.textMuted }}>Conectar con Google</ThemedText>
        </Pressable>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}> 
        <View style={styles.sectionTitleWrap}>
          <ThemedText type="subtitle">Periodo académico</ThemedText>
          <ThemedText style={{ color: colors.textMuted }}>Definí desde cuándo y hasta cuándo se repiten las clases al enviarlas a Google Calendar.</ThemedText>
        </View>

        <View style={styles.statsRow}>
          <StatPill label="Periodo" value={formatScheduleTermStatus(scheduleTermStartDate, scheduleTermEndDate, scheduleTermValidationMessage)} colors={colors} />
          <StatPill label="Zona horaria" value={googleCalendarConfig.timeZone || 'Pendiente'} colors={colors} />
        </View>

        <View style={styles.termDateFields}>
          <View style={styles.termDateInputWrap}>
            <ThemedText style={[styles.inputLabel, { color: colors.textMuted }]}>Inicio</ThemedText>
            <TextInput autoCapitalize="none" keyboardType="numbers-and-punctuation" onChangeText={setDraftTermStartDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textMuted} style={[styles.termDateInput, { color: colors.text, borderColor: colors.borderStrong, backgroundColor: colors.surface }]} value={draftTermStartDate} />
          </View>
          <View style={styles.termDateInputWrap}>
            <ThemedText style={[styles.inputLabel, { color: colors.textMuted }]}>Fin</ThemedText>
            <TextInput autoCapitalize="none" keyboardType="numbers-and-punctuation" onChangeText={setDraftTermEndDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textMuted} style={[styles.termDateInput, { color: colors.text, borderColor: colors.borderStrong, backgroundColor: colors.surface }]} value={draftTermEndDate} />
          </View>
        </View>

        <ThemedText style={{ color: draftScheduleTermValidationMessage ? colors.textMuted : colors.tint }}>Estado: {draftScheduleTermValidationMessage || 'Periodo válido'}</ThemedText>
        <ThemedText style={{ color: hasScheduleTermDates ? colors.tint : colors.textMuted }}>Guardado: {hasScheduleTermDates ? `${scheduleTermStartDate} a ${scheduleTermEndDate}` : 'pendiente'}</ThemedText>
        {!googleCalendarConfig.timeZone ? <ThemedText style={{ color: colors.textMuted }}>Falta configurar la zona horaria en `.env`.</ThemedText> : null}

        <Pressable onPress={() => void saveScheduleTermDates()} style={[styles.primaryButton, { backgroundColor: colors.tint }]}> 
          <IconSymbol color={colors.tintContrast} name="paperplane.fill" size={16} />
          <ThemedText style={{ color: colors.tintContrast }}>Guardar periodo</ThemedText>
        </Pressable>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}> 
        <View style={styles.sectionTitleWrap}>
          <ThemedText type="subtitle">Acciones sobre favoritos</ThemedText>
          <ThemedText style={{ color: colors.textMuted }}>Estas acciones usan horarios ya guardados desde el generador.</ThemedText>
        </View>

        <View style={styles.statsRow}>
          <StatPill label="Favoritos" value={String(favorites.length)} colors={colors} />
          <StatPill label="Google" value={googleCalendarAuth.accessToken ? 'Conectado' : 'Sin conexión'} colors={colors} />
        </View>

        <View style={[styles.favoriteHintCard, { backgroundColor: colors.tintSoft, borderColor: colors.border }]}> 
          <ThemedText type="defaultSemiBold">Orden correcto</ThemedText>
          <ThemedText style={{ color: colors.textMuted }}>Para enviar a Google: conectá la cuenta, guardá el periodo y luego elegí un favorito. Para compartir sin Google, exportá PDF.</ThemedText>
        </View>

        {favorites.length > 1 ? (
          <View style={[styles.bulkActionsCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}> 
            <ThemedText type="defaultSemiBold">Exportación múltiple</ThemedText>
            <ThemedText style={{ color: colors.textMuted }}>Marcá varios favoritos y exportalos juntos en un solo PDF.</ThemedText>
            <Pressable disabled={selectedFavoriteIds.length === 0} onPress={() => void exportMultipleFavorites()} style={[styles.primaryButton, { backgroundColor: selectedFavoriteIds.length === 0 ? colors.surfaceStrong : colors.tint, opacity: selectedFavoriteIds.length === 0 ? 0.55 : 1 }]}> 
              <IconSymbol color={selectedFavoriteIds.length === 0 ? colors.textMuted : colors.tintContrast} name="paperplane.fill" size={16} />
              <ThemedText style={{ color: selectedFavoriteIds.length === 0 ? colors.textMuted : colors.tintContrast }}>Exportar selección ({selectedFavoriteIds.length})</ThemedText>
            </Pressable>
          </View>
        ) : null}

        {favorites.length === 0 ? (
          <ThemedText style={{ color: colors.textMuted }}>Todavía no hay horarios favoritos para exportar.</ThemedText>
        ) : (
          <View style={styles.favoriteList}>
            {favorites.map((favorite, index) => (
              <ExportFavoriteCard
                key={favorite.id}
                favorite={favorite}
                index={index}
                colors={colors}
                isSelected={selectedFavoriteIds.includes(favorite.id)}
                canSyncGoogleCalendar={canSyncGoogleCalendar}
                onExport={() => void exportFavorite(favorite)}
                onGoogleCalendarSync={() => void sendFavoriteToGoogleCalendar(favorite)}
                onToggleSelection={() => toggleSelection(favorite.id)}
                isSyncingGoogleCalendar={syncingFavoriteId === favorite.id}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function ExportFavoriteCard({ favorite, index, colors, canSyncGoogleCalendar, onExport, onGoogleCalendarSync, onToggleSelection, isSelected, isSyncingGoogleCalendar }: {
  favorite: FavoriteSchedule;
  index: number;
  colors: (typeof Colors)['light'];
  canSyncGoogleCalendar: boolean;
  isSelected: boolean;
  isSyncingGoogleCalendar: boolean;
  onExport: () => void;
  onGoogleCalendarSync: () => void;
  onToggleSelection: () => void;
}) {
  return (
    <View style={[styles.favoriteCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}> 
      <View style={styles.favoriteHeader}>
        <Pressable onPress={onToggleSelection} style={[styles.favoriteOrderBadge, { backgroundColor: isSelected ? colors.tintSoft : 'rgba(11, 132, 255, 0.12)', borderColor: isSelected ? colors.tint : 'transparent' }]}> 
          <ThemedText type="defaultSemiBold">#{index + 1}</ThemedText>
          <ThemedText style={{ color: isSelected ? colors.tint : colors.textMuted, fontSize: 11 }}>{isSelected ? 'Selec.' : 'Marcar'}</ThemedText>
        </Pressable>
        <View style={styles.favoriteHeaderText}>
          <ThemedText type="defaultSemiBold">{favorite.title}</ThemedText>
          <ThemedText style={{ color: colors.textMuted }}>{favorite.courses.length} materias · guardado {formatSavedAt(favorite.savedAt)}</ThemedText>
        </View>
      </View>
      <View style={styles.favoriteCourseList}>
        {favorite.courses.map((course) => <ThemedText key={`${favorite.id}-${course.id}-${course.group}`}>{course.name} · {course.group}</ThemedText>)}
      </View>
      <View style={styles.favoriteActionsRow}>
        <InlineActionButton icon="paperplane.fill" label="Exportar PDF" colors={colors} onPress={onExport} />
        <InlineActionButton disabled={!canSyncGoogleCalendar || isSyncingGoogleCalendar} icon="paperplane.fill" label={isSyncingGoogleCalendar ? 'Enviando...' : 'Enviar a Google'} colors={colors} onPress={onGoogleCalendarSync} />
      </View>
    </View>
  );
}

function InlineActionButton({ colors, disabled, icon, label, onPress }: {
  colors: (typeof Colors)['light'];
  disabled?: boolean;
  icon: 'paperplane.fill';
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.inlineActionButton, { borderColor: colors.border, backgroundColor: disabled ? colors.surface : colors.surfaceStrong, opacity: disabled ? 0.45 : 1 }]}> 
      <IconSymbol color={colors.tint} name={icon} size={16} />
      <ThemedText style={{ color: colors.tint }}>{label}</ThemedText>
    </Pressable>
  );
}

function formatSavedAt(savedAt: FavoriteSchedule['savedAt']) {
  return new Date(savedAt).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function formatGooglePlatformLabel(platform: 'android' | 'ios' | 'web') {
  if (platform === 'android') return 'Android';
  if (platform === 'ios') return 'iOS';
  return 'Web';
}

function formatScheduleTermStatus(startDate: string, endDate: string, validationMessage: string) {
  if (!startDate && !endDate) return 'Pendiente';
  return validationMessage ? 'Inválido' : 'Configurado';
}

function StatPill({ label, value, colors }: { label: string; value: string; colors: (typeof Colors)['light'] }) {
  return (
    <View style={[styles.statPill, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}> 
      <ThemedText style={[styles.statLabel, { color: colors.textMuted }]}>{label}</ThemedText>
      <ThemedText type="defaultSemiBold">{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 36 },
  heroCard: { borderWidth: 1, borderRadius: 28, padding: 20, gap: 10, shadowOpacity: 0.18, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 6 },
  card: { borderWidth: 1, borderRadius: 24, padding: 18, gap: 12, shadowOpacity: 0.16, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 4 },
  sectionTitleWrap: { gap: 4 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flex: 1, borderWidth: 1, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12, gap: 4 },
  statLabel: { fontSize: 12 },
  oauthInfoCard: { borderWidth: 1, borderRadius: 18, padding: 14, gap: 6 },
  monoText: { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }), fontSize: 12 },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12 },
  termDateFields: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  termDateInputWrap: { flex: 1, minWidth: 140, gap: 6 },
  inputLabel: { fontSize: 12, fontWeight: '600' },
  termDateInput: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, fontWeight: '600' },
  favoriteHintCard: { borderWidth: 1, borderRadius: 18, padding: 14, gap: 4 },
  bulkActionsCard: { borderWidth: 1, borderRadius: 20, padding: 14, gap: 12 },
  favoriteList: { gap: 12 },
  favoriteCard: { borderWidth: 1, borderRadius: 20, padding: 14, gap: 10 },
  favoriteHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  favoriteOrderBadge: { minWidth: 40, borderRadius: 14, alignItems: 'center', paddingHorizontal: 10, paddingVertical: 10, borderWidth: 1 },
  favoriteHeaderText: { flex: 1, gap: 6 },
  favoriteCourseList: { gap: 4 },
  favoriteActionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  inlineActionButton: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
});
