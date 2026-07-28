import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type ReaderTheme = 'light' | 'dark' | 'sepia';
export type ViewMode = 'pdf' | 'text';

interface ReaderToolbarProps {
  viewMode: ViewMode;
  onToggleViewMode: (mode: ViewMode) => void;
  fontSize: number;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  readerTheme?: ReaderTheme;
  onChangeReaderTheme?: (theme: ReaderTheme) => void;
  accentColor: string;
}

export default function ReaderToolbar({
  viewMode,
  onToggleViewMode,
  fontSize,
  onIncreaseFontSize,
  onDecreaseFontSize,
  accentColor,
}: ReaderToolbarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.modeSwitcher}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            viewMode === 'pdf' && { backgroundColor: accentColor },
          ]}
          onPress={() => onToggleViewMode('pdf')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="document-text-outline"
            size={14}
            color={viewMode === 'pdf' ? '#FFFFFF' : '#8E8E93'}
          />
          <Text
            style={[
              styles.modeText,
              viewMode === 'pdf' ? styles.modeTextActive : styles.modeTextInactive,
            ]}
          >
            צורת הדף
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeButton,
            viewMode === 'text' && { backgroundColor: accentColor },
          ]}
          onPress={() => onToggleViewMode('text')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="book-outline"
            size={14}
            color={viewMode === 'text' ? '#FFFFFF' : '#8E8E93'}
          />
          <Text
            style={[
              styles.modeText,
              viewMode === 'text' ? styles.modeTextActive : styles.modeTextInactive,
            ]}
          >
            טקסט ספריא
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'text' && (
        <View style={styles.rightControls}>
          <View style={styles.fontControls}>
            <TouchableOpacity
              style={styles.fontBtn}
              onPress={onDecreaseFontSize}
              disabled={fontSize <= 14}
              activeOpacity={0.7}
            >
              <Text style={[styles.fontBtnText, fontSize <= 14 && styles.btnDisabled]}>A-</Text>
            </TouchableOpacity>
            <Text style={styles.fontSizeLabel}>{fontSize}</Text>
            <TouchableOpacity
              style={styles.fontBtn}
              onPress={onIncreaseFontSize}
              disabled={fontSize >= 30}
              activeOpacity={0.7}
            >
              <Text style={[styles.fontBtnText, fontSize >= 30 && styles.btnDisabled]}>A+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  modeSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(150, 150, 150, 0.15)',
    borderRadius: 8,
    padding: 2,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  modeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modeTextActive: {
    color: '#FFFFFF',
  },
  modeTextInactive: {
    color: '#8E8E93',
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fontControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(150, 150, 150, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  fontBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  fontBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3A3A3C',
  },
  fontSizeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
    paddingHorizontal: 4,
  },
  btnDisabled: {
    opacity: 0.3,
  },
  themeSelector: {
    flexDirection: 'row',
    gap: 4,
  },
  themeChip: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  themeChipActive: {
    borderColor: '#D4AF37',
    borderWidth: 2,
  },
  themeLight: {
    backgroundColor: '#FFFFFF',
  },
  themeChipTextLight: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
  },
  themeSepia: {
    backgroundColor: '#FBF0D9',
  },
  themeChipTextSepia: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2C221E',
  },
  themeDark: {
    backgroundColor: '#1C1C1E',
  },
  themeChipTextDark: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
