import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../theme';
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

export const DayScheduleList = ({ schedules, onToggleDay, onEditTime }: Props) => (
  <View style={styles.container}>
    {schedules.map((schedule, index) => (
      <View key={index} style={styles.row}>
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
            <Ionicons name="time-outline" size={13} color={THEME.colors.accent} />
            <Text style={styles.timeChipText}>{fmtTime(schedule.hour, schedule.minute)}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.disabledText}>כבוי</Text>
        )}
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
    gap: 12,
  },
  toggle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  toggleActive: {
    backgroundColor: THEME.colors.accentLight,
    borderColor: THEME.colors.accent,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.textMuted,
  },
  toggleTextActive: {
    color: THEME.colors.accent,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    textAlign: 'right',
  },
  labelDisabled: {
    color: THEME.colors.textMuted,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: THEME.colors.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(201,150,60,0.25)',
  },
  timeChipText: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.accent,
    letterSpacing: 0.5,
  },
  disabledText: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    fontWeight: '600',
  },
});
