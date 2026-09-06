import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

interface MasechetModalStatsProps {
  totalLearned: number;
  totalPages: number;
  percentage: number;
  isHomeActive?: boolean;
  onToggleHomeActive?: () => void;
  showPersonalTrack?: boolean;
}

export default function MasechetModalStats({
  totalLearned,
  totalPages,
  percentage,
  showPersonalTrack = true,
}: MasechetModalStatsProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {`\u2066${totalLearned} / ${totalPages}\u2069`}
            </Text>
            <Text style={styles.statLabel}>
              {showPersonalTrack ? 'דפים ייחודיים' : 'דפים שנלמדו'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{percentage}%</Text>
            <Text style={styles.statLabel}>התקדמות במסכת</Text>
          </View>
        </View>

        {showPersonalTrack && (
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendDafYomi]} />
              <Text style={styles.legendText}>דף יומי</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendPersonal]} />
              <Text style={styles.legendText}>לימוד אישי</Text>
            </View>
            <View style={styles.legendItem}>
              <Ionicons name="star" size={11} color={theme.colors.accent} />
              <Text style={styles.legendText}>שניהם</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      paddingBottom: 10,
    },
    statsCard: {
      backgroundColor: theme.colors.background,
      borderRadius: 14,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statValue: {
      fontSize: 17,
      fontWeight: '800',
      color: theme.colors.accent,
    },
    statLabel: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      marginTop: 2,
    },
    divider: {
      width: 1,
      height: 26,
      backgroundColor: theme.colors.border,
    },
    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    legendDafYomi: {
      backgroundColor: theme.colors.accentLight,
      borderColor: theme.colors.accent,
      borderWidth: 1,
    },
    legendPersonal: {
      backgroundColor: theme.colors.accent,
    },
    legendText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
  });
