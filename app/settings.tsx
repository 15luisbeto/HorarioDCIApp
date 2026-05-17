import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
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
    title: 'Inicio',
    description: 'Elegí si querés vincular Google Calendar al comenzar o entrar directo al generador.',
  },
  {
    title: 'Generador',
    description: 'Seleccioná materias, revisá conflictos y guardá combinaciones útiles.',
  },
  {
    title: 'Horarios favoritos',
    description: 'Consultá, renombrá y ordená los horarios que guardaste.',
  },
  {
    title: 'Exportar horarios',
    description: 'Conectá Google, definí el periodo académico y exportá o enviá favoritos.',
  },
  {
    title: 'Catálogo',
    description: 'Buscá materias y revisá grupos, salones y docentes disponibles.',
  },
];

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { setThemePreference, themePreference } = useAppPreferences();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}> 
        <ThemedText type="title">Configuración</ThemedText>
        <ThemedText style={{ color: colors.textMuted }}>
          Ajustá solo la experiencia general. Las acciones de horarios viven en el menú del generador para no mezclar intenciones.
        </ThemedText>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}> 
        <View style={styles.sectionTitleWrap}>
          <ThemedText type="subtitle">Ayuda</ThemedText>
          <ThemedText style={{ color: colors.textMuted }}>
            La app está separada por tareas para que no tengas que recordar dónde está cada acción.
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

      <View style={[styles.creditsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
        <ThemedText style={{ color: colors.textMuted }}>Créditos</ThemedText>
        <ThemedText type="defaultSemiBold">Mtro. Luis Alberto Pérez Martínez</ThemedText>
      </View>
    </ScrollView>
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
  sectionTitleWrap: {
    gap: 4,
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
  optionsList: {
    gap: 10,
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
  creditsCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 4,
  },
});
