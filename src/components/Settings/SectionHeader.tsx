import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

interface SectionHeaderProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isFirst?: boolean;
}

export const SectionHeader = ({ title, icon, isFirst }: SectionHeaderProps) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme, isFirst), [theme, isFirst]);

  return (
    <View style={styles.container}>
      {icon ? (
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={15} color={theme.colors.accent} />
        </View>
      ) : (
        <View style={styles.accentBar} />
      )}
      <Text style={styles.text}>{title}</Text>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>, isFirst?: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 24,
      marginTop: isFirst ? 10 : 24,
      marginBottom: 8,
    },
    iconBox: {
      width: 28,
      height: 28,
      borderRadius: 9,
      backgroundColor: theme.colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(201,150,60,0.2)',
    },
    accentBar: {
      width: 4,
      height: 18,
      backgroundColor: theme.colors.accent,
      borderRadius: 2,
    },
    text: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: -0.2,
    },
  });
