import React from 'react';
import { View } from 'react-native';
import { SettingItem } from '../SettingItem';
import { SectionHeader } from '../SectionHeader';
import SettingsFontSizeRow from './SettingsFontSizeRow';
import type { SettingsSectionChrome } from '../settingsSection.types';
import type { ViewMode } from '../../SefariaReader/ReaderToolbar';
import { getReaderViewModeLabel } from '../../../utils/readerViewMode';
import { isLastVisible, matchesSetting } from '../../../utils/settingsSearch';
import {
  FONT_SIZE_SETTING,
  HAPTICS_ITEM,
  NOTES_ITEM,
  READER_MODE_ITEM,
  READER_SEARCH_ITEMS,
} from '../../../utils/settingsSearchCatalog';

type SettingsReaderSectionProps = SettingsSectionChrome & {
  readerViewMode: ViewMode;
  onReaderViewModePress: () => void;
  showChavrutaNotes: boolean;
  onChavrutaNotesToggle: (enabled: boolean) => void;
  hapticsEnabled: boolean;
  onHapticsToggle: (enabled: boolean) => void;
  fontSize: number;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
};

export { READER_SEARCH_ITEMS, READER_MODE_ITEM };

export default function SettingsReaderSection({
  styles,
  searchQuery,
  isFirst,
  readerViewMode,
  onReaderViewModePress,
  showChavrutaNotes,
  onChavrutaNotesToggle,
  hapticsEnabled,
  onHapticsToggle,
  fontSize,
  onIncreaseFontSize,
  onDecreaseFontSize,
}: SettingsReaderSectionProps) {
  const showMode = matchesSetting(searchQuery, READER_MODE_ITEM);
  const showNotes = matchesSetting(searchQuery, NOTES_ITEM);
  const showHaptics = matchesSetting(searchQuery, HAPTICS_ITEM);
  const showFont = matchesSetting(searchQuery, FONT_SIZE_SETTING);
  const flags = [showMode, showNotes, showHaptics, showFont];
  if (!flags.some(Boolean)) return null;

  return (
    <>
      <SectionHeader title="קורא" icon="book-outline" isFirst={isFirst} />
      <View style={styles.card}>
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
        {showNotes ? (
          <SettingItem
            icon="document-text-outline"
            title={NOTES_ITEM.title}
            description={NOTES_ITEM.description}
            type="switch"
            value={showChavrutaNotes}
            onPress={onChavrutaNotesToggle}
            isLast={isLastVisible(flags, 1)}
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
            isLast={isLastVisible(flags, 2)}
            highlightText={searchQuery}
          />
        ) : null}
        {showFont ? (
          <SettingsFontSizeRow
            searchQuery={searchQuery}
            fontSize={fontSize}
            onIncrease={onIncreaseFontSize}
            onDecrease={onDecreaseFontSize}
            isLast={isLastVisible(flags, 3)}
          />
        ) : null}
      </View>
    </>
  );
}
