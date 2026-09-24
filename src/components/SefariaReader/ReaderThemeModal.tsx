import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '../BottomSheetModal';
import { useTheme } from '../../theme';
import { triggerImpact } from '../../utils/haptics';
import type { ReaderTheme } from './ReaderToolbar';
import { createReaderThemeModalStyles } from './ReaderThemeModal.styles';

interface ReaderThemeModalProps {
  visible: boolean;
  onClose: () => void;
  currentTheme: ReaderTheme;
  onSelectTheme: (theme: ReaderTheme) => void;
  accentColor?: string;
}

interface ThemeOptionItem {
  id: ReaderTheme;
  title: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  swatchBg: string;
  swatchBorder: string;
  swatchText: string;
  iconColor: string;
}

const THEME_OPTIONS: ThemeOptionItem[] = [
  {
    id: 'light',
    title: 'בהיר',
    desc: 'רקע לבן נקי וטקסט שחור קלאסי',
    icon: 'sunny',
    swatchBg: '#FFFFFF',
    swatchBorder: '#CBD5E1',
    swatchText: '#0F172A',
    iconColor: '#D97706',
  },
  {
    id: 'sepia',
    title: 'ספיה (דף ישן)',
    desc: 'גוון קלף חם ורך, מותאם לקריאה ממושכת',
    icon: 'book',
    swatchBg: '#FBF0D9',
    swatchBorder: '#D7C29E',
    swatchText: '#2C221E',
    iconColor: '#92400E',
  },
  {
    id: 'dark',
    title: 'כהה',
    desc: 'רקע שחור עמוק, מונע סנוור בלילה',
    icon: 'moon',
    swatchBg: '#121212',
    swatchBorder: '#3F3F46',
    swatchText: '#FFFFFF',
    iconColor: '#FBBF24',
  },
];

export default function ReaderThemeModal({
  visible,
  onClose,
  currentTheme,
  onSelectTheme,
  accentColor,
}: ReaderThemeModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createReaderThemeModalStyles(theme), [theme]);
  const effectiveAccent = accentColor || theme.colors.accent;

  const handleSelect = (selectedTheme: ReaderTheme) => {
    triggerImpact('light');
    onSelectTheme(selectedTheme);
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>תצוגת קריאה</Text>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="סגור"
          >
            <Ionicons name="close" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>בחר את ערכת הצבעים הנוחה ביותר עבורך</Text>

        <View style={styles.optionsList}>
          {THEME_OPTIONS.map((option) => {
            const isSelected = currentTheme === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  isSelected && [styles.optionCardActive, { borderColor: effectiveAccent }],
                ]}
                onPress={() => handleSelect(option.id)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`ערכת קריאה ${option.title}`}
                accessibilityState={{ selected: isSelected }}
              >
                <View
                  style={[
                    styles.previewSwatch,
                    {
                      backgroundColor: option.swatchBg,
                      borderColor: option.swatchBorder,
                    },
                  ]}
                >
                  <Text style={[styles.previewText, { color: option.swatchText }]}>
                    הדרן
                  </Text>
                </View>

                <View style={styles.optionInfo}>
                  <View style={styles.optionTitleRow}>
                    <Ionicons name={option.icon} size={15} color={option.iconColor} />
                    <Text style={styles.optionTitle}>{option.title}</Text>
                  </View>
                  <Text style={styles.optionDesc}>{option.desc}</Text>
                </View>

                <View
                  style={[
                    styles.checkCircle,
                    isSelected && [
                      styles.checkCircleActive,
                      { backgroundColor: effectiveAccent, borderColor: effectiveAccent },
                    ],
                  ]}
                >
                  {isSelected && (
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color={styles.checkIconColor.color}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </BottomSheetModal>
  );
}
