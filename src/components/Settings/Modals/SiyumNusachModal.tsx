import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '../../BottomSheetModal';
import MasechetSelectList from '../../QuickJump/MasechetSelectList';
import { useTheme } from '../../../theme';
import { SHAS_MASECHTOT, type Masechet } from '../../../data/shas';
import { getSiyumNusachSections } from '../../../data/siyumNusach';
import { createSiyumNusachModalStyles } from './SiyumNusachModal.styles';

interface SiyumNusachModalProps {
  visible: boolean;
  onClose: () => void;
  initialMasechetEn?: string;
  initialMasechetHe?: string;
}

function resolveInitialMasechet(
  initialMasechetEn?: string,
  initialMasechetHe?: string,
): Masechet {
  if (initialMasechetEn) {
    const byEn = SHAS_MASECHTOT.find((masechet) => masechet.en === initialMasechetEn);
    if (byEn) return byEn;
  }
  if (initialMasechetHe) {
    const byHe = SHAS_MASECHTOT.find((masechet) => masechet.he === initialMasechetHe);
    if (byHe) return byHe;
  }
  return SHAS_MASECHTOT[0];
}

export default function SiyumNusachModal({
  visible,
  onClose,
  initialMasechetEn,
  initialMasechetHe,
}: SiyumNusachModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSiyumNusachModalStyles(theme), [theme]);
  const { height: windowHeight } = useWindowDimensions();
  const [selectedMasechet, setSelectedMasechet] = useState<Masechet>(() =>
    resolveInitialMasechet(initialMasechetEn, initialMasechetHe),
  );
  const [pickerExpanded, setPickerExpanded] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setSelectedMasechet(resolveInitialMasechet(initialMasechetEn, initialMasechetHe));
    setPickerExpanded(false);
  }, [visible, initialMasechetEn, initialMasechetHe]);

  const sections = useMemo(
    () => getSiyumNusachSections(selectedMasechet.he),
    [selectedMasechet.he],
  );

  const scrollMaxHeight = Math.min(560, Math.round(windowHeight * 0.62));

  const handleSelectMasechet = useCallback((masechet: Masechet) => {
    setSelectedMasechet(masechet);
    setPickerExpanded(false);
  }, []);

  return (
    <BottomSheetModal visible={visible} onClose={onClose} contentBottomGap={8}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitleGroup}>
            <View style={styles.headerIconCircle}>
              <Ionicons name="book-outline" size={20} color={theme.colors.accent} />
            </View>
            <Text style={styles.title}>נוסח סיום מסכת</Text>
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="סגור"
          >
            <Ionicons name="close" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.pickerToggle, pickerExpanded && styles.pickerToggleOpen]}
          onPress={() => setPickerExpanded((open) => !open)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`מסכת לסיום: ${selectedMasechet.he}`}
        >
          <Text style={styles.pickerToggleText}>{selectedMasechet.he}</Text>
          <Ionicons
            name={pickerExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={theme.colors.textMuted}
          />
        </TouchableOpacity>

        {pickerExpanded ? (
          <View style={styles.pickerList}>
            <MasechetSelectList
              masechtot={SHAS_MASECHTOT}
              selectedEn={selectedMasechet.en}
              onSelect={handleSelectMasechet}
            />
          </View>
        ) : null}

        <ScrollView
          style={[styles.scrollArea, { maxHeight: scrollMaxHeight }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator
          nestedScrollEnabled
        >
          {sections.map((section) => (
            <View key={section.id} style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionBody}>{section.body}</Text>
              {section.note ? <Text style={styles.sectionNote}>{section.note}</Text> : null}
            </View>
          ))}
        </ScrollView>
      </View>
    </BottomSheetModal>
  );
}
