export type StudyLinkMode = 'sefaria' | 'tzurat' | 'both';

export function parseStudyLinkMode(value: string | null | undefined): StudyLinkMode {
  if (value === 'sefaria' || value === 'tzurat' || value === 'both') return value;
  return 'both';
}

export function getStudyLinkModeLabel(mode: StudyLinkMode): string {
  if (mode === 'sefaria') return 'ספריא';
  if (mode === 'tzurat') return 'צורת הדף';
  return 'שניהם';
}

export function shouldShowSefariaLink(mode: StudyLinkMode): boolean {
  return mode === 'sefaria' || mode === 'both';
}

export function shouldShowTzuratLink(mode: StudyLinkMode): boolean {
  return mode === 'tzurat' || mode === 'both';
}
