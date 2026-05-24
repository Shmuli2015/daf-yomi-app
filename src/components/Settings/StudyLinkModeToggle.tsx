import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import type { StudyLinkMode } from '../../utils/studyLinkMode';

interface Props {
  mode: StudyLinkMode;
  onChange: (mode: StudyLinkMode) => void;
}

const OPTIONS: { id: StudyLinkMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'sefaria', label: 'ספריא', icon: 'book-outline' },
  { id: 'tzurat', label: 'צורת הדף', icon: 'document-text-outline' },
  { id: 'both', label: 'שניהם', icon: 'layers-outline' },
];

export default function StudyLinkModeToggle({ mode, onChange }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>כפתורי לימוד במסך הבית ובלוח</Text>
      <View style={styles.row}>
        {OPTIONS.map((option) => {
          const active = mode === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.btn, active && styles.btnActive]}
              onPress={() => onChange(option.id)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={option.icon}
                size={14}
                color={active ? theme.colors.background : theme.colors.textSecondary}
              />
              <Text style={[styles.btnText, active && styles.btnTextActive]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    wrap: {
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      gap: 10,
      alignItems: 'stretch',
    },
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      width: '100%',
      textAlign: 'left',
      writingDirection: 'rtl',
    },
    row: {
      flexDirection: 'row',
      gap: 8,
    },
    btn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 10,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    btnActive: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    btnText: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.colors.textSecondary,
    },
    btnTextActive: {
      color: theme.colors.background,
    },
  });
