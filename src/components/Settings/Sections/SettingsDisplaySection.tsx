import React from 'react';
import { View } from 'react-native';
import { SettingItem } from '../SettingItem';
import { SectionHeader } from '../SectionHeader';
import DafDayStartScheduleList from '../Schedule/DafDayStartScheduleList';
import type { SettingsSectionChrome } from '../settingsSection.types';
import { ThemeMode } from '../../../theme';
import type { DafDayStartDaySchedule, DafDayStartMode } from '../../../utils/dafDayBoundary';
import {
  formatNotificationTime,
  getDafDayStartModeDisplay,
  getThemeModeSettingDisplay,
} from '../../../utils/settingsScreen';
import { isLastVisible, matchesSetting } from '../../../utils/settingsSearch';
import {
  CALENDAR_ITEM,
  CONFETTI_ITEM,
  DAF_DAY_START_ITEM,
  DAF_DAY_START_TIME_ITEM,
  DAF_DAY_START_WEEKLY_ITEM,
  DISPLAY_SEARCH_ITEMS,
  SECULAR_ITEM,
  THEME_ITEM,
  TRACK_ITEM,
} from '../../../utils/settingsSearchCatalog';

type SettingsDisplaySectionProps = SettingsSectionChrome & {
  themeMode: ThemeMode;
  onThemeModalOpen: () => void;
  dafDayStartMode: DafDayStartMode;
  dafDayStartHour: number;
  dafDayStartMinute: number;
  dafDayStartSchedules: DafDayStartDaySchedule[];
  onDafDayStartModeOpen: () => void;
  onDafDayStartTimeOpen: () => void;
  onEditDafDayStartDay: (index: number) => void;
  showSecularDate: boolean;
  onSecularDateToggle: (value: boolean) => void;
  showCalendarDaf: boolean;
  onCalendarDafToggle: (value: boolean) => void;
  showConfettiPref: boolean;
  onConfettiToggle: (value: boolean) => void;
  showPersonalTrackBannerPref?: boolean;
  onPersonalTrackBannerToggle?: (value: boolean) => void;
};

export { DISPLAY_SEARCH_ITEMS };

export default function SettingsDisplaySection({
  styles,
  searchQuery,
  isFirst,
  themeMode,
  onThemeModalOpen,
  dafDayStartMode,
  dafDayStartHour,
  dafDayStartMinute,
  dafDayStartSchedules,
  onDafDayStartModeOpen,
  onDafDayStartTimeOpen,
  onEditDafDayStartDay,
  showSecularDate,
  onSecularDateToggle,
  showCalendarDaf,
  onCalendarDafToggle,
  showConfettiPref,
  onConfettiToggle,
  showPersonalTrackBannerPref,
  onPersonalTrackBannerToggle,
}: SettingsDisplaySectionProps) {
  const themeDisplay = getThemeModeSettingDisplay(themeMode);
  const dafDayDisplay = getDafDayStartModeDisplay(
    dafDayStartMode,
    dafDayStartHour,
    dafDayStartMinute,
  );
  const showTheme = matchesSetting(searchQuery, THEME_ITEM);
  const showDafDayStart = matchesSetting(searchQuery, DAF_DAY_START_ITEM);
  const showDafDayStartTime =
    dafDayStartMode === 'custom_hour' && matchesSetting(searchQuery, DAF_DAY_START_TIME_ITEM);
  const showDafDayStartWeekly =
    dafDayStartMode === 'weekly' && matchesSetting(searchQuery, DAF_DAY_START_WEEKLY_ITEM);
  const showSecular = matchesSetting(searchQuery, SECULAR_ITEM);
  const showCalendar = matchesSetting(searchQuery, CALENDAR_ITEM);
  const showConfetti = matchesSetting(searchQuery, CONFETTI_ITEM);
  const showPersonalTrack =
    onPersonalTrackBannerToggle != null &&
    showPersonalTrackBannerPref != null &&
    matchesSetting(searchQuery, TRACK_ITEM);
  const flags = [
    showTheme,
    showDafDayStart,
    showDafDayStartTime,
    showDafDayStartWeekly,
    showSecular,
    showCalendar,
    showConfetti,
    showPersonalTrack,
  ];
  if (!flags.some(Boolean)) return null;

  return (
    <>
      <SectionHeader title="תצוגה" icon="color-palette-outline" isFirst={isFirst} />
      <View style={styles.card}>
        {showTheme ? (
          <SettingItem
            icon={themeDisplay.icon}
            title={THEME_ITEM.title}
            description={THEME_ITEM.description}
            value={themeDisplay.label}
            onPress={onThemeModalOpen}
            isLast={isLastVisible(flags, 0)}
            highlightText={searchQuery}
          />
        ) : null}
        {showDafDayStart ? (
          <SettingItem
            icon={dafDayDisplay.icon}
            title={DAF_DAY_START_ITEM.title}
            description={DAF_DAY_START_ITEM.description}
            value={dafDayDisplay.label}
            onPress={onDafDayStartModeOpen}
            isLast={isLastVisible(flags, 1) && !showDafDayStartWeekly}
            highlightText={searchQuery}
          />
        ) : null}
        {showDafDayStartTime ? (
          <SettingItem
            icon="time-outline"
            title={DAF_DAY_START_TIME_ITEM.title}
            description={DAF_DAY_START_TIME_ITEM.description}
            value={formatNotificationTime(dafDayStartHour, dafDayStartMinute)}
            onPress={onDafDayStartTimeOpen}
            isLast={isLastVisible(flags, 2)}
            highlightText={searchQuery}
          />
        ) : null}
        {showDafDayStartWeekly ? (
          <DafDayStartScheduleList
            schedules={dafDayStartSchedules}
            onEditDay={onEditDafDayStartDay}
          />
        ) : null}
        {showSecular ? (
          <SettingItem
            icon="calendar-outline"
            title={SECULAR_ITEM.title}
            description={SECULAR_ITEM.description}
            type="switch"
            value={showSecularDate}
            onPress={onSecularDateToggle}
            isLast={isLastVisible(flags, 4)}
            highlightText={searchQuery}
          />
        ) : null}
        {showCalendar ? (
          <SettingItem
            icon="book-outline"
            title={CALENDAR_ITEM.title}
            description={CALENDAR_ITEM.description}
            type="switch"
            value={showCalendarDaf}
            onPress={onCalendarDafToggle}
            isLast={isLastVisible(flags, 5)}
            highlightText={searchQuery}
          />
        ) : null}
        {showConfetti ? (
          <SettingItem
            icon="sparkles-outline"
            title={CONFETTI_ITEM.title}
            description={CONFETTI_ITEM.description}
            type="switch"
            value={showConfettiPref}
            onPress={onConfettiToggle}
            isLast={isLastVisible(flags, 6)}
            highlightText={searchQuery}
          />
        ) : null}
        {showPersonalTrack ? (
          <SettingItem
            icon="bookmark-outline"
            title={TRACK_ITEM.title}
            description={TRACK_ITEM.description}
            type="switch"
            value={showPersonalTrackBannerPref}
            onPress={onPersonalTrackBannerToggle}
            isLast={isLastVisible(flags, 7)}
            highlightText={searchQuery}
          />
        ) : null}
      </View>
    </>
  );
}
