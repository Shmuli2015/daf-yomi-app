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
    if (info.daysLeft === 0) return 'היום מתחילים!';
    if (info.daysLeft === 1) return 'מחר מתחילים';
    return `עוד ${info.daysLeft} ימים`;
  }, [info.daysLeft]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.accentLight, 'transparent']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.innerRow}>
        <View style={styles.infoGroup}>
          <View style={styles.iconBox}>
            <Ionicons name="sparkles" size={20} color={theme.colors.accent} />
          </View>
          <View style={styles.textCol}>
            <View style={styles.eyebrowPill}>
              <Text style={styles.eyebrowText}>{countdownText}</Text>
            </View>
            <Text style={styles.masechetTitle}>מסכת {info.masechetHe}</Text>
            <Text style={styles.timingSubtitle}>
              {info.dayOfWeekHe}, {info.hebrewDateStr}
            </Text>
          </View>
        </View>

        <View style={styles.actionsGroup}>
          <TouchableOpacity
            style={styles.compactShareBtn}
            onPress={() => onShare(info)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="שתף הזמנה למסכת החדשה"
          >
            <Ionicons name="share-outline" size={15} color={theme.colors.accent} />
            <Text style={styles.compactShareBtnText}>שתף</Text>
          </TouchableOpacity>

          {onDismiss && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onDismiss}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="סגור באנר"
            >
              <Ionicons name="close" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
