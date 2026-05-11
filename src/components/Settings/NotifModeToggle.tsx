import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

type Mode = 'daily' | 'custom';

interface Props {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

export const NotifModeToggle = ({ mode, onChange }: Props) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.btn, mode === 'daily' && styles.btnActive]}
        onPress={() => onChange('daily')}
        activeOpacity={0.75}
      >
        <Ionicons
          name="calendar-outline"
          size={14}
          color={mode === 'daily' ? theme.colors.background : theme.colors.textSecondary}
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
          color={mode === 'custom' ? theme.colors.background : theme.colors.textSecondary}
        />
        <Text style={[styles.btnText, mode === 'custom' && styles.btnTextActive]}>לפי ימים</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    btn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    btnActive: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    btnText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    btnTextActive: {
      color: theme.colors.background,
    },
  });
