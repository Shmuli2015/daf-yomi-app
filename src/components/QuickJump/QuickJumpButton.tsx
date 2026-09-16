import React, { useMemo } from 'react';
import { TouchableOpacity, Text, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { createQuickJumpButtonStyles } from './quickJumpButtonStyles';

interface QuickJumpButtonProps {
  onPress: () => void;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export default function QuickJumpButton({
  onPress,
  label = 'קפיצה לדף',
  style,
}: QuickJumpButtonProps) {
  const theme = useTheme();
  const styles = useMemo(() => createQuickJumpButtonStyles(theme), [theme]);

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name="bookmarks-outline" size={15} color={theme.colors.accent} />
      {label ? <Text style={styles.text}>{label}</Text> : null}
    </TouchableOpacity>
  );
}
