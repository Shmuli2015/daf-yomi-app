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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
  },
  accentBar: {
    width: 3,
    height: 14,
    backgroundColor: THEME.colors.accent,
    borderRadius: 2,
  },
  text: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});
