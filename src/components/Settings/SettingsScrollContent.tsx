import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useTheme } from '../../theme';
import { SettingsSearchBar } from './SettingsSearchBar';
import { SettingsFooter } from './SettingsFooter';
import SettingsOverviewCard from './SettingsOverviewCard';
import SettingsCollapsibleCard from './SettingsCollapsibleCard';
import SettingsNotificationsSection from './Sections/SettingsNotificationsSection';
import SettingsDisplaySection from './Sections/SettingsDisplaySection';
import SettingsReaderSection from './Sections/SettingsReaderSection';
import SettingsBackupSection from './Sections/SettingsBackupSection';
import SettingsDataSection from './Sections/SettingsDataSection';
import SettingsOfflineSection from './Sections/SettingsOfflineSection';
import SettingsHelpSection from './Sections/SettingsHelpSection';
import SettingsUpdatesSection from './Sections/SettingsUpdatesSection';
import SettingsDevSection from './Sections/SettingsDevSection';
import InfoModal from '../InfoModal';
import ContentLicensesModal from './Modals/ContentLicensesModal';
import SiyumNusachModal from './Modals/SiyumNusachModal';
import { SUPPORT_EMAIL } from '../../supportContact';
import {
  hasVisibleSettingsMatch,
  countVisibleSettingsMatches,
  hasVisibleSectionMatch,
  type VisibleSettingsSearchContext,
  type VisibleSettingsSearchSection,
} from '../../utils/settingsVisibleSearch';
import {
  buildBackupSummary,
  buildDisplaySummary,
  buildHelpSummary,
  buildNotificationsSummary,
  buildOfflineSummary,
  buildReaderSummary,
} from '../../utils/settingsSummaries';
import { useSettingsAccordion, type SettingsSectionKey } from '../../hooks/useSettingsAccordion';
import { useSettingsHelpChrome } from '../../hooks/useSettingsHelpChrome';
import { useAppStore } from '../../store/useAppStore';
import type { SettingsScrollContentProps } from './settingsScrollContent.types';

export type { SettingsScrollContentProps } from './settingsScrollContent.types';

