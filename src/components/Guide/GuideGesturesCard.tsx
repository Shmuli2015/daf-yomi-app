import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { GUIDE_GESTURES } from './guideGestures.constants';
import { createGuideGesturesCardStyles } from './GuideGesturesCard.styles';

export function GuideGesturesCard() {
  const theme = useTheme();
  const styles = useMemo(() => createGuideGesturesCardStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerIconBox}>
          <Ionicons name="sparkles" size={18} color={theme.colors.accent} />
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>מחוות וקיצורי דרך מהירים</Text>
          <Text style={styles.subtitle}>טיפים לתנועות מגע נוחות בכל מסכי האפליקציה</Text>
        </View>
      </View>

      <View style={styles.itemsList}>
        {GUIDE_GESTURES.map((item) => (
          <View key={item.id} style={styles.gestureCard}>
            <View style={styles.gestureIconBox}>
              <Ionicons name={item.icon} size={16} color={theme.colors.accent} />
            </View>
            <View style={styles.gestureContent}>
              <View style={styles.gestureTitleRow}>
                <Text style={styles.gestureTitle}>{item.title}</Text>
                <View style={styles.gestureBadge}>
                  <Text style={styles.gestureBadgeText}>{item.badge}</Text>
                </View>
              </View>
              <Text style={styles.gestureDesc}>{item.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export default GuideGesturesCard;
