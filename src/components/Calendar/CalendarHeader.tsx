import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../../theme';

const CalendarHeader = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Animated.View entering={FadeIn.duration(450)} style={styles.container}>
      <View style={styles.row}>
        <View style={styles.accentBar} />
        <Text style={styles.title}>לוח שנה</Text>
      </View>
      <Text style={styles.subtitle}>מעקב למידה לפי תאריך עברי</Text>
    </Animated.View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      marginBottom: 10,
      paddingHorizontal: 4,
      alignItems: 'flex-start',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 3,
    },
    accentBar: {
      width: 4,
      height: 24,
      backgroundColor: theme.colors.accent,
      borderRadius: 2,
    },
    title: {
      fontSize: 26,
      fontWeight: '900',
      color: theme.colors.primary,
      letterSpacing: -0.4,
    },
    subtitle: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
  });

export default CalendarHeader;
