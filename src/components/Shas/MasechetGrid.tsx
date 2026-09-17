import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { SHAS_MASECHTOT, SEDARIM, type Seder } from '../../data/shas';
import { getSederProgressFromCache } from '../../utils/progressCache';
import MasechetModal from './MasechetModal';
import MasechetCard from './MasechetCard';
import SederSection from './SederSection';
import SederFilterBar from './SederFilterBar';
import { useShasFilter } from '../../hooks/useShasFilter';

interface MasechetGridProps {
  openMasechetEn?: string;
  returnToHomeOnClose?: boolean;
  onOpenMasechetConsumed?: () => void;
  onReturnToHome?: () => void;
  onOpenQuickJump?: () => void;
}

export default function MasechetGrid({
  openMasechetEn,
  returnToHomeOnClose,
  onOpenMasechetConsumed,
  onReturnToHome,
  onOpenQuickJump,
}: MasechetGridProps) {
  const progressCache = useAppStore((state) => state.progressCache);
  const [selectedMasechet, setSelectedMasechet] = useState<
    (typeof SHAS_MASECHTOT)[0] | null
  >(null);
  const [expandedSedarim, setExpandedSedarim] = useState<Set<Seder>>(new Set());
  const returnToHomeRef = useRef(false);

  const {
    selectedSeder,
    setSelectedSeder,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    filteredSedarimData,
    matchedCount,
    totalCount,
  } = useShasFilter(progressCache);

  useEffect(() => {
    if (!openMasechetEn) return;

    const masechet = SHAS_MASECHTOT.find((m) => m.en === openMasechetEn);
    if (masechet) {
      setSelectedMasechet(masechet);
      setExpandedSedarim((prev) => new Set(prev).add(masechet.seder));
      returnToHomeRef.current = returnToHomeOnClose === true;
    }
    onOpenMasechetConsumed?.();
  }, [openMasechetEn, returnToHomeOnClose, onOpenMasechetConsumed]);

  const handleCloseModal = useCallback(() => {
    setSelectedMasechet(null);
    if (returnToHomeRef.current) {
      returnToHomeRef.current = false;
      onReturnToHome?.();
    }
  }, [onReturnToHome]);

  const toggleSeder = useCallback((seder: Seder) => {
    setExpandedSedarim((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(seder)) {
        newSet.delete(seder);
      } else {
        newSet.add(seder);
      }
      return newSet;
    });
  }, []);

  const handleSelectSeder = useCallback((seder: Seder | null) => {
    setSelectedSeder(seder);
    if (seder) {
      setExpandedSedarim((prev) => new Set(prev).add(seder));
    }
  }, [setSelectedSeder]);

  const handlePressMasechet = useCallback((masechetEn: string) => {
    const masechet = SHAS_MASECHTOT.find((m) => m.en === masechetEn);
    if (masechet) {
      setSelectedMasechet(masechet);
    }
  }, []);

  const isFilteringActive = selectedSeder !== null || searchQuery.trim().length > 0 || selectedStatus !== 'all';

  return (
    <View style={styles.container}>
      <SederFilterBar
        selectedSeder={selectedSeder}
        onSelectSeder={handleSelectSeder}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        matchedCount={matchedCount}
        totalCount={totalCount}
        onOpenQuickJump={onOpenQuickJump}
      />

      {SEDARIM.map((seder) => {
        const masechetData = filteredSedarimData.get(seder.id) || [];
        if (masechetData.length === 0) return null;

        const sederProgress = progressCache
          ? getSederProgressFromCache(progressCache, seder.id)
          : {
              percentage: 0,
              learnedDafim: 0,
              totalDafim: 0,
              completedMasechtot: 0,
              totalMasechtot: 0,
            };

        const isExpanded = isFilteringActive || expandedSedarim.has(seder.id);

        return (
          <SederSection
            key={seder.id}
            sederId={seder.id}
            sederName={seder.he}
            percentage={sederProgress.percentage}
            learnedDafim={sederProgress.learnedDafim}
            totalDafim={sederProgress.totalDafim}
            completedMasechtot={sederProgress.completedMasechtot}
            totalMasechtot={sederProgress.totalMasechtot}
            isExpanded={isExpanded}
            onToggle={toggleSeder}
          >
            <View style={styles.gridRow}>
              {masechetData.map((data, index) => (
                <MasechetCard
                  key={data.m.en}
                  data={data}
                  index={index}
                  onPress={handlePressMasechet}
                />
              ))}
            </View>
          </SederSection>
        );
      })}

      {selectedMasechet && (
        <MasechetModal masechet={selectedMasechet} onClose={handleCloseModal} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 12,
    marginTop: 12,
  },
});
