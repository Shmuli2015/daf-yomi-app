export type StudyTrackMode = 'dafYomi' | 'personal';

export function isPersonalTrackEnabled(
  settings?: { show_personal_track_banner?: number | null } | null,
): boolean {
  return (settings?.show_personal_track_banner ?? 1) !== 0;
}
