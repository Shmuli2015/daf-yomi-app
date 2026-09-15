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
  onToggle: () => void;
  onLongPressToggle?: () => void;
  onOpenTzuratHadaf?: () => void;
}

const DafDetailModal = ({
  visible,
  onClose,
  selectedDate,
  dafInfo,
  studyStatus,
  onToggle,
  onLongPressToggle,
  onOpenTzuratHadaf,
}: DafDetailModalProps) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.panel}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        {selectedDate && dafInfo && (
          <SelectedDafCard
            selectedDate={selectedDate}
            dafInfo={dafInfo}
            studyStatus={studyStatus}
            onToggle={onToggle}
            onLongPressToggle={onLongPressToggle}
            onOpenTzuratHadaf={onOpenTzuratHadaf}
          />
        )}
      </View>
    </BottomSheetModal>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    panel: {
      paddingTop: 40,
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

export default DafDetailModal;
