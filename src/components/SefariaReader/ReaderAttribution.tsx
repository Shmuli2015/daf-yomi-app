import React, { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { createReaderAttributionStyles } from './ReaderAttribution.styles';

interface ReaderAttributionProps {
  lines: string[];
  textColor: string;
  accentColor: string;
  borderColor?: string;
  onPress: () => void;
}

export default function ReaderAttribution({
  lines,
  textColor,
  accentColor,
  borderColor,
  onPress,
}: ReaderAttributionProps) {
  const theme = useTheme();
  const styles = useMemo(() => createReaderAttributionStyles(theme), [theme]);

  return (
    <TouchableOpacity
      style={[styles.container, borderColor ? { borderTopColor: borderColor } : null]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="מקורות ורישיונות"
    >
      {lines.map((line) => (
        <Text key={line} style={[styles.text, { color: textColor }]}>
          {`\u200F${line}`}
        </Text>
      ))}

      <View style={styles.linkRow}>
        <Ionicons name="ribbon-outline" size={12} color={accentColor} />
        <Text style={[styles.linkText, { color: accentColor }]}>
          {'\u200Fפירוט מקורות ורישיונות'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
