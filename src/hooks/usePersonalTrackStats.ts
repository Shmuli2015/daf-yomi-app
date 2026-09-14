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

  const { learnedCount, totalPages, percentage, nextDafNum, isNextDafPartial, nextDafAmud } = useMemo(() => {
    if (!masechet) {
      return {
        learnedCount: 0,
        totalPages: 0,
        percentage: 0,
        nextDafNum: null,
        isNextDafPartial: false,
        nextDafAmud: null,
      };
    }

    const masechetRecords = personalTrackRecords.filter(
      (r) => r.masechet === masechet.en,
    );
    const learnedSet = new Set(
      masechetRecords.filter((r) => r.status === 'learned').map((r) => r.daf_num),
    );
    const partialMap = new Map<number, PersonalTrackRecord>();
    for (const r of masechetRecords) {
      if (r.status === 'partial') {
        partialMap.set(r.daf_num, r);
      }
    }

    let count = 0;
    for (const r of masechetRecords) {
      if (r.status === 'learned') {
        count += 1;
      } else if (r.status === 'partial') {
        count += 0.5;
      }
    }

    const total = masechet.pages;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;

    let next: number | null = null;
    for (let d = 2; d < 2 + total; d++) {
      if (!learnedSet.has(d)) {
        next = d;
        break;
      }
    }

    const nextRecord = next != null ? partialMap.get(next) : undefined;

    return {
      learnedCount: count,
      totalPages: total,
      percentage: pct,
      nextDafNum: next,
      isNextDafPartial: nextRecord?.status === 'partial',
      nextDafAmud: nextRecord?.amud || null,
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
    isNextDafPartial,
    nextDafAmud,
    animatedProgressStyle,
  };
}
