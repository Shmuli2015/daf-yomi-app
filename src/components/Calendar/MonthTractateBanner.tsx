import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

interface MonthTractateBannerProps {
  summary: string;
}

export default function MonthTractateBanner({ summary }: MonthTractateBannerProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!summary) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.badge}>
        <Ionicons name="book-outline" size={13} color={theme.colors.accent} />
        <Text
          style={styles.text}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          {summary}
        </Text>
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    wrapper: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.colors.accentLight,
      borderColor: theme.colors.accentBorder,
      borderWidth: 1,
      borderRadius: 10,
      paddingVertical: 4,
      paddingHorizontal: 12,
      direction: 'rtl',
    },
    text: {
      fontSize: 11.5,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      writingDirection: 'rtl',
      letterSpacing: -0.1,
      includeFontPadding: false,
    },
  });
