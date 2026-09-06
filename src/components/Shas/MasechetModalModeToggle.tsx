import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

export type MasechetStudyMode = 'dafYomi' | 'personal';

interface MasechetModalModeToggleProps {
  mode: MasechetStudyMode;
  onModeChange: (mode: MasechetStudyMode) => void;
  dafYomiCount: number;
  personalCount: number;
}

export default function MasechetModalModeToggle({
  mode,
  onModeChange,
  dafYomiCount,
  personalCount,
}: MasechetModalModeToggleProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.segment, mode === 'dafYomi' && styles.segmentActive]}
        onPress={() => onModeChange('dafYomi')}
        activeOpacity={0.7}
      >
        <Ionicons
          name="calendar-outline"
          size={16}
          color={mode === 'dafYomi' ? theme.colors.accent : theme.colors.textSecondary}
        />
        <Text
          style={[
            styles.segmentText,
            mode === 'dafYomi' && styles.segmentTextActive,
          ]}
        >
          דף יומי ({dafYomiCount})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.segment, mode === 'personal' && styles.segmentActive]}
        onPress={() => onModeChange('personal')}
        activeOpacity={0.7}
      >
        <Ionicons
          name="bookmark-outline"
          size={16}
          color={mode === 'personal' ? theme.colors.accent : theme.colors.textSecondary}
        />
        <Text
          style={[
            styles.segmentText,
            mode === 'personal' && styles.segmentTextActive,
          ]}
        >
          לימוד אישי ({personalCount})
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background,
      borderRadius: 14,
      padding: 3,
      marginHorizontal: 20,
      marginTop: 8,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 4,
    },
    segment: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      borderRadius: 11,
      gap: 6,
    },
    segmentActive: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    segmentText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    segmentTextActive: {
      color: theme.colors.accent,
      fontWeight: '800',
    },
  });
