import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeMode, useTheme } from '../../theme';
import BottomSheetModal from '../BottomSheetModal';

type Option = { mode: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap };

const OPTIONS: Option[] = [
  { mode: 'system', label: 'לפי תצוגת המערכת', icon: 'contrast-outline' },
  { mode: 'dark', label: 'מצב כהה', icon: 'moon-outline' },
  { mode: 'light', label: 'מצב בהיר', icon: 'sunny-outline' },
];

interface ThemeModeModalProps {
  visible: boolean;
  value: ThemeMode;
  onClose: () => void;
  onSelect: (mode: ThemeMode) => void;
}

export function ThemeModeModal({ visible, value, onClose, onSelect }: ThemeModeModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <View style={styles.headerIconCircle}>
          <Ionicons name="color-palette-outline" size={20} color={theme.colors.accent} />
        </View>
        <Text style={styles.title}>בחירת מצב תצוגה</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
          <Ionicons name="close" size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.optionsList}>
        {OPTIONS.map((opt) => {
          const selected = value === opt.mode;
          return (
            <TouchableOpacity
              key={opt.mode}
              style={[styles.row, selected && styles.rowSelected]}
              onPress={() => {
                onSelect(opt.mode);
                onClose();
              }}
              activeOpacity={0.75}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
                  <Ionicons
                    name={opt.icon}
                    size={17}
                    color={selected ? '#FFFFFF' : theme.colors.accent}
                  />
                </View>
                <Text style={[styles.rowLabel, selected && styles.rowLabelSelected]}>{opt.label}</Text>
              </View>
              {selected && (
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.accent} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </BottomSheetModal>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 12,
      direction: 'rtl',
    },
    headerIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: theme.colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(201,150,60,0.2)',
    },
    title: {
      flex: 1,
      fontSize: 16,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      textAlign: 'start' as any,
    },
    closeBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
    optionsList: {
      gap: 8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    rowSelected: {
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.accentLight,
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    iconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.accentLight,
    },
    iconWrapSelected: {
      backgroundColor: theme.colors.accent,
    },
    rowLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    rowLabelSelected: {
      color: theme.colors.textPrimary,
      fontWeight: '800',
    },
  });
