import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Linking, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { ThemeMode, useTheme } from '../../theme';
import { SettingItem } from './SettingItem';
import { SectionHeader } from './SectionHeader';
import { NotifModeToggle } from './NotifModeToggle';
import { DayScheduleList } from './DayScheduleList';
import type { DaySchedule } from './DayScheduleList';
import { SettingsFooter } from './SettingsFooter';
import StudyLinkModeToggle from './StudyLinkModeToggle';
import { SettingsSearchBar } from './SettingsSearchBar';
import type { SettingsScreenStyles } from './settingsScreenStyles';
import type { StudyLinkMode } from '../../utils/studyLinkMode';
import InfoModal from '../InfoModal';
import {
  formatNotificationTime,
  getThemeModeSettingDisplay,
} from '../../utils/settingsScreen';
import { SUPPORT_EMAIL, getSupportMailtoUrl } from '../../supportContact';
import type { ExactAlarmStatus } from '../../utils/exactAlarm';

export type SettingsScrollContentProps = {
  styles: SettingsScreenStyles;
  notificationsEnabled: boolean;
  onNotificationsToggle: (v: boolean) => void;
  exactAlarmStatus?: ExactAlarmStatus;
  onExactAlarmSettingsPress?: () => void;
  notifMode: 'daily' | 'custom';
  onNotifModeChange: (mode: 'daily' | 'custom') => void;
  hour: number;
  minute: number;
  daySchedules: DaySchedule[];
  onDailyTimePress: () => void;
  onToggleDay: (index: number) => void;
  onEditDayTime: (index: number) => void;
  themeMode: ThemeMode;
  onThemeModalOpen: () => void;
  onGuideModalOpen: () => void;
  showSecularDate: boolean;
  onSecularDateToggle: (v: boolean) => void;
  showCalendarDaf: boolean;
  onCalendarDafToggle: (v: boolean) => void;
  showPersonalTrackBannerPref?: boolean;
  onPersonalTrackBannerToggle?: (v: boolean) => void;
  showConfettiPref: boolean;
  onConfettiToggle: (v: boolean) => void;
  studyLinkMode: StudyLinkMode;
  onStudyLinkModeChange: (mode: StudyLinkMode) => void;
  showDevSection: boolean;
  scheduledCount: number;
  onTestNotification: () => void;
  onCheckScheduled: () => void;
  onResetModalOpen: () => void;
  onSaveBackupToFile?: () => void;
  onShareBackup?: () => void;
  onImportBackup?: () => void;
  updateAutoPromptEnabled?: boolean;
  onUpdateAutoPromptToggle?: (enabled: boolean) => void;
  onCheckAppUpdate?: () => void;
  onProbeGithubRelease?: () => void;
  onShareDownloadLink?: () => void;
};

