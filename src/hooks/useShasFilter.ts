import { useState, useMemo, useRef } from 'react';
import { useDebouncedValue } from './useDebouncedValue';
import { SHAS_MASECHTOT, SEDARIM, type Seder } from '../data/shas';
import { getMasechetProgressFromCache, type ProgressCache } from '../utils/progressCache';
import type { MasechetData } from '../components/Shas/MasechetCard';
import type { StatusFilter } from '../components/Shas/SederFilterBar';

export function useShasFilter(progressCache: ProgressCache | null) {
  const [selectedSeder, setSelectedSeder] = useState<Seder | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebouncedValue(searchQuery, 150);
  const previousByEnRef = useRef<Map<string, MasechetData>>(new Map());

  const allMasechetData = useMemo(() => {
    const dataMap = new Map<Seder, MasechetData[]>();
    const nextByEn = new Map<string, MasechetData>();
    const previousByEn = previousByEnRef.current;

    SEDARIM.forEach((seder) => {
      const sederMasechtot = SHAS_MASECHTOT.filter((m) => m.seder === seder.id);
      const data = sederMasechtot
        .map((m) => {
          const progress = progressCache
            ? getMasechetProgressFromCache(progressCache, m.he)
            : { total: m.pages, learned: 0 };
          const percent =
            progress.total > 0
              ? Math.round((progress.learned / progress.total) * 100)
              : 0;
          const isCompleted = progress.total > 0 && progress.learned >= progress.total;
          const previous = previousByEn.get(m.en);
          if (
            previous &&
            previous.total === progress.total &&
            previous.learned === progress.learned &&
            previous.percent === percent &&
            previous.isCompleted === isCompleted
          ) {
            nextByEn.set(m.en, previous);
            return previous;
          }
          const next: MasechetData = {
            m,
            total: progress.total,
            learned: progress.learned,
            percent,
            isCompleted,
          };
          nextByEn.set(m.en, next);
          return next;
        })
        .filter((d) => d.total > 0);

      dataMap.set(seder.id, data);
    });

    previousByEnRef.current = nextByEn;
    return dataMap;
  }, [progressCache]);

  const { filteredSedarimData, matchedCount } = useMemo(() => {
    const trimmedQuery = debouncedQuery.trim().toLowerCase();
    const map = new Map<Seder, MasechetData[]>();
    let count = 0;

    SEDARIM.forEach((seder) => {
      if (selectedSeder !== null && seder.id !== selectedSeder) {
        return;
      }

      const list = allMasechetData.get(seder.id) || [];
      const filtered = list.filter((item) => {
        if (trimmedQuery) {
          const matchesName =
            item.m.he.includes(trimmedQuery) ||
            item.m.en.toLowerCase().includes(trimmedQuery);
          if (!matchesName) return false;
        }

        if (selectedStatus === 'completed') {
          return item.isCompleted;
        }
        if (selectedStatus === 'in_progress') {
          return item.learned > 0 && !item.isCompleted;
        }
        if (selectedStatus === 'not_started') {
          return item.learned === 0;
        }
        return true;
      });

      if (filtered.length > 0) {
        map.set(seder.id, filtered);
        count += filtered.length;
      }
    });

    return { filteredSedarimData: map, matchedCount: count };
  }, [allMasechetData, selectedSeder, selectedStatus, debouncedQuery]);

  return {
    selectedSeder,
    setSelectedSeder,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    filteredSedarimData,
    matchedCount,
    totalCount: SHAS_MASECHTOT.length,
  };
}
