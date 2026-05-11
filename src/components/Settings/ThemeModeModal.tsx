import React, { useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeMode, useTheme } from '../../theme';

type Option = { mode: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap };

const OPTIONS: Option[] = [
  { mode: 'system', label: 'מערכת', icon: 'contrast-outline' },
  { mode: 'dark', label: 'כהה', icon: 'moon-outline' },
  { mode: 'light', label: 'בהיר', icon: 'sunny-outline' },
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
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <View style={styles.card}>
          <View style={styles.topAccent} />
          <Text style={styles.title}>בחר מצב תצוגה</Text>

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
      </View>
    </Modal>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(12,12,12,0.85)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    card: {
      backgroundColor: theme.colors.surface,
      width: '100%',
      maxWidth: 272,
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingBottom: 6,
      // @ts-ignore
      direction: 'rtl',
    },
    topAccent: {
      height: 3,
      backgroundColor: theme.colors.accent,
      width: '100%',
    },
    title: {
      fontSize: 15,
      fontWeight: '900',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      paddingTop: 12,
      paddingBottom: 4,
      paddingHorizontal: 16,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      paddingHorizontal: 12,
      marginHorizontal: 8,
      marginVertical: 3,
      borderRadius: 12,
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
      gap: 8,
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
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    rowLabelSelected: {
      color: theme.colors.textPrimary,
    },
  });
