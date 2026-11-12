import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../theme';
import type { ReaderThemePalette } from '../../utils/readerTheme';
import { createChavrutaSectionHeaderStyles } from './ChavrutaSectionHeader.styles';

interface ChavrutaSectionHeaderProps {
  titleHe: string;
  palette: Pick<
    ReaderThemePalette,
    'accentLight' | 'accentBorder' | 'accentColor' | 'borderColor'
  >;
}

export default function ChavrutaSectionHeader({
  titleHe,
  palette,
}: ChavrutaSectionHeaderProps) {
  const theme = useTheme();
  const styles = useMemo(
    () => createChavrutaSectionHeaderStyles(theme, palette),
    [theme, palette],
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
