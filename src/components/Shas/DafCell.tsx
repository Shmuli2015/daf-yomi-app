import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { numberToGematria } from '../../data/shas';

interface DafCellProps {
  dafNum: number;
  isLearned: boolean;
  isPartial?: boolean;
  partialAmud?: 'a' | 'b' | null;
  isPersonalLearned?: boolean;
  isPersonalPartial?: boolean;
  personalPartialAmud?: 'a' | 'b' | null;
  mode?: 'dafYomi' | 'personal';
  onPress: (dafNum: number) => void;
  onLongPress?: (dafNum: number) => void;
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
    dafCornerAmudBadge?: any;
    dafCornerAmudBadgeText?: any;
  };
}

const DafCell = React.memo(
  ({
    dafNum,
    isLearned,
    isPartial = false,
    partialAmud = null,
    isPersonalLearned = false,
    isPersonalPartial = false,
    personalPartialAmud = null,
    mode = 'dafYomi',
    onPress,
    onLongPress,
    styles,
  }: DafCellProps) => {
    const isBoth = isLearned && isPersonalLearned;
    const isPrimaryLearned = mode === 'personal' ? isPersonalLearned : isLearned;
    const isPrimaryPartial = mode === 'personal' ? isPersonalPartial : isPartial;
    const isSecondaryLearned = mode === 'personal' ? isLearned : isPersonalLearned;
    const isSecondaryPartial = mode === 'personal' ? isPartial : isPersonalPartial;
    const activeAmud = mode === 'personal' ? personalPartialAmud : partialAmud;

    const cellStyle = isBoth
      ? styles.dafCellLearned
      : mode === 'personal'
      ? isPersonalLearned
        ? styles.dafCellPersonalLearned || styles.dafCellLearned
        : isPersonalPartial && styles.dafCellPartial
        ? styles.dafCellPartial
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
        : isPersonalPartial && styles.dafTextPartial
        ? styles.dafTextPartial
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
        onLongPress={onLongPress ? () => onLongPress(dafNum) : undefined}
        style={[styles.dafCell, cellStyle]}
      >
        {isBoth ? (
          <View style={styles.dafCornerStar}>
            <Ionicons name="star" size={8} color="#C9963C" />
          </View>
        ) : (isSecondaryLearned || isSecondaryPartial) && !isPrimaryLearned && !isPrimaryPartial ? (
          <View style={styles.dafCornerDot} />
        ) : null}

        {isPrimaryPartial && activeAmud && styles.dafCornerAmudBadge ? (
          <View style={styles.dafCornerAmudBadge}>
            <Text style={styles.dafCornerAmudBadgeText}>
              {activeAmud === 'a' ? 'א׳' : 'ב׳'}
            </Text>
          </View>
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
      prevProps.partialAmud === nextProps.partialAmud &&
      prevProps.isPersonalLearned === nextProps.isPersonalLearned &&
      prevProps.isPersonalPartial === nextProps.isPersonalPartial &&
      prevProps.personalPartialAmud === nextProps.personalPartialAmud &&
      prevProps.mode === nextProps.mode &&
      prevProps.dafNum === nextProps.dafNum &&
      prevProps.onPress === nextProps.onPress &&
      prevProps.onLongPress === nextProps.onLongPress &&
      prevProps.styles === nextProps.styles
    );
  }
);

export default DafCell;
