import React, { forwardRef, useMemo } from 'react';
import { View, Text, Image } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LIGHT_THEME } from '../../theme';
import { createSiyumShareCardStyles } from './siyumShareCardStyles';

interface SiyumShareCardProps {
  masechetHe: string;
  totalPages: number;
  onLayout?: (e: LayoutChangeEvent) => void;
}

const SiyumShareCard = forwardRef<View, SiyumShareCardProps>(function SiyumShareCard(
  { masechetHe, totalPages, onLayout },
  ref,
) {
  const styles = useMemo(() => createSiyumShareCardStyles(LIGHT_THEME), []);

  return (
    <View ref={ref} style={styles.root} collapsable={false} onLayout={onLayout}>
      <View style={styles.decorTop} />
      <View style={styles.decorBottom} />

      <View style={styles.content}>
        <View style={styles.ribbonOuter}>
          <View style={styles.ribbonRing}>
            <View style={styles.ribbonInner}>
              <Ionicons name="ribbon" size={108} color={LIGHT_THEME.colors.accent} />
            </View>
          </View>
        </View>

        <Text style={styles.title}>מַזָּל טוֹב!</Text>
        <Text style={styles.subtitle}>סיימת מסכת {masechetHe}</Text>

        <View style={styles.pagesPill}>
          <Text style={styles.pagesText}>זכית לסיים {totalPages} דפים</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerLineWrap}>
          <View style={styles.footerLine} />
        </View>
        <View style={styles.branding}>
          <View style={styles.logoOuter}>
            <Image source={require('../../../assets/icon.png')} style={styles.logo} />
          </View>
          <View>
            <Text style={styles.appName}>מסע דף</Text>
            <Text style={styles.appTagline}>מעקב דף יומי</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

export default SiyumShareCard;
