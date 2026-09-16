import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../theme';

const visualRightEdge = Platform.OS === 'web' ? { right: 0 } : { left: 0 };
const visualLeftEdge = Platform.OS === 'web' ? { left: 0 } : { right: 0 };

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
        <View style={styles.halfGroup}>
          <View style={styles.halfPair}>
            <View style={[styles.swatch, styles.halfSwatch]}>
              <View style={styles.halfFillRight} />
            </View>
            <Text style={styles.amudLabel}>א׳</Text>
          </View>
          <View style={styles.halfPair}>
            <View style={[styles.swatch, styles.halfSwatch]}>
              <View style={styles.halfFillLeft} />
            </View>
            <Text style={styles.amudLabel}>ב׳</Text>
          </View>
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
    halfGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    halfPair: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    amudLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    halfFillRight: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: '50%',
      ...visualRightEdge,
      backgroundColor: theme.colors.accent,
      opacity: 0.65,
    },
    halfFillLeft: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: '50%',
      ...visualLeftEdge,
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
