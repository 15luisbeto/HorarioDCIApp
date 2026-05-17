import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { FavoriteSchedule } from '@/lib/schedules';
import { useAppPreferences } from '@/providers/app-preferences';

export default function FavoritesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { favorites, moveFavorite, removeFavorite, renameFavorite } = useAppPreferences();

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}> 
        <ThemedText type="title">Horarios favoritos</ThemedText>
        <ThemedText style={{ color: colors.textMuted }}>
          Acá viven tus combinaciones guardadas. Usá esta vista para comparar, renombrar y ordenar sin mezclarlo con la generación.
        </ThemedText>
        <View style={[styles.countBadge, { backgroundColor: colors.tintSoft }]}> 
          <ThemedText type="defaultSemiBold" style={{ color: colors.tint }}>{favorites.length} guardados</ThemedText>
        </View>
      </View>

      {favorites.length === 0 ? (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}> 
          <ThemedText type="subtitle">Todavía no hay favoritos</ThemedText>
          <ThemedText style={{ color: colors.textMuted }}>
            Volvé al generador, elegí materias y tocá Guardar en una opción de horario.
          </ThemedText>
        </View>
      ) : (
        <View style={styles.favoriteList}>
          {favorites.map((favorite, index) => (
            <FavoriteCard
              key={favorite.id}
              favorite={favorite}
              index={index}
              colors={colors}
              canMoveDown={index < favorites.length - 1}
              canMoveUp={index > 0}
              onMoveDown={() => void moveFavorite(favorite.id, 'down')}
              onMoveUp={() => void moveFavorite(favorite.id, 'up')}
              onRemove={() => void removeFavorite(favorite.id)}
              onRename={(title) => void renameFavorite(favorite.id, title)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function FavoriteCard({ favorite, index, colors, canMoveDown, canMoveUp, onMoveDown, onMoveUp, onRemove, onRename }: {
  favorite: FavoriteSchedule;
  index: number;
  colors: (typeof Colors)['light'];
  canMoveDown: boolean;
  canMoveUp: boolean;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onRemove: () => void;
  onRename: (title: string) => void;
}) {
  return (
    <View style={[styles.favoriteCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}> 
      <View style={styles.favoriteHeader}>
        <View style={[styles.favoriteOrderBadge, { backgroundColor: colors.tintSoft }]}> 
          <ThemedText type="defaultSemiBold">#{index + 1}</ThemedText>
        </View>
        <View style={styles.favoriteHeaderText}>
          <TextInput
            defaultValue={favorite.title}
            onEndEditing={(event) => onRename(event.nativeEvent.text)}
            placeholder="Nombre del favorito"
            placeholderTextColor={colors.textMuted}
            style={[styles.favoriteTitleInput, { color: colors.text, borderColor: colors.borderStrong, backgroundColor: colors.surfaceElevated }]}
          />
          <ThemedText style={{ color: colors.textMuted }}>
            {favorite.courses.length} materias · guardado {formatSavedAt(favorite.savedAt)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.courseList}>
        {favorite.courses.map((course) => (
          <View key={`${favorite.id}-${course.id}-${course.group}`} style={[styles.courseItem, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}> 
            <ThemedText type="defaultSemiBold">{course.name}</ThemedText>
            <ThemedText style={{ color: colors.textMuted }}>{course.group} · {course.sessions.length} clases por semana</ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.actionsRow}>
        <InlineActionButton disabled={!canMoveUp} icon="chevron.right" label="Subir" colors={colors} onPress={onMoveUp} rotation="-90deg" />
        <InlineActionButton disabled={!canMoveDown} icon="chevron.right" label="Bajar" colors={colors} onPress={onMoveDown} rotation="90deg" />
        <InlineActionButton icon="bookmark.fill" label="Quitar" colors={colors} onPress={onRemove} destructive />
      </View>
    </View>
  );
}

function InlineActionButton({ colors, destructive, disabled, icon, label, onPress, rotation }: {
  colors: (typeof Colors)['light'];
  destructive?: boolean;
  disabled?: boolean;
  icon: 'bookmark.fill' | 'chevron.right';
  label: string;
  onPress: () => void;
  rotation?: string;
}) {
  const tintColor = destructive ? colors.danger : colors.tint;

  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.inlineActionButton, { borderColor: destructive ? colors.dangerSoft : colors.border, backgroundColor: disabled ? colors.surface : colors.surfaceStrong, opacity: disabled ? 0.45 : 1 }]}> 
      <View style={rotation ? { transform: [{ rotate: rotation }] } : undefined}>
        <IconSymbol color={tintColor} name={icon} size={16} />
      </View>
      <ThemedText style={{ color: tintColor }}>{label}</ThemedText>
    </Pressable>
  );
}

function formatSavedAt(savedAt: FavoriteSchedule['savedAt']) {
  return new Date(savedAt).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 36 },
  heroCard: { borderWidth: 1, borderRadius: 28, padding: 20, gap: 10, shadowOpacity: 0.18, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 6 },
  card: { borderWidth: 1, borderRadius: 24, padding: 18, gap: 12, shadowOpacity: 0.16, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 4 },
  countBadge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  favoriteList: { gap: 14 },
  favoriteCard: { borderWidth: 1, borderRadius: 24, padding: 16, gap: 12, shadowOpacity: 0.14, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 4 },
  favoriteHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  favoriteOrderBadge: { minWidth: 44, borderRadius: 14, alignItems: 'center', paddingHorizontal: 10, paddingVertical: 12 },
  favoriteHeaderText: { flex: 1, gap: 6 },
  favoriteTitleInput: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, fontWeight: '600' },
  courseList: { gap: 8 },
  courseItem: { borderWidth: 1, borderRadius: 16, padding: 12, gap: 3 },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  inlineActionButton: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
});
