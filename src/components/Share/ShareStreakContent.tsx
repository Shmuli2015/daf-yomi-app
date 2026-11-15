import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { getStreakMilestone } from '../../utils/shareMilestones';
import { createShareStreakContentStyles } from './ShareStreakContent.styles';
import type { ShareCardThemeMode } from './ShareFrame';

interface ShareStreakContentProps {
  streak: number;
  hebrewDate: string;
  cardTheme?: ShareCardThemeMode;
}

export default function ShareStreakContent({
  streak,
  hebrewDate,
  cardTheme = 'dark',
}: ShareStreakContentProps) {
  const theme = useTheme();
  const isDark = cardTheme === 'dark';
  const styles = useMemo(() => createShareStreakContentStyles(theme, isDark), [theme, isDark]);
  const milestone = useMemo(() => getStreakMilestone(streak), [streak]);

  return (
    <View style={styles.root}>
      <View style={styles.milestonePill}>
        <Ionicons name="sparkles" size={24} color={theme.colors.accent} />
        <Text style={styles.milestoneText}>{milestone.badge}</Text>
      </View>

      <View style={styles.flameOuterRing}>
        <View style={styles.flameInnerRing}>
          <Ionicons name="flame" size={112} color={theme.colors.accent} />
        </View>
      </View>

      <Text style={styles.streakNumber}>{streak}</Text>
      <Text style={styles.streakLabel}>ימים ברצף של תורה</Text>

      <View style={styles.datePill}>
        <Ionicons name="calendar-outline" size={22} color={theme.colors.accent} />
        <Text style={styles.dateText}>{hebrewDate}</Text>
      </View>

      <View style={styles.quoteContainer}>
        <Text style={styles.quoteText}>{milestone.quote}</Text>
      </View>
    </View>
  );
}
