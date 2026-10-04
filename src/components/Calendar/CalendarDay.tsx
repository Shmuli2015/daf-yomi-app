import React, { useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { HDate } from '@hebcal/core';
import { useTheme } from '../../theme';
import { createCalendarDayStyles } from './CalendarDay.styles';
import type { AmudSide } from '../../utils/dafStatus';

interface CalendarDayProps {
  hdate: HDate;
  isCurrentMonth: boolean;
  learned: boolean;
  partial?: boolean;
  partialAmud?: AmudSide | null;
  isToday: boolean;
  isSelected: boolean;
  dafLabel?: string;
  hasSpecialEvent?: boolean;
  showSecularDate?: boolean;
  onPress: (hdate: HDate) => void;
}

const CalendarDay = React.memo(
  ({
    hdate,
    isCurrentMonth,
    learned,
    partial = false,
    partialAmud = null,
    isToday,
    isSelected,
    dafLabel,
    hasSpecialEvent,
    showSecularDate = false,
    onPress,
  }: CalendarDayProps) => {
    const theme = useTheme();
    const styles = useMemo(() => createCalendarDayStyles(theme), [theme]);

    const gematriya = hdate.renderGematriya().split(' ')[0];
    const gregDay = hdate.greg().getDate();

    const scale = useSharedValue(1);

    const handlePress = () => {
      scale.value = withSequence(
        withSpring(0.85, { damping: 12, stiffness: 450 }),
        withSpring(1, { damping: 14, stiffness: 250 })
      );
      onPress(hdate);
    };

    const containerOpacity = isCurrentMonth
      ? 1
      : learned || partial
        ? 0.55
        : 0.28;

    const animatedContainerStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: containerOpacity,
    }));

    const isSpecial = hasSpecialEvent && !learned && isCurrentMonth;

    const bg = learned
      ? theme.colors.accent
      : isToday
        ? theme.colors.accentLight
        : 'transparent';

    const borderColor = !isCurrentMonth
      ? 'transparent'
      : isSelected
        ? theme.colors.primary
        : isToday
          ? theme.colors.accent
          : partial && !learned
            ? theme.colors.accent
            : isSpecial
              ? theme.colors.accentBorder
              : theme.colors.border;

    const borderWidth = !isCurrentMonth ? 0 : isSelected ? 2 : isToday ? 2 : partial ? 1.5 : 1;

    const textColor = learned
      ? theme.colors.white
      : isToday
        ? theme.colors.accent
        : isCurrentMonth
          ? theme.colors.textPrimary
          : theme.colors.textMuted;

    const gregColor = learned
      ? 'rgba(255, 255, 255, 0.72)'
      : isToday
        ? theme.colors.accent
        : theme.colors.textMuted;

    const dafChipBackground = !isCurrentMonth
      ? 'transparent'
      : learned
        ? 'rgba(255, 255, 255, 0.22)'
        : isToday
          ? theme.colors.surface
          : partial
            ? theme.colors.accentLight
            : theme.colors.background;

    const dafTextColor = !isCurrentMonth
      ? theme.colors.textMuted
      : learned
        ? theme.colors.white
        : isToday || partial
          ? theme.colors.accent
          : theme.colors.textSecondary;

    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={styles.cell}
        accessibilityRole="button"
        accessibilityLabel={`יום ${gematriya}${dafLabel ? `, דף ${dafLabel}` : ''}`}
      >
        <Animated.View style={animatedContainerStyle}>
          <View
            style={[
              styles.dayCard,
              {
                backgroundColor: bg,
                borderColor,
                borderWidth,
              },
            ]}
          >
            {partial && !learned && (
              <View
                style={[
                  styles.partialFill,
                  partialAmud === 'b' ? styles.partialFillLeft : styles.partialFillRight,
                ]}
              />
            )}

            <View style={styles.topRow}>
              {showSecularDate ? (
                <Animated.Text style={[styles.gregText, { color: gregColor }]}>
                  {gregDay}
                </Animated.Text>
              ) : (
                <View style={styles.topPlaceholder} />
              )}
              {isSpecial ? (
                <View style={styles.specialDot} />
              ) : (
                <View style={styles.topPlaceholder} />
              )}
            </View>

            <Animated.Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={[styles.dayText, { color: textColor }]}
            >
              {gematriya}
            </Animated.Text>

            {dafLabel ? (
              <View style={[styles.dafChip, { backgroundColor: dafChipBackground }]}>
                <Animated.Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                  style={[styles.dafChipText, { color: dafTextColor }]}
                >
                  {dafLabel}
                  {partial && !learned ? (partialAmud === 'b' ? ' ע"ב' : ' ע"א') : ''}
                </Animated.Text>
              </View>
            ) : (
              <View style={styles.dafPlaceholder} />
            )}
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.isCurrentMonth === nextProps.isCurrentMonth &&
      prevProps.learned === nextProps.learned &&
      prevProps.partial === nextProps.partial &&
      prevProps.partialAmud === nextProps.partialAmud &&
      prevProps.isToday === nextProps.isToday &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.dafLabel === nextProps.dafLabel &&
      prevProps.hasSpecialEvent === nextProps.hasSpecialEvent &&
      prevProps.showSecularDate === nextProps.showSecularDate &&
      prevProps.onPress === nextProps.onPress &&
      prevProps.hdate.getFullYear() === nextProps.hdate.getFullYear() &&
      prevProps.hdate.getMonth() === nextProps.hdate.getMonth() &&
      prevProps.hdate.getDate() === nextProps.hdate.getDate()
    );
  }
);

export default CalendarDay;

