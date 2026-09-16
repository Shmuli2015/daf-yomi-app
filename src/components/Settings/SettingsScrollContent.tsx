import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Linking, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { ThemeMode, useTheme } from '../../theme';
import type { ViewMode } from '../SefariaReader/ReaderToolbar';
import { SettingsSearchBar } from './SettingsSearchBar';
import { SettingsFooter } from './SettingsFooter';
import SettingsNotificationsSection, {
  NOTIFICATIONS_SEARCH_ITEMS,
} from './SettingsNotificationsSection';
import SettingsDisplaySection, { DISPLAY_SEARCH_ITEMS } from './SettingsDisplaySection';
import SettingsReaderSection, { READER_SEARCH_ITEMS } from './SettingsReaderSection';
import SettingsPersonalTrackSection, {
  PERSONAL_TRACK_SEARCH_ITEMS,
} from './SettingsPersonalTrackSection';
import SettingsBackupSection, { BACKUP_SEARCH_ITEMS } from './SettingsBackupSection';
import SettingsDataSection, { DATA_SEARCH_ITEMS } from './SettingsDataSection';
import SettingsAboutSection, { ABOUT_SEARCH_ITEMS } from './SettingsAboutSection';
import SettingsDevSection, { DEV_SEARCH_ITEMS } from './SettingsDevSection';
import InfoModal from '../InfoModal';
import ContentLicensesModal from './ContentLicensesModal';
import type { SettingsScreenStyles } from './settingsScreenStyles';
import type { DaySchedule } from './DayScheduleList';
import type { ExactAlarmStatus } from '../../utils/exactAlarm';
import type { NotificationPermissionStatus } from '../../utils/notificationPermission';
import { SUPPORT_EMAIL, getSupportMailtoUrl } from '../../supportContact';
import { matchesAnySetting } from '../../utils/settingsSearch';

export type SettingsScrollContentProps = {
  styles: SettingsScreenStyles;
  notificationsEnabled: boolean;
  onNotificationsToggle: (v: boolean) => void;
  exactAlarmStatus?: ExactAlarmStatus;
  onExactAlarmSettingsPress?: () => void;
  permissionStatus: NotificationPermissionStatus;
  onNotificationPermissionPress: () => void;
  notifMode: 'daily' | 'custom';
  onNotifModeChange: (mode: 'daily' | 'custom') => void;
  hour: number;
  minute: number;
  daySchedules: DaySchedule[];
  onDailyTimePress: () => void;
  onToggleDay: (index: number) => void;
  onEditDayTime: (index: number) => void;
  soundEnabled: boolean;
  onSoundToggle: (enabled: boolean) => void;
  themeMode: ThemeMode;
  onThemeModalOpen: () => void;
  readerViewMode: ViewMode;
  onReaderViewModePress: () => void;
  showChavrutaNotes: boolean;
  onChavrutaNotesToggle: (enabled: boolean) => void;
  hapticsEnabled: boolean;
  onHapticsToggle: (enabled: boolean) => void;
  fontSize: number;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  onGuideModalOpen: () => void;
  showSecularDate: boolean;
  onSecularDateToggle: (v: boolean) => void;
  showCalendarDaf: boolean;
  onCalendarDafToggle: (v: boolean) => void;
  showPersonalTrackBannerPref?: boolean;
  onPersonalTrackBannerToggle?: (v: boolean) => void;
  showConfettiPref: boolean;
  onConfettiToggle: (v: boolean) => void;
  showDevSection: boolean;
  scheduledCount: number;
  onTestNotification: () => void;
  onCheckScheduled: () => void;
  onResetModalOpen: () => void;
  lastBackupAt: string | null;
  onSaveBackupToFile?: () => void;
  onShareBackup?: () => void;
  onImportBackup?: () => void;
  updateAutoPromptEnabled?: boolean;
  onUpdateAutoPromptToggle?: (enabled: boolean) => void;
  onCheckAppUpdate?: () => void;
  onProbeGithubRelease?: () => void;
  onShareDownloadLink?: () => void;
  onShowWhatsNew?: () => void;
  storageSizeFormatted?: string;
  onClearCacheOpen?: () => void;
  onEmailCopied: () => void;
};

