import React from 'react';
import { View } from 'react-native';
import { SettingItem } from './SettingItem';
import { SectionHeader } from './SectionHeader';
import type { SettingsSectionChrome } from './settingsSection.types';
import { isLastVisible, matchesAnySetting, matchesSetting, type SearchableSetting } from '../../utils/settingsSearch';

const TEST_ITEM: SearchableSetting = {
  title: 'שלח התראת בדיקה',
  description: 'בדוק שההתראות עובדות (תגיע בעוד 5 שניות)',
  synonyms: ['טסט', 'דיבאג'],
};

const SCHEDULED_ITEM: SearchableSetting = {
  title: 'בדוק התראות מתוזמנות',
  synonyms: ['מתוזמן', 'רשימה'],
};

const GITHUB_ITEM: SearchableSetting = {
  title: 'בדוק תגובת GitHub',
  description: 'מציג טאג ושם APK מהפרסום האחרון',
  synonyms: ['גיטהאב', 'apk'],
};

type SettingsDevSectionProps = SettingsSectionChrome & {
  scheduledCount: number;
  onTestNotification: () => void;
  onCheckScheduled: () => void;
  onProbeGithubRelease?: () => void;
};

export const DEV_SEARCH_ITEMS: SearchableSetting[] = [TEST_ITEM, SCHEDULED_ITEM, GITHUB_ITEM];

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
  const showScheduled = matchesSetting(searchQuery, { ...SCHEDULED_ITEM, description: scheduledDescription });
  const showGithub = onProbeGithubRelease != null && matchesSetting(searchQuery, GITHUB_ITEM);
  if (!matchesAnySetting(searchQuery, [TEST_ITEM, SCHEDULED_ITEM, GITHUB_ITEM])) return null;
  const flags = [showTest, showScheduled, showGithub];

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
