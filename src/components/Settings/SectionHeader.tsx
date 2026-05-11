import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

export const SectionHeader = ({ title }: { title: string }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.accentBar} />
      <Text style={styles.text}>{title}</Text>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 28,
      marginTop: 32,
      marginBottom: 12,
    },
    accentBar: {
      width: 4,
      height: 20,
      backgroundColor: theme.colors.accent,
      borderRadius: 2,
    },
    text: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '900',
      letterSpacing: -0.2,
    },
  });
