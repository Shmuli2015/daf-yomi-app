import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import BottomSheetModal from '../BottomSheetModal';
import { useTheme } from '../../theme';
import type { AmudSide } from '../../utils/dafStatus';
import TzuratMarkTrackOption from './TzuratMarkTrackOption';
import { createTzuratMarkTrackModalStyles } from './TzuratMarkTrackModal.styles';

interface TzuratMarkTrackModalProps {
  visible: boolean;
  dafYomiStatus: 'none' | 'partial' | 'learned';
  personalStatus: 'none' | 'partial' | 'learned';
  dafYomiPartialAmud?: AmudSide | null;
  personalPartialAmud?: AmudSide | null;
  canMarkDafYomi: boolean;
  onSelectDafYomi: () => void;
  onSelectPersonal: () => void;
  onLongPressDafYomi: () => void;
  onLongPressPersonal: () => void;
  onCancel: () => void;
}

export default function TzuratMarkTrackModal({
  visible,
  dafYomiStatus,
  personalStatus,
  dafYomiPartialAmud = null,
  personalPartialAmud = null,
  canMarkDafYomi,
  onSelectDafYomi,
  onSelectPersonal,
  onLongPressDafYomi,
  onLongPressPersonal,
  onCancel,
}: TzuratMarkTrackModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createTzuratMarkTrackModalStyles(theme), [theme]);

  return (
    <BottomSheetModal visible={visible} onClose={onCancel}>
      <View style={styles.content}>
        <Text style={styles.title}>סימון לימוד</Text>
        <Text style={styles.subtitle}>באיזה מסלול לסמן את הדף?</Text>

        {canMarkDafYomi && (
          <TzuratMarkTrackOption
            icon="calendar-outline"
            title="דף יומי"
            status={dafYomiStatus}
            partialAmud={dafYomiPartialAmud}
            onPress={onSelectDafYomi}
            onLongPress={onLongPressDafYomi}
            styles={styles}
          />
        )}

        <TzuratMarkTrackOption
          icon="bookmark-outline"
          title="לימוד אישי"
          status={personalStatus}
          partialAmud={personalPartialAmud}
          onPress={onSelectPersonal}
          onLongPress={onLongPressPersonal}
          styles={styles}
        />

        <Text style={styles.hint}>לחיצה ארוכה על מסלול תפתח סימון חצי דף</Text>

        <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.7}>
          <Text style={styles.cancelText}>סגור</Text>
        </TouchableOpacity>
      </View>
    </BottomSheetModal>
  );
}
