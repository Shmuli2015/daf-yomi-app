import React, { useMemo } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

interface CalendarTodayButtonProps {
  isCurrentMonth: boolean;
  onPress: () => void;
}

const CalendarTodayButton = ({ isCurrentMonth, onPress }: CalendarTodayButtonProps) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={isCurrentMonth}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel="חזרה לחודש של היום בלוח"
      accessibilityState={{ disabled: isCurrentMonth }}
    >
      <Ionicons
        name="today-outline"
        size={18}
        color={isCurrentMonth ? theme.colors.muted : theme.colors.accent}
      />
    </TouchableOpacity>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    button: {
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.sm,
    },
  });

export default CalendarTodayButton;
