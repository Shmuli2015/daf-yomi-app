import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../../theme';

export const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.container}>
    <View style={styles.accentBar} />
    <Text style={styles.text}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 28,
    marginTop: 32,
    marginBottom: 12,
  },
  accentBar: {
    width: 4,
    height: 20,
    backgroundColor: THEME.colors.accent,
    borderRadius: 2,
  },
  text: {
    color: THEME.colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
});
