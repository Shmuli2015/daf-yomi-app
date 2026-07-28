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
  { id: 'both', label: 'שניהם', icon: 'layers-outline' },
  { id: 'sefaria', label: 'ספריא', icon: 'book-outline' },
  { id: 'tzurat', label: 'קריאת הדף', icon: 'reader-outline' },
];

export default function StudyLinkModeToggle({ mode, onChange }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>כפתורי לימוד במסך הבית ובלוח</Text>
      <View style={styles.segmentedControl}>
        {OPTIONS.map((option) => {
          const active = mode === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.btn, active && styles.btnActive]}
              onPress={() => onChange(option.id)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={option.icon}
                size={14}
                color={active ? '#FFFFFF' : theme.colors.textSecondary}
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
      paddingHorizontal: 18,
      paddingVertical: 14,
      gap: 10,
      backgroundColor: theme.colors.surface,
    },
    label: {
      fontSize: 12.5,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      textAlign: 'start' as any,
      writingDirection: 'rtl',
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
      gap: 4,
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
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    btnTextActive: {
      color: '#FFFFFF',
      fontWeight: '800',
    },
  });
