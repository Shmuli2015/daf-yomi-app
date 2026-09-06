import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { numberToGematria } from '../../data/shas';

interface DafCellProps {
  dafNum: number;
  isLearned: boolean;
  isPartial?: boolean;
  isPersonalLearned?: boolean;
  mode?: 'dafYomi' | 'personal';
  onPress: (dafNum: number) => void;
  styles: {
    dafCell: any;
    dafCellLearned: any;
    dafCellPartial?: any;
    dafCellPersonalLearned?: any;
    dafCellDefault: any;
    dafText: any;
    dafTextLearned: any;
    dafTextPartial?: any;
    dafTextPersonalLearned?: any;
    dafTextDefault: any;
    dafCornerDot?: any;
    dafCornerStar?: any;
  };
}

const DafCell = React.memo(
  ({
    dafNum,
    isLearned,
    isPartial = false,
    isPersonalLearned = false,
    mode = 'dafYomi',
    onPress,
    styles,
  }: DafCellProps) => {
    const isBoth = isLearned && isPersonalLearned;
    const isPrimaryLearned = mode === 'personal' ? isPersonalLearned : isLearned;
    const isSecondaryLearned = mode === 'personal' ? isLearned : isPersonalLearned;

    const cellStyle = isBoth
      ? styles.dafCellLearned
      : mode === 'personal'
      ? isPersonalLearned
        ? styles.dafCellPersonalLearned || styles.dafCellLearned
        : styles.dafCellDefault
      : isLearned
      ? styles.dafCellLearned
      : isPartial && styles.dafCellPartial
      ? styles.dafCellPartial
      : styles.dafCellDefault;

    const textStyle = isBoth
      ? styles.dafTextLearned
      : mode === 'personal'
      ? isPersonalLearned
        ? styles.dafTextPersonalLearned || styles.dafTextLearned
        : styles.dafTextDefault
      : isLearned
      ? styles.dafTextLearned
      : isPartial && styles.dafTextPartial
      ? styles.dafTextPartial
      : styles.dafTextDefault;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onPress(dafNum)}
        style={[styles.dafCell, cellStyle]}
      >
        {isBoth ? (
          <View style={styles.dafCornerStar}>
            <Ionicons name="star" size={8} color="#C9963C" />
          </View>
        ) : isSecondaryLearned && !isPrimaryLearned ? (
          <View style={styles.dafCornerDot} />
        ) : null}
        <Text style={[styles.dafText, textStyle]}>
          {numberToGematria(dafNum)}
        </Text>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.isLearned === nextProps.isLearned &&
      prevProps.isPartial === nextProps.isPartial &&
      prevProps.isPersonalLearned === nextProps.isPersonalLearned &&
      prevProps.mode === nextProps.mode &&
      prevProps.dafNum === nextProps.dafNum &&
      prevProps.onPress === nextProps.onPress &&
      prevProps.styles.dafCell === nextProps.styles.dafCell &&
      prevProps.styles.dafCellLearned === nextProps.styles.dafCellLearned &&
      prevProps.styles.dafCellDefault === nextProps.styles.dafCellDefault &&
      prevProps.styles.dafText === nextProps.styles.dafText &&
      prevProps.styles.dafTextLearned === nextProps.styles.dafTextLearned &&
      prevProps.styles.dafTextDefault === nextProps.styles.dafTextDefault
    );
  }
);

export default DafCell;
