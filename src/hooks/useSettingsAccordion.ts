import { useState, useCallback } from 'react';

export type SettingsSectionKey =
  | 'notifications'
  | 'reader'
  | 'display'
  | 'backup_data'
  | 'help_updates';

export function useSettingsAccordion(initialOpenSection: SettingsSectionKey | null = null) {
  const [openSection, setOpenSection] = useState<SettingsSectionKey | null>(initialOpenSection);

  const toggleSection = useCallback((section: SettingsSectionKey) => {
    setOpenSection(prev => (prev === section ? null : section));
  }, []);

  const openSectionByName = useCallback((section: SettingsSectionKey) => {
    setOpenSection(section);
  }, []);

  const closeAll = useCallback(() => {
    setOpenSection(null);
  }, []);

  return {
    openSection,
    toggleSection,
    openSectionByName,
    closeAll,
  };
}
