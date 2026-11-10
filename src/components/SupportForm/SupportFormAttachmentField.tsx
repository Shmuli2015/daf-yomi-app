import React, { useMemo } from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import {
  SUPPORT_FORM_ATTACHMENT_MAX_COUNT,
  type SupportFormAttachmentDraft,
} from '../../utils/supportFormAttachment';
import { createSupportFormAttachmentFieldStyles } from './SupportFormAttachmentField.styles';

type SupportFormAttachmentFieldProps = {
  attachments: SupportFormAttachmentDraft[];
  error?: string;
  isBusy: boolean;
  onPick: () => void;
  onRemove: (id: string) => void;
};

export default function SupportFormAttachmentField({
  attachments,
  error,
  isBusy,
  onPick,
  onRemove,
}: SupportFormAttachmentFieldProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSupportFormAttachmentFieldStyles(theme), [theme]);
  const canAddMore = attachments.length < SUPPORT_FORM_ATTACHMENT_MAX_COUNT;

  return (
    <View style={styles.root}>
      {attachments.length > 0 ? (
        <View style={styles.previewList}>
          {attachments.map((item) => (
            <View key={item.id} style={styles.previewItem}>
              <Image source={{ uri: item.previewUri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => onRemove(item.id)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`הסרת תמונה ${attachments.indexOf(item) + 1}`}
              >
                <Ionicons name="close" size={14} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : null}

      {canAddMore ? (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={onPick}
          disabled={isBusy}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="צירוף תמונות"
          accessibilityState={{ disabled: isBusy, busy: isBusy }}
        >
          {isBusy ? (
            <ActivityIndicator color={theme.colors.accent} />
          ) : (
            <>
              <Ionicons name="image-outline" size={18} color={theme.colors.textPrimary} />
              <Text style={styles.addBtnText}>
                {attachments.length > 0 ? 'הוספת תמונות' : 'צירוף תמונות'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      ) : null}

      <Text style={styles.hint}>
        {attachments.length} מתוך {SUPPORT_FORM_ATTACHMENT_MAX_COUNT} תמונות. התמונות מצורפות רק
        בשליחה ישירה.
      </Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}
