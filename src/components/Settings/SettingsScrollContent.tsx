import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Linking } from 'react-native';
import { ThemeMode } from '../../theme';
import { SettingItem } from './SettingItem';
import { SectionHeader } from './SectionHeader';
import { NotifModeToggle } from './NotifModeToggle';
import { DayScheduleList } from './DayScheduleList';
import type { DaySchedule } from './DayScheduleList';
import { SettingsFooter } from './SettingsFooter';
import type { SettingsScreenStyles } from './settingsScreenStyles';
import InfoModal from '../InfoModal';
import {
  formatNotificationTime,
  getThemeModeSettingDisplay,
} from '../../utils/settingsScreen';
import { SUPPORT_EMAIL, getSupportMailtoUrl } from '../../supportContact';

export type SettingsScrollContentProps = {
  styles: SettingsScreenStyles;
  notificationsEnabled: boolean;
  onNotificationsToggle: (v: boolean) => void;
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
  showConfettiPref: boolean;
  onConfettiToggle: (v: boolean) => void;
  showDevSection: boolean;
  scheduledCount: number;
  onTestNotification: () => void;
  onCheckScheduled: () => void;
  onResetModalOpen: () => void;
  onCheckAppUpdate?: () => void;
  onProbeGithubRelease?: () => void;
};

export default function SettingsScrollContent({
  styles,
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
  themeMode,
  onThemeModalOpen,
  onGuideModalOpen,
  showSecularDate,
  onSecularDateToggle,
  showConfettiPref,
  onConfettiToggle,
  showDevSection,
  scheduledCount,
  onTestNotification,
  onCheckScheduled,
  onResetModalOpen,
  onCheckAppUpdate,
  onProbeGithubRelease,
}: SettingsScrollContentProps) {
  const themeDisplay = getThemeModeSettingDisplay(themeMode);
  const [mailHintVisible, setMailHintVisible] = useState(false);

  const openSupportEmail = useCallback(async () => {
    try {
      await Linking.openURL(getSupportMailtoUrl());
    } catch {
      setMailHintVisible(true);
    }
  }, []);

  return (
    <>
      <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.body}>
        <View style={styles.pageHeader}>
          <View style={styles.headerRow}>
            <View style={styles.accentBar} />
            <Text style={styles.pageTitle}>הגדרות</Text>
          </View>
          <Text style={styles.pageSubtitle}>התראות, תצוגה וניהול נתונים</Text>
        </View>

        <SectionHeader title="התראות ותזכורות" />
        <View style={styles.card}>
          <SettingItem
            icon="notifications-outline"
            title="תזכורת יומית"
            description="קבל התראה בשעה היעודה"
            type="switch"
            value={notificationsEnabled}
            onPress={onNotificationsToggle}
          />
          {notificationsEnabled && (
            <>
              <NotifModeToggle mode={notifMode} onChange={onNotifModeChange} />
              {notifMode === 'daily' && (
                <SettingItem
                  icon="time-outline"
                  title="זמן ההתראה"
                  description="מתי תרצה ללמוד כל יום?"
                  value={formatNotificationTime(hour, minute)}
                  onPress={onDailyTimePress}
                />
              )}
              {notifMode === 'custom' && (
                <DayScheduleList
                  schedules={daySchedules}
                  onToggleDay={onToggleDay}
                  onEditTime={onEditDayTime}
                />
              )}
            </>
          )}
        </View>

        <SectionHeader title="תצוגה והעדפות" />
        <View style={styles.card}>
          <SettingItem
            icon={themeDisplay.icon}
            title="מצב תצוגה"
            description="בחר מצב בהיר/כהה או לפי המערכת"
            value={themeDisplay.label}
            onPress={onThemeModalOpen}
          />
          <SettingItem
            icon="help-circle-outline"
            title="מדריך שימוש"
            description="למד כיצד להשתמש בכל הפיצ'רים"
            onPress={onGuideModalOpen}
          />
          <SettingItem
            icon="calendar-outline"
            title="הצג תאריך לועזי"
            description="הצגת התאריך הלועזי לצד העברי"
            type="switch"
            value={showSecularDate}
            onPress={onSecularDateToggle}
          />
          <SettingItem
            icon="sparkles-outline"
            title="אפקטים חגיגיים"
            description="הצגת קונפטי בסיום לימוד דף"
            type="switch"
            value={showConfettiPref}
            onPress={onConfettiToggle}
          />
        </View>

        <SectionHeader title="יצירת קשר" />
        <View style={styles.card}>
          <SettingItem
            icon="mail-outline"
            title="תמיכה ויצירת קשר"
            description="משוב והצעות לשיפור"
            onPress={openSupportEmail}
          />
        </View>

        {onCheckAppUpdate ? (
          <>
            <SectionHeader title="עדכוני אפליקציה" />
            <View style={styles.card}>
              <SettingItem
                icon="download-outline"
                title="בדוק עדכונים"
                description="מוודא אם יש גרסה חדשה לאפליקציה (כדאי מדי פעם)"
                onPress={onCheckAppUpdate}
              />
            </View>
          </>
        ) : null}

        {showDevSection && (
          <>
            <SectionHeader title="דיבאג והתראות" />
            <View style={styles.card}>
              <SettingItem
                icon="notifications-outline"
                title="שלח התראת בדיקה"
                description="בדוק שההתראות עובדות (תגיע בעוד 5 שניות)"
                onPress={onTestNotification}
              />
              <SettingItem
                icon="list-outline"
                title="בדוק התראות מתוזמנות"
                description={`${scheduledCount} התראות מתוזמנות`}
                onPress={onCheckScheduled}
              />
              {onProbeGithubRelease ? (
                <SettingItem
                  icon="cloud-outline"
                  title="בדוק תגובת GitHub"
                  description="מציג טאג ושם APK מהפרסום האחרון"
                  onPress={onProbeGithubRelease}
                />
              ) : null}
            </View>
          </>
        )}

        <SectionHeader title="נתונים ופרטיות" />
        <View style={styles.card}>
          <SettingItem
            icon="trash-outline"
            title="איפוס נתונים"
            description="מחיקת כל התקדמות הלימוד"
            isDestructive
            onPress={onResetModalOpen}
          />
        </View>

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
