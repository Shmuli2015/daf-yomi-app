import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { THEME } from '../../theme';

export function SettingsFooter() {
  const version = Constants.expoConfig?.version;

  return (
    <View style={styles.footer}>
      <View style={styles.divider} />
      <Text style={styles.text}>פותח באהבה ע״י שמואל רוזנברג</Text>
      <Text style={styles.text}>בהשראת AG</Text>
      {version ? <Text style={styles.version}>גרסה {version}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginTop: 48,
    alignItems: 'center',
    gap: 12,
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: THEME.colors.border,
    marginBottom: 4,
  },
  text: {
    color: THEME.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  version: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginTop: 4,
    opacity: 0.6,
  },
});
