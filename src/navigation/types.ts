import type { NavigatorScreenParams } from '@react-navigation/native';
import type { SettingsSectionKey } from '../hooks/useSettingsAccordion';
import type { Amud } from '../utils/dafNavigation';

export type MainTabParamList = {
  Home: undefined;
  Calendar: undefined;
  History: { openMasechetEn?: string; returnToHomeOnClose?: boolean } | undefined;
  Settings: { openSection?: SettingsSectionKey } | undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  TzuratHadaf: {
    masechetEn: string;
    masechetHe?: string;
    dafNum: number;
    amud: Amud;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
