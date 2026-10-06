import React, { useEffect, useMemo, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '../../BottomSheetModal';
import MasechetSelectList from '../../QuickJump/MasechetSelectList';
import { useTheme } from '../../../theme';
import { SHAS_MASECHTOT, type Masechet } from '../../../data/shas';
import { createOfflineMasechetPickerModalStyles } from './OfflineMasechetPickerModal.styles';

type OfflineMasechetPickerModalProps = {
  visible: boolean;
  initialMasechetEn?: string | null;
  onClose: () => void;
  onDownload: (masechetEn: string, masechetHe: string) => void;
};

function resolveInitialMasechet(initialMasechetEn?: string | null): Masechet {
  if (initialMasechetEn) {
    const match = SHAS_MASECHTOT.find((masechet) => masechet.en === initialMasechetEn);
    if (match) return match;
  }
  return SHAS_MASECHTOT[0];
}

export default function OfflineMasechetPickerModal({
  visible,
  initialMasechetEn,
  onClose,
  onDownload,
}: OfflineMasechetPickerModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createOfflineMasechetPickerModalStyles(theme), [theme]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMasechet, setSelectedMasechet] = useState<Masechet>(() =>
    resolveInitialMasechet(initialMasechetEn),
  );

  useEffect(() => {
    if (!visible) return;
    setSelectedMasechet(resolveInitialMasechet(initialMasechetEn));
    setSearchQuery('');
  }, [visible, initialMasechetEn]);

  const filteredMasechtot = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return SHAS_MASECHTOT;
    return SHAS_MASECHTOT.filter(
      (masechet) =>
        masechet.he.includes(query) || masechet.en.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  useEffect(() => {
    if (filteredMasechtot.length === 0) return;
    const stillVisible = filteredMasechtot.some(
      (masechet) => masechet.en === selectedMasechet.en,
    );
    if (!stillVisible) {
      setSelectedMasechet(filteredMasechtot[0]);
    }
  }, [filteredMasechtot, selectedMasechet.en]);

  const canDownload = filteredMasechtot.length > 0;

  return (
    <BottomSheetModal visible={visible} onClose={onClose} contentBottomGap={8}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitleGroup}>
            <View style={styles.headerIconCircle}>
              <Ionicons name="library-outline" size={20} color={theme.colors.accent} />
            </View>
            <View style={styles.titleGroup}>
              <Text style={styles.title}>בחר מסכת מהש״ס</Text>
              <Text style={styles.subtitle}>הורדת מסכת שלמה למכשיר</Text>
            </View>
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

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="חיפוש מסכת..."
            placeholderTextColor={theme.colors.textMuted}
            accessibilityLabel="חיפוש מסכת"
            autoCorrect={false}
          />
        </View>

        <View style={styles.pickerList}>
          {filteredMasechtot.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>לא נמצאו מסכתות</Text>
            </View>
          ) : (
            <MasechetSelectList
              masechtot={filteredMasechtot}
              selectedEn={selectedMasechet.en}
              onSelect={setSelectedMasechet}
            />
          )}
        </View>

        <TouchableOpacity
          style={[styles.downloadButton, !canDownload && styles.downloadButtonDisabled]}
          onPress={() => {
            if (!canDownload) return;
            onClose();
            onDownload(selectedMasechet.en, selectedMasechet.he);
          }}
          disabled={!canDownload}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`הורד מסכת ${selectedMasechet.he}`}
        >
          <Text style={styles.downloadButtonText}>הורד {selectedMasechet.he}</Text>
        </TouchableOpacity>
      </View>
    </BottomSheetModal>
  );
}
