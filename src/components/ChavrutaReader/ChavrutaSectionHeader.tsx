import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { createChavrutaSectionHeaderStyles } from './ChavrutaSectionHeader.styles';

interface ChavrutaSectionHeaderProps {
  titleHe: string;
  isSepia?: boolean;
  isDark?: boolean;
  accentColor?: string;
}

export default function ChavrutaSectionHeader({
  titleHe,
  isSepia,
  isDark,
  accentColor,
}: ChavrutaSectionHeaderProps) {
  const theme = useTheme();
  const styles = useMemo(
    () => createChavrutaSectionHeaderStyles(theme, isSepia, isDark, accentColor),
    [theme, isSepia, isDark, accentColor],
  );

  return (
    <View style={styles.container} accessibilityRole="header">
      <View style={styles.dividerLine} />
      <View style={styles.badge}>
        <Text style={styles.title}>{`\u200F${titleHe}`}</Text>
      </View>
      <View style={styles.dividerLine} />
    </View>
  );
}
