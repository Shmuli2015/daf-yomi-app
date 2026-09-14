import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import BottomSheetModal from './BottomSheetModal';

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export default function SuccessModal({ visible, onClose, title, message }: SuccessModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={36} color={theme.colors.success} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
          <Text style={styles.closeText}>מעולה</Text>
        </TouchableOpacity>
      </View>
    </BottomSheetModal>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    content: {
      alignItems: 'center',
      direction: 'rtl',
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: 'rgba(34,197,94,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 22,
      fontWeight: '900',
      marginBottom: 8,
      textAlign: 'center',
    },
    message: {
      color: theme.colors.textSecondary,
      fontSize: 16,
      lineHeight: 22,
      textAlign: 'center',
      marginBottom: 24,
    },
    closeButton: {
      width: '100%',
      backgroundColor: theme.colors.success,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
    },
    closeText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '800',
    },
  });
