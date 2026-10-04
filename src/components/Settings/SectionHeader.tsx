import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { createSectionHeaderStyles } from './SectionHeader.styles';

export interface SectionHeaderProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isFirst?: boolean;
  accentColor?: string;
}

export function SectionHeader({ title, icon, isFirst, accentColor }: SectionHeaderProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSectionHeaderStyles(theme, isFirst), [theme, isFirst]);
  const activeColor = accentColor ?? theme.colors.accent;

  return (
    <View style={styles.container}>
      {icon ? (
        <View style={[styles.iconBox, accentColor ? { borderColor: activeColor + '40', backgroundColor: activeColor + '18' } : undefined]}>
          <Ionicons name={icon} size={16} color={activeColor} />
        </View>
      ) : (
        <View style={[styles.accentBar, accentColor ? { backgroundColor: activeColor } : undefined]} />
      )}
      <Text style={styles.text}>{title}</Text>
    </View>
  );
}

export default SectionHeader;
