import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import Animated, { FadeInLeft, FadeInRight, FadeOut } from 'react-native-reanimated';
import { SettingItem } from '../SettingItem';
import { SectionHeader } from '../SectionHeader';
import { NotifModeToggle } from '../Schedule/NotifModeToggle';
import { DayScheduleList } from '../Schedule/DayScheduleList';
import type { DaySchedule } from '../Schedule/DayScheduleList';
import type { SettingsSectionChrome } from '../settingsSection.types';
import type { ExactAlarmStatus } from '../../../utils/exactAlarm';
import type { NotificationPermissionStatus } from '../../../utils/notificationPermission';
import { formatNotificationTime } from '../../../utils/settingsScreen';
import { isLastVisible, matchesSetting } from '../../../utils/settingsSearch';
import {
  DAILY_ITEM,
  EXACT_ITEM,
  MODE_ITEM,
  NOTIFICATIONS_SEARCH_ITEMS,
  PERMISSION_ITEM,
  SOUND_ITEM,
  TIME_ITEM,
} from '../../../utils/settingsSearchCatalog';

type SettingsNotificationsSectionProps = SettingsSectionChrome & {
  notificationsEnabled: boolean;
  onNotificationsToggle: (value: boolean) => void;
  notifMode: 'daily' | 'custom';
  onNotifModeChange: (mode: 'daily' | 'custom') => void;
  hour: number;
  minute: number;
  daySchedules: DaySchedule[];
  onDailyTimePress: () => void;
  onToggleDay: (index: number) => void;
  onEditDayTime: (index: number) => void;
  exactAlarmStatus: ExactAlarmStatus;
  onExactAlarmSettingsPress?: () => void;
  permissionStatus: NotificationPermissionStatus;
  onNotificationPermissionPress: () => void;
  soundEnabled: boolean;
  onSoundToggle: (enabled: boolean) => void;
};

export { NOTIFICATIONS_SEARCH_ITEMS };

export default function SettingsNotificationsSection({
  styles,
  searchQuery,
  isFirst,
  notificationsEnabled,
  onNotificationsToggle,
  notifMode,
  onNotifModeChange,
  hour,
  minute,
  daySchedules,
  onDailyTimePress,
  onToggleDay,
  onEditDayTime,
  exactAlarmStatus,
  onExactAlarmSettingsPress,
  permissionStatus,
  onNotificationPermissionPress,
  soundEnabled,
  onSoundToggle,
}: SettingsNotificationsSectionProps) {
  const skipEnter = useRef(true);
  useEffect(() => {
    skipEnter.current = false;
  }, []);
  const timeEntering = skipEnter.current ? undefined : FadeInRight.duration(220);
  const daysEntering = skipEnter.current ? undefined : FadeInLeft.duration(220);

  const exactAlarmLabel =
    exactAlarmStatus === 'granted'
      ? 'פעיל'
      : exactAlarmStatus === 'denied'
        ? 'דורש הרשאה'
        : 'לא זמין ב-Expo Go';
  const exactDescription =
    exactAlarmStatus === 'denied'
      ? 'לחץ כדי לאשר תזמון מדויק בהגדרות המכשיר'
      : 'התזכורת תצלצל בדיוק בשעה שבחרת';
  const showExactAlarmRow =
    notificationsEnabled &&
    exactAlarmStatus !== 'not_required' &&
    onExactAlarmSettingsPress != null &&
    matchesSetting(searchQuery, { ...EXACT_ITEM, description: exactDescription });
  const showPermissionRow =
    (permissionStatus === 'denied' || (notificationsEnabled && permissionStatus !== 'granted')) &&
    matchesSetting(searchQuery, PERMISSION_ITEM);
  const permissionLabel = permissionStatus === 'denied' ? 'דורש הרשאה' : 'לא אושר';

  const showDaily = matchesSetting(searchQuery, DAILY_ITEM);
  const showMode = notificationsEnabled && matchesSetting(searchQuery, MODE_ITEM);
  const showTime =
    notificationsEnabled && notifMode === 'daily' && matchesSetting(searchQuery, TIME_ITEM);
  const showDays = notificationsEnabled && notifMode === 'custom' && matchesSetting(searchQuery, MODE_ITEM);
  const showSound = notificationsEnabled && matchesSetting(searchQuery, SOUND_ITEM);

  const flags = [
    showDaily,
    showMode,
    showTime,
    showDays,
    showSound,
    showExactAlarmRow,
    showPermissionRow,
  ];

  if (!flags.some(Boolean)) return null;

  return (
    <>
      <SectionHeader title="התראות ותזכורות" icon="notifications-outline" isFirst={isFirst} />
      <View style={styles.card}>
        {showDaily ? (
          <SettingItem
            icon="notifications-outline"
            title={DAILY_ITEM.title}
            description={DAILY_ITEM.description}
            type="switch"
            value={notificationsEnabled}
            onPress={onNotificationsToggle}
            isLast={isLastVisible(flags, 0)}
            highlightText={searchQuery}
          />
        ) : null}
        {showMode ? <NotifModeToggle mode={notifMode} onChange={onNotifModeChange} /> : null}
        {showTime ? (
          <Animated.View entering={timeEntering} exiting={FadeOut.duration(140)}>
            <SettingItem
              icon="time-outline"
              title={TIME_ITEM.title}
              description={TIME_ITEM.description}
              value={formatNotificationTime(hour, minute)}
              onPress={onDailyTimePress}
              isLast={isLastVisible(flags, 2)}
              highlightText={searchQuery}
            />
          </Animated.View>
        ) : null}
        {showDays ? (
          <Animated.View entering={daysEntering} exiting={FadeOut.duration(140)}>
            <DayScheduleList
              schedules={daySchedules}
              onToggleDay={onToggleDay}
              onEditTime={onEditDayTime}
            />
          </Animated.View>
        ) : null}
        {showSound ? (
          <SettingItem
            icon="volume-high-outline"
            title={SOUND_ITEM.title}
            description={SOUND_ITEM.description}
            type="switch"
            value={soundEnabled}
            onPress={onSoundToggle}
            isLast={isLastVisible(flags, 4)}
            highlightText={searchQuery}
          />
        ) : null}
        {showExactAlarmRow ? (
          <SettingItem
            icon="alarm-outline"
            title={EXACT_ITEM.title}
            description={exactDescription}
            value={exactAlarmLabel}
            onPress={onExactAlarmSettingsPress}
            isLast={isLastVisible(flags, 5)}
            highlightText={searchQuery}
          />
        ) : null}
        {showPermissionRow ? (
          <SettingItem
            icon="phone-portrait-outline"
            title={PERMISSION_ITEM.title}
            description={PERMISSION_ITEM.description}
            value={permissionLabel}
            onPress={onNotificationPermissionPress}
            isLast={isLastVisible(flags, 6)}
            highlightText={searchQuery}
          />
        ) : null}
      </View>
    </>
  );
}
