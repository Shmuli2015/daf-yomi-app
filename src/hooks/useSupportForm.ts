import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { getSupportMailtoUrlFromDraft } from '../supportContact';
import {
  buildSupportFormPayload,
  getSupportFormErrorMessage,
  isSupportFormConfigured,
  submitSupportForm,
  type SupportFormSubmitError,
} from '../services/supportForm';
import { pickSupportFormAttachments } from '../services/supportFormAttachment';
import {
  SUPPORT_FORM_ATTACHMENT_MAX_COUNT,
  type SupportFormAttachmentDraft,
} from '../utils/supportFormAttachment';
import {
  hasSupportFormFieldErrors,
  validateSupportFormInput,
  type SupportFormCategory,
  type SupportFormFieldErrors,
} from '../utils/supportFormValidation';
import { triggerImpact, triggerSuccess } from '../utils/haptics';

type UseSupportFormParams = {
  visible: boolean;
  initialCategory?: SupportFormCategory;
  initialMessage?: string;
  subjectOverride?: string;
  onClose: () => void;
  onMailOpenFailed: () => void;
};

export function useSupportForm({
  visible,
  initialCategory = 'bug',
  initialMessage = '',
  subjectOverride,
  onClose,
  onMailOpenFailed,
}: UseSupportFormParams) {
  const [category, setCategory] = useState<SupportFormCategory>(initialCategory);
  const [message, setMessage] = useState(initialMessage);
  const [replyEmail, setReplyEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [attachments, setAttachments] = useState<SupportFormAttachmentDraft[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [isPickingAttachment, setIsPickingAttachment] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<SupportFormFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitFailed, setSubmitFailed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToastVisible, setSuccessToastVisible] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setCategory(initialCategory);
    setMessage(initialMessage);
    setReplyEmail('');
    setPhone('');
    setHoneypot('');
    setAttachments([]);
    setAttachmentError(null);
    setIsPickingAttachment(false);
    setFieldErrors({});
    setSubmitError(null);
    setSubmitFailed(false);
    setIsSubmitting(false);
    submittingRef.current = false;
  }, [visible, initialCategory, initialMessage]);

  useEffect(() => {
    if (!successToastVisible) {
      return;
    }
    const timer = setTimeout(() => {
      setSuccessToastVisible(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [successToastVisible]);

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
    setAttachmentError(null);
    setSubmitError(null);
  }, []);

  const updateCategory = useCallback((value: SupportFormCategory) => {
    setCategory(value);
    setSubmitError(null);
    setSubmitFailed(false);
  }, []);

  const updateMessage = useCallback((value: string) => {
    setMessage(value);
    setFieldErrors((prev) => ({ ...prev, message: undefined }));
    setSubmitError(null);
    setSubmitFailed(false);
  }, []);

  const updateReplyEmail = useCallback((value: string) => {
    setReplyEmail(value);
    setFieldErrors((prev) => ({ ...prev, replyEmail: undefined }));
    setSubmitError(null);
    setSubmitFailed(false);
  }, []);

  const updatePhone = useCallback((value: string) => {
    setPhone(value);
    setFieldErrors((prev) => ({ ...prev, phone: undefined }));
    setSubmitError(null);
    setSubmitFailed(false);
  }, []);

  const pickAttachment = useCallback(async () => {
    const remainingSlots = SUPPORT_FORM_ATTACHMENT_MAX_COUNT - attachments.length;
    setIsPickingAttachment(true);
    setAttachmentError(null);
    const result = await pickSupportFormAttachments(remainingSlots);
    setIsPickingAttachment(false);
    if (result.ok) {
      setAttachments((prev) => [...prev, ...result.attachments].slice(0, SUPPORT_FORM_ATTACHMENT_MAX_COUNT));
      setSubmitError(null);
      setSubmitFailed(false);
      return;
    }
    if (result.cancelled) {
      return;
    }
    setAttachmentError(result.error);
  }, [attachments.length]);

  const openMailDraft = useCallback(async () => {
    const draft = {
      category,
      message: message.trim(),
      replyEmail: replyEmail.trim() || undefined,
      phone: phone.trim() || undefined,
      subjectOverride,
    };
    try {
      await Linking.openURL(getSupportMailtoUrlFromDraft(draft));
    } catch {
      onMailOpenFailed();
    }
  }, [category, message, replyEmail, phone, subjectOverride, onMailOpenFailed]);

  const dismissSuccessToast = useCallback(() => {
    setSuccessToastVisible(false);
  }, []);

  const hasDraft =
    category !== initialCategory ||
    message.trim() !== initialMessage.trim() ||
    replyEmail.trim().length > 0 ||
    phone.trim().length > 0 ||
    attachments.length > 0;

  const requestClose = useCallback(() => {
    if (!hasDraft || isSubmitting) {
      if (!isSubmitting) {
        onClose();
      }
      return;
    }
    Alert.alert(
      'לסגור את הטופס?',
      'הפרטים שמילאתם יימחקו.',
      [
        { text: 'המשך עריכה', style: 'cancel' },
        { text: 'סגירת הטופס', style: 'destructive', onPress: onClose },
      ],
      { cancelable: true },
    );
  }, [hasDraft, isSubmitting, onClose]);

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current) {
      return;
    }
    const input = { category, message, replyEmail, phone };
    const errors = validateSupportFormInput(input);
    setFieldErrors(errors);
    if (hasSupportFormFieldErrors(errors)) {
      setSubmitError(null);
      setSubmitFailed(false);
      return;
    }

    if (!isSupportFormConfigured()) {
      setSubmitFailed(true);
      setSubmitError(getSupportFormErrorMessage('not_configured'));
      return;
    }

    const payload = buildSupportFormPayload({
      ...input,
      subjectOverride,
      honeypot,
      attachments: attachments.map((item) => ({
        filename: item.filename,
        contentType: item.contentType,
        contentBase64: item.contentBase64,
      })),
    });
    if (!payload) {
      setSubmitFailed(true);
      setSubmitError(getSupportFormErrorMessage('validation'));
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitFailed(false);
    const result = await submitSupportForm(payload);
    submittingRef.current = false;
    setIsSubmitting(false);

    if (result.ok) {
      void triggerSuccess();
      setSuccessToastVisible(true);
      onClose();
      return;
    }

    const errorCode: SupportFormSubmitError = result.error;
    setSubmitFailed(true);
    setSubmitError(getSupportFormErrorMessage(errorCode));
    triggerImpact('medium');
  }, [category, message, replyEmail, phone, subjectOverride, honeypot, attachments, onClose]);

  return {
    category,
    setCategory: updateCategory,
    message,
    setMessage: updateMessage,
    replyEmail,
    setReplyEmail: updateReplyEmail,
    phone,
    setPhone: updatePhone,
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
  };
}
