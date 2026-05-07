import React from 'react';
import { View, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { HDate } from '@hebcal/core';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SelectedDafCard from './SelectedDafCard';
import { THEME } from '../../theme';

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
  const insets = useSafeAreaInsets();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Bottom sheet panel */}
        <View style={[styles.panel, { paddingBottom: insets.bottom + 20 }]}>
          {/* Gold accent top border + handle */}
          <View style={styles.topAccent} />
          <View style={styles.handle} />

          {/* Close button */}
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={18} color={THEME.colors.textSecondary} />
          </TouchableOpacity>

          {selectedDate && dafInfo && (
            <SelectedDafCard
              selectedDate={selectedDate}
              dafInfo={dafInfo}
              isLearned={isLearned}
              onToggle={onToggle}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,28,46,0.72)',
  },
  panel: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 20,
    paddingTop: 0,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 16,
  },
  topAccent: {
    height: 3,
    backgroundColor: THEME.colors.accent,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    marginBottom: 0,
    opacity: 0.7,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: THEME.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
});

export default DafDetailModal;
