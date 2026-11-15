import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import type { UpcomingMasechetInfo } from '../../utils/upcomingMasechet';
import type { UpcomingMasechetShareData } from '../../utils/shareProgressImage';
import ShareIconButton from '../Share/ShareIconButton';
import SharePreviewModal from '../Share/SharePreviewModal';
import { createHomeUpcomingMasechetBannerStyles } from './HomeUpcomingMasechetBanner.styles';

interface HomeUpcomingMasechetBannerProps {
  info: UpcomingMasechetInfo;
}

export default function HomeUpcomingMasechetBanner({
  info,
}: HomeUpcomingMasechetBannerProps) {
  const theme = useTheme();
  const styles = useMemo(() => createHomeUpcomingMasechetBannerStyles(theme), [theme]);
  const [shareVisible, setShareVisible] = useState(false);

  const countdownText = useMemo(() => {
    if (info.status === 'just_started') return 'התחלנו מסכת חדשה!';
    if (info.status === 'starting_today' || info.daysLeft === 0) return 'היום מתחילים!';
    if (info.daysLeft === 1) return 'מחר מתחילים';
    return `עוד ${info.daysLeft} ימים`;
  }, [info.status, info.daysLeft]);

  const timingSubtitle = useMemo(() => {
    if (info.status === 'just_started') {
      return 'התחלנו בימים אלו • בואו והצטרפו';
    }
    return `${info.dayOfWeekHe}, ${info.hebrewDateStr}`;
  }, [info.status, info.dayOfWeekHe, info.hebrewDateStr]);

  const shareData: UpcomingMasechetShareData = useMemo(
    () => ({
      variant: 'upcoming_masechet',
      masechetHe: info.masechetHe,
      daysLeft: info.daysLeft,
      startDateFormatted: `${info.dayOfWeekHe}, ${info.hebrewDateStr}`,
      hebrewDate: info.hebrewDateStr,
      status: info.status,
    }),
    [info],
  );

  const handleShareOpen = useCallback(() => {
    setShareVisible(true);
  }, []);

  const handleShareClose = useCallback(() => {
    setShareVisible(false);
  }, []);

  return (
    <>
      <View style={styles.container}>
        <LinearGradient
          colors={[theme.colors.accent + '0D', 'transparent']}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.innerRow}>
          <View style={styles.infoGroup}>
            <View style={styles.iconBox}>
              <Ionicons name="book" size={18} color={theme.colors.accent} />
            </View>
            <View style={styles.textCol}>
              <View style={styles.eyebrowPill}>
                <Text style={styles.eyebrowText}>{countdownText}</Text>
              </View>
              <Text style={styles.masechetTitle}>מסכת {info.masechetHe}</Text>
              <Text style={styles.timingSubtitle}>{timingSubtitle}</Text>
            </View>
          </View>

          <ShareIconButton onPress={handleShareOpen} />
        </View>
      </View>

      <SharePreviewModal
        visible={shareVisible}
        onClose={handleShareClose}
        data={shareData}
      />
    </>
  );
}
