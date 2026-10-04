import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Linking, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import { ThemeMode, useTheme } from '../../theme';
import type { ViewMode } from '../SefariaReader/ReaderToolbar';
import type { DafDayStartDaySchedule, DafDayStartMode } from '../../utils/dafDayBoundary';
import { SettingsSearchBar } from './SettingsSearchBar';
import { SettingsFooter } from './SettingsFooter';
import SettingsOverviewCard from './SettingsOverviewCard';
import SettingsCollapsibleCard from './SettingsCollapsibleCard';
import SettingsNotificationsSection from './Sections/SettingsNotificationsSection';
import SettingsDisplaySection from './Sections/SettingsDisplaySection';
import SettingsReaderSection from './Sections/SettingsReaderSection';
import SettingsBackupSection from './Sections/SettingsBackupSection';
import SettingsDataSection from './Sections/SettingsDataSection';
import SettingsHelpSection from './Sections/SettingsHelpSection';
import SettingsUpdatesSection from './Sections/SettingsUpdatesSection';
import SettingsDevSection from './Sections/SettingsDevSection';
import InfoModal from '../InfoModal';
import ContentLicensesModal from './Modals/ContentLicensesModal';
import type { SettingsScreenStyles } from './settingsScreenStyles';
import type { DaySchedule } from './Schedule/DayScheduleList';
import type { ExactAlarmStatus } from '../../utils/exactAlarm';
import type { NotificationPermissionStatus } from '../../utils/notificationPermission';
import { SUPPORT_EMAIL, PRIVACY_POLICY_URL, getSupportMailtoUrl } from '../../supportContact';
import {
  hasVisibleSettingsMatch,
  countVisibleSettingsMatches,
  type VisibleSettingsSearchContext,
} from '../../utils/settingsVisibleSearch';
import { formatNotificationTime, getThemeModeSettingDisplay } from '../../utils/settingsScreen';
import { getReaderViewModeLabel } from '../../utils/readerViewMode';
import { formatLastBackupAt } from '../../utils/backupReminder';
import { useSettingsAccordion, type SettingsSectionKey } from '../../hooks/useSettingsAccordion';

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
  dafDayStartMode: DafDayStartMode;
  dafDayStartHour: number;
  dafDayStartMinute: number;
  dafDayStartSchedules: DafDayStartDaySchedule[];
  onDafDayStartModeOpen: () => void;
  onDafDayStartTimeOpen: () => void;
  onEditDafDayStartDay: (index: number) => void;
  readerViewMode: ViewMode;
  onReaderViewModePress: () => void;
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
  dafDayStartMode,
  dafDayStartHour,
  dafDayStartMinute,
  dafDayStartSchedules,
  onDafDayStartModeOpen,
  onDafDayStartTimeOpen,
  onEditDafDayStartDay,
  readerViewMode,
  onReaderViewModePress,
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

  const { openSection, toggleSection, openSectionByName } = useSettingsAccordion(null);

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

  const openPrivacyPolicy = useCallback(() => {
    void Linking.openURL(PRIVACY_POLICY_URL);
  }, []);

  const searchContext: VisibleSettingsSearchContext = {
    notificationsEnabled,
    notifMode,
    exactAlarmStatus,
    hasExactAlarmHandler: onExactAlarmSettingsPress != null,
    permissionStatus,
    dafDayStartMode,
    hasPersonalTrack:
      onPersonalTrackBannerToggle != null && showPersonalTrackBannerPref != null,
    hasSaveBackup: onSaveBackupToFile != null,
    hasShareBackup: onShareBackup != null,
    hasImportBackup: onImportBackup != null,
    hasClearCache: onClearCacheOpen != null,
    hasAutoUpdate: updateAutoPromptEnabled != null && onUpdateAutoPromptToggle != null,
    hasCheckUpdate: onCheckAppUpdate != null,
    hasWhatsNew: onShowWhatsNew != null,
    hasShareDownload: onShareDownloadLink != null,
    showDevSection,
  };

  const hasAnyMatch = hasVisibleSettingsMatch(searchQuery, searchContext);
  const resultCount = countVisibleSettingsMatches(searchQuery, searchContext);
  const isSearching = searchQuery.trim().length > 0;

  const notifSummary = !notificationsEnabled
    ? 'כבוי'
    : notifMode === 'daily'
      ? `יומי בשעה ${formatNotificationTime(hour, minute)}`
      : 'לפי ימי השבוע';

  const readerSummary = `${getReaderViewModeLabel(readerViewMode)}, גופן ${fontSize}`;
  const themeDisplay = getThemeModeSettingDisplay(themeMode);
  const displaySummary = `${themeDisplay.label}, החלפה ${dafDayStartMode === 'midnight' ? 'בחצות' : 'מותאמת'}`;
  const backupFormatted = formatLastBackupAt(lastBackupAt);
  const backupSummary = `${backupFormatted ? 'מעודכן' : 'טרם גובה'} • ${storageSizeFormatted}`;
  const appVersion = Constants.expoConfig?.version;
  const helpSummary = appVersion ? `גרסה ${appVersion} • מדריך ועזרה` : 'מדריך למשתמש ועזרה';

  const isCardExpanded = (key: SettingsSectionKey) => isSearching || openSection === key;

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
              <View style={styles.headerIconWrap}>
                <Ionicons name="options-outline" size={20} color={theme.colors.accent} />
              </View>
              <View>
                <Text style={styles.pageTitle}>הגדרות</Text>
                <Text style={styles.pageSubtitle}>התראות, תצוגה וניהול נתונים</Text>
              </View>
            </View>
          </Animated.View>

          <SettingsSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            resultCount={resultCount}
          />

          {!isSearching ? (
            <SettingsOverviewCard
              notificationsEnabled={notificationsEnabled}
              notifMode={notifMode}
              hour={hour}
              minute={minute}
              daySchedules={daySchedules}
              themeMode={themeMode}
              lastBackupAt={lastBackupAt}
              onNotificationsPress={() => {
                if (!notificationsEnabled) {
                  onNotificationsToggle(true);
                }
                openSectionByName('notifications');
                if (notifMode === 'daily') {
                  onDailyTimePress();
                }
              }}
              onThemePress={onThemeModalOpen}
              onBackupPress={() => {
                openSectionByName('backup_data');
              }}
            />
          ) : null}

          {!hasAnyMatch && isSearching ? (
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
              <SettingsCollapsibleCard
                title="התראות ותזכורות"
                subtitle={notifSummary}
                icon="notifications-outline"
                accentColor={theme.colors.accent}
                isExpanded={isCardExpanded('notifications')}
                onToggle={() => toggleSection('notifications')}
              >
                <SettingsNotificationsSection
                  styles={styles}
                  searchQuery={searchQuery}
                  isFirst
                  embedded
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
              </SettingsCollapsibleCard>

              <SettingsCollapsibleCard
                title="חוויית קריאה ולימוד"
                subtitle={readerSummary}
                icon="book-outline"
                accentColor={theme.colors.accent}
                isExpanded={isCardExpanded('reader')}
                onToggle={() => toggleSection('reader')}
              >
                <SettingsReaderSection
                  styles={styles}
                  searchQuery={searchQuery}
                  isFirst
                  embedded
                  readerViewMode={readerViewMode}
                  onReaderViewModePress={onReaderViewModePress}
                  gemaraNikud={gemaraNikud}
                  onGemaraNikudToggle={onGemaraNikudToggle}
                  showChavrutaNotes={showChavrutaNotes}
                  onChavrutaNotesToggle={onChavrutaNotesToggle}
                  hapticsEnabled={hapticsEnabled}
                  onHapticsToggle={onHapticsToggle}
                  keepScreenAwake={keepScreenAwake}
                  onKeepScreenAwakeToggle={onKeepScreenAwakeToggle}
                  fontSize={fontSize}
                  onIncreaseFontSize={onIncreaseFontSize}
                  onDecreaseFontSize={onDecreaseFontSize}
                />
              </SettingsCollapsibleCard>

              <SettingsCollapsibleCard
                title="מראה ותצוגה"
                subtitle={displaySummary}
                icon="color-palette-outline"
                accentColor={theme.colors.gold}
                isExpanded={isCardExpanded('display')}
                onToggle={() => toggleSection('display')}
              >
                <SettingsDisplaySection
                  styles={styles}
                  searchQuery={searchQuery}
                  isFirst
                  embedded
                  themeMode={themeMode}
                  onThemeModalOpen={onThemeModalOpen}
                  dafDayStartMode={dafDayStartMode}
                  dafDayStartHour={dafDayStartHour}
                  dafDayStartMinute={dafDayStartMinute}
                  dafDayStartSchedules={dafDayStartSchedules}
                  onDafDayStartModeOpen={onDafDayStartModeOpen}
                  onDafDayStartTimeOpen={onDafDayStartTimeOpen}
                  onEditDafDayStartDay={onEditDafDayStartDay}
                  showSecularDate={showSecularDate}
                  onSecularDateToggle={onSecularDateToggle}
                  showCalendarDaf={showCalendarDaf}
                  onCalendarDafToggle={onCalendarDafToggle}
                  showConfettiPref={showConfettiPref}
                  onConfettiToggle={onConfettiToggle}
                  showPersonalTrackBannerPref={showPersonalTrackBannerPref}
                  onPersonalTrackBannerToggle={onPersonalTrackBannerToggle}
                />
              </SettingsCollapsibleCard>

              <SettingsCollapsibleCard
                title="נתונים, גיבוי וזיכרון"
                subtitle={backupSummary}
                icon="cloud-upload-outline"
                accentColor={theme.colors.success}
                isExpanded={isCardExpanded('backup_data')}
                onToggle={() => toggleSection('backup_data')}
              >
                <SettingsBackupSection
                  styles={styles}
                  searchQuery={searchQuery}
                  isFirst
                  embedded
                  lastBackupAt={lastBackupAt}
                  onSaveBackupToFile={onSaveBackupToFile}
                  onShareBackup={onShareBackup}
                  onImportBackup={onImportBackup}
                />
                <SettingsDataSection
                  styles={styles}
                  searchQuery={searchQuery}
                  isFirst={false}
                  embedded
                  storageSizeFormatted={storageSizeFormatted}
                  onClearCacheOpen={onClearCacheOpen}
                  onResetModalOpen={onResetModalOpen}
                />
              </SettingsCollapsibleCard>

              <SettingsCollapsibleCard
                title="עזרה, עדכונים ומידע"
                subtitle={helpSummary}
                icon="information-circle-outline"
                accentColor={theme.colors.accent}
                isExpanded={isCardExpanded('help_updates')}
                onToggle={() => toggleSection('help_updates')}
              >
                <SettingsHelpSection
                  styles={styles}
                  searchQuery={searchQuery}
                  isFirst
                  embedded
                  onGuideModalOpen={onGuideModalOpen}
                  onSupportPress={openSupportEmail}
                  onSupportLongPress={copySupportEmail}
                  onPrivacyPolicyPress={openPrivacyPolicy}
                  onLicensesPress={() => setLicensesVisible(true)}
                />
                <SettingsUpdatesSection
                  styles={styles}
                  searchQuery={searchQuery}
                  isFirst={false}
                  embedded
                  updateAutoPromptEnabled={updateAutoPromptEnabled}
                  onUpdateAutoPromptToggle={onUpdateAutoPromptToggle}
                  onCheckAppUpdate={onCheckAppUpdate}
                  onShowWhatsNew={onShowWhatsNew}
                  onShareDownloadLink={onShareDownloadLink}
                />
              </SettingsCollapsibleCard>

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
            הנתונים שלך נשמרים באופן מקומי בלבד על המכשיר שלך. מדיניות הפרטיות המלאה זמינה בהגדרות תחת עזרה.
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
