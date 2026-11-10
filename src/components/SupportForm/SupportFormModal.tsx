import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import BottomSheetModal from '../BottomSheetModal';
import Toast from '../Toast';
import SupportFormAttachmentField from './SupportFormAttachmentField';
import SupportFormCategoryChips from './SupportFormCategoryChips';
import SupportFormFieldLabel from './SupportFormFieldLabel';
import { useSupportForm } from '../../hooks/useSupportForm';
import { useKeyboardHeight } from '../../hooks/useKeyboardHeight';
import {
  SUPPORT_FORM_MESSAGE_MAX_LENGTH,
  SUPPORT_FORM_MESSAGE_PLACEHOLDERS,
  type SupportFormCategory,
} from '../../utils/supportFormValidation';
import { createSupportFormModalStyles } from './SupportFormModal.styles';

type SupportFormModalProps = {
  visible: boolean;
  onClose: () => void;
  onMailOpenFailed: () => void;
  initialCategory?: SupportFormCategory;
  initialMessage?: string;
  subjectOverride?: string;
};

export default function SupportFormModal({
  visible,
  onClose,
  onMailOpenFailed,
  initialCategory,
  initialMessage,
  subjectOverride,
}: SupportFormModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSupportFormModalStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const {
    category,
    setCategory,
    message,
    setMessage,
    replyEmail,
    setReplyEmail,
    phone,
    setPhone,
    honeypot,
    setHoneypot,
    attachments,
    attachmentError,
    isPickingAttachment,
    pickAttachment,
    removeAttachment,
    fieldErrors,
    submitError,
    submitFailed,
    isSubmitting,
    successToastVisible,
    dismissSuccessToast,
    requestClose,
    handleSubmit,
    openMailDraft,
  } = useSupportForm({
    visible,
    initialCategory,
    initialMessage,
    subjectOverride,
    onClose,
    onMailOpenFailed,
  });
  const keyboardHeight = useKeyboardHeight(visible);
  const { height: windowHeight } = useWindowDimensions();

  const sheetChromeHeight = 48 + Math.max(insets.bottom, 12) + 24 + 130;
  const scrollMaxHeight = Math.max(
    windowHeight * 0.9 - sheetChromeHeight - (keyboardHeight > 0 ? keyboardHeight : 0),
    160,
  );

  return (
    <>
      <BottomSheetModal visible={visible} onClose={requestClose} dismissible={!isSubmitting}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.root}
        >
          <ScrollView
            style={{ maxHeight: scrollMaxHeight }}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.header}>
              <View style={styles.headerIconCircle}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.colors.accent} />
              </View>
              <Text style={styles.title}>פנייה ותמיכה</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={requestClose}
                disabled={isSubmitting}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="סגור"
                accessibilityState={{ disabled: isSubmitting }}
              >
                <Ionicons name="close" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.introText}>שדות המסומנים בכוכבית הם שדות חובה.</Text>

            <SupportFormFieldLabel required>סוג הפנייה</SupportFormFieldLabel>
            <SupportFormCategoryChips value={category} onChange={setCategory} />

            <SupportFormFieldLabel required>ההודעה</SupportFormFieldLabel>
            <TextInput
              style={[styles.input, styles.messageInput, fieldErrors.message ? styles.inputError : null]}
              value={message}
              onChangeText={setMessage}
              placeholder={SUPPORT_FORM_MESSAGE_PLACEHOLDERS[category]}
              placeholderTextColor={theme.colors.textMuted}
              multiline
              textAlignVertical="top"
              accessibilityLabel="ההודעה"
            />
            {fieldErrors.message ? <Text style={styles.errorText}>{fieldErrors.message}</Text> : null}
            <Text style={styles.characterCount}>
              {message.length.toLocaleString('he-IL')} / {SUPPORT_FORM_MESSAGE_MAX_LENGTH.toLocaleString('he-IL')}
            </Text>

            <SupportFormFieldLabel>תמונות</SupportFormFieldLabel>
            <SupportFormAttachmentField
              attachments={attachments}
              error={attachmentError ?? undefined}
              isBusy={isPickingAttachment}
              onPick={() => {
                void pickAttachment();
              }}
              onRemove={removeAttachment}
            />

            <Text style={styles.sectionTitle}>פרטי קשר לחזרה</Text>
            <Text style={styles.sectionHint}>אפשר להשאיר אימייל, טלפון או את שניהם.</Text>

            <SupportFormFieldLabel>אימייל לחזרה</SupportFormFieldLabel>
            <TextInput
              style={[
                styles.input,
                styles.contactInput,
                fieldErrors.replyEmail ? styles.inputError : null,
              ]}
              value={replyEmail}
              onChangeText={setReplyEmail}
              placeholder="name@example.com"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="אימייל לחזרה"
            />
            {fieldErrors.replyEmail ? (
              <Text style={styles.errorText}>{fieldErrors.replyEmail}</Text>
            ) : null}

            <SupportFormFieldLabel>טלפון לחזרה</SupportFormFieldLabel>
            <TextInput
              style={[styles.input, styles.contactInput, fieldErrors.phone ? styles.inputError : null]}
              value={phone}
              onChangeText={setPhone}
              placeholder="050-123-4567"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="phone-pad"
              accessibilityLabel="טלפון לחזרה"
            />
            {fieldErrors.phone ? <Text style={styles.errorText}>{fieldErrors.phone}</Text> : null}

            <TextInput
              style={styles.honeypot}
              value={honeypot}
              onChangeText={setHoneypot}
              accessible={false}
              importantForAccessibility="no"
            />

            {submitError ? (
              <View style={styles.submitErrorBox}>
                <Text style={styles.submitErrorText}>{submitError}</Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.actions}>
            {submitFailed ? (
              <>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => {
                    void openMailDraft();
                  }}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="פתיחה במייל"
                  accessibilityHint="פותח טיוטת מייל ללא התמונות המצורפות"
                >
                  <Text style={styles.primaryBtnText}>פתיחה במייל</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => {
                    void handleSubmit();
                  }}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="נסה שוב לשלוח"
                  accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={theme.colors.accent} />
                  ) : (
                    <>
                      <Ionicons name="refresh-outline" size={17} color={theme.colors.accent} />
                      <Text style={styles.secondaryBtnText}>נסה שוב</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.primaryBtn, isSubmitting && styles.primaryBtnDisabled]}
                  onPress={() => {
                    void handleSubmit();
                  }}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="שליחה"
                  accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={theme.colors.white} />
                  ) : (
                    <>
                      <Ionicons
                        name="send-outline"
                        size={17}
                        color={theme.colors.white}
                        style={styles.sendIconMirrored}
                      />
                      <Text style={styles.primaryBtnText}>שליחה</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => {
                    void openMailDraft();
                  }}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="פתיחה במייל"
                  accessibilityHint="פותח טיוטת מייל ללא התמונות המצורפות"
                >
                  <Text style={styles.secondaryBtnText}>פתיחה במייל</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {keyboardHeight > 0 ? <View style={{ height: keyboardHeight }} /> : null}
        </KeyboardAvoidingView>
      </BottomSheetModal>

      <Toast
        visible={successToastVisible}
        onClose={dismissSuccessToast}
        title="הפנייה נשלחה"
        message="תודה! קיבלנו את ההודעה ונחזור אליכם אם צריך."
        iconName="checkmark-circle"
      />
    </>
  );
}
