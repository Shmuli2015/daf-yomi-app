import React from 'react';
import { View } from 'react-native';
import PersonalTrackBanner from '../PersonalTrackBanner';
import PersonalTrackAddMasechetButton from './PersonalTrackAddMasechetButton';
import type { PersonalTrackRecord } from '../../db/database';

interface PersonalTrackSectionProps {
  pinnedMasechtot: string[];
  personalTrackRecords: PersonalTrackRecord[];
  todayMasechetEn: string;
  onSelectMasechetPress: () => void;
  onOpenMasechetDetailPress: (masechetEn: string) => void;
  onToggleDafLearned: (masechetEn: string, dafNum: number) => void;
  onOpenTzuratHadaf: (masechetEn: string, dafNum: number) => void;
  onOpenGuide: () => void;
}

const SECTION_GAP = 16;
const CARD_GAP = 10;

export default function PersonalTrackSection({
  pinnedMasechtot,
  personalTrackRecords,
  todayMasechetEn,
  onSelectMasechetPress,
  onOpenMasechetDetailPress,
  onToggleDafLearned,
  onOpenTzuratHadaf,
  onOpenGuide,
}: PersonalTrackSectionProps) {
  if (pinnedMasechtot.length === 0) {
    return (
      <View style={{ marginTop: SECTION_GAP }}>
        <PersonalTrackBanner
          activeMasechetEn={null}
          personalTrackRecords={personalTrackRecords}
          onSelectMasechetPress={onSelectMasechetPress}
          onToggleDafLearned={onToggleDafLearned}
          onOpenGuide={onOpenGuide}
        />
      </View>
    );
  }

  return (
    <View style={{ marginTop: SECTION_GAP, gap: CARD_GAP }}>
      {pinnedMasechtot.map((masechetEn) => (
        <PersonalTrackBanner
          key={masechetEn}
          activeMasechetEn={masechetEn}
          personalTrackRecords={personalTrackRecords}
          hideMarkButton={masechetEn === todayMasechetEn}
          onSelectMasechetPress={onSelectMasechetPress}
          onOpenMasechetDetailPress={onOpenMasechetDetailPress}
          onToggleDafLearned={onToggleDafLearned}
          onOpenTzuratHadaf={onOpenTzuratHadaf}
          onOpenGuide={onOpenGuide}
        />
      ))}
      <PersonalTrackAddMasechetButton onPress={onSelectMasechetPress} />
    </View>
  );
}
