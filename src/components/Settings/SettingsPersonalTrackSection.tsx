import React from 'react';
import { View } from 'react-native';
import { SettingItem } from './SettingItem';
import { SectionHeader } from './SectionHeader';
import type { SettingsSectionChrome } from './settingsSection.types';
import { matchesSetting, type SearchableSetting } from '../../utils/settingsSearch';

const TRACK_ITEM: SearchableSetting = {
  title: 'לימוד אישי',
  description: 'מעקב עצמאי אחר מסכתות. כיבוי מסתיר את המסלול בבית ובש״ס',
  synonyms: ['מסלול', 'אישי', 'באנר', 'שס'],
};

type SettingsPersonalTrackSectionProps = SettingsSectionChrome & {
  showPersonalTrackBannerPref: boolean;
  onPersonalTrackBannerToggle: (value: boolean) => void;
};

export const PERSONAL_TRACK_SEARCH_ITEMS: SearchableSetting[] = [TRACK_ITEM];

export default function SettingsPersonalTrackSection({
  styles,
  searchQuery,
  isFirst,
  showPersonalTrackBannerPref,
  onPersonalTrackBannerToggle,
}: SettingsPersonalTrackSectionProps) {
  if (!matchesSetting(searchQuery, TRACK_ITEM)) return null;

  return (
    <>
      <SectionHeader title="לימוד אישי" icon="bookmark-outline" isFirst={isFirst} />
      <View style={styles.card}>
        <SettingItem
          icon="bookmark-outline"
          title={TRACK_ITEM.title}
          description={TRACK_ITEM.description}
          type="switch"
          value={showPersonalTrackBannerPref}
          onPress={onPersonalTrackBannerToggle}
          isLast
          highlightText={searchQuery}
        />
      </View>
    </>
  );
}
