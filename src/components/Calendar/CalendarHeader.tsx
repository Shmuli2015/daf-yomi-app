import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

const CalendarHeader = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.accentBar} />
        <Text style={styles.title}>לוח שנה</Text>
      </View>
      <Text style={styles.subtitle}>מעקב למידה לפי תאריך עברי</Text>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      marginBottom: 20,
      paddingHorizontal: 4,
      alignItems: 'flex-start',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 6,
    },
    accentBar: {
      width: 4,
      height: 32,
      backgroundColor: theme.colors.accent,
      borderRadius: 2,
    },
    title: {
      fontSize: 34,
      fontWeight: '900',
      color: theme.colors.primary,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
  });

export default CalendarHeader;
