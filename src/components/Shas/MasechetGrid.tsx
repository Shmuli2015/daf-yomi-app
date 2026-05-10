import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { SHAS_MASECHTOT } from '../../data/shas';
import { getMasechetProgress, getMasechetDafim } from '../../utils/shas';
import MasechetModal from './MasechetModal';
import MasechetCard, { MasechetData } from './MasechetCard';



export default function MasechetGrid() {
  const { history } = useAppStore();
  const [selectedMasechet, setSelectedMasechet] = useState<typeof SHAS_MASECHTOT[0] | null>(null);

  const masechetData: MasechetData[] = SHAS_MASECHTOT.map(m => {
    const total = getMasechetDafim(m.he).length;
    const learned = getMasechetProgress(m.he, history);
    const percent = total > 0 ? Math.round((learned / total) * 100) : 0;
    return { m, total, learned, percent, isCompleted: total > 0 && learned === total };
  }).filter(d => d.total > 0);

  return (
    <View style={styles.container}>
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
  },
});
