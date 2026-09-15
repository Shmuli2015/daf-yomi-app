import React, { useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { createSederFilterBarStyles } from './sederFilterBarStyles';
import type { Seder } from '../../data/shas';
import { triggerSelection } from '../../utils/haptics';
import QuickJumpButton from '../QuickJump/QuickJumpButton';

export type StatusFilter = 'all' | 'completed' | 'in_progress' | 'not_started';

interface SederFilterBarProps {
  selectedSeder?: Seder | null;
  onSelectSeder?: (seder: Seder | null) => void;
  selectedStatus: StatusFilter;
  onSelectStatus: (status: StatusFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  matchedCount: number;
  totalCount: number;
  onOpenQuickJump?: () => void;
}

const STATUS_OPTIONS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'הכל' },
  { id: 'in_progress', label: 'בתהליך' },
  { id: 'completed', label: 'הושלמו' },
  { id: 'not_started', label: 'טרם נלמדו' },
];

export default function SederFilterBar({
  selectedSeder,
  onSelectSeder,
  selectedStatus,
  onSelectStatus,
  searchQuery,
  onSearchChange,
  matchedCount,
  totalCount,
  onOpenQuickJump,
}: SederFilterBarProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSederFilterBarStyles(theme), [theme]);

  const isFilteringActive = searchQuery.trim().length > 0 || selectedStatus !== 'all';

  const handleStatusPress = (status: StatusFilter) => {
    void triggerSelection();
    onSelectStatus(status);
  };

  const handleClearAll = () => {
    void triggerSelection();
    onSearchChange('');
    onSelectStatus('all');
    if (onSelectSeder) {
      onSelectSeder(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={18}
            color={theme.colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="חיפוש מסכת בש״ס..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={onSearchChange}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => onSearchChange('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="נקה חיפוש"
            >
              <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {onOpenQuickJump && <QuickJumpButton onPress={onOpenQuickJump} />}
      </View>

      <View style={styles.segmentedControl}>
        {STATUS_OPTIONS.map((opt) => {
          const isActive = selectedStatus === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.segment, isActive && styles.segmentActive]}
              onPress={() => handleStatusPress(opt.id)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={opt.label}
            >
              <Text
                style={[
                  styles.segmentText,
                  isActive && styles.segmentTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isFilteringActive && (
        <View style={styles.resultsRow}>
          <Text style={styles.resultsBadge}>
            נמצאו {matchedCount} מתוך {totalCount} מסכתות
          </Text>
          <TouchableOpacity
            style={styles.clearAllButton}
            onPress={handleClearAll}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="איפוס סינון"
          >
            <Text style={styles.clearAllText}>איפוס</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
