import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../theme';

type Mode = 'daily' | 'custom';

interface Props {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

export const NotifModeToggle = ({ mode, onChange }: Props) => (
  <View style={styles.row}>
    <TouchableOpacity
      style={[styles.btn, mode === 'daily' && styles.btnActive]}
      onPress={() => onChange('daily')}
      activeOpacity={0.75}
    >
      <Ionicons
        name="calendar-outline"
        size={14}
        color={mode === 'daily' ? THEME.colors.background : THEME.colors.textSecondary}
      />
      <Text style={[styles.btnText, mode === 'daily' && styles.btnTextActive]}>כל יום</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.btn, mode === 'custom' && styles.btnActive]}
      onPress={() => onChange('custom')}
      activeOpacity={0.75}
    >
      <Ionicons
        name="grid-outline"
        size={14}
        color={mode === 'custom' ? THEME.colors.background : THEME.colors.textSecondary}
      />
      <Text style={[styles.btnText, mode === 'custom' && styles.btnTextActive]}>לפי ימים</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row-reverse',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
  },
  btn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  btnActive: {
    backgroundColor: THEME.colors.accent,
    borderColor: THEME.colors.accent,
  },
  btnText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  btnTextActive: {
    color: THEME.colors.background,
  },
});
