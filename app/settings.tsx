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
import { useAppPreferences, type ThemePreference } from '@/providers/app-preferences';

const THEME_OPTIONS: { value: ThemePreference; title: string; description: string }[] = [
  {
    value: 'system',
    title: 'Seguir el sistema',
    description: 'La app acompaña el modo del teléfono.',
  },
  {
    value: 'light',
    title: 'Modo claro',
    description: 'Más limpio y luminoso para estudiar de día.',
  },
  {
    value: 'dark',
    title: 'Modo oscuro',
    description: 'Visual premium con foco en contraste y calendario.',
  },
];

const HELP_ITEMS = [
  {
    title: 'Generador',
    description: 'Elegí materias y la app arma horarios sin choques.',
  },
  {
    title: 'Catálogo',
    description: 'Buscá y revisá la información de materias y grupos.',
  },
  {
    title: 'Favoritos',
    description: 'Guardá horarios para compararlos y decidir después.',
  },
  {
    title: 'Google Calendar',
    description: 'Conectá tu cuenta, guardá el periodo y enviá un favorito.',
  },
  {
    title: 'Exportar PDF',
    description: 'Exportá favoritos guardados sin conectar Google.',
  },
];

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const {
    favorites,
    moveFavorite,
    removeFavorite,
    renameFavorite,
    scheduleTermEndDate,
    scheduleTermStartDate,
    setScheduleTermDates,
    setThemePreference,
    themePreference,
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
        await Share.share({
          title: favorite.title,
          message: formatFavoriteExportText(favorite),
        });
        return;
      }

      const { uri } = await Print.printToFileAsync({
        html: buildFavoritePdfHtml(favorite),
        base64: false,
      });

      const canShare = await Sharing.isAvailableAsync();

      if (!canShare) {
        Alert.alert('Exportación lista', `Se generó el PDF en:\n${uri}`);
        return;
      }

      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
      });
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

      const { uri } = await Print.printToFileAsync({
        html: buildFavoritesPdfHtml(selectedFavorites),
        base64: false,
      });

      const canShare = await Sharing.isAvailableAsync();

      if (!canShare) {
        Alert.alert('Exportación lista', `Se generó el PDF en:\n${uri}`);
        return;
      }

      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
      });
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
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}> 
        <ThemedText type="title">Configuración</ThemedText>
        <ThemedText style={{ color: colors.textMuted }}>
          Organizá tu experiencia: apariencia, conexión con Google, periodo académico y horarios guardados.
        </ThemedText>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}> 
        <View style={styles.sectionTitleWrap}>
          <ThemedText type="subtitle">Ayuda rápida</ThemedText>
          <ThemedText style={{ color: colors.textMuted }}>
            Usá cada sección para avanzar sin mezclar pasos.
          </ThemedText>
        </View>

        <View style={styles.helpList}>
          {HELP_ITEMS.map((item) => (
            <View key={item.title} style={[styles.helpItem, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}> 
              <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
              <ThemedText style={{ color: colors.textMuted }}>{item.description}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}> 
        <ThemedText type="subtitle">Tema visual</ThemedText>
        <ThemedText style={{ color: colors.textMuted }}>
          Elegí entre modo claro, oscuro o seguir el esquema del sistema.
        </ThemedText>

        <View style={styles.optionsList}>
          {THEME_OPTIONS.map((option) => {
            const isSelected = themePreference === option.value;

            return (
              <Pressable
                key={option.value}
                onPress={() => void setThemePreference(option.value)}
                style={[
                  styles.optionCard,
                  {
                    borderColor: isSelected ? colors.tint : colors.border,
                    backgroundColor: isSelected ? colors.tintSoft : colors.surfaceElevated,
                  },
                ]}>
                <View style={styles.optionHeader}>
                  <ThemedText type="defaultSemiBold">{option.title}</ThemedText>
                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor: isSelected ? colors.tint : colors.borderStrong,
                        backgroundColor: isSelected ? colors.tint : 'transparent',
                      },
                    ]}
                  />
                </View>
                <ThemedText style={{ color: colors.textMuted }}>{option.description}</ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}> 
        <View style={styles.sectionTitleWrap}>
          <ThemedText type="subtitle">Conexión con Google</ThemedText>
          <ThemedText style={{ color: colors.textMuted }}>
            Iniciá sesión para habilitar el envío de favoritos a Google Calendar.
          </ThemedText>
        </View>

        <View style={styles.statsRow}>
          <StatPill
            label="Plataforma"
            value={formatGooglePlatformLabel(googleCalendarAuth.platform)}
            colors={colors}
          />
          <StatPill
            label="Client ID"
            value={googleCalendarAuth.isConfigured ? 'Configurado' : 'Pendiente'}
            colors={colors}
          />
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

        {googleCalendarAuth.errorMessage ? (
          <ThemedText style={{ color: colors.danger }}>{googleCalendarAuth.errorMessage}</ThemedText>
        ) : null}

        {!googleCalendarAuth.isConfigured ? (
          <ThemedText style={{ color: colors.textMuted }}>
            Falta completar el client ID correspondiente en `.env`. No uses credenciales reales dentro del código.
          </ThemedText>
        ) : null}

        <Pressable
          disabled={!canStartGoogleAuth}
          onPress={() => void googleCalendarAuth.signIn()}
          style={[
            styles.googleAuthButton,
            {
              backgroundColor: canStartGoogleAuth ? colors.tint : colors.surfaceStrong,
              opacity: canStartGoogleAuth ? 1 : 0.55,
            },
          ]}>
          <IconSymbol color={canStartGoogleAuth ? colors.tintContrast : colors.textMuted} name="paperplane.fill" size={16} />
          <ThemedText style={{ color: canStartGoogleAuth ? colors.tintContrast : colors.textMuted }}>
            Conectar con Google
          </ThemedText>
        </Pressable>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}> 
        <View style={styles.sectionTitleWrap}>
          <ThemedText type="subtitle">Periodo académico</ThemedText>
          <ThemedText style={{ color: colors.textMuted }}>
            Definí desde cuándo y hasta cuándo se repiten las clases en Google Calendar.
          </ThemedText>
        </View>

        <View style={styles.statsRow}>
          <StatPill
            label="Periodo"
            value={formatScheduleTermStatus(scheduleTermStartDate, scheduleTermEndDate, scheduleTermValidationMessage)}
            colors={colors}
          />
          <StatPill
            label="Zona horaria"
            value={googleCalendarConfig.timeZone || 'Pendiente'}
            colors={colors}
          />
        </View>

        <View style={styles.termDateFields}>
          <View style={styles.termDateInputWrap}>
            <ThemedText style={[styles.inputLabel, { color: colors.textMuted }]}>Inicio</ThemedText>
            <TextInput
              autoCapitalize="none"
              keyboardType="numbers-and-punctuation"
              onChangeText={setDraftTermStartDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
              style={[styles.termDateInput, { color: colors.text, borderColor: colors.borderStrong, backgroundColor: colors.surface }]}
              value={draftTermStartDate}
            />
          </View>
          <View style={styles.termDateInputWrap}>
            <ThemedText style={[styles.inputLabel, { color: colors.textMuted }]}>Fin</ThemedText>
            <TextInput
              autoCapitalize="none"
              keyboardType="numbers-and-punctuation"
              onChangeText={setDraftTermEndDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
              style={[styles.termDateInput, { color: colors.text, borderColor: colors.borderStrong, backgroundColor: colors.surface }]}
              value={draftTermEndDate}
            />
          </View>
        </View>

        <ThemedText style={{ color: draftScheduleTermValidationMessage ? colors.textMuted : colors.tint }}>
          Estado: {draftScheduleTermValidationMessage || 'Periodo válido'}
        </ThemedText>

        <ThemedText style={{ color: hasScheduleTermDates ? colors.tint : colors.textMuted }}>
          Guardado: {hasScheduleTermDates ? `${scheduleTermStartDate} a ${scheduleTermEndDate}` : 'pendiente'}
        </ThemedText>

        {!googleCalendarConfig.timeZone ? (
          <ThemedText style={{ color: colors.textMuted }}>
            Falta configurar la zona horaria en `.env`. Las fechas del semestre se guardan aquí en Ajustes.
          </ThemedText>
        ) : null}

        <Pressable
          onPress={() => void saveScheduleTermDates()}
          style={[styles.saveTermButton, { backgroundColor: colors.tint }]}> 
          <IconSymbol color={colors.tintContrast} name="paperplane.fill" size={16} />
          <ThemedText style={{ color: colors.tintContrast }}>Guardar periodo</ThemedText>
        </Pressable>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}> 
        <View style={styles.sectionTitleWrap}>
          <ThemedText type="subtitle">Horarios favoritos</ThemedText>
          <ThemedText style={{ color: colors.textMuted }}>
            Gestioná horarios guardados, exportá PDF o enviá uno a Google Calendar.
          </ThemedText>
        </View>

        <View style={styles.statsRow}>
          <StatPill label="Favoritos" value={String(favorites.length)} colors={colors} />
          <StatPill label="Google" value={googleCalendarAuth.accessToken ? 'Conectado' : 'Sin conexión'} colors={colors} />
        </View>

        <View style={[styles.favoriteHintCard, { backgroundColor: colors.tintSoft, borderColor: colors.border }]}> 
          <ThemedText type="defaultSemiBold">Para enviar a Google</ThemedText>
          <ThemedText style={{ color: colors.textMuted }}>
            Primero conectá Google y guardá el periodo académico. Para compartir sin Google, usá Exportar PDF.
          </ThemedText>
        </View>

        {favorites.length > 1 ? (
          <View style={[styles.bulkActionsCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}> 
            <View style={styles.sectionTitleWrap}>
              <ThemedText type="defaultSemiBold">Exportación múltiple</ThemedText>
              <ThemedText style={{ color: colors.textMuted }}>
                Marcá varios favoritos y exportalos juntos en un solo PDF.
              </ThemedText>
            </View>
            <Pressable
              disabled={selectedFavoriteIds.length === 0}
              onPress={() => void exportMultipleFavorites()}
              style={[
                styles.bulkExportButton,
                {
                  backgroundColor: selectedFavoriteIds.length === 0 ? colors.surfaceStrong : colors.tint,
                  opacity: selectedFavoriteIds.length === 0 ? 0.55 : 1,
                },
              ]}>
              <IconSymbol color={selectedFavoriteIds.length === 0 ? colors.textMuted : colors.tintContrast} name="paperplane.fill" size={16} />
              <ThemedText style={{ color: selectedFavoriteIds.length === 0 ? colors.textMuted : colors.tintContrast }}>
                Exportar selección ({selectedFavoriteIds.length})
              </ThemedText>
            </Pressable>
          </View>
        ) : null}

        {favorites.length > 0 ? (
          <View style={styles.favoriteList}>
            {favorites.map((favorite, index) => (
              <FavoriteEditorCard
                key={favorite.id}
                favorite={favorite}
                index={index}
                colors={colors}
                canMoveDown={index < favorites.length - 1}
                canMoveUp={index > 0}
                isSelected={selectedFavoriteIds.includes(favorite.id)}
                canSyncGoogleCalendar={canSyncGoogleCalendar}
                onExport={() => void exportFavorite(favorite)}
                onGoogleCalendarSync={() => void sendFavoriteToGoogleCalendar(favorite)}
                onMoveDown={() => void moveFavorite(favorite.id, 'down')}
                onMoveUp={() => void moveFavorite(favorite.id, 'up')}
                onRemove={() => void removeFavorite(favorite.id)}
                onRename={(title) => void renameFavorite(favorite.id, title)}
                onToggleSelection={() => toggleSelection(favorite.id)}
                isSyncingGoogleCalendar={syncingFavoriteId === favorite.id}
              />
            ))}
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

function FavoriteEditorCard({
  favorite,
  index,
  colors,
  canMoveDown,
  canMoveUp,
  canSyncGoogleCalendar,
  onExport,
  onGoogleCalendarSync,
  onMoveDown,
  onMoveUp,
  onRemove,
  onRename,
  onToggleSelection,
  isSelected,
  isSyncingGoogleCalendar,
}: {
  favorite: FavoriteSchedule;
  index: number;
  colors: (typeof Colors)['light'];
  canMoveDown: boolean;
  canMoveUp: boolean;
  canSyncGoogleCalendar: boolean;
  isSelected: boolean;
  isSyncingGoogleCalendar: boolean;
  onExport: () => void;
  onGoogleCalendarSync: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onRemove: () => void;
  onRename: (title: string) => void;
  onToggleSelection: () => void;
}) {
  return (
    <View style={[styles.favoriteCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}> 
      <View style={styles.favoriteHeader}>
        <Pressable
          onPress={onToggleSelection}
          style={[styles.favoriteOrderBadge, { backgroundColor: isSelected ? colors.tintSoft : 'rgba(11, 132, 255, 0.12)', borderColor: isSelected ? colors.tint : 'transparent', borderWidth: 1 }]}>
          <ThemedText type="defaultSemiBold">#{index + 1}</ThemedText>
          <ThemedText style={{ color: isSelected ? colors.tint : colors.textMuted, fontSize: 11 }}>
            {isSelected ? 'Selec.' : 'Marcar'}
          </ThemedText>
        </Pressable>
        <View style={styles.favoriteHeaderText}>
          <TextInput
            defaultValue={favorite.title}
            onEndEditing={(event) => onRename(event.nativeEvent.text)}
            placeholder="Nombre del favorito"
            placeholderTextColor={colors.textMuted}
            style={[styles.favoriteTitleInput, { color: colors.text, borderColor: colors.borderStrong, backgroundColor: colors.surface }]}
          />
          <ThemedText style={{ color: colors.textMuted }}>
            {favorite.courses.length} materias · guardado {formatSavedAt(favorite.savedAt)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.favoriteCourseList}>
        {favorite.courses.map((course) => (
          <ThemedText key={`${favorite.id}-${course.id}-${course.group}`}>{course.name} · {course.group}</ThemedText>
        ))}
      </View>

      <View style={styles.favoriteActionsRow}>
        <InlineActionButton disabled={!canMoveUp} icon="chevron.right" label="Subir" colors={colors} onPress={onMoveUp} rotation="-90deg" />
        <InlineActionButton disabled={!canMoveDown} icon="chevron.right" label="Bajar" colors={colors} onPress={onMoveDown} rotation="90deg" />
        <InlineActionButton icon="paperplane.fill" label="Exportar PDF" colors={colors} onPress={onExport} />
        <InlineActionButton
          disabled={!canSyncGoogleCalendar || isSyncingGoogleCalendar}
          icon="paperplane.fill"
          label={isSyncingGoogleCalendar ? 'Enviando...' : 'Enviar a Google'}
          colors={colors}
          onPress={onGoogleCalendarSync}
        />
        <InlineActionButton icon="bookmark.fill" label="Quitar" colors={colors} onPress={onRemove} destructive />
      </View>
    </View>
  );
}

function InlineActionButton({
  colors,
  destructive,
  disabled,
  icon,
  label,
  onPress,
  rotation,
}: {
  colors: (typeof Colors)['light'];
  destructive?: boolean;
  disabled?: boolean;
  icon: 'bookmark.fill' | 'paperplane.fill' | 'chevron.right';
  label: string;
  onPress: () => void;
  rotation?: string;
}) {
  const tintColor = destructive ? colors.danger : colors.tint;

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.inlineActionButton,
        {
          borderColor: destructive ? colors.dangerSoft : colors.border,
          backgroundColor: disabled ? colors.surface : colors.surfaceStrong,
          opacity: disabled ? 0.45 : 1,
        },
      ]}>
      <View style={rotation ? { transform: [{ rotate: rotation }] } : undefined}>
        <IconSymbol color={tintColor} name={icon} size={16} />
      </View>
      <ThemedText style={{ color: tintColor }}>{label}</ThemedText>
    </Pressable>
  );
}

function formatSavedAt(savedAt: FavoriteSchedule['savedAt']) {
  return new Date(savedAt).toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatGooglePlatformLabel(platform: 'android' | 'ios' | 'web') {
  if (platform === 'android') {
    return 'Android';
  }

  if (platform === 'ios') {
    return 'iOS';
  }

  return 'Web';
}

function formatScheduleTermStatus(startDate: string, endDate: string, validationMessage: string) {
  if (!startDate && !endDate) {
    return 'Pendiente';
  }

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
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 36,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 20,
    gap: 10,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 12,
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  optionsList: {
    gap: 10,
  },
  helpList: {
    gap: 10,
  },
  helpItem: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  sectionTitleWrap: {
    gap: 4,
  },
  optionCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bulkActionsCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    gap: 12,
  },
  bulkExportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  oauthInfoCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  termDateFields: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  termDateInputWrap: {
    flex: 1,
    minWidth: 140,
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  termDateInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '600',
  },
  saveTermButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  monoText: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 12,
  },
  googleAuthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  favoriteList: {
    gap: 12,
  },
  favoriteHintCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  favoriteCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    gap: 10,
  },
  favoriteHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  favoriteOrderBadge: {
    minWidth: 40,
    borderRadius: 14,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: 'rgba(11, 132, 255, 0.12)',
  },
  favoriteHeaderText: {
    flex: 1,
    gap: 6,
  },
  favoriteTitleInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '600',
  },
  favoriteCourseList: {
    gap: 4,
  },
  favoriteActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  inlineActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statPill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
  },
});
