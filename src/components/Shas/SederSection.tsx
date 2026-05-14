import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Seder } from '../../data/shas';

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

const SederSection = React.memo(function SederSection({
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
        <View style={styles.topRow}>
          <View style={styles.titleGroup}>
            <View style={styles.accentBar} />
            <Text style={styles.sederName}>{sederName}</Text>
          </View>
          <View style={styles.percentageBadge}>
            <Text style={styles.percentageText}>{percentage}%</Text>
          </View>
        </View>

        <View style={styles.statsTiles}>
          <View style={styles.statTile}>
            <Text style={styles.statTileCount}>{`\u200E${learnedDafim} / ${totalDafim}\u200E`}</Text>
            <Text style={styles.statTileLabel}>דפים נלמדו</Text>
          </View>
          <View style={styles.statTile}>
            <Text style={styles.statTileCount}>{`\u200E${completedMasechtot} / ${totalMasechtot}\u200E`}</Text>
            <Text style={styles.statTileLabel}>מסכתות הושלמו</Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${percentage}%` }]} />
          </View>
          <View style={styles.chevronBox}>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={theme.colors.textMuted}
            />
          </View>
        </View>
      </TouchableOpacity>
      
      {isExpanded && children && (
        <View style={styles.contentContainer}>
          <View style={styles.contentDivider} />
          {children}
        </View>
      )}
    </View>
  );
});

export default SederSection;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      marginBottom: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      elevation: 5,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 15,
    },
    headerContainer: {
      padding: 20,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    titleGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    accentBar: {
      width: 4,
      height: 26,
      borderRadius: 2,
      backgroundColor: theme.colors.accent,
    },
    sederName: {
      fontSize: 24,
      fontWeight: '900',
      color: theme.colors.primary,
      letterSpacing: -0.5,
    },
    percentageBadge: {
      backgroundColor: theme.colors.accentLight,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(201,150,60,0.15)',
    },
    percentageText: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.colors.accent,
    },
    statsTiles: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
    },
    statTile: {
      flex: 1,
      flexBasis: 0,
      flexGrow: 1,
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      padding: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statTileCount: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.colors.primary,
      marginBottom: 2,
    },
    statTileLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    progressTrack: {
      flex: 1,
      height: 6,
      backgroundColor: theme.colors.progressTrack,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.accent,
      borderRadius: 3,
    },
    chevronBox: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    contentContainer: {
      paddingHorizontal: 16,
      paddingBottom: 20,
    },
    contentDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginBottom: 16,
      opacity: 0.5,
    },
  });
