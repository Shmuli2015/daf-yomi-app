import React, { forwardRef, useMemo } from 'react';
import { View, type ViewInstance, Text } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import ShareFrame from '../Share/ShareFrame';
import { createSiyumShareCardStyles } from './siyumShareCardStyles';

interface SiyumShareCardProps {
  masechetHe: string;
  totalPages: number;
  onLayout?: (e: LayoutChangeEvent) => void;
}

const SiyumShareCard = forwardRef<ViewInstance, SiyumShareCardProps>(function SiyumShareCard(
  { masechetHe, totalPages, onLayout },
  ref,
) {
  const theme = useTheme();
  const isDark = theme.isDark;
  const styles = useMemo(() => createSiyumShareCardStyles(theme, isDark), [theme, isDark]);

  return (
    <View ref={ref} collapsable={false} onLayout={onLayout}>
      <ShareFrame cardTheme={isDark ? 'dark' : 'light'} categoryBadge="סיום מסכת ש״ס">
        <View style={styles.root}>
          <View style={styles.crownOuterRing}>
            <View style={styles.crownInnerRing}>
              <Ionicons name="ribbon" size={88} color={theme.colors.accent} />
            </View>
          </View>

          <Text style={styles.congratsTitle}>מַזָּל טוֹב!</Text>
          <Text style={styles.completionSubtitle}>לרגל סיום והשלמת</Text>

          <View style={styles.masechetRow}>
            <View style={styles.flourishLine} />
            <Text style={styles.masechetName}>מסכת {masechetHe}</Text>
            <View style={styles.flourishLine} />
          </View>

          <View style={styles.pagesPill}>
            <Text style={styles.pagesText}>זכית לסיים {totalPages} דפי גמרא</Text>
          </View>

          <View style={styles.hadranCard}>
            <Text style={styles.hadranLine1}>
              הֲדְרָן עֲלָךְ מַסֶּכֶת {masechetHe} וַהֲדָרָךְ עֲלַן
            </Text>
            <Text style={styles.hadranLine2}>
              דַּעְתַּן עֲלָךְ וְדַעְתָּךְ עֲלַן • תּוֹרָה צִוָּה לָנוּ מֹשֶׁה
            </Text>
          </View>
        </View>
      </ShareFrame>
    </View>
  );
});

export default SiyumShareCard;
