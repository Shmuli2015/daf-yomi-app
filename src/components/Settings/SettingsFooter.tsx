import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

export function SettingsFooter() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const version = Constants.expoConfig?.version;

  return (
    <View style={styles.footerContainer}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="book" size={16} color={theme.colors.accent} />
        </View>
        <Text style={styles.title}>מסע דף</Text>
        <Text style={styles.subtext}>פיתוח: שמואל רוזנברג</Text>
        {version ? (
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>גרסה {version}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    footerContainer: {
      marginTop: 36,
      marginBottom: 16,
      paddingHorizontal: 20,
      alignItems: 'center',
    },
    card: {
      width: '100%',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      paddingVertical: 20,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 4,
    },
    iconCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
      borderWidth: 1,
      borderColor: 'rgba(201,150,60,0.2)',
    },
    title: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    subtext: {
      color: theme.colors.textSecondary,
      fontSize: 12.5,
      fontWeight: '600',
      textAlign: 'center',
    },
    credits: {
      color: theme.colors.textMuted,
      fontSize: 11.5,
      fontWeight: '500',
      textAlign: 'center',
    },
    versionBadge: {
      marginTop: 8,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    versionText: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontWeight: '700',
    },
  });
