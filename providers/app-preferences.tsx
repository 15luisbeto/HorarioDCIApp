import Storage from 'expo-sqlite/kv-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

import type { AppTheme } from '@/constants/theme';
import type { FavoriteSchedule } from '@/lib/schedules';

const THEME_PREFERENCE_KEY = 'horariodciapp.theme-preference';
const FAVORITES_KEY = 'horariodciapp.favorite-schedules';

export type ThemePreference = 'system' | AppTheme;

type AppPreferencesContextValue = {
  colorScheme: AppTheme;
  themePreference: ThemePreference;
  setThemePreference: (value: ThemePreference) => Promise<void>;
  favorites: FavoriteSchedule[];
  toggleFavorite: (schedule: FavoriteSchedule) => Promise<void>;
  removeFavorite: (scheduleId: string) => Promise<void>;
  renameFavorite: (scheduleId: string, title: string) => Promise<void>;
  moveFavorite: (scheduleId: string, direction: 'up' | 'down') => Promise<void>;
  isFavorite: (scheduleId: string) => boolean;
};

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(null);

export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const deviceColorScheme = useDeviceColorScheme();
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');
  const [favorites, setFavorites] = useState<FavoriteSchedule[]>([]);

  const persistFavorites = useCallback(async (next: FavoriteSchedule[]) => {
    await Storage.setItem(FAVORITES_KEY, JSON.stringify(next));
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function hydrate() {
      try {
        const [storedThemePreference, storedFavorites] = await Promise.all([
          Storage.getItem(THEME_PREFERENCE_KEY),
          Storage.getItem(FAVORITES_KEY),
        ]);

        if (!isMounted) {
          return;
        }

        if (storedThemePreference === 'light' || storedThemePreference === 'dark' || storedThemePreference === 'system') {
          setThemePreferenceState(storedThemePreference);
        }

        if (storedFavorites) {
          const parsed = JSON.parse(storedFavorites) as FavoriteSchedule[];
          setFavorites(parsed);
        }
      } catch {
        if (isMounted) {
          setFavorites([]);
          setThemePreferenceState('system');
        }
      }
    }

    hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  const colorScheme: AppTheme = useMemo(() => {
    if (themePreference === 'system') {
      return deviceColorScheme === 'dark' ? 'dark' : 'light';
    }

    return themePreference;
  }, [deviceColorScheme, themePreference]);

  const setThemePreference = useCallback(async (value: ThemePreference) => {
    setThemePreferenceState(value);
    await Storage.setItem(THEME_PREFERENCE_KEY, value);
  }, []);

  const removeFavorite = useCallback(async (scheduleId: string) => {
    setFavorites((current) => {
      const next = current.filter((item) => item.id !== scheduleId);
      void persistFavorites(next);
      return next;
    });
  }, [persistFavorites]);

  const toggleFavorite = useCallback(async (schedule: FavoriteSchedule) => {
    setFavorites((current) => {
      const exists = current.some((item) => item.id === schedule.id);
      const next = exists
        ? current.filter((item) => item.id !== schedule.id)
        : [schedule, ...current].sort((left, right) => right.savedAt.localeCompare(left.savedAt));

      void persistFavorites(next);
      return next;
    });
  }, [persistFavorites]);

  const renameFavorite = useCallback(async (scheduleId: string, title: string) => {
    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      return;
    }

    setFavorites((current) => {
      const next = current.map((item) => (item.id === scheduleId ? { ...item, title: normalizedTitle } : item));
      void persistFavorites(next);
      return next;
    });
  }, [persistFavorites]);

  const moveFavorite = useCallback(async (scheduleId: string, direction: 'up' | 'down') => {
    setFavorites((current) => {
      const index = current.findIndex((item) => item.id === scheduleId);

      if (index === -1) {
        return current;
      }

      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);
      void persistFavorites(next);
      return next;
    });
  }, [persistFavorites]);

  const isFavorite = useCallback(
    (scheduleId: string) => favorites.some((item) => item.id === scheduleId),
    [favorites]
  );

  const value = useMemo<AppPreferencesContextValue>(
    () => ({
      colorScheme,
      themePreference,
      setThemePreference,
      favorites,
      toggleFavorite,
      removeFavorite,
      renameFavorite,
      moveFavorite,
      isFavorite,
    }),
    [colorScheme, favorites, isFavorite, moveFavorite, removeFavorite, renameFavorite, setThemePreference, themePreference, toggleFavorite]
  );

  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>;
}

export function useAppPreferences() {
  const context = useContext(AppPreferencesContext);

  if (!context) {
    throw new Error('useAppPreferences must be used inside AppPreferencesProvider');
  }

  return context;
}
