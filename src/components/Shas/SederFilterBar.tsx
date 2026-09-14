import React, { useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { createSederFilterBarStyles } from './sederFilterBarStyles';
import { SEDARIM, type Seder } from '../../data/shas';
import { triggerSelection } from '../../utils/haptics';
import QuickJumpButton from '../QuickJump/QuickJumpButton';

export type StatusFilter = 'all' | 'completed' | 'in_progress' | 'not_started';

interface SederFilterBarProps {
  selectedSeder: Seder | null;
  onSelectSeder: (seder: Seder | null) => void;
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

  const handleSederPress = (sederId: Seder | null) => {
    void triggerSelection();
    onSelectSeder(sederId);
  };

  const handleStatusPress = (status: StatusFilter) => {
    void triggerSelection();
    onSelectStatus(status);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color={theme.colors.textMuted} style={styles.searchIcon} />
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
            >
              <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {onOpenQuickJump && (
          <QuickJumpButton onPress={onOpenQuickJump} />
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[styles.chip, selectedSeder === null && styles.chipActive]}
          onPress={() => handleSederPress(null)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.chipText,
              selectedSeder === null && styles.chipTextActive,
            ]}
          >
            כל הש״ס
          </Text>
        </TouchableOpacity>

        {SEDARIM.map((seder) => {
          const isActive = selectedSeder === seder.id;
          return (
            <TouchableOpacity
              key={seder.id}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => handleSederPress(seder.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                סדר {seder.he}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
        contentContainerStyle={styles.statusScrollContent}
      >
        {STATUS_OPTIONS.map((opt) => {
          const isActive = selectedStatus === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.statusChip, isActive && styles.statusChipActive]}
              onPress={() => handleStatusPress(opt.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.statusChipText,
                  isActive && styles.statusChipTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.resultsBadge}>
        מציג {matchedCount} מתוך {totalCount} מסכתות
      </Text>
    </View>
  );
}
