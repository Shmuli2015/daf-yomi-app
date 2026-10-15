const HEBREW_PATTERN = /[\u0590-\u05FF]/;

interface SefariaLoadErrorContext {
  gemaraNikud: boolean;
  nikudAvailable: boolean;
}

export function describeSefariaLoadError(error: unknown, context: SefariaLoadErrorContext): string {
  const raw = error instanceof Error ? error.message : '';
  if (HEBREW_PATTERN.test(raw)) return raw;
  if (error instanceof TypeError && context.nikudAvailable) {
    const versionLabel = context.gemaraNikud ? 'עם ניקוד' : 'בלי ניקוד';
    return `אין חיבור לרשת והגרסה ${versionLabel} של הדף לא שמורה במכשיר`;
  }
  return 'שגיאה בטעינת הטקסט';
}
