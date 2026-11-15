import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '../BottomSheetModal';
import { useTheme } from '../../theme';
import { createTzuratStopPointModalStyles } from './TzuratStopPointModal.styles';

interface TzuratStopPointModalProps {
  visible: boolean;
  onClose: () => void;
  masechetName: string;
  dafLabel: string;
  currentStopPoint?: string | null;
  onSave: (note: string | null) => void;
}

export default function TzuratStopPointModal({
  visible,
  onClose,
  masechetName,
  dafLabel,
  currentStopPoint = null,
  onSave,
}: TzuratStopPointModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createTzuratStopPointModalStyles(theme), [theme]);
  const [noteText, setNoteText] = useState(currentStopPoint ?? '');

  useEffect(() => {
    if (visible) {
      setNoteText(currentStopPoint ?? '');
    }
  }, [visible, currentStopPoint]);

  const hasExisting = Boolean(currentStopPoint && currentStopPoint.trim());

  const handleSave = () => {
    onSave(noteText.trim() || null);
    onClose();
  };

  const handleDelete = () => {
    onSave(null);
    onClose();
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose} avoidKeyboard>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Ionicons name="bookmark" size={24} color={theme.colors.accent} />
          <Text style={styles.title}>נקודת עצירה בלימוד</Text>
        </View>
        <Text style={styles.subtitle}>
          {masechetName} {dafLabel}
        </Text>

        <TextInput
          style={styles.input}
          value={noteText}
          onChangeText={setNoteText}
          placeholder="למשל: סיימתי 3/4 עמוד, שורה 15..."
          placeholderTextColor={theme.colors.textMuted}
          textAlign="right"
          autoFocus
        />

        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>שמור נקודת עצירה</Text>
          </TouchableOpacity>
          {hasExisting && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteButtonText}>מחק</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.cancelButtonText}>ביטול</Text>
        </TouchableOpacity>
      </View>
    </BottomSheetModal>
  );
}
