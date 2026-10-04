import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { createGuideContactCardStyles } from './GuideContactCard.styles';

interface GuideContactCardProps {
  onOpenEmail: () => void;
  onCopyEmail: () => void;
  emailCopied: boolean;
}

export function GuideContactCard({
  onOpenEmail,
  onCopyEmail,
  emailCopied,
}: GuideContactCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => createGuideContactCardStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.iconBox}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.colors.accent} />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.title}>לא מצאתם תשובה? כתבו לנו</Text>
            <Text style={styles.subtitle}>נשמח לעזור, להשיב על שאלות ולקבל הצעות לשיפור.</Text>
          </View>
        </View>

        <View style={styles.buttonsRow}>
          <TouchableOpacity
            onPress={onOpenEmail}
            style={styles.sendBtn}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="שליחת הודעה בדוא״ל"
          >
            <Ionicons name="paper-plane-outline" size={15} color={theme.colors.white} />
            <Text style={styles.sendBtnText}>שליחת הודעה</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onCopyEmail}
            style={styles.copyBtn}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="העתקת כתובת דוא״ל"
          >
            <Ionicons
              name={emailCopied ? 'checkmark' : 'copy-outline'}
              size={15}
              color={theme.colors.accent}
            />
            <Text style={styles.copyBtnText}>
              {emailCopied ? 'הועתק ללוח!' : 'העתקת כתובת'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.wishBanner}>
        <Ionicons name="sparkles" size={13} color={theme.colors.accent} />
        <Text style={styles.wishText}>לימוד פורה ומאיר בכל מרחבי הש״ס!</Text>
      </View>
    </View>
  );
}

export default GuideContactCard;
