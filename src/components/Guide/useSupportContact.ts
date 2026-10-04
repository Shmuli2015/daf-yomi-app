import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SUPPORT_EMAIL, getSupportMailtoUrl } from '../../supportContact';
import { triggerImpact } from '../../utils/haptics';

const COPIED_FEEDBACK_DURATION_MS = 2500;

export function useSupportContact() {
  const [mailHintVisible, setMailHintVisible] = useState(false);
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

  const openSupportEmail = useCallback(async (subject?: string) => {
    try {
      await Linking.openURL(getSupportMailtoUrl(subject));
    } catch {
      setMailHintVisible(true);
    }
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

  const dismissMailHint = useCallback(() => {
    setMailHintVisible(false);
  }, []);

  return {
    mailHintVisible,
    emailCopied,
    openSupportEmail,
    copySupportEmail,
    dismissMailHint,
  };
}
