import React from 'react';
import { View } from 'react-native';
import { SettingItem } from '../SettingItem';
import { SectionHeader } from '../SectionHeader';
import type { SettingsSectionChrome } from '../settingsSection.types';
import { isLastVisible, matchesSetting } from '../../../utils/settingsSearch';
import {
  GUIDE_ITEM,
  HELP_SEARCH_ITEMS,
  LICENSES_ITEM,
  SUPPORT_ITEM,
} from '../../../utils/settingsSearchCatalog';

type SettingsHelpSectionProps = SettingsSectionChrome & {
  onGuideModalOpen: () => void;
  onSupportPress: () => void;
  onSupportLongPress: () => void;
  onLicensesPress: () => void;
};

export { HELP_SEARCH_ITEMS, GUIDE_ITEM, SUPPORT_ITEM, LICENSES_ITEM };

export default function SettingsHelpSection({
  styles,
  searchQuery,
  isFirst,
  onGuideModalOpen,
  onSupportPress,
  onSupportLongPress,
  onLicensesPress,
}: SettingsHelpSectionProps) {
  const showGuide = matchesSetting(searchQuery, GUIDE_ITEM);
  const showSupport = matchesSetting(searchQuery, SUPPORT_ITEM);
  const showLicenses = matchesSetting(searchQuery, LICENSES_ITEM);
  const flags = [showGuide, showSupport, showLicenses];
  if (!flags.some(Boolean)) return null;

  return (
    <>
      <SectionHeader title="עזרה" icon="help-circle-outline" isFirst={isFirst} />
      <View style={styles.card}>
        {showGuide ? (
          <SettingItem
            icon="help-circle-outline"
            title={GUIDE_ITEM.title}
            description={GUIDE_ITEM.description}
            onPress={onGuideModalOpen}
            isLast={isLastVisible(flags, 0)}
            highlightText={searchQuery}
          />
        ) : null}
        {showSupport ? (
          <SettingItem
            icon="mail-outline"
            title={SUPPORT_ITEM.title}
            description={SUPPORT_ITEM.description}
            onPress={onSupportPress}
            onLongPress={onSupportLongPress}
            isLast={isLastVisible(flags, 1)}
            highlightText={searchQuery}
          />
        ) : null}
        {showLicenses ? (
          <SettingItem
            icon="ribbon-outline"
            title={LICENSES_ITEM.title}
            description={LICENSES_ITEM.description}
            onPress={onLicensesPress}
            isLast={isLastVisible(flags, 2)}
            highlightText={searchQuery}
          />
        ) : null}
      </View>
    </>
  );
}
