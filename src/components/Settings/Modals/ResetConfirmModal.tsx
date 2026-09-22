import { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import { ResetConfirmModalProps } from './ResetConfirmModal.types';
import { createResetConfirmModalStyles } from './ResetConfirmModal.styles';
import BottomSheetModal from '../../BottomSheetModal';

export default function ResetConfirmModal({
  visible,
  title,
  message,
  onConfirm,
  onClose,
}: ResetConfirmModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createResetConfirmModalStyles(theme), [theme]);

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.headerRow}>
        <View style={styles.headerTitleGroup}>
          <View style={styles.headerIconCircle}>
            <Ionicons name="warning-outline" size={20} color={theme.colors.danger} />
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.contentBox}>
        <Text style={styles.message}>{message}</Text>
      </View>

      <View style={styles.warningRow}>
        <Ionicons name="alert-circle-outline" size={16} color={theme.colors.danger} />
        <Text style={styles.warningText}>פעולה זו היא לצמיתות ואינה ניתנת לשחזור.</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>ביטול</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={onConfirm}
          activeOpacity={0.7}
        >
          <Text style={styles.confirmButtonText}>אישור איפוס</Text>
        </TouchableOpacity>
      </View>
    </BottomSheetModal>
  );
}
