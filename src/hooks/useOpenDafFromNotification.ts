import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { subscribePendingDafOpen, takePendingDafOpen } from '../utils/pendingDafOpen';

export function useOpenDafFromNotification() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const openPendingDaf = () => {
      const target = takePendingDafOpen();
      if (!target) return;
      navigation.navigate('TzuratHadaf', target);
    };

    openPendingDaf();
    return subscribePendingDafOpen(openPendingDaf);
  }, [navigation]);
}
