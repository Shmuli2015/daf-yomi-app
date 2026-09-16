import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { createYesterdayNudgeStyles } from './YesterdayNudge.styles';

type YesterdayNudgeProps = {
  onMarkYesterday: () => void;
  onOpenYesterday: () => void;
  onDismiss: () => void;
};

export default function YesterdayNudge({
  onMarkYesterday,
  onOpenYesterday,
  onDismiss,
}: YesterdayNudgeProps) {
  const theme = useTheme();
  const styles = useMemo(() => createYesterdayNudgeStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.body}
        onPress={onOpenYesterday}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="עבור לדף של אתמול"
      >
        <Ionicons name="alert-circle-outline" size={18} color={theme.colors.accent} />
        <Text style={styles.title}>שכחת לסמן אתמול?</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.markBtn}
        onPress={onMarkYesterday}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="סמן את הדף של אתמול כנלמד"
      >
        <Ionicons name="checkmark" size={14} color={theme.colors.white} />
        <Text style={styles.markBtnText}>סמן</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onDismiss}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="הסתר תזכורת"
      >
        <Ionicons name="close" size={16} color={theme.colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}
