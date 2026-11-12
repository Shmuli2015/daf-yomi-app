import React, { useMemo } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { createReaderSearchBarStyles } from './ReaderSearchBar.styles';

interface ReaderSearchBarProps {
  query: string;
  onChangeQuery: (value: string) => void;
  matchCount: number;
  activeMatchIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export default function ReaderSearchBar({
  query,
  onChangeQuery,
  matchCount,
  activeMatchIndex,
  onNext,
  onPrev,
  onClose,
}: ReaderSearchBarProps) {
  const theme = useTheme();
  const styles = useMemo(() => createReaderSearchBarStyles(theme), [theme]);
  const counterLabel =
    matchCount === 0
      ? '0/0'
      : `${activeMatchIndex + 1}/${matchCount}`;

  return (
    <View style={styles.container}>
      <View style={styles.inputWrap}>
        <Ionicons name="search-outline" size={16} color={theme.colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={onChangeQuery}
          placeholder="חיפוש בעמוד..."
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          textAlign="right"
          autoFocus
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          accessibilityLabel="חיפוש בתוך העמוד"
        />
      </View>

      <Text style={styles.counter}>{counterLabel}</Text>

      <TouchableOpacity
        style={styles.iconBtn}
        onPress={onPrev}
        disabled={matchCount === 0}
        accessibilityRole="button"
        accessibilityLabel="תוצאה קודמת"
      >
        <Ionicons
          name="chevron-up"
          size={18}
          color={matchCount === 0 ? theme.colors.textMuted : theme.colors.accent}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconBtn}
        onPress={onNext}
        disabled={matchCount === 0}
        accessibilityRole="button"
        accessibilityLabel="תוצאה הבאה"
      >
        <Ionicons
          name="chevron-down"
          size={18}
          color={matchCount === 0 ? theme.colors.textMuted : theme.colors.accent}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconBtn}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="סגור חיפוש"
      >
        <Ionicons name="close" size={18} color={theme.colors.accent} />
      </TouchableOpacity>
    </View>
  );
}
