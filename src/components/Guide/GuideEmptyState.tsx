import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { getGuideQuestionSubject } from '../../supportContact';
import { createGuideEmptyStateStyles } from './GuideEmptyState.styles';

interface GuideEmptyStateProps {
  searchQuery: string;
  onClearSearch: () => void;
  otherTabLabel?: string;
  otherTabCount?: number;
  onSwitchTab?: () => void;
  onAskSupport?: (subject: string) => void;
}

export function GuideEmptyState({
  searchQuery,
  onClearSearch,
  otherTabLabel,
  otherTabCount = 0,
  onSwitchTab,
  onAskSupport,
}: GuideEmptyStateProps) {
  const theme = useTheme();
  const styles = useMemo(() => createGuideEmptyStateStyles(theme), [theme]);
  const trimmed = searchQuery.trim();

  const handleAsk = useCallback(() => {
    if (onAskSupport && trimmed.length > 0) {
      onAskSupport(getGuideQuestionSubject(trimmed));
    }
  }, [onAskSupport, trimmed]);

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="search-outline" size={26} color={theme.colors.textMuted} />
      </View>
      <Text style={styles.title}>לא נמצאו תוצאות</Text>
      <Text style={styles.subtitle}>
        {trimmed.length > 0
          ? `לא מצאנו מידע המתאים לחיפוש "${trimmed}". נסו מילות חיפוש אחרות או פנו אלינו לעזרה.`
          : 'אין תוכן להצגה בקטגוריה זו.'}
      </Text>

      <View style={styles.actions}>
        {otherTabCount > 0 && onSwitchTab && otherTabLabel && (
          <TouchableOpacity
            onPress={onSwitchTab}
            style={styles.switchTabBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`מעבר ל-${otherTabCount} תוצאות ב-${otherTabLabel}`}
          >
            <Ionicons name="swap-horizontal-outline" size={16} color={theme.colors.accent} />
            <Text style={styles.switchTabText}>
              מעבר ל-{otherTabCount} תוצאות ב{otherTabLabel}
            </Text>
          </TouchableOpacity>
        )}

        {trimmed.length > 0 && onAskSupport && (
          <TouchableOpacity
            onPress={handleAsk}
            style={styles.askBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`שאלו אותנו על ${trimmed}`}
          >
            <Ionicons name="mail-outline" size={16} color={theme.colors.accent} />
            <Text style={styles.askBtnText}>שאלו אותנו על "{trimmed}"</Text>
          </TouchableOpacity>
        )}

        {trimmed.length > 0 && (
          <TouchableOpacity
            onPress={onClearSearch}
            style={styles.clearBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="נקה חיפוש"
          >
            <Text style={styles.clearBtnText}>נקה חיפוש</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default GuideEmptyState;
