import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../theme';
import {
  getChapterEndDisplay,
  getChapterStartDisplay,
} from '../utils/chapterBoundaries';
import type { ReaderThemePalette } from '../utils/readerTheme';
import { createChapterBoundaryMarkerStyles } from './ChapterBoundaryMarker.styles';

interface ChapterBoundaryMarkerProps {
  kind: 'start' | 'end';
  titleHe: string;
  chapterNumber?: number;
  isMasechetEnd?: boolean;
  masechetHe?: string;
  palette: Pick<ReaderThemePalette, 'accentLight' | 'accentBorder' | 'accentColor' | 'textColor'>;
}

export default function ChapterBoundaryMarker({
  kind,
  titleHe,
  chapterNumber,
  isMasechetEnd,
  masechetHe,
  palette,
}: ChapterBoundaryMarkerProps) {
  const theme = useTheme();
  const styles = useMemo(
    () => createChapterBoundaryMarkerStyles(theme, palette),
    [theme, palette],
  );
  const display =
    kind === 'start'
      ? getChapterStartDisplay(titleHe, chapterNumber)
      : getChapterEndDisplay(titleHe, isMasechetEnd, masechetHe);

  return (
    <View style={styles.container} accessibilityRole="header">
      <Text style={styles.heading}>{display.heading}</Text>
      {display.subtitle ? <Text style={styles.subtitle}>{display.subtitle}</Text> : null}
    </View>
  );
}
