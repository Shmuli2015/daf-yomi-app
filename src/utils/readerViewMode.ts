import type { ViewMode } from '../components/SefariaReader/ReaderToolbar';

export const READER_VIEW_MODES: ViewMode[] = ['classic', 'steinsaltz', 'chavruta'];
export const READER_VIEW_MODE_DEFAULT: ViewMode = 'classic';

export function clampReaderViewMode(value: string | null | undefined): ViewMode {
  if (value === 'steinsaltz' || value === 'chavruta' || value === 'classic') {
    return value;
  }
  return READER_VIEW_MODE_DEFAULT;
}

export function getReaderViewModeLabel(mode: ViewMode): string {
  if (mode === 'steinsaltz') return 'שטיינזלץ';
  if (mode === 'chavruta') return 'חברותא';
  return 'גמרא';
}
