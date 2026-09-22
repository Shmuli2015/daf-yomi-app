import React from 'react';
import { View } from 'react-native';
import { SettingItem } from './SettingItem';
import { SectionHeader } from './SectionHeader';
import type { SettingsSectionChrome } from './settingsSection.types';
import { isLastVisible, matchesSetting } from '../../utils/settingsSearch';
import { CACHE_ITEM, DATA_SEARCH_ITEMS, RESET_ITEM } from '../../utils/settingsSearchCatalog';

type SettingsDataSectionProps = SettingsSectionChrome & {
  storageSizeFormatted: string;
  onClearCacheOpen?: () => void;
  onResetModalOpen: () => void;
};

export { DATA_SEARCH_ITEMS };

export default function SettingsDataSection({
  styles,
  searchQuery,
  isFirst,
  storageSizeFormatted,
  onClearCacheOpen,
  onResetModalOpen,
}: SettingsDataSectionProps) {
  const cacheDescription = `מחיקת טקסטים שהורדו (${storageSizeFormatted}). אינו מוחק סימוני לימוד`;
  const showCache =
    onClearCacheOpen != null &&
    matchesSetting(searchQuery, { ...CACHE_ITEM, description: cacheDescription });
  const showReset = matchesSetting(searchQuery, RESET_ITEM);
  const flags = [showCache, showReset];
  if (!flags.some(Boolean)) return null;

  return (
    <>
      <SectionHeader title="נתונים ופרטיות" icon="shield-checkmark-outline" isFirst={isFirst} />
      <View style={styles.card}>
        {showCache ? (
          <SettingItem
            icon="folder-open-outline"
            title={CACHE_ITEM.title}
            description={cacheDescription}
            onPress={onClearCacheOpen}
            isLast={isLastVisible(flags, 0)}
            highlightText={searchQuery}
          />
        ) : null}
        {showReset ? (
          <SettingItem
            icon="trash-outline"
            title={RESET_ITEM.title}
            description={RESET_ITEM.description}
            isDestructive
            onPress={onResetModalOpen}
            isLast={isLastVisible(flags, 1)}
            highlightText={searchQuery}
          />
        ) : null}
      </View>
    </>
  );
}
