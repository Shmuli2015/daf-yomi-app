import React from 'react';
import { View, Text } from 'react-native';
import { SettingItem } from './SettingItem';
import { SectionHeader } from './SectionHeader';
import type { SettingsSectionChrome } from './settingsSection.types';
import { formatLastBackupAt, getBackupReminderText } from '../../utils/backupReminder';
import { isLastVisible, matchesAnySetting, matchesSetting, type SearchableSetting } from '../../utils/settingsSearch';

const SAVE_ITEM: SearchableSetting = {
  title: 'שמור גיבוי לקובץ',
  description: 'בחר תיקייה (למשל הורדות) ושמור קובץ JSON במכשיר',
  synonyms: ['גיבוי', 'קובץ', 'json', 'שמירה'],
};

const SHARE_ITEM: SearchableSetting = {
  title: 'שתף גיבוי',
  description: 'שלח את קובץ הגיבוי בוואטסאפ, דרייב או אפליקציה אחרת',
  synonyms: ['שיתוף', 'וואטסאפ', 'דרייב'],
};

const IMPORT_ITEM: SearchableSetting = {
  title: 'ייבא גיבוי',
  description: 'שחזור נתונים מקובץ גיבוי קודם',
  synonyms: ['שחזור', 'ייבוא', 'מיזוג', 'החלפה'],
};

type SettingsBackupSectionProps = SettingsSectionChrome & {
  lastBackupAt: string | null;
  onSaveBackupToFile?: () => void;
  onShareBackup?: () => void;
  onImportBackup?: () => void;
};

export const BACKUP_SEARCH_ITEMS: SearchableSetting[] = [SAVE_ITEM, SHARE_ITEM, IMPORT_ITEM];

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
  const showSave = onSaveBackupToFile != null && matchesSetting(searchQuery, { ...SAVE_ITEM, description: saveDescription });
  const showShare = onShareBackup != null && matchesSetting(searchQuery, SHARE_ITEM);
  const showImport = onImportBackup != null && matchesSetting(searchQuery, IMPORT_ITEM);
  if (!matchesAnySetting(searchQuery, [SAVE_ITEM, SHARE_ITEM, IMPORT_ITEM])) return null;
  const flags = [showSave, showShare, showImport];

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
            title={SHARE_ITEM.title}
            description={SHARE_ITEM.description}
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
