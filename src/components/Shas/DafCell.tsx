import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { numberToGematria } from '../../data/shas';

interface DafCellProps {
  dafNum: number;
  isLearned: boolean;
  onPress: (dafNum: number) => void;
  styles: {
    dafCell: any;
    dafCellLearned: any;
    dafCellDefault: any;
    dafText: any;
    dafTextLearned: any;
    dafTextDefault: any;
  };
}

const DafCell = React.memo(
  ({ dafNum, isLearned, onPress, styles }: DafCellProps) => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onPress(dafNum)}
        style={[styles.dafCell, isLearned ? styles.dafCellLearned : styles.dafCellDefault]}
      >
        <Text style={[styles.dafText, isLearned ? styles.dafTextLearned : styles.dafTextDefault]}>
          {numberToGematria(dafNum)}
        </Text>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.isLearned === nextProps.isLearned &&
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
