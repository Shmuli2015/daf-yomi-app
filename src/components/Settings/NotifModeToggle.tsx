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
    <View style={styles.container}>
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[styles.btn, mode === 'daily' && styles.btnActive]}
          onPress={() => onChange('daily')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="calendar-outline"
            size={15}
            color={mode === 'daily' ? '#FFFFFF' : theme.colors.textSecondary}
          />
          <Text style={[styles.btnText, mode === 'daily' && styles.btnTextActive]}>כל יום</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, mode === 'custom' && styles.btnActive]}
          onPress={() => onChange('custom')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="grid-outline"
            size={15}
            color={mode === 'custom' ? '#FFFFFF' : theme.colors.textSecondary}
          />
          <Text style={[styles.btnText, mode === 'custom' && styles.btnTextActive]}>לפי ימים</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    segmentedControl: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background,
      borderRadius: 14,
      padding: 4,
      gap: 4,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    btn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 8,
      borderRadius: 10,
    },
    btnActive: {
      backgroundColor: theme.colors.accent,
      shadowColor: theme.colors.accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 2,
    },
    btnText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    btnTextActive: {
      color: '#FFFFFF',
      fontWeight: '800',
    },
  });
