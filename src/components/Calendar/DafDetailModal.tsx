import React, { useMemo } from 'react';
import { View, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { HDate } from '@hebcal/core';
import { Ionicons } from '@expo/vector-icons';
import SelectedDafCard from './SelectedDafCard';
import { useTheme } from '../../theme';

interface DafDetailModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: HDate | null;
  dafInfo: {
    masechet: string;
    daf: string;
    dateString: string;
    sefariaUrl: string;
  } | null;
  isLearned: boolean;
  onToggle: () => void;
}

const DafDetailModal = ({
  visible,
  onClose,
  selectedDate,
  dafInfo,
  isLearned,
  onToggle,
}: DafDetailModalProps) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.backdrop} />
        
        <View style={styles.container}>
          <Pressable style={styles.panel} onPress={(e) => e.stopPropagation()}>
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
                isLearned={isLearned}
                onToggle={onToggle}
              />
            )}
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
    },
    container: {
      width: '90%',
      maxWidth: 360,
      zIndex: 1,
    },
    panel: {
      backgroundColor: theme.colors.surface,
      borderRadius: 32,
      paddingHorizontal: 20,
      paddingTop: 52,
      paddingBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.4,
      shadowRadius: 30,
      elevation: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      // @ts-ignore
      direction: 'rtl',
    },
    closeBtn: {
      position: 'absolute',
      left: 12,
      top: 12,
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
