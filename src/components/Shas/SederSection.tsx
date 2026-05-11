import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';
import { Seder } from '../../data/shas';
import { Ionicons } from '@expo/vector-icons';

interface SederSectionProps {
  sederName: string;
  percentage: number;
  learnedDafim: number;
  totalDafim: number;
  completedMasechtot: number;
  totalMasechtot: number;
  isExpanded: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

export default function SederSection({
  sederName,
  percentage,
  learnedDafim,
  totalDafim,
  completedMasechtot,
  totalMasechtot,
  isExpanded,
  onToggle,
  children,
}: SederSectionProps) {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.headerContainer} 
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.accentDot} />
            <Text style={styles.sederName}>{sederName}</Text>
            <View style={styles.chevronContainer}>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={theme.colors.textSecondary}
              />
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{percentage}%</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>
                {learnedDafim} / {totalDafim} דפים
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>
                {completedMasechtot} / {totalMasechtot} מסכתות
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
        </View>
      </TouchableOpacity>
      
      {isExpanded && children && (
        <View style={styles.contentContainer}>
          {children}
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      marginBottom: 16,
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      overflow: 'hidden',
    },
    headerContainer: {
      padding: 16,
    },
    header: {
      marginBottom: 12,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 10,
    },
    accentDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.accent,
    },
    sederName: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.colors.primary,
      flex: 1,
    },
    chevronContainer: {
      marginLeft: 'auto',
    },
    statsRow: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
    },
    statBox: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statValue: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.accent,
    },
    statLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    progressBarContainer: {
      height: 6,
      backgroundColor: theme.colors.progressBg,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: theme.colors.accent,
      borderRadius: 3,
    },
    contentContainer: {
      padding: 16,
      paddingTop: 0,
    },
  });
