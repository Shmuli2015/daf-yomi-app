import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { SHAS_MASECHTOT, SEDARIM, Seder } from '../../data/shas';
import { getMasechetProgress, getMasechetDafim, getSederProgress } from '../../utils/shas';
import MasechetModal from './MasechetModal';
import MasechetCard, { MasechetData } from './MasechetCard';
import SederSection from './SederSection';



export default function MasechetGrid() {
  const { history } = useAppStore();
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

  return (
    <View style={styles.container}>
      {SEDARIM.map((seder) => {
        const sederMasechtot = SHAS_MASECHTOT.filter(m => m.seder === seder.id);
        
        const masechetData: MasechetData[] = sederMasechtot.map(m => {
          const total = getMasechetDafim(m.he).length;
          const learned = getMasechetProgress(m.he, history);
          const percent = total > 0 ? Math.round((learned / total) * 100) : 0;
          return { m, total, learned, percent, isCompleted: total > 0 && learned === total };
        }).filter(d => d.total > 0);

        if (masechetData.length === 0) return null;

        const sederProgress = getSederProgress(seder.id, history);
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
