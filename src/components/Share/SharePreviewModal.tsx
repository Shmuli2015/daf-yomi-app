import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Modal,
  Animated,
  ActivityIndicator,
  InteractionManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import ShareProgressCard from './ShareProgressCard';
import { CARD_SIZE, captureAndShare, type ShareProgressData } from '../../utils/shareProgressImage';

const PREVIEW_WIDTH = 300;
const PREVIEW_SCALE = PREVIEW_WIDTH / CARD_SIZE;

interface SharePreviewModalProps {
  visible: boolean;
  onClose: () => void;
  data: ShareProgressData | null;
}

export default function SharePreviewModal({ visible, onClose, data }: SharePreviewModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const captureRef = useRef<View>(null);
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [sharing, setSharing] = useState(false);
  const [captureLaidOut, setCaptureLaidOut] = useState(false);

  useEffect(() => {
    if (visible) {
      setCaptureLaidOut(false);
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, damping: 12, stiffness: 100, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      scale.setValue(0.9);
      opacity.setValue(0);
      setSharing(false);
      setCaptureLaidOut(false);
    }
  }, [visible, data, opacity, scale]);

  const handleShare = async () => {
    if (!data || sharing) return;
    setSharing(true);
    try {
      await new Promise<void>((resolve) =>
        InteractionManager.runAfterInteractions(() => resolve(undefined)),
      );
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      await new Promise<void>((resolve) => setTimeout(resolve, 50));
      if (!captureLaidOut) {
        await new Promise<void>((resolve) => setTimeout(resolve, 120));
      }
      await captureAndShare(captureRef);
    } finally {
      setSharing(false);
    }
  };

  if (!visible || !data) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="סגור"
        />

        <Animated.View style={[styles.container, { opacity, transform: [{ scale }] }]}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="סגור"
          >
            <Ionicons name="close" size={22} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <Text style={styles.title}>כך ייראה השיתוף שלך</Text>

          <View style={styles.previewWrapper}>
            <View style={styles.previewScaler}>
              <ShareProgressCard data={data} />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.shareButton, sharing && styles.shareButtonDisabled]}
            onPress={handleShare}
            activeOpacity={0.8}
            disabled={sharing}
          >
            {sharing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="share-outline" size={20} color="#FFFFFF" />
                <Text style={styles.shareText}>שתף תמונה</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.captureHost} pointerEvents="none" collapsable={false}>
          <ShareProgressCard
            ref={captureRef}
            data={data}
            onLayout={() => setCaptureLaidOut(true)}
          />
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.7)',
    },
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      padding: 24,
      paddingTop: 36,
      width: '100%',
      maxWidth: 340,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      direction: 'rtl',
    },
    closeBtn: {
      position: 'absolute',
      top: 12,
      left: 12,
      padding: 4,
      zIndex: 2,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 20,
      fontWeight: '900',
      marginBottom: 20,
      textAlign: 'center',
    },
    previewWrapper: {
      width: PREVIEW_WIDTH,
      height: PREVIEW_WIDTH,
      overflow: 'hidden',
      borderRadius: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    previewScaler: {
      width: CARD_SIZE,
      height: CARD_SIZE,
      transform: [{ scale: PREVIEW_SCALE }],
    },
    shareButton: {
      width: '100%',
      backgroundColor: theme.colors.accent,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    shareButtonDisabled: {
      opacity: 0.85,
    },
    shareText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },
    captureHost: {
      position: 'absolute',
      left: -10000,
      top: 0,
      width: CARD_SIZE,
      height: CARD_SIZE,
      opacity: 1,
    },
  });
