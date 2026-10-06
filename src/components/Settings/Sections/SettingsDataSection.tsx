import React from 'react';
import { View } from 'react-native';
import { SettingItem } from '../SettingItem';
import { SectionHeader } from '../SectionHeader';
import type { SettingsSectionChrome } from '../settingsSection.types';
import { matchesSetting } from '../../../utils/settingsSearch';
import {
  RESET_ITEM,
  DATA_SEARCH_ITEMS,
} from '../../../utils/settingsSearchCatalog';

type SettingsDataSectionProps = SettingsSectionChrome & {
  onResetModalOpen: () => void;
};

export { DATA_SEARCH_ITEMS };

export default function SettingsDataSection({
  styles,
  searchQuery,
  isFirst,
  embedded,
  onResetModalOpen,
}: SettingsDataSectionProps) {
  const showReset = matchesSetting(searchQuery, RESET_ITEM);
  if (!showReset) return null;

  return (
    <>
      {!embedded ? (
        <SectionHeader title="נתונים ופרטיות" icon="shield-checkmark-outline" isFirst={isFirst} />
      ) : null}
      <View style={embedded ? styles.embeddedCard : styles.card}>
        <SettingItem
          icon="trash-outline"
          title={RESET_ITEM.title}
          description={RESET_ITEM.description}
          isDestructive
          onPress={onResetModalOpen}
          isLast
          highlightText={searchQuery}
        />
      </View>
    </>
  );
}
