import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { numberToGematria } from '../../data/shas';

interface DafCellProps {
  dafNum: number;
  isLearned: boolean;
  isPartial?: boolean;
  onPress: (dafNum: number) => void;
  styles: {
    dafCell: any;
    dafCellLearned: any;
    dafCellPartial?: any;
    dafCellDefault: any;
    dafText: any;
    dafTextLearned: any;
    dafTextPartial?: any;
    dafTextDefault: any;
  };
}

const DafCell = React.memo(
  ({ dafNum, isLearned, isPartial = false, onPress, styles }: DafCellProps) => {
    const cellStyle = isLearned
      ? styles.dafCellLearned
      : isPartial && styles.dafCellPartial
        ? styles.dafCellPartial
        : styles.dafCellDefault;
    const textStyle = isLearned
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
