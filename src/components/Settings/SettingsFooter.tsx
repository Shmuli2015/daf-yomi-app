import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../../theme';

export const SettingsFooter = () => (
  <View style={styles.footer}>
    <View style={styles.divider} />
    <Text style={styles.text}>פותח באהבה ע״י שמואל רוזנברג</Text>
  </View>
);

const styles = StyleSheet.create({
  footer: {
    marginTop: 48,
    paddingBottom: 24,
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
});
