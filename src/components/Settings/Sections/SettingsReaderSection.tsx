import React from 'react';
import { View } from 'react-native';
import { SettingItem } from '../SettingItem';
import { SectionHeader } from '../SectionHeader';
import SettingsFontSizeRow from './SettingsFontSizeRow';
import type { SettingsSectionChrome } from '../settingsSection.types';
import type { ReaderTheme, ViewMode } from '../../SefariaReader/ReaderToolbar';
import { getReaderViewModeLabel } from '../../../utils/readerViewMode';
import { getReaderThemeLabel } from '../../../utils/readerTheme';
import { isLastVisible, matchesSetting } from '../../../utils/settingsSearch';
import {
  FONT_SIZE_SETTING,
  GEMARA_NIKUD_ITEM,
  HAPTICS_ITEM,
  KEEP_SCREEN_AWAKE_ITEM,
  NOTES_ITEM,
  READER_MODE_ITEM,
  READER_SEARCH_ITEMS,
  READER_THEME_ITEM,
} from '../../../utils/settingsSearchCatalog';

type SettingsReaderSectionProps = SettingsSectionChrome & {
  readerViewMode: ViewMode;
  onReaderViewModePress: () => void;
  readerTheme: ReaderTheme;
  onReaderThemePress: () => void;
  gemaraNikud: boolean;
  onGemaraNikudToggle: (enabled: boolean) => void;
  showChavrutaNotes: boolean;
  onChavrutaNotesToggle: (enabled: boolean) => void;
  hapticsEnabled: boolean;
  onHapticsToggle: (enabled: boolean) => void;
  keepScreenAwake: boolean;
  onKeepScreenAwakeToggle: (enabled: boolean) => void;
  fontSize: number;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
};

export { READER_SEARCH_ITEMS, READER_MODE_ITEM };

export default function SettingsReaderSection({
  styles,
  searchQuery,
  isFirst,
  embedded,
  readerViewMode,
  onReaderViewModePress,
  readerTheme,
  onReaderThemePress,
  gemaraNikud,
  onGemaraNikudToggle,
  showChavrutaNotes,
  onChavrutaNotesToggle,
  hapticsEnabled,
  onHapticsToggle,
  keepScreenAwake,
  onKeepScreenAwakeToggle,
  fontSize,
  onIncreaseFontSize,
  onDecreaseFontSize,
}: SettingsReaderSectionProps) {
  const showMode = matchesSetting(searchQuery, READER_MODE_ITEM);
  const showTheme = matchesSetting(searchQuery, READER_THEME_ITEM);
  const showNikud = matchesSetting(searchQuery, GEMARA_NIKUD_ITEM);
  const showNotes = matchesSetting(searchQuery, NOTES_ITEM);
  const showHaptics = matchesSetting(searchQuery, HAPTICS_ITEM);
  const showKeepScreenAwake = matchesSetting(searchQuery, KEEP_SCREEN_AWAKE_ITEM);
  const showFont = matchesSetting(searchQuery, FONT_SIZE_SETTING);
  const flags = [
    showMode,
    showTheme,
    showNikud,
    showNotes,
    showHaptics,
    showKeepScreenAwake,
    showFont,
  ];
  if (!flags.some(Boolean)) return null;

  return (
    <>
      {!embedded ? (
        <SectionHeader title="קורא" icon="book-outline" isFirst={isFirst} />
      ) : null}
      <View style={embedded ? styles.embeddedCard : styles.card}>
        {showMode ? (
          <SettingItem
            icon="reader-outline"
            title={READER_MODE_ITEM.title}
            description={READER_MODE_ITEM.description}
            value={getReaderViewModeLabel(readerViewMode)}
            onPress={onReaderViewModePress}
            isLast={isLastVisible(flags, 0)}
            highlightText={searchQuery}
          />
        ) : null}
        {showTheme ? (
          <SettingItem
            icon="color-palette-outline"
            title={READER_THEME_ITEM.title}
            description={READER_THEME_ITEM.description}
            value={getReaderThemeLabel(readerTheme)}
            onPress={onReaderThemePress}
            isLast={isLastVisible(flags, 1)}
            highlightText={searchQuery}
          />
        ) : null}
        {showNikud ? (
          <SettingItem
            icon="text-outline"
            title={GEMARA_NIKUD_ITEM.title}
            description={GEMARA_NIKUD_ITEM.description}
            type="switch"
            value={gemaraNikud}
            onPress={onGemaraNikudToggle}
            isLast={isLastVisible(flags, 2)}
            highlightText={searchQuery}
          />
        ) : null}
        {showNotes ? (
          <SettingItem
            icon="document-text-outline"
            title={NOTES_ITEM.title}
            description={NOTES_ITEM.description}
            type="switch"
            value={showChavrutaNotes}
            onPress={onChavrutaNotesToggle}
            isLast={isLastVisible(flags, 3)}
            highlightText={searchQuery}
          />
        ) : null}
        {showHaptics ? (
          <SettingItem
            icon="phone-portrait-outline"
            title={HAPTICS_ITEM.title}
            description={HAPTICS_ITEM.description}
            type="switch"
            value={hapticsEnabled}
            onPress={onHapticsToggle}
            isLast={isLastVisible(flags, 4)}
            highlightText={searchQuery}
          />
        ) : null}
        {showKeepScreenAwake ? (
          <SettingItem
            icon="sunny-outline"
            title={KEEP_SCREEN_AWAKE_ITEM.title}
            description={KEEP_SCREEN_AWAKE_ITEM.description}
            type="switch"
            value={keepScreenAwake}
            onPress={onKeepScreenAwakeToggle}
            isLast={isLastVisible(flags, 5)}
            highlightText={searchQuery}
          />
        ) : null}
        {showFont ? (
          <SettingsFontSizeRow
            searchQuery={searchQuery}
            fontSize={fontSize}
            onIncrease={onIncreaseFontSize}
            onDecrease={onDecreaseFontSize}
            isLast={isLastVisible(flags, 6)}
          />
        ) : null}
      </View>
    </>
  );
}
