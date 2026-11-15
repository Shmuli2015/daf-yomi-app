import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';
import { createShareFrameStyles } from './ShareFrame.styles';

export type ShareCardThemeMode = 'dark' | 'light';

interface ShareFrameProps {
  cardTheme?: ShareCardThemeMode;
  categoryBadge: string;
  children: React.ReactNode;
}

export default function ShareFrame({
  cardTheme = 'dark',
  categoryBadge,
  children,
}: ShareFrameProps) {
  const theme = useTheme();
  const isDark = cardTheme === 'dark';
  const styles = useMemo(() => createShareFrameStyles(theme, isDark), [theme, isDark]);

  const bgGradientColors = useMemo<[string, string, ...string[]]>(() => {
    if (isDark) {
      return [
        theme.colors.cardDarkSurface,
        theme.colors.cardDarkSurfaceSecondary,
        theme.colors.cardDarkSurface,
      ];
    }
    return [
      theme.colors.cardWarmSurface,
      theme.colors.cardWarmSurfaceSecondary,
      theme.colors.cardWarmSurface,
    ];
  }, [isDark, theme.colors]);

  return (
    <View style={styles.root} collapsable={false}>
      <LinearGradient
        colors={bgGradientColors}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.outerBorder} />
      <View style={styles.innerBorder} />
      <View style={styles.cornerTopLeft} />
      <View style={styles.cornerTopRight} />
      <View style={styles.cornerBottomLeft} />
      <View style={styles.cornerBottomRight} />

      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerBrandRow}>
            <View style={styles.headerFlourishLine} />
            <Text style={styles.headerBrandText}>מסע דף • מעקב דף יומי</Text>
            <View style={styles.headerFlourishLine} />
          </View>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>{categoryBadge}</Text>
          </View>
        </View>

        <View style={styles.contentSlot}>{children}</View>

        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <View style={styles.brandingRow}>
            <View style={styles.logoBox}>
              <Image source={require('../../../assets/icon.png')} style={styles.logoImage} />
            </View>
            <View style={styles.brandingTextBlock}>
              <Text style={styles.appName}>מסע דף</Text>
              <Text style={styles.appTagline}>
                האפליקציה ללימוד ומעקב הדף היומי • הצטרפו ללימוד
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
