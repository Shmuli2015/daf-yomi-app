import { useEffect } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useAppStore } from '../store/useAppStore';

const READER_KEEP_AWAKE_TAG = 'daf-yomi-reader';

export function useReaderKeepAwake() {
  const keepScreenAwake = useAppStore(state => state.settings?.keep_screen_awake !== 0);

  useEffect(() => {
    if (!keepScreenAwake) {
      deactivateKeepAwake(READER_KEEP_AWAKE_TAG).catch(() => {});
      return;
    }

    activateKeepAwakeAsync(READER_KEEP_AWAKE_TAG).catch(() => {});

    return () => {
      deactivateKeepAwake(READER_KEEP_AWAKE_TAG).catch(() => {});
    };
  }, [keepScreenAwake]);
}
