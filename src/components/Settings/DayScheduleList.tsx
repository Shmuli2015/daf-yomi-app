import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { DaySchedule } from '../../utils/notifications';

export type { DaySchedule };

const DAY_LABELS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const DAY_SHORT = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

const fmtTime = (h: number, m: number) =>
  `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

interface Props {
  schedules: DaySchedule[];
  onToggleDay: (index: number) => void;
  onEditTime: (index: number) => void;
}

export const DayScheduleList = ({ schedules, onToggleDay, onEditTime }: Props) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      {schedules.map((schedule, index) => {
        const isLast = index === schedules.length - 1;
        return (
          <View key={index} style={[styles.row, isLast && styles.rowLast]}>
            <TouchableOpacity
              style={[styles.toggle, schedule.enabled && styles.toggleActive]}
              onPress={() => onToggleDay(index)}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleText, schedule.enabled && styles.toggleTextActive]}>
                {DAY_SHORT[index]}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.label, !schedule.enabled && styles.labelDisabled]}>
              {DAY_LABELS[index]}
            </Text>

            {schedule.enabled ? (
              <TouchableOpacity
                style={styles.timeChip}
                onPress={() => onEditTime(index)}
                activeOpacity={0.7}
              >
                <Ionicons name="time-outline" size={13} color={theme.colors.accent} />
                <Text style={styles.timeChipText}>{fmtTime(schedule.hour, schedule.minute)}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.disabledText}>כבוי</Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 18,
      paddingVertical: 6,
      backgroundColor: theme.colors.surface,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      gap: 12,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    toggle: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    toggleActive: {
      backgroundColor: theme.colors.accentLight,
      borderColor: theme.colors.accent,
    },
    toggleText: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.colors.textMuted,
    },
    toggleTextActive: {
      color: theme.colors.accent,
    },
    label: {
      flex: 1,
      fontSize: 14.5,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      textAlign: 'start' as any,
    },
    labelDisabled: {
      color: theme.colors.textMuted,
    },
    timeChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: theme.colors.accentLight,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(201,150,60,0.25)',
    },
    timeChipText: {
      fontSize: 13.5,
      fontWeight: '800',
      color: theme.colors.accent,
      letterSpacing: 0.5,
    },
    disabledText: {
      fontSize: 12.5,
      color: theme.colors.textMuted,
      fontWeight: '600',
    },
  });
