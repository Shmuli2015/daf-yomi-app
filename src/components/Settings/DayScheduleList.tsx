import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme';
import { DaySchedule } from '../../utils/notifications';
import DayScheduleDayCell from './DayScheduleDayCell';
import { createDayScheduleListStyles } from './DayScheduleList.styles';

export type { DaySchedule };

interface Props {
  schedules: DaySchedule[];
  onToggleDay: (index: number) => void;
  onEditTime: (index: number) => void;
}

export const DayScheduleList = ({ schedules, onToggleDay, onEditTime }: Props) => {
  const theme = useTheme();
  const styles = useMemo(() => createDayScheduleListStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.weekGrid}>
        {schedules.map((schedule, index) => (
          <View key={index} style={styles.cellSlot}>
            <DayScheduleDayCell
              index={index}
              enabled={schedule.enabled}
              hour={schedule.hour}
              minute={schedule.minute}
              onPress={() => (schedule.enabled ? onEditTime(index) : onToggleDay(index))}
            />
          </View>
        ))}
      </View>
    </View>
  );
};
