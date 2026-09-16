import React, { useMemo } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';
import { formatNotificationTime } from '../../utils/settingsScreen';
import { DAY_LABELS, DAY_SHORT } from './DayScheduleList.constants';
import { createDayScheduleDayCellStyles } from './DayScheduleDayCell.styles';

type DayScheduleDayCellProps = {
  index: number;
  enabled: boolean;
  hour: number;
  minute: number;
  onPress: () => void;
};

export default function DayScheduleDayCell({
  index,
  enabled,
  hour,
  minute,
  onPress,
}: DayScheduleDayCellProps) {
  const theme = useTheme();
  const styles = useMemo(() => createDayScheduleDayCellStyles(theme), [theme]);
  const timeLabel = enabled ? formatNotificationTime(hour, minute) : 'כבוי';
  const accessibilityLabel = `יום ${DAY_LABELS[index]}, ${timeLabel}`;

  return (
    <TouchableOpacity
      style={[styles.cell, enabled && styles.cellEnabled]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: enabled }}
    >
      <Text style={[styles.dayLetter, enabled && styles.dayLetterEnabled]}>{DAY_SHORT[index]}</Text>
      <Text style={enabled ? styles.timeText : styles.disabledText}>{timeLabel}</Text>
    </TouchableOpacity>
  );
}
