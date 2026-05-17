import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Redirect, type Href, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  analyzeCourseConflicts,
  createFavoriteSchedule,
  DAY_ORDER,
  dataset,
  formatCourseLabel,
  formatTeachers,
  generateSchedules,
  searchCourseNames,
  type ScheduleOption,
} from '@/lib/schedules';
import { useAppPreferences } from '@/providers/app-preferences';

const MAX_SELECTED_COURSES = 8;
const MAX_RENDERED_OPTIONS = 12;
const HOUR_HEIGHT = 64;
const TIME_COLUMN_WIDTH = 58;
const DAY_COLUMN_WIDTH = 140;
const COURSE_COLORS = ['#38BDF8', '#8B5CF6', '#22C55E', '#F97316', '#EF4444', '#14B8A6', '#3B82F6', '#E879F9'];

export default function GeneratorScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { hasSeenWelcome, isFavorite, isHydrated, toggleFavorite } = useAppPreferences();

  const [query, setQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCourseNames, setSelectedCourseNames] = useState<string[]>([]);

  const suggestions = useMemo(
    () => searchCourseNames(query, selectedCourseNames),
    [query, selectedCourseNames]
  );

  const generationResult = useMemo(
    () => generateSchedules(selectedCourseNames, MAX_RENDERED_OPTIONS),
    [selectedCourseNames]
  );

  const conflictAnalysis = useMemo(
    () => analyzeCourseConflicts(selectedCourseNames, generationResult.totalFound > 0),
    [generationResult.totalFound, selectedCourseNames]
  );

  const countLabel = generationResult.countCapped
    ? `${generationResult.totalFound}+`
    : generationResult.totalFound.toString();

  function addCourse(courseName: string) {
    setSelectedCourseNames((current) => {
      if (current.includes(courseName) || current.length >= MAX_SELECTED_COURSES) {
        return current;
      }

      return [...current, courseName];
    });
    setQuery('');
  }

  function removeCourse(courseName: string) {
    setSelectedCourseNames((current) => current.filter((item) => item !== courseName));
  }

  function handleToggleFavorite(option: ScheduleOption) {
    void toggleFavorite(createFavoriteSchedule(option));
  }

  function navigateFromMenu(href: Href) {
    setIsMenuOpen(false);
    router.push(href);
  }

  if (!isHydrated) {
    return <View style={[styles.screen, { backgroundColor: colors.background }]} />;
  }

  if (!hasSeenWelcome) {
    return <Redirect href={'/welcome' as Href} />;
  }

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}> 
        <View style={styles.heroHeaderRow}>
          <View style={styles.heroBlock}>
            <ThemedText type="title" style={styles.heroTitle}>Comunidad DCI</ThemedText>
            <ThemedText style={[styles.heroSubtitle, { color: colors.tint }]}>Horarios inteligentes para tu comunidad</ThemedText>
            <ThemedText style={{ color: colors.textMuted }}>
              Elegí materias, detectá riesgos de choque antes de generar y compará combinaciones en un calendario semanal limpio.
            </ThemedText>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => router.push('/settings' as Href)}
              style={[styles.settingsButton, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}> 
              <IconSymbol color={colors.tint} name="gearshape.fill" size={20} />
            </Pressable>
            <Pressable
              onPress={() => setIsMenuOpen((current) => !current)}
              style={[styles.settingsButton, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}> 
              <IconSymbol color={colors.tint} name="line.3.horizontal" size={20} />
            </Pressable>
          </View>
        </View>
        {isMenuOpen ? (
          <View style={[styles.menuPanel, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}> 
            <Pressable onPress={() => navigateFromMenu('/favorites' as Href)} style={styles.menuItem}>
              <View style={styles.menuItemText}>
                <ThemedText type="defaultSemiBold">Horarios favoritos</ThemedText>
                <ThemedText style={{ color: colors.textMuted }}>Revisá y ordená tus combinaciones guardadas.</ThemedText>
              </View>
              <IconSymbol color={colors.tint} name="chevron.right" size={18} />
            </Pressable>
            <Pressable onPress={() => navigateFromMenu('/exports' as Href)} style={styles.menuItem}>
              <View style={styles.menuItemText}>
                <ThemedText type="defaultSemiBold">Exportar horarios</ThemedText>
                <ThemedText style={{ color: colors.textMuted }}>Conectá Google, definí periodo y compartí favoritos.</ThemedText>
              </View>
              <IconSymbol color={colors.tint} name="chevron.right" size={18} />
            </Pressable>
          </View>
        ) : null}
        <View style={styles.metadataRow}>
          <MetadataPill label="Periodo" value={dataset.period} colors={colors} tone="accent" />
          <MetadataPill label="Actualizado" value={dataset.updated_at} colors={colors} tone="neutral" />
          <MetadataPill label="Materias" value={String(dataset.courses.length)} colors={colors} tone="success" />
        </View>
      </View>

      <AnimatedSection delay={0}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWrap}>
              <ThemedText type="subtitle">1. Selección inteligente</ThemedText>
              <ThemedText style={{ color: colors.textMuted }}>
                Buscá por nombre. Cada materia puede tener varios grupos; el generador prueba las
                combinaciones y descarta choques automáticamente.
              </ThemedText>
            </View>
            <View style={[styles.selectionCountBadge, { backgroundColor: colors.tintSoft }]}> 
              <ThemedText type="defaultSemiBold" style={{ color: colors.tint }}>
                {selectedCourseNames.length}/{MAX_SELECTED_COURSES}
              </ThemedText>
            </View>
          </View>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Ej. Programación básica"
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

          {selectedCourseNames.length > 0 ? (
            <View style={styles.chipsWrap}>
              {selectedCourseNames.map((courseName) => (
                <Pressable
                  key={courseName}
                  onPress={() => removeCourse(courseName)}
                  style={[
                    styles.selectedChip,
                    {
                      borderColor: colors.borderStrong,
                      backgroundColor: colors.surfaceStrong,
                    },
                  ]}>
                  <ThemedText type="defaultSemiBold">{courseName}</ThemedText>
                  <ThemedText style={{ color: colors.tint }}>Quitar</ThemedText>
                </Pressable>
              ))}
            </View>
          ) : (
            <ThemedText style={[styles.emptyCopy, { color: colors.textMuted }]}>Todavía no seleccionaste ninguna materia.</ThemedText>
          )}

          <View style={styles.actionsRow}>
            <ThemedText style={[styles.helperText, { color: colors.textMuted }]}>Máximo {MAX_SELECTED_COURSES} materias por corrida para que el generador siga ágil.</ThemedText>
            {selectedCourseNames.length > 0 ? (
              <Pressable onPress={() => setSelectedCourseNames([])}>
                <ThemedText style={{ color: colors.tint }}>Limpiar</ThemedText>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.suggestionsList}>
            {suggestions.map((courseName) => (
              <Pressable
                key={courseName}
                onPress={() => addCourse(courseName)}
                style={[
                  styles.suggestionButton,
                  { borderColor: colors.border, backgroundColor: colors.surfaceElevated },
                ]}>
                <ThemedText type="defaultSemiBold">{courseName}</ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      </AnimatedSection>

      <AnimatedSection delay={90}>
        <ConflictSummaryCard analysis={conflictAnalysis} generationCount={generationResult.totalFound} colors={colors} />
      </AnimatedSection>

      <AnimatedSection delay={160}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
          <ThemedText type="subtitle">2. Calendario semanal</ThemedText>

          {selectedCourseNames.length === 0 ? (
            <ThemedText style={[styles.emptyCopy, { color: colors.textMuted }]}>
              Elegí materias arriba y acá vas a ver el horario semanal como calendario.
            </ThemedText>
          ) : generationResult.options.length === 0 ? (
            <ThemedText style={[styles.emptyCopy, { color: colors.textMuted }]}>
              No encontré una combinación sin choques para las materias elegidas.
            </ThemedText>
          ) : (
            <>
              <View style={styles.calendarHeadingRow}>
                <View style={styles.sectionTitleWrap}>
                  <ThemedText>
                    Encontré <ThemedText type="defaultSemiBold">{countLabel}</ThemedText> combinaciones válidas.
                  </ThemedText>
                  <ThemedText style={{ color: colors.textMuted }}>
                    Vista tipo dashboard para comparar opciones y bajar el costo mental de lectura.
                  </ThemedText>
                </View>
                <View style={[styles.selectionCountBadge, { backgroundColor: colors.backgroundAccent }]}>
                  <ThemedText type="defaultSemiBold" style={{ color: colors.tint }}>{generationResult.options.length} visibles</ThemedText>
                </View>
              </View>
              {generationResult.truncated ? (
                <ThemedText style={[styles.helperText, { color: colors.textMuted }]}>
                  Muestro solo las primeras {generationResult.options.length}. Si querés más detalle,
                  conviene filtrar con menos materias.
                </ThemedText>
              ) : null}

              <View style={styles.scheduleList}>
                {generationResult.options.map((option, index) => (
                  <ScheduleCalendarCard
                    key={option.id}
                    option={option}
                    index={index}
                    colorScheme={colorScheme}
                    isFavorite={isFavorite(option.id)}
                    onToggleFavorite={() => handleToggleFavorite(option)}
                  />
                ))}
              </View>
            </>
          )}
        </View>
      </AnimatedSection>
    </ScrollView>
  );
}

function AnimatedSection({ children, delay }: { children: ReactNode; delay: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 320, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 320, delay, useNativeDriver: true }),
    ]).start();
  }, [delay, opacity, translateY]);

  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
}

