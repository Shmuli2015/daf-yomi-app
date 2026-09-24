import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Ionicons } from '@expo/vector-icons';
import { SHAS_MASECHTOT } from '../../data/shas';
import { stripNiqqud } from '../../utils/shas';
import { useTheme } from '../../theme';
import BulkActionConfirmOverlay from './BulkActionConfirmOverlay';
import FullscreenLoadingOverlay from './FullscreenLoadingOverlay';
import DafCell from './DafCell';
import DafMarkMenuModal from '../DafMarkMenuModal';
import MasechetModalModeToggle from './MasechetModalModeToggle';
import MasechetModalStats from './MasechetModalStats';
import SiyumModal from '../Siyum/SiyumModal';
import SheetDragHandle from '../SheetDragHandle';
import { createMasechetModalStyles } from './MasechetModal.styles';
import { useMasechetModal } from './useMasechetModal';

interface MasechetModalProps {
  masechet: typeof SHAS_MASECHTOT[0];
  onClose: () => void;
}

export default function MasechetModal({
  masechet,
  onClose,
}: MasechetModalProps) {
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles = useMemo(() => createMasechetModalStyles(theme), [theme]);

  const {
    mode,
    setMode,
    effectiveMode,
    isPersonalEnabled,
    isHomeActive,
    handleToggleHomeActive,
    handleRequestClose,
    dafimArray,
    numColumns,
    masechetStats,
    pct,
    pendingAction,
    isLoading,
    handleMarkAllPress,
    handleUnmarkAllPress,
    handleConfirm,
    handleCancel,
    showConfetti,
    setShowConfetti,
    showSiyum,
    closeSiyum,
    selectedDafForMenu,
    handleToggleDafStable,
    handleLongPressDafStable,
    sheetAnimatedStyle,
    overlayAnimatedStyle,
    animationType,
    keyExtractor,
    getItemLayout,
    getCellProps,
    handleMenuSelectFull,
    handleMenuSelectHalfA,
    handleMenuSelectHalfB,
    handleMenuUnmark,
    handleMenuCancel,
    menuPartialAmud,
    menuShowUnmark,
  } = useMasechetModal({
    masechet,
    onClose,
    windowWidth,
  });

  const renderItem = useCallback(
    ({ item: dafNum }: { item: number }) => (
      <DafCell
        {...getCellProps(dafNum)}
        onPress={handleToggleDafStable}
        onLongPress={handleLongPressDafStable}
        styles={styles}
      />
    ),
    [getCellProps, handleToggleDafStable, handleLongPressDafStable, styles],
  );

  return (
    <Modal
      visible
      transparent
      animationType={animationType}
      onRequestClose={handleRequestClose}
      statusBarTranslucent={Platform.OS === 'android'}
    >
      <View style={styles.overlayRoot}>
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.overlayDim, overlayAnimatedStyle]}
        />
        <Pressable style={StyleSheet.absoluteFill} onPress={handleRequestClose} />
        <View style={[styles.sheetLayer, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
          <Animated.View
            pointerEvents="auto"
            style={[styles.sheetFill, sheetAnimatedStyle]}
          >
            <SafeAreaView style={styles.modalSafe} edges={['bottom']}>
              <View style={styles.handleSpacing}>
                <SheetDragHandle />
              </View>

              <View style={styles.modalHeaderContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{stripNiqqud(masechet.he)}</Text>
                  <View style={styles.headerActions}>
                    {isPersonalEnabled && (
                      <TouchableOpacity
                        onPress={handleToggleHomeActive}
                        style={[styles.homeActionBtn, isHomeActive && styles.homeActionBtnActive]}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={isHomeActive ? 'star' : 'star-outline'}
                          size={14}
                          color={isHomeActive ? theme.colors.white : theme.colors.accent}
                        />
                        <Text style={[styles.homeActionText, isHomeActive && styles.homeActionTextActive]}>
                          {isHomeActive ? 'ראשי' : 'קבע כראשי'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={handleRequestClose} style={styles.closeBtn} activeOpacity={0.7}>
                      <Text style={styles.closeBtnText}>סגור</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {isPersonalEnabled && (
                  <MasechetModalModeToggle
                    mode={mode}
                    onModeChange={setMode}
                    dafYomiCount={masechetStats.dafYomiLearned}
                    personalCount={masechetStats.personalLearned}
                  />
                )}

                <MasechetModalStats
                  totalLearned={masechetStats.learned}
                  totalPages={masechetStats.total}
                  percentage={pct}
                  showPersonalTrack={isPersonalEnabled}
                />

                <View style={styles.actionButtons}>
                  <TouchableOpacity onPress={handleMarkAllPress} style={styles.markAllBtn} activeOpacity={0.7}>
                    <Text style={styles.markAllBtnText}>
                      {effectiveMode === 'personal' ? 'סמן הכל באישי' : 'סמן הכל'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleUnmarkAllPress} style={styles.unmarkAllBtn} activeOpacity={0.7}>
                    <Text style={styles.unmarkAllBtnText}>
                      {effectiveMode === 'personal' ? 'בטל הכל באישי' : 'בטל הכל'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <FlatList
                data={dafimArray}
                keyExtractor={keyExtractor}
                numColumns={numColumns}
                key={`masechet-grid-${numColumns}`}
                columnWrapperStyle={styles.dafRow}
                contentContainerStyle={styles.modalContent}
                initialNumToRender={36}
                maxToRenderPerBatch={24}
                windowSize={5}
                getItemLayout={getItemLayout}
                removeClippedSubviews={Platform.OS === 'android'}
                showsVerticalScrollIndicator={true}
                renderItem={renderItem}
                ListFooterComponent={<View style={{ height: 24 }} />}
              />

              {showConfetti && (
                <View style={styles.confettiContainer} pointerEvents="none">
                  <ConfettiCannon
                    count={180}
                    origin={{ x: windowWidth / 2, y: -20 }}
                    fadeOut={true}
                    fallSpeed={3500}
                    onAnimationEnd={() => setShowConfetti(false)}
                  />
                </View>
              )}

              <BulkActionConfirmOverlay
                variant={pendingAction}
                dafCount={dafimArray.length}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
              />

              <FullscreenLoadingOverlay visible={isLoading} />

              {selectedDafForMenu !== null && (
                <DafMarkMenuModal
                  visible={selectedDafForMenu !== null}
                  partialAmud={menuPartialAmud}
                  showUnmark={menuShowUnmark}
                  onSelectFull={handleMenuSelectFull}
                  onSelectHalfA={handleMenuSelectHalfA}
                  onSelectHalfB={handleMenuSelectHalfB}
                  onUnmark={handleMenuUnmark}
                  onCancel={handleMenuCancel}
                />
              )}

              <SiyumModal
                visible={showSiyum}
                masechetHe={masechet.he}
                totalPages={masechet.pages}
                onClose={closeSiyum}
              />
            </SafeAreaView>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}
