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
  index,
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
        {data.isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>✓</Text>
          </View>
        )}
        <Text style={styles.masechetName}>{stripNiqqud(data.m.he)}</Text>
        <Text style={styles.progressText}>{data.learned} / {data.total} דפים</Text>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              data.isCompleted ? styles.progressFillCompleted : styles.progressFillDefault,
              { width: barWidth },
            ]}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
});

export default MasechetCard;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    cardWrapper: { width: '48%' },
    card: { borderRadius: 20, padding: 16, borderWidth: 1 },
    cardDefault: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    cardCompleted: {
      backgroundColor: theme.colors.accentLight,
      borderColor: 'rgba(201,150,60,0.35)',
    },
    completedBadge: {
      position: 'absolute',
      top: 10,
      end: 10,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: theme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    completedBadgeText: { color: 'white', fontSize: 11, fontWeight: '900' },
    masechetName: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      textAlign: 'left',
      marginBottom: 4,
    },
    progressText: {
      fontSize: 11,
      color: theme.colors.textMuted,
      fontWeight: '600',
      textAlign: 'left',
      marginBottom: 8,
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
    progressFillDefault: { backgroundColor: theme.colors.accent },
    progressFillCompleted: { backgroundColor: theme.colors.accent },
  });