function ConflictSummaryCard({
  analysis,
  generationCount,
  colors,
}: {
  analysis: ReturnType<typeof analyzeCourseConflicts>;
  generationCount: number;
  colors: (typeof Colors)['light'];
}) {
  const statusConfig = {
    idle: {
      title: 'Todavía no hay suficiente contexto',
      body: 'Seleccioná al menos dos materias para estimar conflictos potenciales entre grupos.',
      accent: colors.tint,
      background: colors.tintSoft,
    },
    clear: {
      title: 'No aparecen conflictos aparentes',
      body: 'Entre los grupos disponibles no encontré choques directos entre pares de materias.',
      accent: colors.success,
      background: colors.successSoft,
    },
    warning: {
      title: 'Hay combinaciones de grupos que chocan',
      body: 'Todavía existen opciones válidas, pero algunas cruces de grupo se pisan y conviene mirarlos antes.',
      accent: colors.warning,
      background: colors.warningSoft,
    },
    impossible: {
      title: 'La selección actual es inviable',
      body: 'No hay una combinación válida completa con las materias elegidas y sus grupos disponibles.',
      accent: colors.danger,
      background: colors.dangerSoft,
    },
  } as const;

  const config = statusConfig[analysis.status];
  const highlightedPairs = analysis.coursePairs.filter((pair) => pair.conflictingGroupPairs > 0).slice(0, 3);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleWrap}>
          <ThemedText type="subtitle">Riesgo de conflicto</ThemedText>
          <ThemedText style={{ color: colors.textMuted }}>Feedback previo a revisar las opciones generadas.</ThemedText>
        </View>
        <View style={[styles.stateBadge, { backgroundColor: config.background }]}> 
          <ThemedText type="defaultSemiBold" style={{ color: config.accent }}>{config.title}</ThemedText>
        </View>
      </View>

      <ThemedText style={{ color: colors.textMuted }}>{config.body}</ThemedText>

      <View style={styles.metricsGrid}>
        <MetricTile label="Materias" value={String(analysis.totalCourses)} colors={colors} />
        <MetricTile label="Grupos" value={String(analysis.totalGroups)} colors={colors} />
        <MetricTile label="Cruces analizados" value={String(analysis.comparedGroupPairs)} colors={colors} />
        <MetricTile label="Combinaciones válidas" value={String(generationCount)} colors={colors} />
      </View>

      {analysis.coursesWithoutGroups.length > 0 ? (
        <ThemedText style={{ color: colors.danger }}>
          Sin grupos disponibles: {analysis.coursesWithoutGroups.join(', ')}
        </ThemedText>
      ) : null}

      {analysis.coursePairsWithConflicts > 0 ? (
        <View style={styles.conflictExamplesBlock}>
          <ThemedText type="defaultSemiBold">Pares con conflicto potencial</ThemedText>
          {highlightedPairs.map((pair) => (
            <View key={`${pair.leftCourseName}-${pair.rightCourseName}`} style={[styles.conflictExampleRow, { backgroundColor: colors.surfaceElevated }]}>
              <View style={styles.conflictExampleHeader}>
                <ThemedText type="defaultSemiBold">{pair.leftCourseName}</ThemedText>
                <ThemedText style={{ color: colors.textMuted }}>vs</ThemedText>
                <ThemedText type="defaultSemiBold">{pair.rightCourseName}</ThemedText>
              </View>
              <ThemedText style={{ color: pair.fullyConflicting ? colors.danger : colors.textMuted }}>
                {pair.conflictingGroupPairs}/{pair.totalGroupPairs} cruces entre grupos chocan
                {pair.fullyConflicting ? ' · bloqueo total del par' : ''}
              </ThemedText>
              {pair.sampleConflictLabels.length > 0 ? (
                <ThemedText style={{ color: colors.textMuted }}>Ejemplos: {pair.sampleConflictLabels.join(', ')}</ThemedText>
              ) : null}
            </View>
          ))}
        </View>
      ) : analysis.status !== 'idle' ? (
        <ThemedText style={{ color: colors.textMuted }}>No encontré pares de materias que se bloqueen entre sí al nivel de grupos.</ThemedText>
      ) : null}
    </View>
  );
}

