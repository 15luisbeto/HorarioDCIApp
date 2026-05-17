import { useAppPreferences } from '@/providers/app-preferences';

export function useColorScheme() {
  return useAppPreferences().colorScheme;
}
