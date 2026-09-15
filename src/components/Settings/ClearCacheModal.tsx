import { useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { ClearCacheModalProps } from './ClearCacheModal.types';
import { createClearCacheModalStyles } from './ClearCacheModal.styles';
import BottomSheetModal from '../BottomSheetModal';

export default function ClearCacheModal({
  visible,
  formattedSize,
  isClearing,
  onClose,
  onConfirm,
}: ClearCacheModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createClearCacheModalStyles(theme), [theme]);

  return (
    <BottomSheetModal visible={visible} onClose={onClose} dismissible={!isClearing}>
      <View style={styles.headerRow}>
        <View style={styles.headerTitleGroup}>
          <View style={styles.headerIconCircle}>
            <Ionicons name="folder-open-outline" size={20} color={theme.colors.accent} />
          </View>
          <Text style={styles.title}>ניקוי קבצים שמורים</Text>
        </View>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          disabled={isClearing}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.contentBox}>
        <Text style={styles.message}>
          פעולה זו תמחק טקסטים של גמרא, שטיינזלץ וחברותא שהורדו למכשיר.
        </Text>

        <View style={styles.sizeRow}>
          <Text style={styles.sizeLabel}>מקום שיתפנה במכשיר:</Text>
          <View style={styles.sizeValueBadge}>
            <Text style={styles.sizeValueText}>{formattedSize}</Text>
          </View>
        </View>
      </View>

      <View style={styles.safeNoteRow}>
        <Ionicons name="shield-checkmark-outline" size={16} color={theme.colors.success} />
        <Text style={styles.safeNoteText}>
          סימוני הלימוד, הרצף וההגדרות שלך נשמרים תמיד ולא יימחקו.
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onClose}
          disabled={isClearing}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>ביטול</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.confirmButton,
            isClearing && styles.confirmButtonDisabled,
          ]}
          onPress={onConfirm}
          disabled={isClearing}
          activeOpacity={0.7}
        >
          {isClearing ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.confirmButtonText}>נקה עכשיו</Text>
          )}
        </TouchableOpacity>
      </View>
    </BottomSheetModal>
  );
}
