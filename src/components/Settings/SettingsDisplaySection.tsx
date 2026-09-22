import React from 'react';
import { View } from 'react-native';
import { SettingItem } from './SettingItem';
import { SectionHeader } from './SectionHeader';
import DafDayStartScheduleList from './DafDayStartScheduleList';
import type { SettingsSectionChrome } from './settingsSection.types';
import { ThemeMode } from '../../theme';
import type { DafDayStartDaySchedule, DafDayStartMode } from '../../utils/dafDayBoundary';
import {
  formatNotificationTime,
  getDafDayStartModeDisplay,
  getThemeModeSettingDisplay,
} from '../../utils/settingsScreen';
import { isLastVisible, matchesAnySetting, matchesSetting, type SearchableSetting } from '../../utils/settingsSearch';

const THEME_ITEM: SearchableSetting = {
  title: 'מצב תצוגה',
  description: 'בחר מצב בהיר/כהה או לפי המערכת',
  synonyms: ['ערכת נושא', 'כהה', 'בהיר', 'דארק', 'לייט', 'מערכת', 'תמה'],
};

const DAF_DAY_START_ITEM: SearchableSetting = {
  title: 'מתי מתחלף הדף היומי',
  description: 'בחצות, שעה קבועה, או לפי ימי השבוע',
  synonyms: ['חצות', 'שקיעה', 'ערב', 'החלפת דף', 'תחילת יום', 'שעה', 'שישי', 'שבת', 'ימים'],
};

const DAF_DAY_START_TIME_ITEM: SearchableSetting = {
  title: 'שעת החלפת הדף',
  description: 'השעה בערב שבה מתחלף הדף היומי',
  synonyms: ['שעה', 'ערב', 'החלפה'],
};

const DAF_DAY_START_WEEKLY_ITEM: SearchableSetting = {
  title: 'שעת החלפה לפי ימים',
  description: 'שעה שונה לכל יום בשבוע',
  synonyms: ['שישי', 'שבת', 'מוצאי שבת', 'ימים', 'שבוע'],
};

const SECULAR_ITEM: SearchableSetting = {
  title: 'הצג תאריך לועזי',
  description: 'הצגת התאריך הלועזי לצד העברי',
  synonyms: ['גרגוריאני', 'לועזי', 'תאריך'],
};

const CALENDAR_ITEM: SearchableSetting = {
  title: 'הצג דף בלוח שנה',
  description: 'הצגת מספר הדף היומי בכל תא בלוח השנה',
  synonyms: ['לוח', 'מספר דף', 'תא'],
};

const CONFETTI_ITEM: SearchableSetting = {
  title: 'אפקטים חגיגיים',
  description: 'הצגת קונפטי בסיום לימוד דף',
  synonyms: ['קונפטי', 'חגיגה', 'אנימציה'],
};

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
};

export const DISPLAY_SEARCH_ITEMS: SearchableSetting[] = [
  THEME_ITEM,
  DAF_DAY_START_ITEM,
  DAF_DAY_START_TIME_ITEM,
  DAF_DAY_START_WEEKLY_ITEM,
  SECULAR_ITEM,
  CALENDAR_ITEM,
  CONFETTI_ITEM,
];

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
  const searchable = [THEME_ITEM, DAF_DAY_START_ITEM, SECULAR_ITEM, CALENDAR_ITEM, CONFETTI_ITEM];
  if (dafDayStartMode === 'custom_hour') {
    searchable.splice(2, 0, DAF_DAY_START_TIME_ITEM);
  }
  if (dafDayStartMode === 'weekly') {
    searchable.splice(2, 0, DAF_DAY_START_WEEKLY_ITEM);
  }
  if (!matchesAnySetting(searchQuery, searchable)) {
    return null;
  }
  const flags = [
    showTheme,
    showDafDayStart,
    showDafDayStartTime,
    showDafDayStartWeekly,
    showSecular,
    showCalendar,
    showConfetti,
  ];

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
      </View>
    </>
  );
}
