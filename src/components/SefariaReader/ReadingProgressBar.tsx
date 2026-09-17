import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme';
import { createReadingProgressBarStyles } from './ReadingProgressBar.styles';

interface ReadingProgressBarProps {
  progress: number;
  accentColor?: string;
}

export default function ReadingProgressBar({
  progress,
  accentColor,
}: ReadingProgressBarProps) {
  const theme = useTheme();
  const styles = useMemo(() => createReadingProgressBarStyles(theme), [theme]);

  const clampedProgress = Math.min(1, Math.max(0, progress));
  const activeColor = accentColor || theme.colors.accent;

  if (clampedProgress <= 0) {
    return null;
  }

  return (
    <View style={styles.track}>
      <View
        style={[
          styles.indicator,
          {
            width: `${Math.round(clampedProgress * 100)}%`,
            backgroundColor: activeColor,
          },
        ]}
      />
    </View>
  );
}
