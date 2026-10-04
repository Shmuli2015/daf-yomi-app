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
  PRIVACY_POLICY_ITEM,
  SIYUM_NUSACH_ITEM,
  SUPPORT_ITEM,
} from '../../../utils/settingsSearchCatalog';

type SettingsHelpSectionProps = SettingsSectionChrome & {
  onGuideModalOpen: () => void;
  onSupportPress: () => void;
  onSupportLongPress: () => void;
  onPrivacyPolicyPress: () => void;
  onSiyumNusachPress: () => void;
  onLicensesPress: () => void;
};

export {
  HELP_SEARCH_ITEMS,
  GUIDE_ITEM,
  SUPPORT_ITEM,
  PRIVACY_POLICY_ITEM,
  SIYUM_NUSACH_ITEM,
  LICENSES_ITEM,
};

export default function SettingsHelpSection({
  styles,
  searchQuery,
  isFirst,
  embedded,
  onGuideModalOpen,
  onSupportPress,
  onSupportLongPress,
  onPrivacyPolicyPress,
  onSiyumNusachPress,
  onLicensesPress,
}: SettingsHelpSectionProps) {
  const showGuide = matchesSetting(searchQuery, GUIDE_ITEM);
  const showSupport = matchesSetting(searchQuery, SUPPORT_ITEM);
  const showPrivacy = matchesSetting(searchQuery, PRIVACY_POLICY_ITEM);
  const showSiyumNusach = matchesSetting(searchQuery, SIYUM_NUSACH_ITEM);
  const showLicenses = matchesSetting(searchQuery, LICENSES_ITEM);
  const flags = [showGuide, showSupport, showPrivacy, showSiyumNusach, showLicenses];
  if (!flags.some(Boolean)) return null;

  return (
    <>
      {!embedded ? (
        <SectionHeader title="עזרה" icon="help-circle-outline" isFirst={isFirst} />
      ) : null}
      <View style={embedded ? styles.embeddedCard : styles.card}>
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
        {showPrivacy ? (
          <SettingItem
            icon="document-text-outline"
            title={PRIVACY_POLICY_ITEM.title}
            description={PRIVACY_POLICY_ITEM.description}
            onPress={onPrivacyPolicyPress}
            isLast={isLastVisible(flags, 2)}
            highlightText={searchQuery}
          />
        ) : null}
        {showSiyumNusach ? (
          <SettingItem
            icon="book-outline"
            title={SIYUM_NUSACH_ITEM.title}
            description={SIYUM_NUSACH_ITEM.description}
            onPress={onSiyumNusachPress}
            isLast={isLastVisible(flags, 3)}
            highlightText={searchQuery}
          />
        ) : null}
        {showLicenses ? (
          <SettingItem
            icon="ribbon-outline"
            title={LICENSES_ITEM.title}
            description={LICENSES_ITEM.description}
            onPress={onLicensesPress}
            isLast={isLastVisible(flags, 4)}
            highlightText={searchQuery}
          />
        ) : null}
      </View>
    </>
  );
}
