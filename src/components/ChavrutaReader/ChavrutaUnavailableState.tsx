import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import type { ReaderTheme } from '../SefariaReader/ReaderToolbar';
import { getReaderThemePalette } from '../../utils/readerTheme';
import { createChavrutaUnavailableStateStyles } from './ChavrutaUnavailableState.styles';

interface ChavrutaUnavailableStateProps {
  readerTheme?: ReaderTheme;
  accentColor?: string;
}

export default function ChavrutaUnavailableState({
  readerTheme,
  accentColor,
}: ChavrutaUnavailableStateProps) {
  const theme = useTheme();
  const palette = useMemo(
    () => getReaderThemePalette(readerTheme ?? 'light', accentColor),
    [readerTheme, accentColor],
  );
  const styles = useMemo(
    () => createChavrutaUnavailableStateStyles(theme, palette),
    [theme, palette],
  );

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="people-outline" size={40} color={palette.accentColor} />
      </View>
      <Text style={styles.title}>אין ביאור חברותא למסכת זו</Text>
      <View style={styles.divider} />
      <Text style={styles.description}>
        ניתן לקרוא את הטקסט בטאבים האחרים של הקורא.
      </Text>
    </View>
  );
}
