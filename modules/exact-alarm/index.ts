import { requireOptionalNativeModule } from 'expo';

type ExactAlarmNativeModule = {
  canScheduleExactAlarmsAsync: () => Promise<boolean>;
};

const NativeExactAlarm = requireOptionalNativeModule<ExactAlarmNativeModule>('ExactAlarm');

export async function canScheduleExactAlarmsNative(): Promise<boolean | null> {
  if (!NativeExactAlarm) return null;
  return NativeExactAlarm.canScheduleExactAlarmsAsync();
}
