import React, { useMemo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenTopGradient from '../ScreenTopGradient';
import { useTheme } from '../../theme';
import { createSettingsScreenStyles } from './settingsScreenStyles';

export default function SettingsLoadingView() {
  const theme = useTheme();
  const styles = useMemo(() => createSettingsScreenStyles(theme), [theme]);

  return (
    <View style={[styles.loadingRoot, { backgroundColor: theme.colors.background }]}>
      <ScreenTopGradient />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            טוען הגדרות...
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
