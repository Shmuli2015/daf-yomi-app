import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { formatDafLabel } from '../../utils/dafNavigation';
import type { Amud } from '../../utils/dafNavigation';

interface TzuratHeaderProps {
  masechetHe?: string;
  masechetEn: string;
  dafNum: number;
  amud: Amud;
  isLandscape?: boolean;
  isLearned?: boolean;
  canMarkLearned?: boolean;
  onClose: () => void;
  onToggleLearned?: () => void;
}

export default function TzuratHeader({
  masechetHe,
  masechetEn,
  dafNum,
  amud,
  isLandscape = false,
  isLearned = false,
  canMarkLearned = false,
  onClose,
  onToggleLearned,
}: TzuratHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, isLandscape), [theme, isLandscape]);

  const title = masechetHe || masechetEn;
  const btnSize = isLandscape ? 34 : 40;
  const iconSize = isLandscape ? 18 : 20;

  return (
    <View style={[styles.container, { paddingTop: insets.top + (isLandscape ? 4 : 8) }]}>
      <TouchableOpacity
        onPress={onClose}
        style={[styles.iconBtn, { width: btnSize, height: btnSize }]}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={iconSize + 2} color={theme.colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.titleBlock}>
        {!isLandscape && <Text style={styles.badge}>צורת הדף</Text>}
        <Text style={styles.masechet} numberOfLines={1}>{title}</Text>
        <Text style={styles.daf}>{formatDafLabel(dafNum, amud)}</Text>
      </View>

      <View style={styles.actions}>
        {canMarkLearned ? (
          <TouchableOpacity
            onPress={onToggleLearned}
            style={[
              styles.markBtn,
              isLandscape && styles.markBtnLandscape,
              isLearned ? styles.markBtnLearned : styles.markBtnPending,
            ]}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isLearned ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={iconSize}
              color={isLearned ? theme.colors.success : theme.colors.accent}
            />
            {!isLandscape && (
              <Text
                style={[
                  styles.markBtnText,
                  { color: isLearned ? theme.colors.success : theme.colors.accent },
                ]}
                numberOfLines={1}
              >
                {isLearned ? 'נלמד' : 'סמן כנלמד'}
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={{ width: btnSize }} />
        )}
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>, isLandscape: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: isLandscape ? 10 : 16,
      paddingBottom: isLandscape ? 6 : 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    iconBtn: {
      borderRadius: isLandscape ? 10 : 12,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleBlock: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 6,
    },
    badge: {
      color: theme.colors.accent,
      fontSize: 11,
      fontWeight: '800',
      marginBottom: 2,
    },
    masechet: {
      color: theme.colors.textPrimary,
      fontSize: isLandscape ? 15 : 18,
      fontWeight: '900',
    },
    daf: {
      color: theme.colors.textSecondary,
      fontSize: isLandscape ? 12 : 14,
      fontWeight: '700',
      marginTop: isLandscape ? 0 : 2,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isLandscape ? 4 : 6,
    },
    markBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: isLandscape ? 10 : 12,
      borderWidth: 1,
    },
    markBtnLandscape: {
      paddingHorizontal: 6,
      paddingVertical: 6,
    },
    markBtnPending: {
      backgroundColor: theme.colors.accentLight,
      borderColor: 'rgba(201,150,60,0.3)',
    },
    markBtnLearned: {
      backgroundColor: theme.colors.successLight,
      borderColor: '#BBF7D0',
    },
    markBtnText: {
      fontSize: 11,
      fontWeight: '800',
      maxWidth: 72,
    },
  });
