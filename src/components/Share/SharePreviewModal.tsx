import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  type ViewInstance,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import ShareProgressCard from './ShareProgressCard';
import type { ShareCardThemeMode } from './ShareFrame';
import {
  captureAndShare,
  waitForShareCaptureReady,
  type ShareProgressData,
} from '../../utils/shareProgressImage';
import BottomSheetModal from '../BottomSheetModal';
import { createSharePreviewModalStyles } from './SharePreviewModal.styles';

interface SharePreviewModalProps {
  visible: boolean;
  onClose: () => void;
  data: ShareProgressData | null;
}

export default function SharePreviewModal({
  visible,
  onClose,
  data,
}: SharePreviewModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSharePreviewModalStyles(theme), [theme]);
  const captureRef = useRef<ViewInstance>(null);
  const [sharing, setSharing] = useState(false);
  const [captureLaidOut, setCaptureLaidOut] = useState(false);
  const [cardTheme, setCardTheme] = useState<ShareCardThemeMode>('dark');

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

        <View style={styles.themeSelectorRow}>
          <TouchableOpacity
            style={[
              styles.themeOptionButton,
              cardTheme === 'dark' && styles.themeOptionButtonActive,
            ]}
            onPress={() => setCardTheme('dark')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="moon"
              size={15}
              color={cardTheme === 'dark' ? theme.colors.accent : theme.colors.textMuted}
            />
            <Text
              style={[
                styles.themeOptionText,
                cardTheme === 'dark' && styles.themeOptionTextActive,
              ]}
            >
              כהה מלכותי
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeOptionButton,
              cardTheme === 'light' && styles.themeOptionButtonActive,
            ]}
            onPress={() => setCardTheme('light')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="sunny"
              size={15}
              color={cardTheme === 'light' ? theme.colors.accent : theme.colors.textMuted}
            />
            <Text
              style={[
                styles.themeOptionText,
                cardTheme === 'light' && styles.themeOptionTextActive,
              ]}
            >
              בהיר יוקרתי
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.previewWrapper}>
          <View style={styles.previewScaler}>
            <ShareProgressCard data={data} cardTheme={cardTheme} />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.shareButton, sharing && styles.shareButtonDisabled]}
          onPress={handleShare}
          activeOpacity={0.8}
          disabled={sharing}
        >
          {sharing ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <>
              <Ionicons name="share-outline" size={20} color={theme.colors.white} />
              <Text style={styles.shareText}>שתף תמונה</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.captureHost} pointerEvents="none" collapsable={false}>
        <ShareProgressCard
          ref={captureRef}
          data={data}
          cardTheme={cardTheme}
          onLayout={() => setCaptureLaidOut(true)}
        />
      </View>
    </BottomSheetModal>
  );
}