export default function SettingsScrollContent({
  styles,
  notificationsEnabled,
  onNotificationsToggle,
  exactAlarmStatus = 'not_required',
  onExactAlarmSettingsPress,
  permissionStatus,
  onNotificationPermissionPress,
  notifMode,
  onNotifModeChange,
  hour,
  minute,
  daySchedules,
  onDailyTimePress,
  onToggleDay,
  onEditDayTime,
  soundEnabled,
  onSoundToggle,
  themeMode,
  onThemeModalOpen,
  readerViewMode,
  onReaderViewModePress,
  showChavrutaNotes,
  onChavrutaNotesToggle,
  hapticsEnabled,
  onHapticsToggle,
  fontSize,
  onIncreaseFontSize,
  onDecreaseFontSize,
  onGuideModalOpen,
  showSecularDate,
  onSecularDateToggle,
  showCalendarDaf,
  onCalendarDafToggle,
  showPersonalTrackBannerPref,
  onPersonalTrackBannerToggle,
  showConfettiPref,
  onConfettiToggle,
  showDevSection,
  scheduledCount,
  onTestNotification,
  onCheckScheduled,
  onResetModalOpen,
  lastBackupAt,
  onSaveBackupToFile,
  onShareBackup,
  onImportBackup,
  updateAutoPromptEnabled,
  onUpdateAutoPromptToggle,
  onCheckAppUpdate,
  onProbeGithubRelease,
  onShareDownloadLink,
  onShowWhatsNew,
  storageSizeFormatted = '0 B',
  onClearCacheOpen,
  onEmailCopied,
}: SettingsScrollContentProps) {
  const theme = useTheme();
  const [mailHintVisible, setMailHintVisible] = useState(false);
  const [licensesVisible, setLicensesVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const copySupportEmail = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(SUPPORT_EMAIL);
      onEmailCopied();
    } catch {
      setMailHintVisible(true);
    }
  }, [onEmailCopied]);

  const openSupportEmail = useCallback(async () => {
    try {
      await Linking.openURL(getSupportMailtoUrl());
    } catch {
      setMailHintVisible(true);
    }
  }, []);

  const searchItems = [
    ...NOTIFICATIONS_SEARCH_ITEMS,
    ...DISPLAY_SEARCH_ITEMS,
    ...READER_SEARCH_ITEMS,
    ...PERSONAL_TRACK_SEARCH_ITEMS,
    ...BACKUP_SEARCH_ITEMS,
    ...DATA_SEARCH_ITEMS,
    ...ABOUT_SEARCH_ITEMS,
    ...(showDevSection ? DEV_SEARCH_ITEMS : []),
  ];
  const hasAnyMatch = matchesAnySetting(searchQuery, searchItems);

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.body}>
          <Animated.View entering={FadeIn.duration(400).delay(0)} style={styles.pageHeader}>
            <View style={styles.headerRow}>
              <View style={styles.accentBar} />
              <Text style={styles.pageTitle}>הגדרות</Text>
            </View>
            <Text style={styles.pageSubtitle}>התראות, תצוגה וניהול נתונים</Text>
          </Animated.View>

          <SettingsSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
          />

          {!hasAnyMatch && searchQuery.trim().length > 0 ? (
            <View style={styles.noResultsContainer}>
              <View style={styles.noResultsIconWrap}>
                <Ionicons name="search" size={24} color={theme.colors.accent} />
              </View>
              <Text style={styles.noResultsTitle}>לא נמצאו הגדרות תואמות</Text>
              <Text style={styles.noResultsText}>
                לא מצאנו תוצאות עבור "{searchQuery.trim()}"
              </Text>
              <TouchableOpacity
                style={styles.clearSearchBtn}
                onPress={() => setSearchQuery('')}
                activeOpacity={0.7}
              >
                <Text style={styles.clearSearchBtnText}>איפוס חיפוש</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <SettingsNotificationsSection
                styles={styles}
                searchQuery={searchQuery}
                isFirst
                notificationsEnabled={notificationsEnabled}
                onNotificationsToggle={onNotificationsToggle}
                notifMode={notifMode}
                onNotifModeChange={onNotifModeChange}
                hour={hour}
                minute={minute}
                daySchedules={daySchedules}
                onDailyTimePress={onDailyTimePress}
                onToggleDay={onToggleDay}
                onEditDayTime={onEditDayTime}
                exactAlarmStatus={exactAlarmStatus}
                onExactAlarmSettingsPress={onExactAlarmSettingsPress}
                permissionStatus={permissionStatus}
                onNotificationPermissionPress={onNotificationPermissionPress}
                soundEnabled={soundEnabled}
                onSoundToggle={onSoundToggle}
              />
              <SettingsDisplaySection
                styles={styles}
                searchQuery={searchQuery}
                isFirst={false}
                themeMode={themeMode}
                onThemeModalOpen={onThemeModalOpen}
                showSecularDate={showSecularDate}
                onSecularDateToggle={onSecularDateToggle}
                showCalendarDaf={showCalendarDaf}
                onCalendarDafToggle={onCalendarDafToggle}
                showConfettiPref={showConfettiPref}
                onConfettiToggle={onConfettiToggle}
              />
              <SettingsReaderSection
                styles={styles}
                searchQuery={searchQuery}
                isFirst={false}
                readerViewMode={readerViewMode}
                onReaderViewModePress={onReaderViewModePress}
                showChavrutaNotes={showChavrutaNotes}
                onChavrutaNotesToggle={onChavrutaNotesToggle}
                hapticsEnabled={hapticsEnabled}
                onHapticsToggle={onHapticsToggle}
                fontSize={fontSize}
                onIncreaseFontSize={onIncreaseFontSize}
                onDecreaseFontSize={onDecreaseFontSize}
              />
              {onPersonalTrackBannerToggle != null && showPersonalTrackBannerPref != null ? (
                <SettingsPersonalTrackSection
                  styles={styles}
                  searchQuery={searchQuery}
                  isFirst={false}
                  showPersonalTrackBannerPref={showPersonalTrackBannerPref}
                  onPersonalTrackBannerToggle={onPersonalTrackBannerToggle}
                />
              ) : null}
              <SettingsBackupSection
                styles={styles}
                searchQuery={searchQuery}
                isFirst={false}
                lastBackupAt={lastBackupAt}
                onSaveBackupToFile={onSaveBackupToFile}
                onShareBackup={onShareBackup}
                onImportBackup={onImportBackup}
              />
              <SettingsDataSection
                styles={styles}
                searchQuery={searchQuery}
                isFirst={false}
                storageSizeFormatted={storageSizeFormatted}
                onClearCacheOpen={onClearCacheOpen}
                onResetModalOpen={onResetModalOpen}
              />
              <SettingsAboutSection
                styles={styles}
                searchQuery={searchQuery}
                isFirst={false}
                onGuideModalOpen={onGuideModalOpen}
                onSupportPress={openSupportEmail}
                onSupportLongPress={copySupportEmail}
                onLicensesPress={() => setLicensesVisible(true)}
                updateAutoPromptEnabled={updateAutoPromptEnabled}
                onUpdateAutoPromptToggle={onUpdateAutoPromptToggle}
                onCheckAppUpdate={onCheckAppUpdate}
                onShowWhatsNew={onShowWhatsNew}
                onShareDownloadLink={onShareDownloadLink}
              />
              {showDevSection ? (
                <SettingsDevSection
                  styles={styles}
                  searchQuery={searchQuery}
                  isFirst={false}
                  scheduledCount={scheduledCount}
                  onTestNotification={onTestNotification}
                  onCheckScheduled={onCheckScheduled}
                  onProbeGithubRelease={onProbeGithubRelease}
                />
              ) : null}
            </>
          )}

          <Text style={styles.privacyNote}>
            הנתונים שלך נשמרים באופן מקומי בלבד על המכשיר שלך.
          </Text>

          <SettingsFooter />
        </View>
      </ScrollView>

      <InfoModal
        visible={mailHintVisible}
        onClose={() => setMailHintVisible(false)}
        title="לא נפתחה אפליקציית המייל"
        message="לפעמים המכשיר לא מפנה לאפליקציית דוא״ל. ניתן להעתיק את הכתובת ולכתוב אלינו מכל אפליקציה."
        emphasis={SUPPORT_EMAIL}
        secondaryLabel="העתק כתובת"
        onSecondary={() => {
          void copySupportEmail();
          setMailHintVisible(false);
        }}
      />

      <ContentLicensesModal
        visible={licensesVisible}
        onClose={() => setLicensesVisible(false)}
      />
    </>
  );
}
