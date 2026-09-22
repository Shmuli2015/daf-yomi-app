import React from 'react';
import { View, Text } from 'react-native';
import { SettingItem } from '../SettingItem';
import { SectionHeader } from '../SectionHeader';
import type { SettingsSectionChrome } from '../settingsSection.types';
import { formatLastBackupAt, getBackupReminderText } from '../../../utils/backupReminder';
import { isLastVisible, matchesSetting } from '../../../utils/settingsSearch';
import {
  BACKUP_SEARCH_ITEMS,
  IMPORT_ITEM,
  SAVE_ITEM,
  SHARE_BACKUP_ITEM,
} from '../../../utils/settingsSearchCatalog';

type SettingsBackupSectionProps = SettingsSectionChrome & {
  lastBackupAt: string | null;
  onSaveBackupToFile?: () => void;
  onShareBackup?: () => void;
  onImportBackup?: () => void;
};

export { BACKUP_SEARCH_ITEMS };

export default function SettingsBackupSection({
  styles,
  searchQuery,
  isFirst,
  lastBackupAt,
  onSaveBackupToFile,
  onShareBackup,
  onImportBackup,
}: SettingsBackupSectionProps) {
  const lastLabel = formatLastBackupAt(lastBackupAt);
  const reminder = getBackupReminderText(lastBackupAt);
  const saveDescription = lastLabel
    ? `${SAVE_ITEM.description}. גובה לאחרונה ב-${lastLabel}`
    : SAVE_ITEM.description;
  const showSave =
    onSaveBackupToFile != null &&
    matchesSetting(searchQuery, { ...SAVE_ITEM, description: saveDescription });
  const showShare = onShareBackup != null && matchesSetting(searchQuery, SHARE_BACKUP_ITEM);
  const showImport = onImportBackup != null && matchesSetting(searchQuery, IMPORT_ITEM);
  const flags = [showSave, showShare, showImport];
  if (!flags.some(Boolean)) return null;

  return (
    <>
      <SectionHeader title="גיבוי ושחזור" icon="cloud-upload-outline" isFirst={isFirst} />
      <View style={styles.card}>
        {showSave ? (
          <SettingItem
            icon="save-outline"
            title={SAVE_ITEM.title}
            description={saveDescription}
            onPress={onSaveBackupToFile}
            isLast={isLastVisible(flags, 0)}
            highlightText={searchQuery}
          />
        ) : null}
        {showShare ? (
          <SettingItem
            icon="share-outline"
            title={SHARE_BACKUP_ITEM.title}
            description={SHARE_BACKUP_ITEM.description}
            onPress={onShareBackup}
            isLast={isLastVisible(flags, 1)}
            highlightText={searchQuery}
          />
        ) : null}
        {showImport ? (
          <SettingItem
            icon="cloud-upload-outline"
            title={IMPORT_ITEM.title}
            description={IMPORT_ITEM.description}
            onPress={onImportBackup}
            isLast={isLastVisible(flags, 2)}
            highlightText={searchQuery}
          />
        ) : null}
      </View>
      {reminder && !searchQuery.trim() ? (
        <Text style={styles.backupHint}>{reminder}</Text>
      ) : null}
    </>
  );
}
