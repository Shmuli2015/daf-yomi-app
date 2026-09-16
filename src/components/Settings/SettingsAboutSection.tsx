import React from 'react';
import { View } from 'react-native';
import { SettingItem } from './SettingItem';
import { SectionHeader } from './SectionHeader';
import type { SettingsSectionChrome } from './settingsSection.types';
import { isLastVisible, matchesAnySetting, matchesSetting, type SearchableSetting } from '../../utils/settingsSearch';

export const GUIDE_ITEM: SearchableSetting = {
  title: 'מדריך שימוש',
  description: 'למד כיצד להשתמש בכל התכונות והאפשרויות',
  synonyms: ['עזרה', 'הסבר', 'faq'],
};

export const SUPPORT_ITEM: SearchableSetting = {
  title: 'תמיכה ויצירת קשר',
  description: 'משוב והצעות לשיפור',
  synonyms: ['מייל', 'דואל', 'אימייל', 'צור קשר', 'תמיכה'],
};

export const LICENSES_ITEM: SearchableSetting = {
  title: 'מקורות ורישיונות',
  description: 'טקסטים מספריא, שטיינזלץ, דיקטה וחברותא',
  synonyms: ['ספריא', 'רישיון', 'קרדיט'],
};

const AUTO_UPDATE_ITEM: SearchableSetting = {
  title: 'התראות עדכון אוטומטיות',
  description: 'בדיקת עדכונים אוטומטית בפתיחת האפליקציה או בחזרה מהרקע, והתראה עם הורד והתקן כשמתפרסם עדכון',
  synonyms: ['עדכון', 'אוטומטי'],
};

const CHECK_UPDATE_ITEM: SearchableSetting = {
  title: 'בדוק עדכונים',
  description: 'מוודא אם יש גרסה חדשה לאפליקציה (כדאי מדי פעם)',
  synonyms: ['גרסה', 'עדכון'],
};

const WHATS_NEW_ITEM: SearchableSetting = {
  title: 'מה חדש בגרסה זו',
  description: 'רשימת השינויים בגרסה המותקנת',
  synonyms: ['חדש', 'שינויים', 'רשימה'],
};

const SHARE_APP_ITEM: SearchableSetting = {
  title: 'שתף קישור להורדה',
  description: 'שלח לחברים קישור להתקנת מסע דף',
  synonyms: ['שיתוף', 'הורדה', 'חברים'],
};

type SettingsAboutSectionProps = SettingsSectionChrome & {
  onGuideModalOpen: () => void;
  onSupportPress: () => void;
  onSupportLongPress: () => void;
  onLicensesPress: () => void;
  updateAutoPromptEnabled?: boolean;
  onUpdateAutoPromptToggle?: (enabled: boolean) => void;
  onCheckAppUpdate?: () => void;
  onShowWhatsNew?: () => void;
  onShareDownloadLink?: () => void;
};

export const ABOUT_SEARCH_ITEMS: SearchableSetting[] = [
  GUIDE_ITEM,
  SUPPORT_ITEM,
  LICENSES_ITEM,
  AUTO_UPDATE_ITEM,
  CHECK_UPDATE_ITEM,
  WHATS_NEW_ITEM,
  SHARE_APP_ITEM,
];

export default function SettingsAboutSection({
  styles,
  searchQuery,
  isFirst,
  onGuideModalOpen,
  onSupportPress,
  onSupportLongPress,
  onLicensesPress,
  updateAutoPromptEnabled,
  onUpdateAutoPromptToggle,
  onCheckAppUpdate,
  onShowWhatsNew,
  onShareDownloadLink,
}: SettingsAboutSectionProps) {
  const showGuide = matchesSetting(searchQuery, GUIDE_ITEM);
  const showSupport = matchesSetting(searchQuery, SUPPORT_ITEM);
  const showLicenses = matchesSetting(searchQuery, LICENSES_ITEM);
  const showAuto =
    updateAutoPromptEnabled != null &&
    onUpdateAutoPromptToggle != null &&
    matchesSetting(searchQuery, AUTO_UPDATE_ITEM);
  const showCheck = onCheckAppUpdate != null && matchesSetting(searchQuery, CHECK_UPDATE_ITEM);
  const showWhatsNew = onShowWhatsNew != null && matchesSetting(searchQuery, WHATS_NEW_ITEM);
  const showShare = onShareDownloadLink != null && matchesSetting(searchQuery, SHARE_APP_ITEM);

  if (
    !matchesAnySetting(searchQuery, [
      GUIDE_ITEM,
      SUPPORT_ITEM,
      LICENSES_ITEM,
      AUTO_UPDATE_ITEM,
      CHECK_UPDATE_ITEM,
      WHATS_NEW_ITEM,
      SHARE_APP_ITEM,
    ])
  ) {
    return null;
  }

  const flags = [showGuide, showSupport, showLicenses, showAuto, showCheck, showWhatsNew, showShare];

  return (
    <>
      <SectionHeader title="אודות" icon="information-circle-outline" isFirst={isFirst} />
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
        {showAuto ? (
          <SettingItem
            icon="alert-circle-outline"
            title={AUTO_UPDATE_ITEM.title}
            description={AUTO_UPDATE_ITEM.description}
            type="switch"
            value={updateAutoPromptEnabled}
            onPress={onUpdateAutoPromptToggle}
            isLast={isLastVisible(flags, 3)}
            highlightText={searchQuery}
          />
        ) : null}
        {showCheck ? (
          <SettingItem
            icon="download-outline"
            title={CHECK_UPDATE_ITEM.title}
            description={CHECK_UPDATE_ITEM.description}
            onPress={onCheckAppUpdate}
            isLast={isLastVisible(flags, 4)}
            highlightText={searchQuery}
          />
        ) : null}
        {showWhatsNew ? (
          <SettingItem
            icon="sparkles-outline"
            title={WHATS_NEW_ITEM.title}
            description={WHATS_NEW_ITEM.description}
            onPress={onShowWhatsNew}
            isLast={isLastVisible(flags, 5)}
            highlightText={searchQuery}
          />
        ) : null}
        {showShare ? (
          <SettingItem
            icon="share-social-outline"
            title={SHARE_APP_ITEM.title}
            description={SHARE_APP_ITEM.description}
            onPress={onShareDownloadLink}
            isLast={isLastVisible(flags, 6)}
            highlightText={searchQuery}
          />
        ) : null}
      </View>
    </>
  );
}
