import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import * as Notifications from 'expo-notifications';
import { resetDB } from '../db/database';
import { SettingItem } from '../components/Settings/SettingItem';
import { SectionHeader } from '../components/Settings/SectionHeader';
import { TimePickerModal } from '../components/Settings/TimePickerModal';
import { THEME } from '../theme';

export default function SettingsScreen() {
  const { settings, updateNotificationSettings, loadInitialData } = useAppStore();
  const [shabbatEnabled, setShabbatEnabled] = useState(false);
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(30);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (settings) {
      setHour(settings.notification_hour);
      setMinute(settings.notification_minute);
      setShabbatEnabled(settings.enable_shabbat_notifications === 1);
    }
  }, [settings]);

  const saveSettings = async (newHour: number, newMin: number, newShabbat: boolean) => {
    updateNotificationSettings(newHour, newMin, newShabbat);
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🕯️ הגיע זמן הדף היומי',
          body: 'אל תשכח לסמן את הלימוד של היום!',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          hour: newHour,
          minute: newMin,
          repeats: true,
        } as any,
      });
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'מחיקת נתונים',
      'האם אתה בטוח שברצונך למחוק את כל היסטוריית הלימוד? פעולה זו אינה ניתנת לביטול.',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק הכל',
          style: 'destructive',
          onPress: () => {
            resetDB();
            loadInitialData();
            Alert.alert('הצלחנו', 'הנתונים נמחקו בהצלחה');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* App Branding Header */}
        <View style={styles.brandHeader}>
          <View style={styles.brandDecorCircle} />
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <Ionicons name="book" size={28} color={THEME.colors.accent} />
            </View>
            <View style={styles.brandText}>
              <Text style={styles.brandTitle}>דף יומי</Text>
              <Text style={styles.brandSubtitle}>לימוד יומי של גמרא</Text>
            </View>
          </View>
        </View>

        {/* Notifications Section */}
        <SectionHeader title="התראות" />
        <View style={styles.card}>
          <SettingItem
            icon="notifications-outline"
            title="התראות יומיות"
            description="קבל תזכורת יומית ללימוד"
            type="switch"
            value={true}
            onPress={() => {}}
          />
          <SettingItem
            icon="time-outline"
            title="זמן התראה"
            description="בחר מתי לקבל את התזכורת"
            value={`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`}
            onPress={() => setShowTimePicker(true)}
          />
          <SettingItem
            icon="sunny-outline"
            title="התראות בשבת"
            description="שלח התראות גם בימי שבת וחג"
            type="switch"
            value={shabbatEnabled}
            onPress={(val: boolean) => {
              setShabbatEnabled(val);
              saveSettings(hour, minute, val);
            }}
          />
        </View>

        {/* Advanced Section */}
        <SectionHeader title="מתקדם" />
        <View style={styles.card}>
          <SettingItem
            icon="trash-outline"
            title="איפוס נתונים"
            description="מחק את כל היסטוריית הלימוד שלך"
            isDestructive
            onPress={handleReset}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>V1.0.4</Text>
          </View>
          <Text style={styles.footerText}>פותח באהבה ע״י דף יומי</Text>
        </View>
      </ScrollView>

      <TimePickerModal
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        hour={hour}
        minute={minute}
        setHour={setHour}
        setMinute={setMinute}
        onSave={() => {
          saveSettings(hour, minute, shabbatEnabled);
          setShowTimePicker(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  brandHeader: {
    backgroundColor: THEME.colors.primary,
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  brandDecorCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(201,150,60,0.07)',
    top: -60,
    left: -40,
  },
  brandRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 16,
  },
  brandIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(201,150,60,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(201,150,60,0.3)',
  },
  brandText: {
    alignItems: 'flex-end',
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: THEME.colors.accent,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    marginTop: 2,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  footer: {
    paddingTop: 32,
    paddingBottom: 16,
    alignItems: 'center',
    gap: 6,
  },
  versionBadge: {
    backgroundColor: THEME.colors.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(201,150,60,0.2)',
  },
  versionText: {
    color: THEME.colors.accent,
    fontSize: 11,
    fontWeight: '800',
  },
  footerText: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
});
