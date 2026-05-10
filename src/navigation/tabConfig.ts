import { Ionicons } from '@expo/vector-icons';

export const TAB_CONFIG: Record<string, {
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
  label: string;
}> = {
  Home: { activeIcon: 'home', inactiveIcon: 'home-outline', label: 'ראשי' },
  Calendar: { activeIcon: 'calendar', inactiveIcon: 'calendar-outline', label: 'לוח שנה' },
  History: { activeIcon: 'stats-chart', inactiveIcon: 'stats-chart-outline', label: 'ש״ס' },
  Settings: { activeIcon: 'settings', inactiveIcon: 'settings-outline', label: 'הגדרות' },
};
