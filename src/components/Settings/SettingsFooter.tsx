import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';
import { createSettingsFooterStyles } from './SettingsFooter.styles';

export function SettingsFooter() {
  const theme = useTheme();
  const styles = useMemo(() => createSettingsFooterStyles(theme), [theme]);
  const version = Constants.expoConfig?.version;
  const versionLabel = version ? `גרסה ${version}` : null;

  return (
    <View style={styles.footerContainer}>
      <View style={styles.card}>
        <LinearGradient
          colors={[theme.colors.accent + '12', theme.colors.surface]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.cardGradient}
          pointerEvents="none"
        />

        <View style={styles.iconHalo}>
          <Ionicons name="book" size={24} color={theme.colors.accent} />
        </View>

        <Text style={styles.title}>מסע דף</Text>
        <Text style={styles.tagline}>סדר ובהירות במסע הש״ס</Text>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerDot} />
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.metaStack}>
          {versionLabel ? (
            <View style={styles.versionBadge}>
              <View style={styles.versionDot} />
              <Text style={styles.versionText}>{versionLabel}</Text>
            </View>
          ) : null}

          <View style={styles.authorBadge}>
            <Ionicons name="code-slash-outline" size={14} color={theme.colors.accent} />
            <Text style={styles.authorText}>פיתוח: שמואל רוזנברג</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default SettingsFooter;
