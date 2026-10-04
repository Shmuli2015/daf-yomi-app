import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
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
      style={[
        styles.button,
        !isCurrentMonth ? styles.buttonActive : styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={isCurrentMonth}
      activeOpacity={0.75}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel="חזרה לחודש הנוכחי בלוח"
      accessibilityState={{ disabled: isCurrentMonth }}
    >
      <Ionicons
        name="calendar-outline"
        size={13}
        color={isCurrentMonth ? theme.colors.textMuted : theme.colors.accent}
      />
      <Text
        style={[
          styles.text,
          { color: isCurrentMonth ? theme.colors.textMuted : theme.colors.accent },
        ]}
      >
        היום
      </Text>
    </TouchableOpacity>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 10,
      borderWidth: 1,
    },
    buttonActive: {
      backgroundColor: theme.colors.accentLight,
      borderColor: theme.colors.accentBorder,
    },
    buttonDisabled: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      opacity: 0.45,
    },
    text: {
      fontSize: 11,
      fontWeight: '700',
      includeFontPadding: false,
    },
  });

export default CalendarTodayButton;
