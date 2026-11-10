import { useCallback, useEffect, useRef, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { SUPPORT_EMAIL } from '../../supportContact';
import { triggerImpact } from '../../utils/haptics';

const COPIED_FEEDBACK_DURATION_MS = 2500;

export function useSupportContact() {
  const [mailHintVisible, setMailHintVisible] = useState(false);
  const [supportFormVisible, setSupportFormVisible] = useState(false);
  const [supportSubjectOverride, setSupportSubjectOverride] = useState<string | undefined>();
  const [emailCopied, setEmailCopied] = useState(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (copiedTimerRef.current) {
        clearTimeout(copiedTimerRef.current);
      }
    },
    [],
  );

  const openSupportForm = useCallback((subject?: string) => {
    setSupportSubjectOverride(subject?.trim() ? subject.trim() : undefined);
    setSupportFormVisible(true);
  }, []);

  const closeSupportForm = useCallback(() => {
    setSupportFormVisible(false);
    setSupportSubjectOverride(undefined);
  }, []);

  const copySupportEmail = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(SUPPORT_EMAIL);
      triggerImpact('light');
      setEmailCopied(true);
      if (copiedTimerRef.current) {
        clearTimeout(copiedTimerRef.current);
      }
      copiedTimerRef.current = setTimeout(
        () => setEmailCopied(false),
        COPIED_FEEDBACK_DURATION_MS,
      );
    } catch {
      setMailHintVisible(true);
    }
  }, []);

  const openMailHint = useCallback(() => {
    setMailHintVisible(true);
  }, []);

  const dismissMailHint = useCallback(() => {
    setMailHintVisible(false);
  }, []);

  return {
    mailHintVisible,
    emailCopied,
    supportFormVisible,
    supportSubjectOverride,
    openSupportForm,
    closeSupportForm,
    copySupportEmail,
    openMailHint,
    dismissMailHint,
  };
}
