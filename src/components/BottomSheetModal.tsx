import React, { useMemo } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { useSheetDismissGesture } from '../hooks/useSheetDismissGesture';
import { createBottomSheetModalStyles } from './BottomSheetModal.styles';
import SheetDragHandle from './SheetDragHandle';

interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  showHandle?: boolean;
  dismissible?: boolean;
}

export default function BottomSheetModal({
  visible,
  onClose,
  children,
  showHandle = true,
  dismissible = true,
}: BottomSheetModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createBottomSheetModalStyles(theme), [theme]);
  const handleClose = dismissible ? onClose : undefined;
  const { panHandlers, sheetAnimatedStyle, overlayAnimatedStyle, animationType } =
    useSheetDismissGesture({
      visible,
      enabled: dismissible && showHandle,
      onClose,
    });

  return (
    <Modal
      transparent
      visible={visible}
      animationType={animationType}
      onRequestClose={handleClose}
      statusBarTranslucent={Platform.OS === 'android'}
    >
      <View style={styles.overlayRoot}>
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.overlayDim, overlayAnimatedStyle]}
        />
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <View style={styles.sheetLayer} pointerEvents="box-none">
          <Animated.View pointerEvents="auto" style={[styles.sheet, sheetAnimatedStyle]}>
            <SafeAreaView edges={['bottom']}>
              {showHandle ? <SheetDragHandle panHandlers={panHandlers} /> : null}
              {children}
            </SafeAreaView>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}
