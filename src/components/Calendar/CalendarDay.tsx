import React, { useEffect, useRef, useMemo } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { HDate } from '@hebcal/core';
import { useTheme } from '../../theme';

interface CalendarDayProps {
  hdate: HDate;
  isCurrentMonth: boolean;
  learned: boolean;
  isToday: boolean;
  isSelected: boolean;
  onPress: (hdate: HDate) => void;
}

const CalendarDay = ({ hdate, isCurrentMonth, learned, isToday, isSelected, onPress }: CalendarDayProps) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const gematriya = hdate.renderGematriya().split(' ')[0];
  const gregDay = hdate.greg().getDate();

  const scale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.7)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    pulseLoopRef.current?.stop();
    if (isToday) {
      pulseLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseOpacity, { toValue: 0.15, duration: 1100, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.7, duration: 1100, useNativeDriver: true }),
        ])
      );
      pulseLoopRef.current.start();
    } else {
      Animated.timing(pulseOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
    return () => { pulseLoopRef.current?.stop(); };
  }, [isToday]);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.8, damping: 8, stiffness: 300, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, damping: 12, stiffness: 200, useNativeDriver: true }),
    ]).start();
    onPress(hdate);
  };

  const bg = learned ? theme.colors.accent : isToday ? theme.colors.accentLight : 'transparent';
  const textColor = learned ? 'white' : isToday ? theme.colors.accent : theme.colors.textPrimary;
  const subColor = learned ? 'rgba(255,255,255,0.7)' : isToday ? theme.colors.accent : theme.colors.textMuted;
  const borderColor = isSelected ? theme.colors.accent : 'transparent';

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1} style={styles.cell}>
      <Animated.View style={{ transform: [{ scale }], opacity: isCurrentMonth ? 1 : 0.3 }}>
        {isToday && (
          <Animated.View style={[styles.pulseRing, { opacity: pulseOpacity }]} />
        )}
        <Animated.View
          style={[styles.circle, { backgroundColor: bg, borderColor, borderWidth: isSelected ? 1.5 : 0 }]}
        >
          <Animated.Text style={[styles.dayText, { color: textColor }]}>{gematriya}</Animated.Text>
          <Animated.Text style={[styles.gregText, { color: subColor }]}>{gregDay}</Animated.Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    cell: {
      width: '14.28%',
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 2,
    },
    circle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
    },
    pulseRing: {
      position: 'absolute',
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: theme.colors.accent,
      backgroundColor: 'transparent',
      left: -2,
      top: -2,
      zIndex: -1,
    },
    dayText: { fontSize: 14, fontWeight: '800' },
    gregText: { fontSize: 9, fontWeight: '500', marginTop: -1 },
  });

export default CalendarDay;
