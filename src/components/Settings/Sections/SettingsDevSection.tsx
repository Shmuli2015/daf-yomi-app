import React from 'react';
import { View } from 'react-native';
import { SettingItem } from '../SettingItem';
import { SectionHeader } from '../SectionHeader';
import type { SettingsSectionChrome } from '../settingsSection.types';
import { isLastVisible, matchesSetting } from '../../../utils/settingsSearch';
import {
  DEV_SEARCH_ITEMS,
  GITHUB_ITEM,
  SCHEDULED_ITEM,
  TEST_ITEM,
} from '../../../utils/settingsSearchCatalog';

type SettingsDevSectionProps = SettingsSectionChrome & {
  scheduledCount: number;
  onTestNotification: () => void;
  onCheckScheduled: () => void;
  onProbeGithubRelease?: () => void;
};

export { DEV_SEARCH_ITEMS };

export default function SettingsDevSection({
  styles,
  searchQuery,
  isFirst,
  scheduledCount,
  onTestNotification,
  onCheckScheduled,
  onProbeGithubRelease,
}: SettingsDevSectionProps) {
  const scheduledDescription = `${scheduledCount} התראות מתוזמנות`;
  const showTest = matchesSetting(searchQuery, TEST_ITEM);
  const showScheduled = matchesSetting(searchQuery, {
    ...SCHEDULED_ITEM,
    description: scheduledDescription,
  });
  const showGithub = onProbeGithubRelease != null && matchesSetting(searchQuery, GITHUB_ITEM);
  const flags = [showTest, showScheduled, showGithub];
  if (!flags.some(Boolean)) return null;

  return (
    <>
      <SectionHeader title="דיבאג והתראות" icon="code-working-outline" isFirst={isFirst} />
      <View style={styles.card}>
        {showTest ? (
          <SettingItem
            icon="notifications-outline"
            title={TEST_ITEM.title}
            description={TEST_ITEM.description}
            onPress={onTestNotification}
            isLast={isLastVisible(flags, 0)}
            highlightText={searchQuery}
          />
        ) : null}
        {showScheduled ? (
          <SettingItem
            icon="list-outline"
            title={SCHEDULED_ITEM.title}
            description={scheduledDescription}
            onPress={onCheckScheduled}
            isLast={isLastVisible(flags, 1)}
            highlightText={searchQuery}
          />
        ) : null}
        {showGithub ? (
          <SettingItem
            icon="cloud-outline"
            title={GITHUB_ITEM.title}
            description={GITHUB_ITEM.description}
            onPress={onProbeGithubRelease}
            isLast={isLastVisible(flags, 2)}
            highlightText={searchQuery}
          />
        ) : null}
      </View>
    </>
  );
}
