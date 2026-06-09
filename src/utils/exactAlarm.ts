import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as IntentLauncher from 'expo-intent-launcher';
import { Platform, Alert, Linking } from 'react-native';
import { canScheduleExactAlarmsNative } from 'exact-alarm';

const ANDROID_EXACT_ALARM_MIN_API = 31;
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export type ExactAlarmStatus = 'granted' | 'denied' | 'not_required' | 'unknown';

let promptedThisSession = false;

export function requiresExactAlarmPermission(): boolean {
  return Platform.OS === 'android' && Number(Platform.Version) >= ANDROID_EXACT_ALARM_MIN_API;
}

export async function getExactAlarmStatus(): Promise<ExactAlarmStatus> {
  if (!requiresExactAlarmPermission()) return 'not_required';

  const nativeResult = await canScheduleExactAlarmsNative();
  if (nativeResult === null) return isExpoGo ? 'unknown' : 'unknown';
  return nativeResult ? 'granted' : 'denied';
}

export async function hasExactAlarmPermission(): Promise<boolean> {
  const status = await getExactAlarmStatus();
  return status === 'granted' || status === 'not_required';
}

export async function openExactAlarmSettings(): Promise<void> {
  if (Platform.OS !== 'android') return;

  const pkg = Constants.expoConfig?.android?.package ?? 'com.shmuli.dafyomi';
  try {
    await IntentLauncher.startActivityAsync('android.settings.REQUEST_SCHEDULE_EXACT_ALARM', {
      data: `package:${pkg}`,
    });
  } catch {
    try {
      await Linking.openSettings();
    } catch {
      // User can open settings manually.
    }
  }
}

export async function promptForExactAlarmPermission(options?: {
  force?: boolean;
}): Promise<boolean> {
  if (!requiresExactAlarmPermission()) return true;

  const granted = await hasExactAlarmPermission();
  if (granted) return true;
  if (promptedThisSession && !options?.force) return false;

  promptedThisSession = true;

  return new Promise(resolve => {
    Alert.alert(
      'תזכורות מדויקות',
      'כדי שהתזכורת תצלצל בדיוק בשעה שבחרת, יש לאשר «תזמון התראות מדויק» בהגדרות המכשיר. בלי הרשאה זו התזכורת עלולה להתעכב בדקות.',
      [
        {
          text: 'אחר כך',
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: 'פתח הגדרות',
          onPress: () => {
            void openExactAlarmSettings();
            resolve(false);
          },
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

export function resetExactAlarmPromptSession(): void {
  promptedThisSession = false;
}
