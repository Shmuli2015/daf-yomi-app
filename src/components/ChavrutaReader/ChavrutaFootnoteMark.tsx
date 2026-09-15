import React, { useMemo } from 'react';
import { Pressable, Text } from 'react-native';
import { useTheme } from '../../theme';
import { createChavrutaFootnoteMarkStyles } from './ChavrutaFootnoteMark.styles';

interface ChavrutaFootnoteMarkProps {
  label: string;
  fontSize: number;
  accentColor: string;
  onPress: () => void;
}

export default function ChavrutaFootnoteMark({
  label,
  fontSize,
  accentColor,
  onPress,
}: ChavrutaFootnoteMarkProps) {
  const theme = useTheme();
  const styles = useMemo(() => createChavrutaFootnoteMarkStyles(theme), [theme]);

  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 14, bottom: 14, left: 12, right: 12 }}
      accessibilityRole="button"
      accessibilityLabel={`הערה ${label}`}
      style={[styles.pressable, { backgroundColor: `${accentColor}26` }]}
    >
      <Text style={[styles.mark, { fontSize, color: accentColor }]}>{label}</Text>
    </Pressable>
  );
}
