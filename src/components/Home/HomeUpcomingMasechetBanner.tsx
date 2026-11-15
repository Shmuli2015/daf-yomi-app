import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import type { UpcomingMasechetInfo } from '../../utils/upcomingMasechet';
import { createHomeUpcomingMasechetBannerStyles } from './HomeUpcomingMasechetBanner.styles';

interface HomeUpcomingMasechetBannerProps {
  info: UpcomingMasechetInfo;
  onShare: (info: UpcomingMasechetInfo) => void;
  onDismiss?: () => void;
}

export default function HomeUpcomingMasechetBanner({
  info,
  onShare,
  onDismiss,
}: HomeUpcomingMasechetBannerProps) {
  const theme = useTheme();
  const styles = useMemo(() => createHomeUpcomingMasechetBannerStyles(theme), [theme]);

  const countdownText = useMemo(() => {
    if (info.daysLeft === 0) return 'היום מתחילים מסכת חדשה!';
    if (info.daysLeft === 1) return 'מחר מתחילים מסכת חדשה!';
    return `עוד ${info.daysLeft} ימים מתחילים מסכת חדשה!`;
  }, [info.daysLeft]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.accentLight, 'transparent']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.topRow}>
        <View style={styles.iconTitleGroup}>
          <View style={styles.iconBox}>
            <Ionicons name="sparkles" size={18} color={theme.colors.accent} />
          </View>
          <Text style={styles.headline}>{countdownText}</Text>
        </View>

        {onDismiss && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onDismiss}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="סגור באנר"
          >
            <Ionicons name="close" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.masechetTitle}>מסכת {info.masechetHe}</Text>
        <Text style={styles.timingSubtitle}>
          {info.dayOfWeekHe}, {info.hebrewDateStr}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.shareInviteButton}
        onPress={() => onShare(info)}
        activeOpacity={0.8}
      >
        <Ionicons name="share-social-outline" size={18} color={theme.colors.white} />
        <Text style={styles.shareInviteButtonText}>שתף הזמנה ללימוד עם חברים</Text>
      </TouchableOpacity>
    </View>
  );
}
