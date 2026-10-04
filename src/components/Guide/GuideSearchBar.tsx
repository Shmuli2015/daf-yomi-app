import React, { useMemo } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { createGuideSearchBarStyles } from './GuideSearchBar.styles';

interface GuideSearchBarProps {
  query: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
}

export function GuideSearchBar({ query, onChangeText, onClear }: GuideSearchBarProps) {
  const theme = useTheme();
  const styles = useMemo(() => createGuideSearchBarStyles(theme), [theme]);
  const hasQuery = query.trim().length > 0;

  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={20} color={theme.colors.textMuted} />
      <TextInput
        style={styles.input}
        placeholder="חפש נושא, כפתור או הגדרה במדריך..."
        placeholderTextColor={theme.colors.textMuted}
        value={query}
        onChangeText={onChangeText}
        autoCorrect={false}
        returnKeyType="search"
        accessibilityRole="search"
        accessibilityLabel="תיבת חיפוש במדריך"
      />
      {hasQuery && (
        <TouchableOpacity
          onPress={onClear}
          style={styles.clearButton}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="איפוס חיפוש"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default GuideSearchBar;
