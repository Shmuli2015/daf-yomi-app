import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { createDafMarkMenuStyles } from './DafMarkMenuContent.styles';

export interface DafMarkMenuContentProps {
  onSelectFull: () => void;
  onSelectHalfA: () => void;
  onSelectHalfB: () => void;
  onCancel: () => void;
  showUnmark?: boolean;
  onUnmark?: () => void;
  partialAmud?: 'a' | 'b' | null;
  stopPoint?: string | null;
  onSaveStopPoint?: (note: string | null) => void;
  onOpenTzuratHadaf?: () => void;
}

export default function DafMarkMenuContent({
  onSelectFull,
  onSelectHalfA,
  onSelectHalfB,
  onCancel,
  showUnmark = false,
  onUnmark,
  partialAmud = null,
  stopPoint = null,
  onSaveStopPoint,
  onOpenTzuratHadaf,
}: DafMarkMenuContentProps) {
  const theme = useTheme();
  const styles = useMemo(() => createDafMarkMenuStyles(theme), [theme]);
  const [isEditingStopPoint, setIsEditingStopPoint] = useState(false);
  const [stopPointInput, setStopPointInput] = useState(stopPoint ?? '');

  useEffect(() => {
    setStopPointInput(stopPoint ?? '');
  }, [stopPoint]);

  const hasStopPoint = Boolean(stopPoint && stopPoint.trim());

  const handleSaveNote = () => {
    if (onSaveStopPoint) {
      onSaveStopPoint(stopPointInput.trim() || null);
    }
    setIsEditingStopPoint(false);
  };

  const handleDeleteNote = () => {
    if (onSaveStopPoint) {
      onSaveStopPoint(null);
    }
    setStopPointInput('');
    setIsEditingStopPoint(false);
  };

  return (
    <View style={styles.content}>
      <Text style={styles.title}>סימון לימוד</Text>
      <Text style={styles.subtitle}>בחרו כמה למדתם היום</Text>

      <TouchableOpacity style={styles.optionButton} onPress={onSelectFull} activeOpacity={0.8}>
        <Ionicons name="checkmark-circle" size={22} color={theme.colors.success} />
        <Text style={styles.optionText}>דף מלא</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionButton} onPress={onSelectHalfA} activeOpacity={0.8}>
        <Ionicons
          name={partialAmud === 'a' ? 'checkmark-circle' : 'remove-circle-outline'}
          size={22}
          color={partialAmud === 'a' ? theme.colors.success : theme.colors.accent}
        />
        <Text style={[styles.optionText, partialAmud === 'a' && styles.optionTextDone]}>
          חצי דף (א){partialAmud === 'a' ? ' ✓' : ''}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionButton} onPress={onSelectHalfB} activeOpacity={0.8}>
        <Ionicons
          name={partialAmud === 'b' ? 'checkmark-circle' : 'remove-circle-outline'}
          size={22}
          color={partialAmud === 'b' ? theme.colors.success : theme.colors.accent}
        />
        <Text style={[styles.optionText, partialAmud === 'b' && styles.optionTextDone]}>
          חצי דף (ב){partialAmud === 'b' ? ' ✓' : ''}
        </Text>
      </TouchableOpacity>

      {onSaveStopPoint && (
        isEditingStopPoint ? (
          <View style={styles.stopPointCard}>
            <Text style={styles.stopPointLabel}>איפה עצרת בלימוד?</Text>
            <TextInput
              style={styles.stopPointInput}
              value={stopPointInput}
              onChangeText={setStopPointInput}
              placeholder="למשל: סיימתי 3/4 עמוד, שורה 15..."
              placeholderTextColor={theme.colors.textMuted}
              textAlign="right"
              autoFocus
            />
            <View style={styles.stopPointButtonsRow}>
              <TouchableOpacity
                style={styles.stopPointSaveBtn}
                onPress={handleSaveNote}
                activeOpacity={0.8}
              >
                <Text style={styles.stopPointSaveText}>שמור</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.stopPointCancelBtn}
                onPress={() => setIsEditingStopPoint(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.stopPointCancelText}>ביטול</Text>
              </TouchableOpacity>
              {hasStopPoint && (
                <TouchableOpacity
                  style={styles.stopPointDeleteBtn}
                  onPress={handleDeleteNote}
                  activeOpacity={0.8}
                >
                  <Text style={styles.stopPointDeleteText}>מחק</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => setIsEditingStopPoint(true)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={hasStopPoint ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={hasStopPoint ? theme.colors.success : theme.colors.accent}
            />
            <Text style={[styles.optionText, hasStopPoint && styles.optionTextDone]} numberOfLines={1}>
              {hasStopPoint ? `נקודת עצירה: ${stopPoint}` : 'נקודת עצירה / איפה עצרתי'}
            </Text>
          </TouchableOpacity>
        )
      )}

      {onOpenTzuratHadaf && (
        <TouchableOpacity style={styles.optionButton} onPress={onOpenTzuratHadaf} activeOpacity={0.8}>
          <Ionicons name="book-outline" size={22} color={theme.colors.accent} />
          <Text style={styles.optionText}>פתח בקורא</Text>
        </TouchableOpacity>
      )}

      {showUnmark && onUnmark && (
        <TouchableOpacity style={styles.unmarkButton} onPress={onUnmark} activeOpacity={0.8}>
          <Ionicons name="close-circle-outline" size={22} color={theme.colors.danger} />
          <Text style={styles.unmarkText}>בטל סימון</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.7}>
        <Text style={styles.cancelText}>סגור</Text>
      </TouchableOpacity>
    </View>
  );
}

