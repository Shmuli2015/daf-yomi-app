import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LIGHT_THEME, useTheme } from '../../theme';
import { useModeSwitcherIndicator } from '../../hooks/useModeSwitcherIndicator';
import { READER_FONT_SIZE_MAX, READER_FONT_SIZE_MIN } from '../../utils/readerFontSize';
import { triggerImpact } from '../../utils/haptics';
import ReaderThemeModal from './ReaderThemeModal';
import { createReaderToolbarStyles } from './ReaderToolbar.styles';

export type ReaderTheme = 'light' | 'dark' | 'sepia';
export type ViewMode = 'classic' | 'steinsaltz' | 'chavruta';

interface ReaderToolbarProps {
  viewMode: ViewMode;
  onToggleViewMode: (mode: ViewMode) => void;
  fontSize: number;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  readerTheme?: ReaderTheme;
  onChangeReaderTheme?: (theme: ReaderTheme) => void;
  accentColor: string;
  showNotes?: boolean;
  onToggleNotes?: () => void;
  gemaraNikud?: boolean;
  onToggleGemaraNikud?: () => void;
  nikudAvailable?: boolean;
  chavrutaAvailable?: boolean;
  steinsaltzAvailable?: boolean;
  classicTabLabel?: string;
  onOpenGuide?: () => void;
}

const MODES: Array<{ id: ViewMode; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { id: 'chavruta', label: 'חברותא', icon: 'people-outline' },
  { id: 'steinsaltz', label: 'שטיינזלץ', icon: 'reader-outline' },
  { id: 'classic', label: 'גמרא', icon: 'book-outline' },
];

export default function ReaderToolbar({
  viewMode,
  onToggleViewMode,
  fontSize,
  onIncreaseFontSize,
  onDecreaseFontSize,
  readerTheme = 'light',
  onChangeReaderTheme,
  accentColor,
  showNotes = false,
  onToggleNotes,
  gemaraNikud = true,
  onToggleGemaraNikud,
  nikudAvailable = false,
  chavrutaAvailable = true,
  steinsaltzAvailable = true,
  classicTabLabel = 'גמרא',
  onOpenGuide,
}: ReaderToolbarProps) {
  const theme = useTheme();
  const styles = useMemo(() => createReaderToolbarStyles(theme), [theme]);
  const onAccent = LIGHT_THEME.colors.surface;
  const showNotesToggle = viewMode === 'chavruta' && onToggleNotes != null;
  const showNikudToggle = viewMode === 'classic' && nikudAvailable && onToggleGemaraNikud != null;

  const [showThemeModal, setShowThemeModal] = useState(false);
  const visibleModes = useMemo(
    () =>
      MODES.filter((mode) => {
        if (mode.id === 'chavruta') return chavrutaAvailable;
        if (mode.id === 'steinsaltz') return steinsaltzAvailable;
        return true;
      }),
    [chavrutaAvailable, steinsaltzAvailable],
  );
  const modeIds = useMemo(() => visibleModes.map((mode) => mode.id), [visibleModes]);
  const { onSwitcherLayout, indicatorStyle, isReady } = useModeSwitcherIndicator(viewMode, modeIds);

  const handleDecreaseFont = () => {
    if (fontSize > READER_FONT_SIZE_MIN) {
      triggerImpact('light');
      onDecreaseFontSize();
    }
  };

  const handleIncreaseFont = () => {
    if (fontSize < READER_FONT_SIZE_MAX) {
      triggerImpact('light');
      onIncreaseFontSize();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.modeSwitcher} onLayout={onSwitcherLayout}>
        <Animated.View
          pointerEvents="none"
          style={[styles.modeIndicator, { backgroundColor: accentColor }, indicatorStyle]}
        />
        {visibleModes.map((mode) => {
          const isActive = viewMode === mode.id;
          const label = mode.id === 'classic' ? classicTabLabel : mode.label;
          return (
            <TouchableOpacity
              key={mode.id}
              style={[
                styles.modeButton,
                isActive && !isReady && { backgroundColor: accentColor },
              ]}
              onPress={() => onToggleViewMode(mode.id)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ selected: isActive }}
            >
              <Ionicons
                name={mode.icon}
                size={14}
                color={isActive ? onAccent : theme.colors.textMuted}
              />
              <Text
                numberOfLines={1}
                style={[
                  styles.modeText,
                  isActive ? styles.modeTextActive : styles.modeTextInactive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.controlsRow}>
        {showNotesToggle ? (
          <TouchableOpacity
            style={[styles.notesBtn, showNotes && styles.notesBtnActive]}
            onPress={onToggleNotes}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="הצגת הערות"
            accessibilityState={{ selected: showNotes }}
          >
            <Ionicons
              name="document-text-outline"
              size={14}
              color={showNotes ? onAccent : theme.colors.textMuted}
            />
            <Text style={[styles.notesBtnText, showNotes && styles.notesBtnTextActive]}>
              הערות
            </Text>
          </TouchableOpacity>
        ) : showNikudToggle ? (
          <TouchableOpacity
            style={[styles.notesBtn, gemaraNikud && styles.notesBtnActive]}
            onPress={onToggleGemaraNikud}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="ניקוד בגמרא"
            accessibilityState={{ selected: gemaraNikud }}
          >
            <Ionicons
              name="text-outline"
              size={14}
              color={gemaraNikud ? onAccent : theme.colors.textMuted}
            />
            <Text style={[styles.notesBtnText, gemaraNikud && styles.notesBtnTextActive]}>
              ניקוד
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.controlsSpacer} />
        )}

        <View style={styles.actionsRow}>
          {onChangeReaderTheme && (
            <TouchableOpacity
              style={styles.themeBtn}
              onPress={() => {
                triggerImpact('light');
                setShowThemeModal(true);
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="תצוגת קריאה"
            >
              <Ionicons
                name="contrast-outline"
                size={17}
                color={theme.colors.accent}
              />
            </TouchableOpacity>
          )}

          {onOpenGuide && (
            <TouchableOpacity
              style={styles.helpBtn}
              onPress={onOpenGuide}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="מדריך ושאלות נפוצות לקורא"
            >
              <Ionicons
                name="help-circle-outline"
                size={18}
                color={theme.colors.accent}
              />
            </TouchableOpacity>
          )}

          <View style={styles.fontControls}>
            <TouchableOpacity
              style={styles.fontBtn}
              onPress={handleDecreaseFont}
              disabled={fontSize <= READER_FONT_SIZE_MIN}
              activeOpacity={0.6}
              accessibilityLabel="הקטן גופן"
            >
              <Text style={[styles.fontBtnText, fontSize <= READER_FONT_SIZE_MIN && styles.btnDisabled]}>A-</Text>
            </TouchableOpacity>
            <Text style={styles.fontSizeLabel}>{fontSize}</Text>
            <TouchableOpacity
              style={styles.fontBtn}
              onPress={handleIncreaseFont}
              disabled={fontSize >= READER_FONT_SIZE_MAX}
              activeOpacity={0.6}
              accessibilityLabel="הגדל גופן"
            >
              <Text style={[styles.fontBtnText, fontSize >= READER_FONT_SIZE_MAX && styles.btnDisabled]}>A+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {onChangeReaderTheme && (
        <ReaderThemeModal
          visible={showThemeModal}
          onClose={() => setShowThemeModal(false)}
          currentTheme={readerTheme}
          onSelectTheme={onChangeReaderTheme}
          accentColor={accentColor}
        />
      )}
    </View>
  );
}
