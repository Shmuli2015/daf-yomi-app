import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { HDate } from '@hebcal/core';
import { Ionicons } from '@expo/vector-icons';
import SelectedDafCard from './SelectedDafCard';
import { useTheme } from '../../theme';
import BottomSheetModal from '../BottomSheetModal';

interface DafDetailModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: HDate | null;
  dafInfo: {
    masechet: string;
    daf: string;
    dateString: string;
    masechetEn: string;
    dafNum: number;
    amud: 'a' | 'b';
  } | null;
  studyStatus?: 'none' | 'partial' | 'learned';
  partialAmud?: 'a' | 'b' | null;
  onToggle: () => void;
  onLongPressToggle?: () => void;
  onOpenTzuratHadaf?: () => void;
  onPrevDay?: () => void;
  onNextDay?: () => void;
  onCatchUp?: () => void;
  missedCount?: number;
}

export default function DafDetailModal({
  visible,
  onClose,
  selectedDate,
  dafInfo,
  studyStatus,
  partialAmud,
  onToggle,
  onLongPressToggle,
  onOpenTzuratHadaf,
  onPrevDay,
  onNextDay,
  onCatchUp,
  missedCount = 0,
}: DafDetailModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.panel}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeBtn}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="סגור חלון"
        >
          <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        {selectedDate && dafInfo && (
          <SelectedDafCard
            selectedDate={selectedDate}
            dafInfo={dafInfo}
            studyStatus={studyStatus}
            partialAmud={partialAmud}
            onToggle={onToggle}
            onLongPressToggle={onLongPressToggle}
            onOpenTzuratHadaf={onOpenTzuratHadaf}
            onPrevDay={onPrevDay}
            onNextDay={onNextDay}
            onCatchUp={onCatchUp}
            missedCount={missedCount}
          />
        )}
      </View>
    </BottomSheetModal>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    panel: {
      paddingTop: 36,
      direction: 'rtl',
    },
    closeBtn: {
      position: 'absolute',
      left: 0,
      top: 0,
      zIndex: 10,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
  });