function MetricTile({ label, value, colors }: { label: string; value: string; colors: (typeof Colors)['light'] }) {
  return (
    <View style={[styles.metricTile, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}> 
      <ThemedText style={[styles.metricLabel, { color: colors.textMuted }]}>{label}</ThemedText>
      <ThemedText type="subtitle">{value}</ThemedText>
    </View>
  );
}

function ScheduleCalendarCard({
  option,
  index,
  colorScheme,
  title,
  caption,
  isFavorite,
  onToggleFavorite,
}: {
  option: ScheduleOption;
  index: number;
  colorScheme: 'light' | 'dark';
  title?: string;
  caption?: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const colors = Colors[colorScheme];
  const courseColors = useMemo(() => {
    const palette = new Map<string, string>();

    option.courses.forEach((course, courseIndex) => {
      palette.set(`${course.name}:${course.group}`, COURSE_COLORS[courseIndex % COURSE_COLORS.length]);
    });

    return palette;
  }, [option]);

  const bounds = useMemo(() => {
    const allSessions = option.courses.flatMap((course) => course.sessions);
    const startMinutes = allSessions.map((session) => toMinutes(session.start));
    const endMinutes = allSessions.map((session) => toMinutes(session.end));
    const startHour = Math.max(7, Math.floor(Math.min(...startMinutes) / 60));
    const endHour = Math.max(startHour + 1, Math.ceil(Math.max(...endMinutes) / 60));

    return {
      startHour,
      endHour,
      height: (endHour - startHour) * HOUR_HEIGHT,
    };
  }, [option]);

  const hours = Array.from({ length: bounds.endHour - bounds.startHour + 1 }, (_, hourIndex) => bounds.startHour + hourIndex);

  return (
    <View
      style={[
        styles.scheduleCard,
        {
          borderColor: colors.border,
          backgroundColor: colors.surfaceElevated,
          shadowColor: colors.shadow,
        },
      ]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.sectionTitleWrap}>
            <ThemedText type="defaultSemiBold">{title ?? `Opción ${index + 1}`}</ThemedText>
            <ThemedText style={[styles.helperText, { color: colors.textMuted }]}>
              {caption ?? `${option.courses.length} materias en esta combinación`}
            </ThemedText>
          </View>
          <Pressable
            onPress={onToggleFavorite}
            style={[styles.favoriteButton, { backgroundColor: isFavorite ? colors.tintSoft : colors.surfaceStrong, borderColor: colors.border }]}> 
            <IconSymbol color={isFavorite ? colors.tint : colors.textMuted} name="bookmark.fill" size={18} />
            <ThemedText style={{ color: isFavorite ? colors.tint : colors.textMuted }}>
              {isFavorite ? 'Guardado' : 'Guardar'}
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={[styles.calendarHeaderRow, { backgroundColor: colors.surfaceStrong }]}> 
            <View style={[styles.timeHeaderCell, { width: TIME_COLUMN_WIDTH }]}> 
              <ThemedText style={styles.dayLabel}>Hora</ThemedText>
            </View>
            {DAY_ORDER.map((day) => (
              <View key={`${option.id}-${day}-header`} style={[styles.dayHeaderCell, { width: DAY_COLUMN_WIDTH }]}> 
                <ThemedText style={styles.dayLabel}>{day}</ThemedText>
              </View>
            ))}
          </View>

          <View style={[styles.calendarBody, { height: bounds.height }]}> 
            <View style={[styles.timeColumn, { width: TIME_COLUMN_WIDTH, height: bounds.height }]}> 
              {hours.map((hour) => {
                const top = (hour - bounds.startHour) * HOUR_HEIGHT;

                return (
                  <View key={`${option.id}-hour-${hour}`} style={[styles.timeTick, { top }]}> 
                    <ThemedText style={styles.timeLabel}>{formatHour(hour)}</ThemedText>
                  </View>
                );
              })}
            </View>

            {DAY_ORDER.map((day) => {
              const sessions = option.sessionsByDay[day];

              return (
                <View
                  key={`${option.id}-${day}-column`}
                  style={[
                    styles.dayColumn,
                    {
                      width: DAY_COLUMN_WIDTH,
                      height: bounds.height,
                      borderColor: colors.border,
                      backgroundColor: colors.calendarColumn,
                    },
                  ]}>
                  {hours.map((hour) => {
                    const top = (hour - bounds.startHour) * HOUR_HEIGHT;

                    return (
                      <View
                        key={`${option.id}-${day}-${hour}-line`}
                        style={[
                          styles.hourLine,
                          {
                            top,
                            borderColor: colors.calendarGrid,
                          },
                        ]}
                      />
                    );
                  })}

                  {sessions.map((session) => {
                    const key = `${session.courseName}:${session.group}`;
                    const top = ((toMinutes(session.start) - bounds.startHour * 60) / 60) * HOUR_HEIGHT;
                    const height = ((toMinutes(session.end) - toMinutes(session.start)) / 60) * HOUR_HEIGHT;

                    return (
                      <View
                        key={`${option.id}-${day}-${key}-${session.start}-${session.room}`}
                        style={[
                          styles.sessionBlock,
                          {
                            top,
                            height,
                            backgroundColor: `${courseColors.get(key) ?? COURSE_COLORS[0]}CC`,
                            borderColor: `${courseColors.get(key) ?? COURSE_COLORS[0]}F2`,
                          },
                        ]}>
                        <Text numberOfLines={2} style={styles.sessionBlockTitle}>
                          {session.courseName}
                        </Text>
                        <Text numberOfLines={1} style={styles.sessionBlockMeta}>
                          {session.group} · {session.room}
                        </Text>
                        <Text numberOfLines={1} style={styles.sessionBlockMeta}>
                          {session.start}–{session.end}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.legendBlock}>
        <ThemedText type="defaultSemiBold">Materias y profesores por color</ThemedText>
        <View style={styles.legendList}>
          {option.courses.map((course) => {
            const key = `${course.name}:${course.group}`;
            const color = courseColors.get(key) ?? COURSE_COLORS[0];

            return (
              <View key={`${option.id}-${key}-legend`} style={styles.legendItem}>
                <View style={[styles.legendSwatch, { backgroundColor: color }]} />
                <View style={styles.legendTextWrap}>
                  <ThemedText type="defaultSemiBold">{formatCourseLabel(course)}</ThemedText>
                  <ThemedText>{formatTeachers(course.teachers)}</ThemedText>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function MetadataPill({
  label,
  value,
  colors,
  tone,
}: {
  label: string;
  value: string;
  colors: (typeof Colors)['light'];
  tone: 'accent' | 'neutral' | 'success';
}) {
  const backgroundColor = tone === 'accent' ? colors.tintSoft : tone === 'success' ? colors.successSoft : colors.surfaceElevated;
  const textColor = tone === 'accent' ? colors.tint : tone === 'success' ? colors.success : colors.text;

  return (
    <View style={[styles.metadataPill, { backgroundColor }]}> 
      <ThemedText style={[styles.metadataLabel, { color: tone === 'neutral' ? colors.textMuted : textColor }]}>{label}</ThemedText>
      <ThemedText type="defaultSemiBold" style={{ color: textColor }}>{value}</ThemedText>
    </View>
  );
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatHour(hour: number) {
  return `${hour.toString().padStart(2, '0')}:00`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 18,
    paddingBottom: 36,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 32,
    padding: 22,
    gap: 18,
    shadowOpacity: 0.22,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
  heroBlock: {
    flex: 1,
    gap: 10,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  heroTitle: {
    lineHeight: 38,
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  menuPanel: {
    alignSelf: 'flex-end',
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderRadius: 22,
    padding: 8,
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  menuItemText: {
    flex: 1,
    gap: 2,
  },
  metadataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metadataPill: {
    flex: 1,
    minWidth: 100,
    gap: 3,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
  },
  metadataLabel: {
    fontSize: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 18,
    gap: 14,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  sectionTitleWrap: {
    flex: 1,
    gap: 4,
  },
  selectionCountBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stateBadge: {
    maxWidth: '48%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedChip: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  helperText: {
    fontSize: 13,
    lineHeight: 18,
  },
  suggestionsList: {
    gap: 8,
  },
  suggestionButton: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  emptyCopy: {},
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricTile: {
    minWidth: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 2,
  },
  metricLabel: {
    fontSize: 12,
  },
  conflictExamplesBlock: {
    gap: 10,
  },
  conflictExampleRow: {
    borderRadius: 18,
    padding: 12,
    gap: 4,
  },
  conflictExampleHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  calendarHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  scheduleList: {
    gap: 14,
  },
  scheduleCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    gap: 14,
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  cardHeader: {
    gap: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 8,
  },
  timeHeaderCell: {
    marginRight: 8,
    paddingTop: 10,
    paddingBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayHeaderCell: {
    marginRight: 8,
    paddingTop: 10,
    paddingBottom: 8,
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
  calendarBody: {
    flexDirection: 'row',
  },
  timeColumn: {
    position: 'relative',
    marginRight: 8,
  },
  timeTick: {
    position: 'absolute',
    left: 0,
    transform: [{ translateY: -9 }],
  },
  timeLabel: {
    fontSize: 12,
    opacity: 0.75,
  },
  dayColumn: {
    position: 'relative',
    marginRight: 8,
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  hourLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
  },
  sessionBlock: {
    position: 'absolute',
    left: 6,
    right: 6,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 2,
  },
  sessionBlockTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sessionBlockMeta: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  legendBlock: {
    gap: 10,
  },
  legendList: {
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  legendSwatch: {
    width: 14,
    height: 14,
    borderRadius: 999,
    marginTop: 4,
  },
  legendTextWrap: {
    flex: 1,
    gap: 2,
  },
});
