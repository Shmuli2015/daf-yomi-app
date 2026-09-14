import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import ShareProgressCard from './ShareProgressCard';
import { CARD_SIZE, captureAndShare, waitForShareCaptureReady, type ShareProgressData } from '../../utils/shareProgressImage';
import BottomSheetModal from '../BottomSheetModal';

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
  const [sharing, setSharing] = useState(false);
  const [captureLaidOut, setCaptureLaidOut] = useState(false);

  useEffect(() => {
    if (visible) {
      setCaptureLaidOut(false);
    } else {
      setSharing(false);
      setCaptureLaidOut(false);
    }
  }, [visible, data]);

  const handleShare = async () => {
    if (!data || sharing) return;
    setSharing(true);
    try {
      await waitForShareCaptureReady(captureLaidOut);
      await captureAndShare(captureRef);
    } finally {
      setSharing(false);
    }
  };

  if (!data) return null;

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.content}>
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
      </View>

      <View style={styles.captureHost} pointerEvents="none" collapsable={false}>
        <ShareProgressCard
          ref={captureRef}
          data={data}
          onLayout={() => setCaptureLaidOut(true)}
        />
      </View>
    </BottomSheetModal>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    content: {
      alignItems: 'center',
      paddingTop: 12,
      direction: 'rtl',
    },
    closeBtn: {
      position: 'absolute',
      top: 0,
      left: 0,
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
