import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { SettingItem } from '../SettingItem';
import { SectionHeader } from '../SectionHeader';
import SettingsChoiceModal from '../Modals/SettingsChoiceModal';
import type { SettingsSectionChrome } from '../settingsSection.types';
import { useTheme } from '../../../theme';
import {
  autoBackupIntervalLabel,
  normalizeAutoBackupInterval,
  type AutoBackupInterval,
} from '../../../utils/autoBackupInterval';
import type { SettingsChoiceOption } from '../Modals/SettingsChoiceModal';
import {
  autoBackupFailureMessage,
  autoBackupIssueMessage,
  normalizeAutoBackupIssue,
} from '../../../utils/autoBackupIssue';
import { formatLastBackupAt, getBackupReminderText } from '../../../utils/backupReminder';
import { isLastVisible, matchesSetting } from '../../../utils/settingsSearch';
import {
  AUTO_BACKUP_FOLDER_ITEM,
  AUTO_BACKUP_INTERVAL_ITEM,
  AUTO_BACKUP_ITEM,
  BACKUP_SEARCH_ITEMS,
  IMPORT_ITEM,
  SAVE_ITEM,
  SHARE_BACKUP_ITEM,
} from '../../../utils/settingsSearchCatalog';

const INTERVAL_OPTIONS: Array<SettingsChoiceOption<AutoBackupInterval>> = [
  { value: 'daily', label: 'יומי', icon: 'today-outline' },
  { value: 'weekly', label: 'שבועי', icon: 'calendar-outline' },
  { value: 'monthly', label: 'חודשי', icon: 'calendar-number-outline' },
];

type SettingsBackupSectionProps = SettingsSectionChrome & {
  showTrailingDivider?: boolean;
  lastBackupAt: string | null;
  autoBackupAvailable?: boolean;
  autoBackupEnabled?: boolean;
  autoBackupInterval?: string;
  autoBackupFailed?: boolean;
  autoBackupIssue?: string | null;
  onAutoBackupToggle?: (enabled: boolean) => void;
  onAutoBackupIntervalChange?: (interval: AutoBackupInterval) => void;
  onChangeAutoBackupFolder?: () => void;
  onSaveBackupToFile?: () => void;
  onShareBackup?: () => void;
  onImportBackup?: () => void;
};

export { BACKUP_SEARCH_ITEMS };

