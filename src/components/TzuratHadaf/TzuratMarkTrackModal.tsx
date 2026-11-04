import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import BottomSheetModal from '../BottomSheetModal';
import DafMarkMenuContent, { type DafMarkMenuContentProps } from '../DafMarkMenuContent';
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
  halfMenu?: DafMarkMenuContentProps | null;
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
  halfMenu = null,
}: TzuratMarkTrackModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createTzuratMarkTrackModalStyles(theme), [theme]);

  return (
    <BottomSheetModal visible={visible} onClose={onCancel}>
      {halfMenu ? <DafMarkMenuContent {...halfMenu} /> : null}
      <View
        style={[styles.content, halfMenu ? styles.hiddenContent : null]}
        pointerEvents={halfMenu ? 'none' : 'auto'}
      >
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
