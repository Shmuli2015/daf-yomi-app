import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { ViewMode } from '../components/SefariaReader/ReaderToolbar';
import { clampReaderViewMode } from '../utils/readerViewMode';

export function useSettingsReaderPrefs() {
  const readerViewMode = useAppStore(state =>
    clampReaderViewMode(state.settings?.reader_view_mode),
  );
  const showChavrutaNotes = useAppStore(state => state.settings?.show_chavruta_notes !== 0);
  const hapticsEnabled = useAppStore(state => state.settings?.haptics_enabled !== 0);
  const setReaderViewMode = useAppStore(state => state.setReaderViewMode);
  const setShowChavrutaNotesEnabled = useAppStore(state => state.setShowChavrutaNotesEnabled);
  const setHapticsEnabled = useAppStore(state => state.setHapticsEnabled);

  const handleReaderViewModeSelect = useCallback(
    (mode: ViewMode) => {
      setReaderViewMode(mode);
    },
    [setReaderViewMode],
  );

  const handleChavrutaNotesToggle = useCallback(
    (enabled: boolean) => {
      setShowChavrutaNotesEnabled(enabled);
    },
    [setShowChavrutaNotesEnabled],
  );

  const handleHapticsToggle = useCallback(
    (enabled: boolean) => {
      setHapticsEnabled(enabled);
    },
    [setHapticsEnabled],
  );

  return {
    readerViewMode,
    showChavrutaNotes,
    hapticsEnabled,
    handleReaderViewModeSelect,
    handleChavrutaNotesToggle,
    handleHapticsToggle,
  };
}
