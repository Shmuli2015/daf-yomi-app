import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeMode, useTheme } from '../../theme';
import { triggerSelection } from '../../utils/haptics';
import { formatNotificationTime } from '../../utils/settingsScreen';
import { formatLastBackupAt } from '../../utils/backupReminder';
import type { DaySchedule } from './Schedule/DayScheduleList';
import { createSettingsOverviewCardStyles } from './SettingsOverviewCard.styles';

export type SettingsOverviewCardProps = {
  notificationsEnabled: boolean;
  notifMode?: 'daily' | 'custom';
  hour: number;
  minute: number;
  daySchedules?: DaySchedule[];
  themeMode: ThemeMode;
  lastBackupAt: string | null;
  onNotificationsPress: () => void;
  onThemePress: () => void;
  onBackupPress: () => void;
};

export default function SettingsOverviewCard({
  notificationsEnabled,
  notifMode = 'daily',
  hour,
  minute,
  daySchedules,
  themeMode,
  lastBackupAt,
  onNotificationsPress,
  onThemePress,
  onBackupPress,
}: SettingsOverviewCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSettingsOverviewCardStyles(theme), [theme]);

  let notifLabel = 'כבוי';
  let notifSubtitle = 'התראות';

  if (notificationsEnabled) {
    if (notifMode === 'custom' && daySchedules && daySchedules.length > 0) {
      const todayIndex = new Date().getDay();
      const todaySchedule = daySchedules[todayIndex];
      const activeDaysCount = daySchedules.filter(d => d.enabled).length;

      if (activeDaysCount === 0) {
        notifLabel = 'אין ימים פעילים';
        notifSubtitle = 'לפי ימים';
      } else if (todaySchedule?.enabled) {
        notifLabel = formatNotificationTime(todaySchedule.hour, todaySchedule.minute);
        notifSubtitle = 'היום (לפי ימים)';
      } else {
        notifLabel = 'לפי ימים';
        notifSubtitle = `${activeDaysCount} ימים בשבוע`;
      }
    } else {
      notifLabel = formatNotificationTime(hour, minute);
      notifSubtitle = 'תזכורת יומית';
    }
  }

  const themeLabel = themeMode === 'dark' ? 'כהה' : themeMode === 'light' ? 'בהיר' : 'מערכת';
  const themeIcon = themeMode === 'dark' ? 'moon-outline' : themeMode === 'light' ? 'sunny-outline' : 'contrast-outline';
  const backupFormatted = formatLastBackupAt(lastBackupAt);
  const backupLabel = backupFormatted ? 'מעודכן' : 'טרם גובה';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.accentLight, 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.topGradient}
        pointerEvents="none"
      />
      <View style={styles.tilesRow}>
        <TouchableOpacity
          style={styles.tile}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={`התראות: ${notifLabel}, ${notifSubtitle}`}
          onPress={() => {
            void triggerSelection();
            onNotificationsPress();
          }}
        >
          <View style={styles.iconBox}>
            <Ionicons
              name={notificationsEnabled ? 'notifications' : 'notifications-off-outline'}
              size={18}
              color={theme.colors.accent}
            />
          </View>
          <Text style={styles.tileLabel} numberOfLines={1}>{notifLabel}</Text>
          <Text style={styles.tileSubtitle} numberOfLines={1}>{notifSubtitle}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tile, styles.tileBorder]}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={`מצב תצוגה: ${themeLabel}`}
          onPress={() => {
            void triggerSelection();
            onThemePress();
          }}
        >
          <View style={styles.iconBox}>
            <Ionicons name={themeIcon} size={18} color={theme.colors.accent} />
          </View>
          <Text style={styles.tileLabel} numberOfLines={1}>{themeLabel}</Text>
          <Text style={styles.tileSubtitle} numberOfLines={1}>מצב תצוגה</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tile, styles.tileBorder]}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={`גיבוי נתונים: ${backupLabel}`}
          onPress={() => {
            void triggerSelection();
            onBackupPress();
          }}
        >
          <View style={styles.iconBox}>
            <Ionicons
              name={lastBackupAt ? 'shield-checkmark-outline' : 'cloud-upload-outline'}
              size={18}
              color={theme.colors.accent}
            />
          </View>
          <Text style={styles.tileLabel} numberOfLines={1}>{backupLabel}</Text>
          <Text style={styles.tileSubtitle} numberOfLines={1}>גיבוי נתונים</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
