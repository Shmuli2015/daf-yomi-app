import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { SHAS_MASECHTOT } from '../../data/shas';
import { stripNiqqud } from '../../utils/shas';
import { useTheme } from '../../theme';

export interface MasechetData {
  m: typeof SHAS_MASECHTOT[0];
  total: number;
  learned: number;
  percent: number;
  isCompleted: boolean;
}

interface MasechetCardProps {
  data: MasechetData;
  index: number;
  onPress: () => void;
}

const MasechetCard = React.memo(function MasechetCard({
  data,
  onPress,
}: MasechetCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const progressWidth = useRef(new Animated.Value(data.percent / 100)).current;

  useEffect(() => {
    Animated.timing(progressWidth, {
      toValue: data.percent / 100,
      duration: 400,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [data.percent]);

  const barWidth = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={onPress}
        style={[styles.card, data.isCompleted ? styles.cardCompleted : styles.cardDefault]}
      >
        <View style={styles.cardHeader}>
          <Text
            style={[styles.masechetName, data.isCompleted && styles.masechetNameCompleted]}
            numberOfLines={2}
          >
            {stripNiqqud(data.m.he)}
          </Text>
          {data.isCompleted && (
            <View style={styles.completedBadgeHeader}>
              <Text style={styles.completedCheckHeader}>✓</Text>
            </View>
          )}
        </View>

        <View style={styles.cardBody}>
          <View style={styles.statsRow}>
            <Text style={styles.progressText}>
              {`\u200E${data.learned} / ${data.total}\u200E`} דפים
            </Text>
            {data.isCompleted ? (
              <View style={styles.percentPillCompleted}>
                <Text style={styles.percentPillCompletedText}>100%</Text>
              </View>
            ) : (
              <View style={styles.percentPill}>
                <Text style={styles.percentPillText}>{data.percent}%</Text>
              </View>
            )}
          </View>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                data.isCompleted ? styles.progressFillCompleted : styles.progressFillDefault,
                { width: barWidth },
              ]}
            />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
});

export default MasechetCard;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    cardWrapper: {
      width: '47.5%',
    },
    card: {
      borderRadius: 18,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderWidth: 1.5,
      minHeight: 96,
      justifyContent: 'space-between',
    },
    cardDefault: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    cardCompleted: {
      backgroundColor: theme.colors.surface,
      borderColor: 'rgba(201,150,60,0.5)',
      shadowColor: theme.colors.accent,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
      gap: 4,
    },
    masechetName: {
      fontSize: 17,
      fontWeight: '900',
      color: theme.colors.primary,
      flex: 1,
      textAlign: 'left',
      lineHeight: 21,
    },
    masechetNameCompleted: {
      color: theme.colors.primary,
    },
    completedBadgeHeader: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: theme.colors.accentLight,
      borderWidth: 1,
      borderColor: 'rgba(201,150,60,0.4)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    completedCheckHeader: {
      color: theme.colors.accent,
      fontSize: 11,
      fontWeight: '900',
    },
    percentPill: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 5,
      borderWidth: 0.5,
      borderColor: theme.colors.border,
    },
    percentPillText: {
      fontSize: 9.5,
      fontWeight: '800',
      color: theme.colors.textMuted,
    },
    percentPillCompleted: {
      backgroundColor: theme.colors.accentLight,
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: 'rgba(201,150,60,0.3)',
    },
    percentPillCompletedText: {
      fontSize: 9.5,
      fontWeight: '900',
      color: theme.colors.accent,
    },
    cardBody: {
      width: '100%',
    },
    progressText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontWeight: '700',
      textAlign: 'left',
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
      gap: 4,
    },
    progressTrack: {
      height: 5,
      backgroundColor: theme.colors.progressTrack,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      position: 'absolute',
      start: 0,
      height: '100%',
      borderRadius: 3,
    },
    progressFillDefault: {
      backgroundColor: theme.colors.accent,
    },
    progressFillCompleted: {
      backgroundColor: theme.colors.accent,
    },
  });


