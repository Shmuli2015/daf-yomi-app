import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme';
import { splitLeadFromBody } from './guideItemParser';
import GuideItemText from './GuideItemText';
import { createGuideSectionItemStyles } from './GuideSectionItem.styles';

interface GuideSectionItemProps {
  item: string;
  index: number;
  highlightRegex?: RegExp | null;
  isLast: boolean;
}

export function GuideSectionItem({
  item,
  index,
  highlightRegex,
  isLast,
}: GuideSectionItemProps) {
  const theme = useTheme();
  const styles = useMemo(() => createGuideSectionItemStyles(theme), [theme]);
  const { lead, body } = useMemo(() => splitLeadFromBody(item), [item]);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.indexBadge}>
          <Text style={styles.indexText}>{index + 1}</Text>
        </View>
        <View style={styles.contentWrap}>
          {lead && (
            <GuideItemText
              text={lead}
              baseStyle={styles.leadTitle}
              boldStyle={styles.leadTitle}
              theme={theme}
              highlightRegex={highlightRegex}
            />
          )}
          <GuideItemText
            text={body}
            baseStyle={styles.bodyText}
            boldStyle={styles.bodyTextBold}
            theme={theme}
            highlightRegex={highlightRegex}
          />
        </View>
      </View>
      {!isLast && <View style={styles.divider} />}
    </>
  );
}

export default GuideSectionItem;
