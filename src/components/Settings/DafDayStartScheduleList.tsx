import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme';
import type { DafDayStartDaySchedule } from '../../utils/dafDayBoundary';
import DayScheduleDayCell from './DayScheduleDayCell';
import { createDayScheduleListStyles } from './DayScheduleList.styles';

type DafDayStartScheduleListProps = {
  schedules: DafDayStartDaySchedule[];
  onEditDay: (index: number) => void;
};

export default function DafDayStartScheduleList({
  schedules,
  onEditDay,
}: DafDayStartScheduleListProps) {
  const theme = useTheme();
  const styles = useMemo(() => createDayScheduleListStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.weekGrid}>
        {schedules.map((schedule, index) => (
          <View key={index} style={styles.cellSlot}>
            <DayScheduleDayCell
              index={index}
              enabled
              hour={schedule.hour}
              minute={schedule.minute}
              onPress={() => onEditDay(index)}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