export default function SettingsScrollContent({
  styles,
  notifications,
  reader,
  display,
  offline,
  backupData,
  helpUpdates,
  dev,
}: SettingsScrollContentProps) {
  const theme = useTheme();
  const todayMasechet = useAppStore((state) => state.todayMasechet);
  const todayMasechetEn = useAppStore((state) => state.todayMasechetEn);
  const {
    searchQuery,
    setSearchQuery,
    clearSearch,
    mailHintVisible,
    closeMailHint,
    licensesVisible,
    openLicenses,
    closeLicenses,
    siyumNusachVisible,
    openSiyumNusach,
    closeSiyumNusach,
    copySupportEmail,
    openSupportEmail,
    openPrivacyPolicy,
  } = useSettingsHelpChrome({ onEmailCopied: helpUpdates.onEmailCopied });

  const { openSection, toggleSection, openSectionByName } = useSettingsAccordion(null);

  const searchContext: VisibleSettingsSearchContext = {
    notificationsEnabled: notifications.notificationsEnabled,
    notifMode: notifications.notifMode,
    exactAlarmStatus: notifications.exactAlarmStatus ?? 'not_required',
    hasExactAlarmHandler: notifications.onExactAlarmSettingsPress != null,
    permissionStatus: notifications.permissionStatus,
    dafDayStartMode: display.dafDayStartMode,
    hasPersonalTrack:
      display.onPersonalTrackBannerToggle != null &&
      display.showPersonalTrackBannerPref != null,
    hasSaveBackup: backupData.onSaveBackupToFile != null,
    hasShareBackup: backupData.onShareBackup != null,
    hasImportBackup: backupData.onImportBackup != null,
    hasClearCache: offline.onClearCacheOpen != null,
    hasOfflinePrefetch: offline.onDownloadDays != null,
    hasAutoUpdate:
      helpUpdates.updateAutoPromptEnabled != null &&
      helpUpdates.onUpdateAutoPromptToggle != null,
    hasCheckUpdate: helpUpdates.onCheckAppUpdate != null,
    hasWhatsNew: helpUpdates.onShowWhatsNew != null,
    hasShareDownload: helpUpdates.onShareDownloadLink != null,
    showDevSection: dev.showDevSection,
  };

  const hasAnyMatch = hasVisibleSettingsMatch(searchQuery, searchContext);
  const resultCount = countVisibleSettingsMatches(searchQuery, searchContext);
  const isSearching = searchQuery.trim().length > 0;

  const storageSizeFormatted = offline.storageSizeFormatted ?? '0 B';
  const notifSummary = buildNotificationsSummary(
    notifications.notificationsEnabled,
    notifications.notifMode,
    notifications.hour,
    notifications.minute,
  );
  const readerSummary = buildReaderSummary(
    reader.readerViewMode,
    reader.readerTheme,
    reader.fontSize,
  );
  const displaySummary = buildDisplaySummary(
    display.themeMode,
    display.dafDayStartMode,
    display.dafDayStartHour,
    display.dafDayStartMinute,
  );
  const backupSummary = buildBackupSummary(backupData.lastBackupAt);
  const offlineSummary = buildOfflineSummary(
    offline.offlinePrefetchStatusLabel,
    storageSizeFormatted,
  );
  const helpSummary = buildHelpSummary(Constants.expoConfig?.version);

  const isCardExpanded = (key: SettingsSectionKey) =>
    isSearching || openSection === key || (key === 'offline' && offline.isPrefetching);
  const shouldShowSection = (key: VisibleSettingsSearchSection) =>
    !isSearching || hasVisibleSectionMatch(searchQuery, key, searchContext);

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
            onClear={clearSearch}
            resultCount={resultCount}
          />

          {!isSearching ? (
            <SettingsOverviewCard
              notificationsEnabled={notifications.notificationsEnabled}
              notifMode={notifications.notifMode}
              hour={notifications.hour}
              minute={notifications.minute}
              daySchedules={notifications.daySchedules}
              themeMode={display.themeMode}
              lastBackupAt={backupData.lastBackupAt}
              onNotificationsPress={() => {
                openSectionByName('notifications');
                if (notifications.notificationsEnabled && notifications.notifMode === 'daily') {
                  notifications.onDailyTimePress();
                }
              }}
              onThemePress={display.onThemeModalOpen}
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
                onPress={clearSearch}
                activeOpacity={0.7}
              >
                <Text style={styles.clearSearchBtnText}>איפוס חיפוש</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {shouldShowSection('notifications') ? (
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
                    notificationsEnabled={notifications.notificationsEnabled}
                    onNotificationsToggle={notifications.onNotificationsToggle}
                    notifMode={notifications.notifMode}
                    onNotifModeChange={notifications.onNotifModeChange}
                    hour={notifications.hour}
                    minute={notifications.minute}
                    daySchedules={notifications.daySchedules}
                    onDailyTimePress={notifications.onDailyTimePress}
                    onToggleDay={notifications.onToggleDay}
                    onEditDayTime={notifications.onEditDayTime}
                    exactAlarmStatus={notifications.exactAlarmStatus ?? 'not_required'}
                    onExactAlarmSettingsPress={notifications.onExactAlarmSettingsPress}
                    permissionStatus={notifications.permissionStatus}
                    onNotificationPermissionPress={notifications.onNotificationPermissionPress}
                    soundEnabled={notifications.soundEnabled}
                    onSoundToggle={notifications.onSoundToggle}
                  />
                </SettingsCollapsibleCard>
              ) : null}

              {shouldShowSection('reader') ? (
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
                    readerViewMode={reader.readerViewMode}
                    onReaderViewModePress={reader.onReaderViewModePress}
                    readerTheme={reader.readerTheme}
                    onReaderThemePress={reader.onReaderThemePress}
                    gemaraNikud={reader.gemaraNikud}
                    onGemaraNikudToggle={reader.onGemaraNikudToggle}
                    showChavrutaNotes={reader.showChavrutaNotes}
                    onChavrutaNotesToggle={reader.onChavrutaNotesToggle}
                    hapticsEnabled={reader.hapticsEnabled}
                    onHapticsToggle={reader.onHapticsToggle}
                    keepScreenAwake={reader.keepScreenAwake}
                    onKeepScreenAwakeToggle={reader.onKeepScreenAwakeToggle}
                    fontSize={reader.fontSize}
                    onIncreaseFontSize={reader.onIncreaseFontSize}
                    onDecreaseFontSize={reader.onDecreaseFontSize}
                  />
                </SettingsCollapsibleCard>
              ) : null}

              {shouldShowSection('display') ? (
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
                    themeMode={display.themeMode}
                    onThemeModalOpen={display.onThemeModalOpen}
                    dafDayStartMode={display.dafDayStartMode}
                    dafDayStartHour={display.dafDayStartHour}
                    dafDayStartMinute={display.dafDayStartMinute}
                    dafDayStartSchedules={display.dafDayStartSchedules}
                    onDafDayStartModeOpen={display.onDafDayStartModeOpen}
                    onDafDayStartTimeOpen={display.onDafDayStartTimeOpen}
                    onEditDafDayStartDay={display.onEditDafDayStartDay}
                    showSecularDate={display.showSecularDate}
                    onSecularDateToggle={display.onSecularDateToggle}
                    showCalendarDaf={display.showCalendarDaf}
                    onCalendarDafToggle={display.onCalendarDafToggle}
                    showConfettiPref={display.showConfettiPref}
                    onConfettiToggle={display.onConfettiToggle}
                    showPersonalTrackBannerPref={display.showPersonalTrackBannerPref}
                    onPersonalTrackBannerToggle={display.onPersonalTrackBannerToggle}
                  />
                </SettingsCollapsibleCard>
              ) : null}

              {shouldShowSection('offline') ? (
                <SettingsCollapsibleCard
                  title="לימוד ללא רשת"
                  subtitle={offlineSummary}
                  icon="cloud-download-outline"
                  accentColor={theme.colors.accent}
                  isExpanded={isCardExpanded('offline')}
                  onToggle={() => toggleSection('offline')}
                >
                  <SettingsOfflineSection
                    styles={styles}
                    searchQuery={searchQuery}
                    isFirst
                    embedded
                    dayCount={offline.dayCount}
                    daysStatus={offline.daysStatus}
                    dafYomiMasechet={offline.dafYomiMasechet}
                    personalMasechet={offline.personalMasechet}
                    isPrefetching={offline.isPrefetching}
                    prefetchProgress={offline.prefetchProgress}
                    activeTargetLabel={offline.activeTargetLabel}
                    storageSizeFormatted={storageSizeFormatted}
                    onDownloadDays={offline.onDownloadDays}
                    onDownloadMasechet={offline.onDownloadMasechet}
                    onCancelDownload={offline.onCancelDownload}
                    onClearCacheOpen={offline.onClearCacheOpen}
                  />
                </SettingsCollapsibleCard>
              ) : null}

              {shouldShowSection('backup_data') ? (
                <SettingsCollapsibleCard
                  title="נתונים וגיבוי"
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
                    lastBackupAt={backupData.lastBackupAt}
                    onSaveBackupToFile={backupData.onSaveBackupToFile}
                    onShareBackup={backupData.onShareBackup}
                    onImportBackup={backupData.onImportBackup}
                  />
                  <SettingsDataSection
                    styles={styles}
                    searchQuery={searchQuery}
                    isFirst={false}
                    embedded
                    onResetModalOpen={backupData.onResetModalOpen}
                  />
                </SettingsCollapsibleCard>
              ) : null}

              {shouldShowSection('help_updates') ? (
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
                    onGuideModalOpen={helpUpdates.onGuideModalOpen}
                    onSupportPress={openSupportEmail}
                    onSupportLongPress={copySupportEmail}
                    onPrivacyPolicyPress={openPrivacyPolicy}
                    onSiyumNusachPress={openSiyumNusach}
                    onLicensesPress={openLicenses}
                  />
                  <SettingsUpdatesSection
                    styles={styles}
                    searchQuery={searchQuery}
                    isFirst={false}
                    embedded
                    updateAutoPromptEnabled={helpUpdates.updateAutoPromptEnabled}
                    onUpdateAutoPromptToggle={helpUpdates.onUpdateAutoPromptToggle}
                    onCheckAppUpdate={helpUpdates.onCheckAppUpdate}
                    onShowWhatsNew={helpUpdates.onShowWhatsNew}
                    onShareDownloadLink={helpUpdates.onShareDownloadLink}
                  />
                </SettingsCollapsibleCard>
              ) : null}

              {dev.showDevSection && shouldShowSection('dev') ? (
                <SettingsDevSection
                  styles={styles}
                  searchQuery={searchQuery}
                  isFirst={false}
                  scheduledCount={dev.scheduledCount}
                  onTestNotification={dev.onTestNotification}
                  onCheckScheduled={dev.onCheckScheduled}
                  onProbeGithubRelease={dev.onProbeGithubRelease}
                />
              ) : null}
            </>
          )}

          <Text style={styles.privacyNote}>
            הנתונים שלך נשמרים באופן מקומי בלבד על המכשיר שלך. מדיניות הפרטיות המלאה זמינה תחת עזרה.
          </Text>

          <SettingsFooter />
        </View>
      </ScrollView>

      <InfoModal
        visible={mailHintVisible}
        onClose={closeMailHint}
        title="לא נפתחה אפליקציית המייל"
        message="לפעמים המכשיר לא מפנה לאפליקציית דוא״ל. ניתן להעתיק את הכתובת ולכתוב אלינו מכל אפליקציה."
        emphasis={SUPPORT_EMAIL}
        secondaryLabel="העתק כתובת"
        onSecondary={() => {
          void copySupportEmail();
          closeMailHint();
        }}
      />

      <ContentLicensesModal
        visible={licensesVisible}
        onClose={closeLicenses}
      />

      <SiyumNusachModal
        visible={siyumNusachVisible}
        onClose={closeSiyumNusach}
        initialMasechetEn={todayMasechetEn}
        initialMasechetHe={todayMasechet}
      />
    </>
  );
}
