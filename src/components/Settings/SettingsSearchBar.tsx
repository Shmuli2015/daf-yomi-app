import React, { useMemo, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { triggerSelection } from '../../utils/haptics';
import { createSettingsSearchBarStyles } from './SettingsSearchBar.styles';

export interface SettingsSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  resultCount?: number;
}

export function SettingsSearchBar({
  value,
  onChangeText,
  onClear,
  resultCount,
}: SettingsSearchBarProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSettingsSearchBarStyles(theme), [theme]);
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    void triggerSelection();
    onClear();
  };

  const showResultCount = value.trim().length > 0 && typeof resultCount === 'number';

  return (
    <View style={[styles.container, isFocused && styles.containerFocused]}>
      <Ionicons
        name="search-outline"
        size={18}
        color={isFocused ? theme.colors.accent : theme.colors.textMuted}
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.input}
        placeholder="חפש בהגדרות..."
        placeholderTextColor={theme.colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel="חפש בהגדרות"
      />
      {showResultCount && (
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>
            {resultCount === 0 ? '0' : resultCount}
          </Text>
        </View>
      )}
      {value.length > 0 ? (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearBtn}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="נקה חיפוש"
        >
          <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default SettingsSearchBar;
