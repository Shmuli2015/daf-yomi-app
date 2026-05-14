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
        <View style={styles.cardHeader}>
          <Text style={styles.masechetName} numberOfLines={2}>
            {stripNiqqud(data.m.he)}
          </Text>
          {data.isCompleted && (
            <View style={styles.completedIconBox}>
              <Text style={styles.completedCheck}>✓</Text>
            </View>
          )}
        </View>

        <View style={styles.cardBody}>
          <View style={styles.statsRow}>
            <Text style={styles.progressText}>
              {`\u200E${data.learned} / ${data.total}\u200E`} דפים
            </Text>
            {!data.isCompleted && (
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
      borderRadius: 20,
      padding: 14,
      borderWidth: 1,
      minHeight: 100,
      justifyContent: 'space-between',
    },
    cardDefault: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    cardCompleted: {
      backgroundColor: theme.colors.accentLight,
      borderColor: 'rgba(201,150,60,0.25)',
      shadowColor: theme.colors.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
      gap: 4,
    },
    masechetName: {
      fontSize: 18,
      fontWeight: '900',
      color: theme.colors.primary,
      flex: 1,
      textAlign: 'left',
    },
    percentPill: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      borderWidth: 0.5,
      borderColor: theme.colors.border,
    },
    percentPillText: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.colors.textMuted,
    },
    completedIconBox: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: theme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    completedCheck: {
      color: 'white',
      fontSize: 12,
      fontWeight: '900',
    },
    cardBody: {
      width: '100%',
    },
    progressText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '700',
      textAlign: 'left',
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    progressTrack: {
      height: 6,
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
