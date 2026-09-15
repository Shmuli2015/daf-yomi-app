import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../theme';
import {
  getChapterEndDisplay,
  getChapterStartDisplay,
} from '../utils/chapterBoundaries';
import { createChapterBoundaryMarkerStyles } from './ChapterBoundaryMarker.styles';

interface ChapterBoundaryMarkerProps {
  kind: 'start' | 'end';
  titleHe: string;
  chapterNumber?: number;
  isMasechetEnd?: boolean;
  masechetHe?: string;
}

export default function ChapterBoundaryMarker({
  kind,
  titleHe,
  chapterNumber,
  isMasechetEnd,
  masechetHe,
}: ChapterBoundaryMarkerProps) {
  const theme = useTheme();
  const styles = useMemo(() => createChapterBoundaryMarkerStyles(theme), [theme]);
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
