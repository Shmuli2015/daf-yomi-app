import React, { useId, useMemo } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Defs, G, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../theme';
import { getShasMilestone } from '../../utils/shareMilestones';
import {
  createShareShasContentStyles,
  SHAS_RING_SIZE,
  SHAS_RING_RADIUS,
  SHAS_STROKE_WIDTH,
  SHAS_CIRCUMFERENCE,
} from './ShareShasContent.styles';
import type { ShareCardThemeMode } from './ShareFrame';

interface ShareShasContentProps {
  progress: number;
  percentage: string;
  learnedDafim: number;
  completedMasechtot: number;
  cardTheme?: ShareCardThemeMode;
}

export default function ShareShasContent({
  progress,
  percentage,
  learnedDafim,
  completedMasechtot,
  cardTheme = 'dark',
}: ShareShasContentProps) {
  const theme = useTheme();
  const isDark = cardTheme === 'dark';
  const styles = useMemo(() => createShareShasContentStyles(theme, isDark), [theme, isDark]);
  const rawId = useId();
  const gradientId = useMemo(() => `shasGoldGrad_${rawId.replace(/\W/g, '')}`, [rawId]);
  const numericPercent = useMemo(() => parseFloat(percentage) || 0, [percentage]);
  const milestone = useMemo(() => getShasMilestone(numericPercent), [numericPercent]);

  return (
    <View style={styles.root}>
      <View style={styles.milestonePill}>
        <Ionicons name="trophy-outline" size={24} color={theme.colors.accent} />
        <Text style={styles.milestoneText}>{milestone.badge}</Text>
      </View>

      <View style={styles.ringContainer}>
        <Svg width={SHAS_RING_SIZE} height={SHAS_RING_SIZE}>
          <Defs>
            <SvgGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={theme.colors.goldLight} />
              <Stop offset="50%" stopColor={theme.colors.accent} />
              <Stop offset="100%" stopColor={theme.colors.goldDark} />
            </SvgGradient>
          </Defs>
          <G transform={`rotate(-90 ${SHAS_RING_SIZE / 2} ${SHAS_RING_SIZE / 2})`}>
            <Circle
              cx={SHAS_RING_SIZE / 2}
              cy={SHAS_RING_SIZE / 2}
              r={SHAS_RING_RADIUS}
              stroke={isDark ? 'rgba(255,255,255,0.12)' : theme.colors.progressTrack}
              strokeWidth={SHAS_STROKE_WIDTH}
              fill="none"
            />
            <Circle
              cx={SHAS_RING_SIZE / 2}
              cy={SHAS_RING_SIZE / 2}
              r={SHAS_RING_RADIUS}
              stroke={`url(#${gradientId})`}
              strokeWidth={SHAS_STROKE_WIDTH}
              fill="none"
              strokeDasharray={`${SHAS_CIRCUMFERENCE}`}
              strokeDashoffset={SHAS_CIRCUMFERENCE * (1 - Math.min(1, Math.max(0, progress)))}
              strokeLinecap="round"
            />
          </G>
        </Svg>
        <View style={styles.ringCenter}>
          <Text style={styles.ringPercent}>{percentage}%</Text>
          <Text style={styles.ringLabel}>מהש״ס הושלם</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={styles.statIconWrap}>
            <Ionicons name="book-outline" size={26} color={theme.colors.accent} />
          </View>
          <Text style={styles.statValue}>{learnedDafim}</Text>
          <Text style={styles.statTitle}>דפים שנלמדו</Text>
          <Text style={styles.statSubtext}>מתוך 2,711 דפים</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconWrap}>
            <Ionicons name="ribbon-outline" size={26} color={theme.colors.accent} />
          </View>
          <Text style={styles.statValue}>{completedMasechtot}</Text>
          <Text style={styles.statTitle}>מסכתות שהושלמו</Text>
          <Text style={styles.statSubtext}>מתוך 37 מסכתות</Text>
        </View>
      </View>

      <View style={styles.quoteContainer}>
        <Text style={styles.quoteText}>{milestone.quote}</Text>
      </View>
    </View>
  );
}
