import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { getUpcomingMasechetCopy } from '../../utils/shareMilestones';
import { createShareUpcomingMasechetContentStyles } from './ShareUpcomingMasechetContent.styles';
import type { ShareCardThemeMode } from './ShareFrame';

interface ShareUpcomingMasechetContentProps {
  masechetHe: string;
  daysLeft: number;
  startDateFormatted: string;
  cardTheme?: ShareCardThemeMode;
  status?: 'upcoming' | 'starting_today' | 'just_started';
}

export default function ShareUpcomingMasechetContent({
  masechetHe,
  daysLeft,
  startDateFormatted,
  cardTheme = 'dark',
  status,
}: ShareUpcomingMasechetContentProps) {
  const theme = useTheme();
  const isDark = cardTheme === 'dark';
  const styles = useMemo(
    () => createShareUpcomingMasechetContentStyles(theme, isDark),
    [theme, isDark],
  );
  const copyInfo = useMemo(
    () => getUpcomingMasechetCopy(masechetHe, daysLeft, status),
    [masechetHe, daysLeft, status],
  );

  return (
    <View style={styles.root}>
      <View style={styles.topPill}>
        <Ionicons name="sparkles" size={22} color={theme.colors.accent} />
        <Text style={styles.topPillText}>הזמנה ללימוד הדף היומי</Text>
      </View>

      <View style={styles.crestOuterRing}>
        <View style={styles.crestInnerRing}>
          <Ionicons name="library" size={88} color={theme.colors.accent} />
        </View>
      </View>

      <Text style={styles.announceText}>מתחילים מסכת חדשה!</Text>

      <View style={styles.masechetRow}>
        <View style={styles.masechetFlourish} />
        <Text style={styles.masechetName}>מסכת {masechetHe}</Text>
        <View style={styles.masechetFlourish} />
      </View>

      <View style={styles.timingCard}>
        <Text style={styles.timingBadgeText}>{copyInfo.badge}</Text>
        <Text style={styles.timingDateText}>{startDateFormatted}</Text>
      </View>

      <View style={styles.inviteBanner}>
        <Text style={styles.inviteHeadline}>{copyInfo.callToAction}</Text>
        <Text style={styles.inviteSubtext}>
          הצטרפו עוד היום למסע הדף היומי באפליקציית מסע דף
        </Text>
      </View>
    </View>
  );
}
