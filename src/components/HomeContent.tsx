import React, { useMemo, useState, useCallback } from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';
import SharePreviewModal from './Share/SharePreviewModal';
import HomeShasCard from './Home/HomeShasCard';
import HomeStreakCard from './Home/HomeStreakCard';
import { createHomeContentStyles } from './Home/HomeContent.styles';
import type { StreakShareData } from '../utils/shareProgressImage';
import type { Last7DayRecord } from '../utils/last7Days';

interface HomeContentProps {
  streak: number;
  last7Days: Last7DayRecord[];
  hebrewDateStr: string;
  viewedDateStr: string;
  shasLearnedCount: number;
  shasTotalPages: number;
  shasPercentage: number;
  onPressShas: () => void;
  onSelectDay: (date: Date) => void;
}

const HomeContent = React.memo(function HomeContent({
  streak,
  last7Days,
  hebrewDateStr,
  viewedDateStr,
  shasLearnedCount,
  shasTotalPages,
  shasPercentage,
  onPressShas,
  onSelectDay,
}: HomeContentProps) {
  const theme = useTheme();
  const styles = useMemo(() => createHomeContentStyles(theme), [theme]);
  const [shareVisible, setShareVisible] = useState(false);
  const [shareData, setShareData] = useState<StreakShareData | null>(null);

  const handleSharePress = useCallback(() => {
    const cleanHebrewDate = hebrewDateStr.replace(/[\u0591-\u05C7]/g, '');
    setShareData({ variant: 'streak', streak, hebrewDate: cleanHebrewDate });
    setShareVisible(true);
  }, [hebrewDateStr, streak]);

  const handleShareClose = useCallback(() => {
    setShareVisible(false);
  }, []);

  return (
    <View style={styles.container}>
      <HomeShasCard
        shasLearnedCount={shasLearnedCount}
        shasTotalPages={shasTotalPages}
        shasPercentage={shasPercentage}
        onPressShas={onPressShas}
      />

      <HomeStreakCard
        streak={streak}
        last7Days={last7Days}
        viewedDateStr={viewedDateStr}
        onSharePress={handleSharePress}
        onSelectDay={onSelectDay}
      />

      <SharePreviewModal visible={shareVisible} onClose={handleShareClose} data={shareData} />
    </View>
  );
});

export default HomeContent;
