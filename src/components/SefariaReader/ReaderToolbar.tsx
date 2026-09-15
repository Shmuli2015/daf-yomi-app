import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LIGHT_THEME, useTheme } from '../../theme';
import { useModeSwitcherIndicator } from '../../hooks/useModeSwitcherIndicator';
import { READER_FONT_SIZE_MAX, READER_FONT_SIZE_MIN } from '../../utils/readerFontSize';
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
  chavrutaAvailable?: boolean;
  steinsaltzAvailable?: boolean;
  classicTabLabel?: string;
}

const MODES: Array<{ id: ViewMode; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { id: 'classic', label: 'גמרא', icon: 'book-outline' },
  { id: 'steinsaltz', label: 'שטיינזלץ', icon: 'reader-outline' },
  { id: 'chavruta', label: 'חברותא', icon: 'people-outline' },
];

export default function ReaderToolbar({
  viewMode,
  onToggleViewMode,
  fontSize,
  onIncreaseFontSize,
  onDecreaseFontSize,
  accentColor,
  showNotes = false,
  onToggleNotes,
  chavrutaAvailable = true,
  steinsaltzAvailable = true,
  classicTabLabel = 'גמרא',
}: ReaderToolbarProps) {
  const theme = useTheme();
  const styles = useMemo(() => createReaderToolbarStyles(theme), [theme]);
  const onAccent = LIGHT_THEME.colors.surface;
  const showNotesToggle = viewMode === 'chavruta' && onToggleNotes != null;
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
        ) : (
          <View style={styles.controlsSpacer} />
        )}

        <View style={styles.fontControls}>
          <TouchableOpacity
            style={styles.fontBtn}
            onPress={onDecreaseFontSize}
            disabled={fontSize <= READER_FONT_SIZE_MIN}
            activeOpacity={0.7}
            accessibilityLabel="הקטן גופן"
          >
            <Text style={[styles.fontBtnText, fontSize <= READER_FONT_SIZE_MIN && styles.btnDisabled]}>A-</Text>
          </TouchableOpacity>
          <Text style={styles.fontSizeLabel}>{fontSize}</Text>
          <TouchableOpacity
            style={styles.fontBtn}
            onPress={onIncreaseFontSize}
            disabled={fontSize >= READER_FONT_SIZE_MAX}
            activeOpacity={0.7}
            accessibilityLabel="הגדל גופן"
          >
            <Text style={[styles.fontBtnText, fontSize >= READER_FONT_SIZE_MAX && styles.btnDisabled]}>A+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
