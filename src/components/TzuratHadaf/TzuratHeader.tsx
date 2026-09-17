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
  studyStatus?: 'none' | 'partial' | 'learned';
  canMarkLearned?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onClose: () => void;
  onToggleLearned?: () => void;
  onLongPressLearned?: () => void;
}

export default function TzuratHeader({
  masechetHe,
  masechetEn,
  dafNum,
  amud,
  isLandscape = false,
  studyStatus = 'none',
  canMarkLearned = false,
  isFullscreen = false,
  onToggleFullscreen,
  onClose,
  onToggleLearned,
  onLongPressLearned,
}: TzuratHeaderProps) {
  const isLearned = studyStatus === 'learned';
  const isPartial = studyStatus === 'partial';
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, isLandscape), [theme, isLandscape]);

  const title = masechetHe || masechetEn;
  const btnSize = isLandscape ? 34 : 40;
  const iconSize = isLandscape ? 18 : 20;
  const markLabel = isLearned ? 'נלמד' : isPartial ? 'סיימתי!' : 'סמן כנלמד';

  return (
    <View style={[styles.container, { paddingTop: insets.top + (isLandscape ? 4 : 8) }]}>
      <View style={styles.content}>
        <View style={styles.titleBlock} pointerEvents="none">
          <Text style={styles.masechet} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.daf} numberOfLines={1}>
            {formatDafLabel(dafNum, amud)}
          </Text>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.iconBtn, { width: btnSize, height: btnSize }]}
            activeOpacity={0.7}
            accessibilityLabel="סגור"
          >
            <Ionicons name="close" size={iconSize + 2} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.actions}>
            {onToggleFullscreen ? (
              <TouchableOpacity
                onPress={onToggleFullscreen}
                style={[styles.iconBtn, { width: btnSize, height: btnSize }]}
                activeOpacity={0.7}
                accessibilityLabel="מסך מלא"
              >
                <Ionicons
                  name={isFullscreen ? 'contract-outline' : 'expand-outline'}
                  size={iconSize}
                  color={theme.colors.accent}
                />
              </TouchableOpacity>
            ) : null}

            {canMarkLearned ? (
              <TouchableOpacity
                onPress={onToggleLearned}
                onLongPress={studyStatus !== 'learned' ? onLongPressLearned : undefined}
                delayLongPress={400}
                style={[
                  styles.iconBtn,
                  { width: btnSize, height: btnSize },
                  isLearned ? styles.markBtnLearned : isPartial ? styles.markBtnPartial : styles.markBtnPending,
                ]}
                activeOpacity={0.7}
                accessibilityLabel={markLabel}
              >
                <Ionicons
                  name={isLearned ? 'checkmark-circle' : isPartial ? 'ellipse' : 'checkmark-circle-outline'}
                  size={iconSize}
                  color={isLearned ? theme.colors.success : theme.colors.accent}
                />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>, isLandscape: boolean) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: isLandscape ? 10 : 16,
      paddingBottom: isLandscape ? 6 : 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    content: {
      position: 'relative',
      justifyContent: 'center',
      minHeight: isLandscape ? 34 : 40,
    },
    titleBlock: {
      ...StyleSheet.absoluteFill,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 88,
    },
    masechet: {
      color: theme.colors.textPrimary,
      fontSize: isLandscape ? 15 : 17,
      fontWeight: '900',
      textAlign: 'center',
      writingDirection: 'rtl',
      width: '100%',
    },
    daf: {
      color: theme.colors.textSecondary,
      fontSize: isLandscape ? 12 : 13,
      fontWeight: '700',
      marginTop: 1,
      textAlign: 'center',
      writingDirection: 'rtl',
      width: '100%',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: isLandscape ? 34 : 40,
      zIndex: 1,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isLandscape ? 4 : 6,
    },
    iconBtn: {
      borderRadius: isLandscape ? 10 : 12,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    markBtnPending: {
      backgroundColor: theme.colors.accentLight,
      borderColor: 'rgba(201,150,60,0.3)',
    },
    markBtnLearned: {
      backgroundColor: theme.colors.successLight,
      borderColor: '#BBF7D0',
    },
    markBtnPartial: {
      backgroundColor: theme.colors.accentLight,
      borderColor: theme.colors.accent + '50',
    },
  });
