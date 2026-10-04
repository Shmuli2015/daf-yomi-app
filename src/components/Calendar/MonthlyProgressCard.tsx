import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

interface MonthlyProgressCardProps {
  learnedCount: number;
  totalCount: number;
  tractateLabel?: string;
}

export default function MonthlyProgressCard({
  learnedCount,
  totalCount,
  tractateLabel,
}: MonthlyProgressCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const percentage = totalCount > 0 ? Math.min(100, Math.round((learnedCount / totalCount) * 100)) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <View style={styles.iconCircle}>
            <Ionicons name="stats-chart" size={14} color={theme.colors.accent} />
          </View>
          <View style={styles.titleTextCol}>
            <Text style={styles.title}>התקדמות חודשית</Text>
            {tractateLabel ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {tractateLabel}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={styles.statsGroup}>
          <Text style={styles.countText}>
            {learnedCount}/{totalCount} דפים
          </Text>
          <Text style={styles.percentText}>{percentage}%</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${percentage}%` },
          ]}
        />
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      paddingVertical: 9,
      paddingHorizontal: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      direction: 'rtl',
      ...theme.shadow.card,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 7,
    },
    titleGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },
    iconCircle: {
      width: 24,
      height: 24,
      borderRadius: 7,
      backgroundColor: theme.colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleTextCol: {
      justifyContent: 'center',
    },
    title: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      includeFontPadding: false,
    },
    subtitle: {
      fontSize: 10.5,
      fontWeight: '700',
      color: theme.colors.accent,
      marginTop: 0.5,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
      includeFontPadding: false,
    },
    statsGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    countText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      includeFontPadding: false,
    },
    percentText: {
      fontSize: 13,
      fontWeight: '900',
      color: theme.colors.accent,
      includeFontPadding: false,
    },
    progressTrack: {
      height: 5,
      borderRadius: 3,
      backgroundColor: theme.colors.background,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
      backgroundColor: theme.colors.accent,
    },
  });
