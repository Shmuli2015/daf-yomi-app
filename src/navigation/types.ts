import type { Amud } from '../utils/dafNavigation';

export type RootStackParamList = {
  MainTabs: undefined;
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
