import React, { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import BottomSheetModal from './BottomSheetModal';
import { createStoreMigrationModalStyles } from './StoreMigrationModal.styles';
import {
  STORE_MIGRATION_BACKUP_LABEL,
  STORE_MIGRATION_LATER_LABEL,
  STORE_MIGRATION_LEAD,
  STORE_MIGRATION_PLAY_LABEL,
  STORE_MIGRATION_STEPS,
  STORE_MIGRATION_TITLE,
  STORE_MIGRATION_WARNING,
} from '../utils/storeMigrationCopy';

type StoreMigrationModalProps = {
  visible: boolean;
  onClose: () => void;
  onOpenBackup: () => void;
  onOpenPlayStore: () => void;
};

export default function StoreMigrationModal({
  visible,
  onClose,
  onOpenBackup,
  onOpenPlayStore,
}: StoreMigrationModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStoreMigrationModalStyles(theme), [theme]);

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.card}>
        <View style={styles.closeRow} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="סגור"
          >
            <Ionicons name="close" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Ionicons name="logo-google-playstore" size={28} color={theme.colors.accent} />
          </View>
          <Text style={styles.title}>{STORE_MIGRATION_TITLE}</Text>
        </View>
        <Text style={styles.lead}>{STORE_MIGRATION_LEAD}</Text>
        <Text style={styles.warning}>{STORE_MIGRATION_WARNING}</Text>
        <View style={styles.steps}>
          {STORE_MIGRATION_STEPS.map((step, index) => (
            <View key={step} style={styles.stepRow}>
              <Text style={styles.stepIndex}>{index + 1}</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={onOpenBackup}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={STORE_MIGRATION_BACKUP_LABEL}
        >
          <Text style={styles.primaryLabel}>{STORE_MIGRATION_BACKUP_LABEL}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={onOpenPlayStore}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={STORE_MIGRATION_PLAY_LABEL}
        >
          <Text style={styles.secondaryLabel}>{STORE_MIGRATION_PLAY_LABEL}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={onClose}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={STORE_MIGRATION_LATER_LABEL}
        >
          <Text style={styles.secondaryLabel}>{STORE_MIGRATION_LATER_LABEL}</Text>
        </TouchableOpacity>
      </View>
    </BottomSheetModal>
  );
}