export default function SettingsBackupSection({
  styles,
  searchQuery,
  isFirst,
  embedded,
  showTrailingDivider = false,
  lastBackupAt,
  autoBackupAvailable = false,
  autoBackupEnabled = false,
  autoBackupInterval = 'weekly',
  autoBackupFailed = false,
  autoBackupIssue = null,
  onAutoBackupToggle,
  onAutoBackupIntervalChange,
  onChangeAutoBackupFolder,
  onSaveBackupToFile,
  onShareBackup,
  onImportBackup,
}: SettingsBackupSectionProps) {
  const theme = useTheme();
  const issue = normalizeAutoBackupIssue(autoBackupIssue);
  const issueMessage =
    autoBackupIssueMessage(issue) ?? (autoBackupFailed ? autoBackupFailureMessage() : null);
  const [showIntervalModal, setShowIntervalModal] = useState(false);
  const lastLabel = formatLastBackupAt(lastBackupAt);
  const reminder = getBackupReminderText(lastBackupAt);
  const interval = normalizeAutoBackupInterval(autoBackupInterval);
  const saveDescription = lastLabel
    ? `${SAVE_ITEM.description}. גובה לאחרונה ב-${lastLabel}`
    : SAVE_ITEM.description;
  const autoDescription = autoBackupEnabled && lastLabel
    ? `${AUTO_BACKUP_ITEM.description}. גובה לאחרונה ב-${lastLabel}`
    : AUTO_BACKUP_ITEM.description;
  const showAuto =
    autoBackupAvailable &&
    onAutoBackupToggle != null &&
    matchesSetting(searchQuery, { ...AUTO_BACKUP_ITEM, description: autoDescription });
  const showInterval =
    autoBackupAvailable &&
    autoBackupEnabled &&
    onAutoBackupIntervalChange != null &&
    matchesSetting(searchQuery, AUTO_BACKUP_INTERVAL_ITEM);
  const showFolder =
    autoBackupAvailable &&
    autoBackupEnabled &&
    onChangeAutoBackupFolder != null &&
    matchesSetting(searchQuery, AUTO_BACKUP_FOLDER_ITEM);
  const showSave =
    onSaveBackupToFile != null &&
    matchesSetting(searchQuery, { ...SAVE_ITEM, description: saveDescription });
  const showShare = onShareBackup != null && matchesSetting(searchQuery, SHARE_BACKUP_ITEM);
  const showImport = onImportBackup != null && matchesSetting(searchQuery, IMPORT_ITEM);
  const flags = [showAuto, showInterval, showFolder, showSave, showShare, showImport];
  if (!flags.some(Boolean) && !showIntervalModal) return null;

  return (
    <>
      {!embedded ? (
        <SectionHeader
          title="גיבוי ושחזור"
          icon="cloud-upload-outline"
          isFirst={isFirst}
          accentColor={theme.colors.success}
        />
      ) : null}
      {flags.some(Boolean) ? (
        <View style={embedded ? styles.embeddedCard : styles.card}>
          {showAuto ? (
            <SettingItem
              icon="sync-outline"
              title={AUTO_BACKUP_ITEM.title}
              description={autoDescription}
              type="switch"
              value={autoBackupEnabled}
              onPress={onAutoBackupToggle}
              iconColor={theme.colors.success}
              isLast={isLastVisible(flags, 0)}
              highlightText={searchQuery}
            />
          ) : null}
          {showInterval ? (
            <SettingItem
              icon="time-outline"
              title={AUTO_BACKUP_INTERVAL_ITEM.title}
              description={AUTO_BACKUP_INTERVAL_ITEM.description}
              value={autoBackupIntervalLabel(interval)}
              onPress={() => setShowIntervalModal(true)}
              iconColor={theme.colors.success}
              isLast={isLastVisible(flags, 1)}
              highlightText={searchQuery}
            />
          ) : null}
          {showFolder ? (
            <SettingItem
              icon="folder-open-outline"
              title={AUTO_BACKUP_FOLDER_ITEM.title}
              description={AUTO_BACKUP_FOLDER_ITEM.description}
              onPress={onChangeAutoBackupFolder}
              iconColor={theme.colors.success}
              isLast={isLastVisible(flags, 2)}
              highlightText={searchQuery}
            />
          ) : null}
          {showSave ? (
            <SettingItem
              icon="save-outline"
              title={SAVE_ITEM.title}
              description={saveDescription}
              onPress={onSaveBackupToFile}
              iconColor={theme.colors.success}
              isLast={isLastVisible(flags, 3)}
              highlightText={searchQuery}
            />
          ) : null}
          {showShare ? (
            <SettingItem
              icon="share-outline"
              title={SHARE_BACKUP_ITEM.title}
              description={SHARE_BACKUP_ITEM.description}
              onPress={onShareBackup}
              iconColor={theme.colors.success}
              isLast={isLastVisible(flags, 4)}
              highlightText={searchQuery}
            />
          ) : null}
          {showImport ? (
            <SettingItem
              icon="cloud-upload-outline"
              title={IMPORT_ITEM.title}
              description={IMPORT_ITEM.description}
              onPress={onImportBackup}
              iconColor={theme.colors.success}
              isLast={isLastVisible(flags, 5)}
              highlightText={searchQuery}
            />
          ) : null}
        </View>
      ) : null}
      {issueMessage && !searchQuery.trim() ? (
        <Text style={issue === 'restored' ? styles.backupHint : styles.backupError}>
          {issueMessage}
        </Text>
      ) : null}
      {reminder && !autoBackupEnabled && !searchQuery.trim() ? (
        <Text style={styles.backupHint}>{reminder}</Text>
      ) : null}
      {showTrailingDivider ? <View style={styles.itemDivider} /> : null}
      <SettingsChoiceModal
        visible={showIntervalModal}
        title="תדירות הגיבוי"
        headerIcon="time-outline"
        value={interval}
        options={INTERVAL_OPTIONS}
        onClose={() => setShowIntervalModal(false)}
        onSelect={next => onAutoBackupIntervalChange?.(next)}
      />
    </>
  );
}
