import React, { useMemo } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { createGuideScrollTopButtonStyles } from './GuideScrollTopButton.styles';

interface GuideScrollTopButtonProps {
  onPress: () => void;
  bottomInset: number;
}

export function GuideScrollTopButton({ onPress, bottomInset }: GuideScrollTopButtonProps) {
  const theme = useTheme();
  const styles = useMemo(() => createGuideScrollTopButtonStyles(theme), [theme]);

  return (
    <TouchableOpacity
      style={[styles.button, { bottom: Math.max(bottomInset, 48) + 16 }]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="חזרה לראש המדריך"
    >
      <Ionicons name="arrow-up" size={20} color={theme.colors.accent} />
    </TouchableOpacity>
  );
}

export default GuideScrollTopButton;
