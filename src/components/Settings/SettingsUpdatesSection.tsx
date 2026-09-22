import React from 'react';
import { View } from 'react-native';
import { SettingItem } from './SettingItem';
import { SectionHeader } from './SectionHeader';
import type { SettingsSectionChrome } from './settingsSection.types';
import { isLastVisible, matchesSetting } from '../../utils/settingsSearch';
import {
  AUTO_UPDATE_ITEM,
  CHECK_UPDATE_ITEM,
  SHARE_APP_ITEM,
  UPDATES_SEARCH_ITEMS,
  WHATS_NEW_ITEM,
} from '../../utils/settingsSearchCatalog';

type SettingsUpdatesSectionProps = SettingsSectionChrome & {
  updateAutoPromptEnabled?: boolean;
  onUpdateAutoPromptToggle?: (enabled: boolean) => void;
  onCheckAppUpdate?: () => void;
  onShowWhatsNew?: () => void;
  onShareDownloadLink?: () => void;
};

export { UPDATES_SEARCH_ITEMS };

export default function SettingsUpdatesSection({
  styles,
  searchQuery,
  isFirst,
  updateAutoPromptEnabled,
  onUpdateAutoPromptToggle,
  onCheckAppUpdate,
  onShowWhatsNew,
  onShareDownloadLink,
}: SettingsUpdatesSectionProps) {
  const showAuto =
    updateAutoPromptEnabled != null &&
    onUpdateAutoPromptToggle != null &&
    matchesSetting(searchQuery, AUTO_UPDATE_ITEM);
  const showCheck = onCheckAppUpdate != null && matchesSetting(searchQuery, CHECK_UPDATE_ITEM);
  const showWhatsNew = onShowWhatsNew != null && matchesSetting(searchQuery, WHATS_NEW_ITEM);
  const showShare = onShareDownloadLink != null && matchesSetting(searchQuery, SHARE_APP_ITEM);
  const flags = [showAuto, showCheck, showWhatsNew, showShare];
  if (!flags.some(Boolean)) return null;

  return (
    <>
      <SectionHeader title="עדכונים ושיתוף" icon="download-outline" isFirst={isFirst} />
      <View style={styles.card}>
        {showAuto ? (
          <SettingItem
            icon="alert-circle-outline"
            title={AUTO_UPDATE_ITEM.title}
            description={AUTO_UPDATE_ITEM.description}
            type="switch"
            value={updateAutoPromptEnabled}
            onPress={onUpdateAutoPromptToggle}
            isLast={isLastVisible(flags, 0)}
            highlightText={searchQuery}
          />
        ) : null}
        {showCheck ? (
          <SettingItem
            icon="download-outline"
            title={CHECK_UPDATE_ITEM.title}
            description={CHECK_UPDATE_ITEM.description}
            onPress={onCheckAppUpdate}
            isLast={isLastVisible(flags, 1)}
            highlightText={searchQuery}
          />
        ) : null}
        {showWhatsNew ? (
          <SettingItem
            icon="sparkles-outline"
            title={WHATS_NEW_ITEM.title}
            description={WHATS_NEW_ITEM.description}
            onPress={onShowWhatsNew}
            isLast={isLastVisible(flags, 2)}
            highlightText={searchQuery}
          />
        ) : null}
        {showShare ? (
          <SettingItem
            icon="share-social-outline"
            title={SHARE_APP_ITEM.title}
            description={SHARE_APP_ITEM.description}
            onPress={onShareDownloadLink}
            isLast={isLastVisible(flags, 3)}
            highlightText={searchQuery}
          />
        ) : null}
      </View>
    </>
  );
}
