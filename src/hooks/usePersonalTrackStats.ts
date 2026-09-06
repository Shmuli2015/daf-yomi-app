import { useMemo, useEffect } from 'react';
import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { SHAS_MASECHTOT } from '../data/shas';
import type { PersonalTrackRecord } from '../db/database';

export function usePersonalTrackStats(
  activeMasechetEn: string | null,
  personalTrackRecords: PersonalTrackRecord[],
) {
  const masechet = useMemo(() => {
    if (!activeMasechetEn) return null;
    return SHAS_MASECHTOT.find((m) => m.en === activeMasechetEn) || null;
  }, [activeMasechetEn]);

  const { learnedCount, totalPages, percentage, nextDafNum } = useMemo(() => {
    if (!masechet) {
      return { learnedCount: 0, totalPages: 0, percentage: 0, nextDafNum: null };
    }

    const masechetRecords = personalTrackRecords.filter(
      (r) => r.masechet === masechet.en && r.status === 'learned',
    );
    const learnedSet = new Set(masechetRecords.map((r) => r.daf_num));
    const count = learnedSet.size;
    const total = masechet.pages;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;

    let next: number | null = null;
    for (let d = 2; d < 2 + total; d++) {
      if (!learnedSet.has(d)) {
        next = d;
        break;
      }
    }

    return {
      learnedCount: count,
      totalPages: total,
      percentage: pct,
      nextDafNum: next,
    };
  }, [masechet, personalTrackRecords]);

  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withTiming(percentage, { duration: 800 });
  }, [percentage]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return {
    masechet,
    learnedCount,
    totalPages,
    percentage,
    nextDafNum,
    animatedProgressStyle,
  };
}
