import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

const SWATCH_SIZE = 16;

export default function CompactCalendarLegend() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.legendItem}>
        <View style={[styles.swatch, styles.learnedSwatch]} />
        <Text style={styles.label} numberOfLines={1}>נלמד</Text>
      </View>

      <View style={styles.legendItem}>
        <View style={[styles.swatch, styles.halfSwatch]}>
          <View style={styles.halfFill} />
        </View>
        <Text style={styles.label} numberOfLines={1}>חצי דף</Text>
      </View>

      <View style={styles.legendItem}>
        <View style={[styles.swatch, styles.todaySwatch]} />
        <Text style={styles.label} numberOfLines={1}>היום</Text>
      </View>

      <View style={styles.legendItem}>
        <View style={[styles.swatch, styles.specialSwatch]} />
        <Text style={styles.label} numberOfLines={1}>שבת / מועד</Text>
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'nowrap',
      gap: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      marginTop: 10,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      direction: 'rtl',
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      flexShrink: 1,
    },
    swatch: {
      width: SWATCH_SIZE,
      height: SWATCH_SIZE,
      borderRadius: SWATCH_SIZE / 2,
      borderWidth: 1.5,
      overflow: 'hidden',
    },
    learnedSwatch: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    halfSwatch: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.accent,
    },
    halfFill: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      width: '50%',
      backgroundColor: theme.colors.accent,
      opacity: 0.65,
    },
    todaySwatch: {
      backgroundColor: theme.colors.accentLight,
      borderColor: theme.colors.accent,
    },
    specialSwatch: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.accentBorder,
    },
    label: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      flexShrink: 1,
    },
  });