export default function SettingsScrollContent({
  styles,
  notificationsEnabled,
  onNotificationsToggle,
  exactAlarmStatus = 'not_required',
  onExactAlarmSettingsPress,
  notifMode,
  onNotifModeChange,
  hour,
  minute,
  daySchedules,
  onDailyTimePress,
  onToggleDay,
  onEditDayTime,
  themeMode,
  onThemeModalOpen,
  onGuideModalOpen,
  showSecularDate,
  onSecularDateToggle,
  showCalendarDaf,
  onCalendarDafToggle,
  showPersonalTrackBannerPref,
  onPersonalTrackBannerToggle,
  showConfettiPref,
  onConfettiToggle,
  studyLinkMode,
  onStudyLinkModeChange,
  showDevSection,
  scheduledCount,
  onTestNotification,
  onCheckScheduled,
  onResetModalOpen,
  onSaveBackupToFile,
  onShareBackup,
  onImportBackup,
  updateAutoPromptEnabled,
  onUpdateAutoPromptToggle,
  onCheckAppUpdate,
  onProbeGithubRelease,
  onShareDownloadLink,
}: SettingsScrollContentProps) {
  const theme = useTheme();
  const themeDisplay = getThemeModeSettingDisplay(themeMode);
  const [mailHintVisible, setMailHintVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const matchItem = useCallback(
    (title: string, description?: string) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      return (
        title.toLowerCase().includes(q) ||
        (description != null && description.toLowerCase().includes(q))
      );
    },
    [searchQuery],
  );

  const showExactAlarmRow =
    notificationsEnabled &&
    exactAlarmStatus !== 'not_required' &&
    onExactAlarmSettingsPress != null;
  const exactAlarmLabel =
    exactAlarmStatus === 'granted'
      ? 'פעיל'
      : exactAlarmStatus === 'denied'
        ? 'דורש הרשאה'
        : 'לא זמין ב-Expo Go';

  const openSupportEmail = useCallback(async () => {
    try {
      await Linking.openURL(getSupportMailtoUrl());
    } catch {
      setMailHintVisible(true);
    }
  }, []);

  const sec1Match =
    matchItem('תזכורת יומית', 'קבל התראה בשעה היעודה') ||
    (notificationsEnabled &&
      (matchItem('זמן ההתראה', 'מתי תרצה ללמוד כל יום?') ||
        matchItem('תזכורות מדויקות', exactAlarmStatus === 'denied' ? 'לחץ כדי לאשר תזמון מדויק בהגדרות המכשיר' : 'התזכורת תצלצל בדיוק בשעה שבחרת')));

  const sec2Match =
    matchItem('מצב תצוגה', 'בחר מצב בהיר/כהה או לפי המערכת') ||
    matchItem('מדריך שימוש', 'למד כיצד להשתמש בכל התכונות והאפשרויות') ||
    matchItem('הצג תאריך לועזי', 'הצגת התאריך הלועזי לצד העברי') ||
    matchItem('הצג דף בלוח שנה', 'הצגת מספר הדף היומי בכל תא בלוח השנה') ||
    matchItem('אפקטים חגיגיים', 'הצגת קונפטי בסיום לימוד דף') ||
    matchItem('כפתורי לימוד במסך הבית ובלוח');

  const sec3Match = matchItem('תמיכה ויצירת קשר', 'משוב והצעות לשיפור');

  const sec4Match =
    (updateAutoPromptEnabled != null && matchItem('התראות עדכון אוטומטיות', 'בדיקת עדכונים אוטומטית בפתיחת האפליקציה')) ||
    (onCheckAppUpdate != null && matchItem('בדוק עדכונים', 'מוודא אם יש גרסה חדשה לאפליקציה')) ||
    (onShareDownloadLink != null && matchItem('שתף קישור להורדה', 'שלח לחברים קישור להתקנת מסע דף'));

  const sec5Match =
    showDevSection &&
    (matchItem('שלח התראת בדיקה', 'בדוק שההתראות עובדות') ||
      matchItem('בדוק התראות מתוזמנות', `${scheduledCount} התראות מתוזמנות`) ||
      (onProbeGithubRelease != null && matchItem('בדוק תגובת GitHub', 'מציג טאג ושם APK')));

  const sec6Match =
    (onSaveBackupToFile != null && matchItem('שמור גיבוי לקובץ', 'שמור קובץ JSON במכשיר')) ||
    (onShareBackup != null && matchItem('שתף גיבוי', 'שלח את קובץ הגיבוי')) ||
    (onImportBackup != null && matchItem('ייבא גיבוי', 'שחזור נתונים מקובץ גיבוי קודם'));

  const sec7Match = matchItem('איפוס נתונים', 'מחיקת נתוני דף יומי, מסלול אישי או איפוס כללי');

  const visibleSections = [
    sec1Match,
    sec2Match,
    sec3Match,
    sec4Match,
    sec5Match,
    sec6Match,
    sec7Match,
  ];
  const firstVisibleIndex = visibleSections.findIndex(Boolean);

  const hasAnyMatch =
    sec1Match || sec2Match || sec3Match || sec4Match || sec5Match || sec6Match || sec7Match;

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

          <View>
            <SettingsSearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={() => setSearchQuery('')}
            />
          </View>

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
              {sec1Match && (
                <>
                  <SectionHeader
                    title="התראות ותזכורות"
                    icon="notifications-outline"
                    isFirst={firstVisibleIndex === 0}
                  />
                  <View style={styles.card}>
                    {matchItem('תזכורת יומית', 'קבל התראה בשעה היעודה') && (
                      <SettingItem
                        icon="notifications-outline"
                        title="תזכורת יומית"
                        description="קבל התראה בשעה היעודה"
                        type="switch"
                        value={notificationsEnabled}
                        onPress={onNotificationsToggle}
                        isLast={!notificationsEnabled}
                        highlightText={searchQuery}
                      />
                    )}
                    {notificationsEnabled && (
                      <>
                        {!searchQuery.trim() && (
                          <NotifModeToggle mode={notifMode} onChange={onNotifModeChange} />
                        )}
                        {notifMode === 'daily' && matchItem('זמן ההתראה', 'מתי תרצה ללמוד כל יום?') && (
                          <SettingItem
                            icon="time-outline"
                            title="זמן ההתראה"
                            description="מתי תרצה ללמוד כל יום?"
                            value={formatNotificationTime(hour, minute)}
                            onPress={onDailyTimePress}
                            isLast={!showExactAlarmRow}
                            highlightText={searchQuery}
                          />
                        )}
                        {notifMode === 'custom' && !searchQuery.trim() && (
                          <DayScheduleList
                            schedules={daySchedules}
                            onToggleDay={onToggleDay}
                            onEditTime={onEditDayTime}
                          />
                        )}
                        {showExactAlarmRow && matchItem('תזכורות מדויקות') && (
                          <SettingItem
                            icon="alarm-outline"
                            title="תזכורות מדויקות"
                            description={
                              exactAlarmStatus === 'denied'
                                ? 'לחץ כדי לאשר תזמון מדויק בהגדרות המכשיר'
                                : 'התזכורת תצלצל בדיוק בשעה שבחרת'
                            }
                            value={exactAlarmLabel}
                            onPress={onExactAlarmSettingsPress}
                            isLast
                            highlightText={searchQuery}
                          />
                        )}
                      </>
                    )}
                  </View>
                </>
              )}

              {sec2Match && (
                <>
                  <SectionHeader
                    title="תצוגה והעדפות"
                    icon="color-palette-outline"
                    isFirst={firstVisibleIndex === 1}
                  />
                  <View style={styles.card}>
                    {matchItem('מצב תצוגה', 'בחר מצב בהיר/כהה או לפי המערכת') && (
                      <SettingItem
                        icon={themeDisplay.icon}
                        title="מצב תצוגה"
                        description="בחר מצב בהיר/כהה או לפי המערכת"
                        value={themeDisplay.label}
                        onPress={onThemeModalOpen}
                        highlightText={searchQuery}
                      />
                    )}
                    {matchItem('מדריך שימוש', 'למד כיצד להשתמש בכל התכונות והאפשרויות') && (
                      <SettingItem
                        icon="help-circle-outline"
                        title="מדריך שימוש"
                        description="למד כיצד להשתמש בכל התכונות והאפשרויות"
                        onPress={onGuideModalOpen}
                        highlightText={searchQuery}
                      />
                    )}
                    {matchItem('הצג תאריך לועזי', 'הצגת התאריך הלועזי לצד העברי') && (
                      <SettingItem
                        icon="calendar-outline"
                        title="הצג תאריך לועזי"
                        description="הצגת התאריך הלועזי לצד העברי"
                        type="switch"
                        value={showSecularDate}
                        onPress={onSecularDateToggle}
                        highlightText={searchQuery}
                      />
                    )}
                    {matchItem('הצג דף בלוח שנה', 'הצגת מספר הדף היומי בכל תא בלוח השנה') && (
                      <SettingItem
                        icon="book-outline"
                        title="הצג דף בלוח שנה"
                        description="הצגת מספר הדף היומי בכל תא בלוח השנה"
                        type="switch"
                        value={showCalendarDaf}
                        onPress={onCalendarDafToggle}
                        highlightText={searchQuery}
                      />
                    )}
                    {onPersonalTrackBannerToggle != null && showPersonalTrackBannerPref != null && matchItem('לימוד אישי', 'מעקב עצמאי אחר מסכתות והצגת לימוד אישי במסך הבית ובש״ס') && (
                      <SettingItem
                        icon="bookmark-outline"
                        title="לימוד אישי"
                        description="מעקב עצמאי אחר מסכתות והצגת לימוד אישי במסך הבית ובש״ס"
                        type="switch"
                        value={showPersonalTrackBannerPref}
                        onPress={onPersonalTrackBannerToggle}
                        highlightText={searchQuery}
                      />
                    )}
                    {matchItem('אפקטים חגיגיים', 'הצגת קונפטי בסיום לימוד דף') && (
                      <SettingItem
                        icon="sparkles-outline"
                        title="אפקטים חגיגיים"
                        description="הצגת קונפטי בסיום לימוד דף"
                        type="switch"
                        value={showConfettiPref}
                        onPress={onConfettiToggle}
                        highlightText={searchQuery}
                      />
                    )}
                    {(!searchQuery.trim() || matchItem('כפתורי לימוד במסך הבית ובלוח')) && (
                      <StudyLinkModeToggle mode={studyLinkMode} onChange={onStudyLinkModeChange} />
                    )}
                  </View>
                </>
              )}

              {sec3Match && (
                <>
                  <SectionHeader
                    title="יצירת קשר"
                    icon="chatbubble-ellipses-outline"
                    isFirst={firstVisibleIndex === 2}
                  />
                  <View style={styles.card}>
                    <SettingItem
                      icon="mail-outline"
                      title="תמיכה ויצירת קשר"
                      description="משוב והצעות לשיפור"
                      onPress={openSupportEmail}
                      isLast
                      highlightText={searchQuery}
                    />
                  </View>
                </>
              )}

              {sec4Match && (
                <>
                  {onCheckAppUpdate ? (
                    <>
                      <SectionHeader
                        title="עדכוני אפליקציה"
                        icon="download-outline"
                        isFirst={firstVisibleIndex === 3}
                      />
                      <View style={styles.card}>
                        {onUpdateAutoPromptToggle != null && updateAutoPromptEnabled != null && matchItem('התראות עדכון אוטומטיות') ? (
                          <SettingItem
                            icon="alert-circle-outline"
                            title="התראות עדכון אוטומטיות"
                            description="בדיקת עדכונים אוטומטית בפתיחת האפליקציה או בחזרה מהרקע, והתראה עם הורד והתקן כשמתפרסם עדכון"
                            type="switch"
                            value={updateAutoPromptEnabled}
                            onPress={onUpdateAutoPromptToggle}
                            highlightText={searchQuery}
                          />
                        ) : null}
                        {matchItem('בדוק עדכונים', 'מוודא אם יש גרסה חדשה לאפליקציה') && (
                          <SettingItem
                            icon="download-outline"
                            title="בדוק עדכונים"
                            description="מוודא אם יש גרסה חדשה לאפליקציה (כדאי מדי פעם)"
                            onPress={onCheckAppUpdate}
                            isLast={!onShareDownloadLink}
                            highlightText={searchQuery}
                          />
                        )}
                        {onShareDownloadLink && matchItem('שתף קישור להורדה') ? (
                          <SettingItem
                            icon="share-social-outline"
                            title="שתף קישור להורדה"
                            description="שלח לחברים קישור להתקנת מסע דף"
                            onPress={onShareDownloadLink}
                            isLast
                            highlightText={searchQuery}
                          />
                        ) : null}
                      </View>
                    </>
                  ) : onShareDownloadLink ? (
                    <>
                      <SectionHeader
                        title="שיתוף האפליקציה"
                        icon="share-social-outline"
                        isFirst={firstVisibleIndex === 3}
                      />
                      <View style={styles.card}>
                        <SettingItem
                          icon="share-social-outline"
                          title="שתף קישור להורדה"
                          description="שלח לחברים קישור להתקנת מסע דף"
                          onPress={onShareDownloadLink}
                          isLast
                          highlightText={searchQuery}
                        />
                      </View>
                    </>
                  ) : null}
                </>
              )}

              {sec5Match && (
                <>
                  <SectionHeader
                    title="דיבאג והתראות"
                    icon="code-working-outline"
                    isFirst={firstVisibleIndex === 4}
                  />
                  <View style={styles.card}>
                    {matchItem('שלח התראת בדיקה') && (
                      <SettingItem
                        icon="notifications-outline"
                        title="שלח התראת בדיקה"
                        description="בדוק שההתראות עובדות (תגיע בעוד 5 שניות)"
                        onPress={onTestNotification}
                        highlightText={searchQuery}
                      />
                    )}
                    {matchItem('בדוק התראות מתוזמנות') && (
                      <SettingItem
                        icon="list-outline"
                        title="בדוק התראות מתוזמנות"
                        description={`${scheduledCount} התראות מתוזמנות`}
                        onPress={onCheckScheduled}
                        isLast={!onProbeGithubRelease}
                        highlightText={searchQuery}
                      />
                    )}
                    {onProbeGithubRelease && matchItem('בדוק תגובת GitHub') ? (
                      <SettingItem
                        icon="cloud-outline"
                        title="בדוק תגובת GitHub"
                        description="מציג טאג ושם APK מהפרסום האחרון"
                        onPress={onProbeGithubRelease}
                        isLast
                        highlightText={searchQuery}
                      />
                    ) : null}
                  </View>
                </>
              )}

              {sec6Match && (
                <>
                  <SectionHeader
                    title="גיבוי ושחזור"
                    icon="cloud-upload-outline"
                    isFirst={firstVisibleIndex === 5}
                  />
                  <View style={styles.card}>
                    {onSaveBackupToFile && matchItem('שמור גיבוי לקובץ') ? (
                      <SettingItem
                        icon="save-outline"
                        title="שמור גיבוי לקובץ"
                        description="בחר תיקייה (למשל הורדות) ושמור קובץ JSON במכשיר"
                        onPress={onSaveBackupToFile}
                        highlightText={searchQuery}
                      />
                    ) : null}
                    {onShareBackup && matchItem('שתף גיבוי') ? (
                      <SettingItem
                        icon="share-outline"
                        title="שתף גיבוי"
                        description="שלח את קובץ הגיבוי בוואטסאפ, דרייב או אפליקציה אחרת"
                        onPress={onShareBackup}
                        highlightText={searchQuery}
                      />
                    ) : null}
                    {onImportBackup && matchItem('ייבא גיבוי') ? (
                      <SettingItem
                        icon="cloud-upload-outline"
                        title="ייבא גיבוי"
                        description="שחזור נתונים מקובץ גיבוי קודם"
                        onPress={onImportBackup}
                        isLast
                        highlightText={searchQuery}
                      />
                    ) : null}
                  </View>
                </>
              )}

              {sec7Match && (
                <>
                  <SectionHeader
                    title="נתונים ופרטיות"
                    icon="shield-checkmark-outline"
                    isFirst={firstVisibleIndex === 6}
                  />
                  <View style={styles.card}>
                    <SettingItem
                      icon="trash-outline"
                      title="איפוס נתונים"
                      description="מחיקת נתוני דף יומי, מסלול אישי או איפוס כללי"
                      isDestructive
                      onPress={onResetModalOpen}
                      isLast
                      highlightText={searchQuery}
                    />
                  </View>
                </>
              )}
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
      />
    </>
  );
}
