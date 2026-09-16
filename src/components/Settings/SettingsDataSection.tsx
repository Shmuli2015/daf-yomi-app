import React from 'react';
import { View } from 'react-native';
import { SettingItem } from './SettingItem';
import { SectionHeader } from './SectionHeader';
import type { SettingsSectionChrome } from './settingsSection.types';
import { isLastVisible, matchesAnySetting, matchesSetting, type SearchableSetting } from '../../utils/settingsSearch';

const CACHE_ITEM: SearchableSetting = {
  title: 'ניקוי קבצים שמורים',
  description: 'מחיקת טקסטים שמורים',
  synonyms: ['מטמון', 'קאש', 'אחסון', 'זיכרון'],
};

const RESET_ITEM: SearchableSetting = {
  title: 'איפוס נתונים',
  description: 'מחיקת נתוני דף יומי, מסלול אישי או איפוס כללי',
  synonyms: ['מחיקה', 'איפוס', 'אתחול'],
};

type SettingsDataSectionProps = SettingsSectionChrome & {
  storageSizeFormatted: string;
  onClearCacheOpen?: () => void;
  onResetModalOpen: () => void;
};

export const DATA_SEARCH_ITEMS: SearchableSetting[] = [CACHE_ITEM, RESET_ITEM];

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
    onClearCacheOpen != null && matchesSetting(searchQuery, { ...CACHE_ITEM, description: cacheDescription });
  const showReset = matchesSetting(searchQuery, RESET_ITEM);
  if (!matchesAnySetting(searchQuery, [CACHE_ITEM, RESET_ITEM])) return null;
  const flags = [showCache, showReset];

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
