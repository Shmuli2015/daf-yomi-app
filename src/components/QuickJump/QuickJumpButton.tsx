import React, { useMemo } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { createQuickJumpButtonStyles } from './quickJumpButtonStyles';

interface QuickJumpButtonProps {
  onPress: () => void;
  label?: string;
}

export default function QuickJumpButton({
  onPress,
  label = 'קפיצה לדף',
}: QuickJumpButtonProps) {
  const theme = useTheme();
  const styles = useMemo(() => createQuickJumpButtonStyles(theme), [theme]);

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name="flash-outline" size={16} color={theme.colors.accent} />
      {label ? <Text style={styles.text}>{label}</Text> : null}
    </TouchableOpacity>
  );
}
