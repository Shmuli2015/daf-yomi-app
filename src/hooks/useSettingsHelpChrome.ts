import { useCallback, useState } from 'react';
import { Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SUPPORT_EMAIL, PRIVACY_POLICY_URL } from '../supportContact';

type UseSettingsHelpChromeParams = {
  onEmailCopied: () => void;
};

export function useSettingsHelpChrome({ onEmailCopied }: UseSettingsHelpChromeParams) {
  const [mailHintVisible, setMailHintVisible] = useState(false);
  const [supportFormVisible, setSupportFormVisible] = useState(false);
  const [licensesVisible, setLicensesVisible] = useState(false);
  const [siyumNusachVisible, setSiyumNusachVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const copySupportEmail = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(SUPPORT_EMAIL);
      onEmailCopied();
    } catch {
      setMailHintVisible(true);
    }
  }, [onEmailCopied]);

  const openSupportForm = useCallback(() => {
    setSupportFormVisible(true);
  }, []);

  const closeSupportForm = useCallback(() => {
    setSupportFormVisible(false);
  }, []);

  const openMailHint = useCallback(() => {
    setMailHintVisible(true);
  }, []);

  const openPrivacyPolicy = useCallback(() => {
    void Linking.openURL(PRIVACY_POLICY_URL);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const openLicenses = useCallback(() => {
    setLicensesVisible(true);
  }, []);

  const closeLicenses = useCallback(() => {
    setLicensesVisible(false);
  }, []);

  const openSiyumNusach = useCallback(() => {
    setSiyumNusachVisible(true);
  }, []);

  const closeSiyumNusach = useCallback(() => {
    setSiyumNusachVisible(false);
  }, []);

  const closeMailHint = useCallback(() => {
    setMailHintVisible(false);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    clearSearch,
    mailHintVisible,
    closeMailHint,
    openMailHint,
    supportFormVisible,
    openSupportForm,
    closeSupportForm,
    licensesVisible,
    openLicenses,
    closeLicenses,
    siyumNusachVisible,
    openSiyumNusach,
    closeSiyumNusach,
    copySupportEmail,
    openPrivacyPolicy,
  };
}
