import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  type ViewInstance,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import ShareProgressCard from './ShareProgressCard';
import type { ShareCardThemeMode } from './ShareFrame';
import { useModeSwitcherIndicator } from '../../hooks/useModeSwitcherIndicator';
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

const SHARE_THEME_TABS: Array<{
  id: ShareCardThemeMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { id: 'dark', label: 'כהה מלכותי', icon: 'moon' },
  { id: 'light', label: 'בהיר יוקרתי', icon: 'sunny' },
];

const SHARE_THEME_IDS = SHARE_THEME_TABS.map((tab) => tab.id);

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
  const [cardTheme, setCardTheme] = useState<ShareCardThemeMode>(() =>
    theme.isDark ? 'dark' : 'light',
  );

  const { onSwitcherLayout, indicatorStyle, isReady } = useModeSwitcherIndicator(
    cardTheme,
    SHARE_THEME_IDS,
  );

  useEffect(() => {
    if (visible) {
      setCaptureLaidOut(false);
      setCardTheme(theme.isDark ? 'dark' : 'light');
    } else {
      setSharing(false);
      setCaptureLaidOut(false);
    }
  }, [visible, data, theme.isDark]);

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

        <View style={styles.segmentedControl} onLayout={onSwitcherLayout}>
          <Animated.View pointerEvents="none" style={[styles.indicator, indicatorStyle]} />
          {SHARE_THEME_TABS.map((tab) => {
            const isActive = cardTheme === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.segmentBtn, isActive && !isReady && styles.segmentBtnActiveFallback]}
                onPress={() => setCardTheme(tab.id)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={tab.label}
                accessibilityState={{ selected: isActive }}
              >
                <Ionicons
                  name={tab.icon}
                  size={15}
                  color={isActive ? theme.colors.accent : theme.colors.textMuted}
                />
                <Text
                  style={[styles.segmentText, isActive && styles.segmentTextActive]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.previewWrapper}>
          <Animated.View
            key={cardTheme}
            entering={FadeIn.duration(240)}
            style={styles.previewScaler}
          >
            <ShareProgressCard data={data} cardTheme={cardTheme} />
          </Animated.View>
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
            <Text style={styles.shareText}>שתף תמונה</Text>
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
