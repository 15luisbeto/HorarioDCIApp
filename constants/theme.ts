/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const accentLight = '#0B84FF';
const accentDark = '#6EE7FF';

export const Colors = {
  light: {
    text: '#102033',
    textMuted: '#5C6B7A',
    background: '#F3F7FB',
    backgroundAccent: '#E8F4FF',
    surface: '#FFFFFF',
    surfaceElevated: '#F8FBFF',
    surfaceStrong: '#EAF3FB',
    border: '#D9E4F0',
    borderStrong: '#BDD1E7',
    tint: accentLight,
    tintSoft: '#D8EAFF',
    tintContrast: '#FFFFFF',
    icon: '#718096',
    tabIconDefault: '#718096',
    tabIconSelected: accentLight,
    success: '#0F9F6E',
    successSoft: '#DCFCEB',
    warning: '#C97A00',
    warningSoft: '#FFF1CF',
    danger: '#CF334D',
    dangerSoft: '#FFE1E7',
    shadow: 'rgba(15, 23, 42, 0.08)',
    overlay: 'rgba(255, 255, 255, 0.72)',
    calendarGrid: '#E0EAF4',
    calendarColumn: '#F7FBFF',
  },
  dark: {
    text: '#E8F2FF',
    textMuted: '#91A4BD',
    background: '#07111F',
    backgroundAccent: '#0E1C33',
    surface: '#0C1728',
    surfaceElevated: '#122238',
    surfaceStrong: '#182D47',
    border: '#1B324D',
    borderStrong: '#2A527A',
    tint: accentDark,
    tintSoft: 'rgba(110, 231, 255, 0.16)',
    tintContrast: '#06111F',
    icon: '#8BA1BA',
    tabIconDefault: '#7D92A8',
    tabIconSelected: accentDark,
    success: '#3DD9A0',
    successSoft: 'rgba(61, 217, 160, 0.14)',
    warning: '#FFBE55',
    warningSoft: 'rgba(255, 190, 85, 0.14)',
    danger: '#FF6B8A',
    dangerSoft: 'rgba(255, 107, 138, 0.16)',
    shadow: 'rgba(2, 6, 23, 0.42)',
    overlay: 'rgba(6, 17, 31, 0.72)',
    calendarGrid: '#19314B',
    calendarColumn: '#0E1C31',
  },
};

export type AppTheme = keyof typeof Colors;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
