import { useState, useMemo } from 'react';
import { SHAS_MASECHTOT, SEDARIM, type Seder } from '../data/shas';
import { getMasechetProgressFromCache, type ProgressCache } from '../utils/progressCache';
import type { MasechetData } from '../components/Shas/MasechetCard';
import type { StatusFilter } from '../components/Shas/SederFilterBar';

export function useShasFilter(progressCache: ProgressCache | null) {
  const [selectedSeder, setSelectedSeder] = useState<Seder | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allMasechetData = useMemo(() => {
    const dataMap = new Map<Seder, MasechetData[]>();

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
          return {
            m,
            total: progress.total,
            learned: progress.learned,
            percent,
            isCompleted: progress.total > 0 && progress.learned >= progress.total,
          };
        })
        .filter((d) => d.total > 0);

      dataMap.set(seder.id, data);
    });

    return dataMap;
  }, [progressCache]);

  const { filteredSedarimData, matchedCount } = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();
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
  }, [allMasechetData, selectedSeder, selectedStatus, searchQuery]);

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
