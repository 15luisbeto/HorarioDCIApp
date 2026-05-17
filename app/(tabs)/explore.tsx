import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { dataset, filterCourses, formatTeachers } from '@/lib/schedules';

const MAX_VISIBLE_RESULTS = 80;

export default function CatalogScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [query, setQuery] = useState('');

  const filteredCourses = useMemo(() => filterCourses(query), [query]);
  const visibleCourses = filteredCourses.slice(0, MAX_VISIBLE_RESULTS);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
        <View style={styles.headerBlock}>
          <ThemedText type="title" style={styles.heroTitle}>Catálogo académico</ThemedText>
          <ThemedText style={{ color: colors.textMuted }}>
            Revisá docentes, grupos y sesiones exactas del dataset cargado desde las páginas oficiales.
          </ThemedText>
        </View>
        <View style={styles.metricsRow}>
          <CatalogMetric label="Páginas" value={String(dataset.source_pages.length)} color={colors.tint} />
          <CatalogMetric label="Registros" value={String(dataset.courses.length)} color={colors.success} />
        </View>
        <ThemedText style={[styles.helperText, { color: colors.textMuted }]}>Fuente consolidada del periodo {dataset.period}.</ThemedText>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar por materia, grupo, docente o aula"
        placeholderTextColor={colors.textMuted}
        style={[
          styles.searchInput,
          {
            color: colors.text,
            borderColor: colors.border,
            backgroundColor: colors.surfaceElevated,
          },
        ]}
      />

      <ThemedText style={[styles.helperText, { color: colors.textMuted }]}>
        {filteredCourses.length > MAX_VISIBLE_RESULTS
          ? `Mostrando ${visibleCourses.length} de ${filteredCourses.length} resultados. Afiná la búsqueda para ver menos ruido.`
          : `Resultados: ${filteredCourses.length}`}
      </ThemedText>

      <View style={styles.list}>
        {visibleCourses.map((course) => (
          <View
            key={`${course.id}-${course.group}`}
            style={[
              styles.card,
              {
                borderColor: colors.border,
                backgroundColor: colors.surface,
                shadowColor: colors.shadow,
              },
            ]}>
            <View style={styles.courseHeader}>
              <View style={styles.courseHeaderText}>
                <ThemedText type="defaultSemiBold">{course.name}</ThemedText>
                <ThemedText style={{ color: colors.textMuted }}>Docentes: {formatTeachers(course.teachers)}</ThemedText>
              </View>
              <View style={[styles.groupBadge, { backgroundColor: colors.tintSoft }]}> 
                <ThemedText type="defaultSemiBold" style={{ color: colors.tint }}>{course.group}</ThemedText>
              </View>
            </View>

            <ThemedText style={{ color: colors.textMuted }}>Bloque fuente: {course.source_letter_range}</ThemedText>

            <View style={styles.sessionsList}>
              {course.sessions.map((session) => (
                <View
                  key={`${course.id}-${course.group}-${session.day}-${session.start}-${session.room}`}
                  style={[styles.sessionRow, { borderLeftColor: colors.tint }]}> 
                  <ThemedText type="defaultSemiBold">
                    {session.day} · {session.start}–{session.end}
                  </ThemedText>
                  <ThemedText style={{ color: colors.textMuted }}>{session.room}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function CatalogMetric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.metricCard, { backgroundColor: `${color}18` }]}>
      <ThemedText style={styles.metricLabel}>{label}</ThemedText>
      <ThemedText type="subtitle">{value}</ThemedText>
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
    gap: 14,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  headerBlock: {
    gap: 10,
  },
  heroTitle: {
    lineHeight: 38,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  metricLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
  helperText: {
    fontSize: 13,
    lineHeight: 18,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  list: {
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 8,
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  courseHeaderText: {
    flex: 1,
    gap: 2,
  },
  groupBadge: {
    minWidth: 52,
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sessionsList: {
    marginTop: 8,
    gap: 8,
  },
  sessionRow: {
    gap: 2,
    paddingLeft: 10,
    borderLeftWidth: 2,
  },
});
