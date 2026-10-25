export type MishnahJoinRole = 'solo' | 'start' | 'middle' | 'end';

export function mishnahJoinRoles(
  flags: ReadonlyArray<boolean>,
): Array<MishnahJoinRole | null> {
  return flags.map((isMishnah, index) => {
    if (!isMishnah) return null;
    const prev = index > 0 && flags[index - 1];
    const next = index < flags.length - 1 && flags[index + 1];
    if (prev && next) return 'middle';
    if (prev) return 'end';
    if (next) return 'start';
    return 'solo';
  });
}
