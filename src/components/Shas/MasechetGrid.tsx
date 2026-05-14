import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { SHAS_MASECHTOT, SEDARIM, Seder } from '../../data/shas';
import { getMasechetProgressFromCache, getSederProgressFromCache } from '../../utils/progressCache';
import MasechetModal from './MasechetModal';
import MasechetCard, { MasechetData } from './MasechetCard';
import SederSection from './SederSection';

export default function MasechetGrid() {
  const progressCache = useAppStore(state => state.progressCache);
  const [selectedMasechet, setSelectedMasechet] = useState<typeof SHAS_MASECHTOT[0] | null>(null);
  const [expandedSedarim, setExpandedSedarim] = useState<Set<Seder>>(new Set());

  const toggleSeder = (seder: Seder) => {
    setExpandedSedarim(prev => {
      const newSet = new Set(prev);
      if (newSet.has(seder)) {
        newSet.delete(seder);
      } else {
        newSet.add(seder);
      }
      return newSet;
    });
  };

  const allMasechetData = useMemo(() => {
    if (!progressCache) return new Map<Seder, MasechetData[]>();
    
    const dataMap = new Map<Seder, MasechetData[]>();
    
    SEDARIM.forEach(seder => {
      const sederMasechtot = SHAS_MASECHTOT.filter(m => m.seder === seder.id);
      const data = sederMasechtot.map(m => {
        const progress = getMasechetProgressFromCache(progressCache, m.he);
        const percent = progress.total > 0 ? Math.round((progress.learned / progress.total) * 100) : 0;
        return { 
          m, 
          total: progress.total, 
          learned: progress.learned, 
          percent, 
          isCompleted: progress.total > 0 && progress.learned === progress.total 
        };
      }).filter(d => d.total > 0);
      
      dataMap.set(seder.id, data);
    });
    
    return dataMap;
  }, [progressCache]);

  return (
    <View style={styles.container}>
      {SEDARIM.map((seder) => {
        const masechetData = allMasechetData.get(seder.id) || [];
        if (masechetData.length === 0) return null;

        const sederProgress = progressCache 
          ? getSederProgressFromCache(progressCache, seder.id)
          : { percentage: 0, learnedDafim: 0, totalDafim: 0, completedMasechtot: 0, totalMasechtot: 0 };
        
        const isExpanded = expandedSedarim.has(seder.id);

        return (
          <SederSection
            key={seder.id}
            sederName={seder.he}
            percentage={sederProgress.percentage}
            learnedDafim={sederProgress.learnedDafim}
            totalDafim={sederProgress.totalDafim}
            completedMasechtot={sederProgress.completedMasechtot}
            totalMasechtot={sederProgress.totalMasechtot}
            isExpanded={isExpanded}
            onToggle={() => toggleSeder(seder.id)}
          >
            <View style={styles.gridRow}>
              {masechetData.map((data, index) => (
                <MasechetCard
                  key={data.m.en}
                  data={data}
                  index={index}
                  onPress={() => setSelectedMasechet(data.m)}
                />
              ))}
            </View>
          </SederSection>
        );
      })}

      {selectedMasechet && (
        <MasechetModal masechet={selectedMasechet} onClose={() => setSelectedMasechet(null)} />
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
