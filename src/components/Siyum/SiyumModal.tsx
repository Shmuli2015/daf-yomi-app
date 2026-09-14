import React, { useMemo, useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useTheme } from '../../theme';
import { createSiyumModalStyles } from './siyumModalStyles';
import { triggerSuccess } from '../../utils/haptics';
import { useSiyumShare } from './useSiyumShare';
import SiyumShareCard from './SiyumShareCard';

interface SiyumModalProps {
  visible: boolean;
  masechetHe: string;
  totalPages: number;
  onClose: () => void;
}

export default function SiyumModal({
  visible,
  masechetHe,
  totalPages,
  onClose,
}: SiyumModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSiyumModalStyles(theme), [theme]);
  const { width } = useWindowDimensions();
  const [showConfetti, setShowConfetti] = useState(false);
  const {
    captureRef,
    sharingImage,
    handleShareImage,
    onCaptureLayout,
  } = useSiyumShare(visible);

  useEffect(() => {
    if (visible) {
      setShowConfetti(true);
      void triggerSuccess();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.modalContainer}>
          <View style={styles.headerGradient}>
            <View style={styles.crownIconContainer}>
              <Ionicons name="ribbon-outline" size={36} color={theme.colors.accent} />
            </View>
            <Text style={styles.title}>מַזָּל טוֹב!</Text>
            <Text style={styles.subtitle}>סיימת מסכת {masechetHe}</Text>
          </View>

          <View style={styles.body}>
            <View style={styles.verseCard}>
              <Text style={styles.completionText}>זכית לסיים {totalPages} דפים</Text>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.shareButton, sharingImage && styles.shareButtonDisabled]}
              onPress={handleShareImage}
              activeOpacity={0.8}
              disabled={sharingImage}
            >
              {sharingImage ? (
                <ActivityIndicator color={theme.colors.surface} />
              ) : (
                <>
                  <Ionicons name="image-outline" size={20} color={theme.colors.surface} />
                  <Text style={styles.shareButtonText}>שתף תמונה</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>סגור</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showConfetti && (
          <View style={styles.confettiContainer} pointerEvents="none">
            <ConfettiCannon
              count={220}
              origin={{ x: width / 2, y: -50 }}
              fadeOut
              fallSpeed={3200}
              explosionSpeed={350}
              colors={[theme.colors.accent, theme.colors.surface, theme.colors.success]}
              onAnimationEnd={() => setShowConfetti(false)}
            />
          </View>
        )}
      </View>

      <View style={styles.captureHost} pointerEvents="none" collapsable={false}>
        <SiyumShareCard
          ref={captureRef}
          masechetHe={masechetHe}
          totalPages={totalPages}
          onLayout={onCaptureLayout}
        />
      </View>
    </Modal>
  );
}
