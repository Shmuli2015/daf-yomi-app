import React, { forwardRef } from 'react';
import { View, type ViewInstance } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import type { ShareProgressData } from '../../utils/shareProgressImage';
import ShareFrame, { type ShareCardThemeMode } from './ShareFrame';
import ShareStreakContent from './ShareStreakContent';
import ShareShasContent from './ShareShasContent';
import ShareUpcomingMasechetContent from './ShareUpcomingMasechetContent';

interface ShareProgressCardProps {
  data: ShareProgressData;
  cardTheme?: ShareCardThemeMode;
  onLayout?: (e: LayoutChangeEvent) => void;
}

const ShareProgressCard = forwardRef<ViewInstance, ShareProgressCardProps>(
  function ShareProgressCard({ data, cardTheme = 'dark', onLayout }, ref) {
    if (data.variant === 'streak') {
      return (
        <View ref={ref} collapsable={false} onLayout={onLayout}>
          <ShareFrame cardTheme={cardTheme} categoryBadge="הישג רצף לימוד">
            <ShareStreakContent
              streak={data.streak}
              hebrewDate={data.hebrewDate}
              cardTheme={cardTheme}
            />
          </ShareFrame>
        </View>
      );
    }

    if (data.variant === 'shas') {
      return (
        <View ref={ref} collapsable={false} onLayout={onLayout}>
          <ShareFrame cardTheme={cardTheme} categoryBadge="התקדמות אישית בש״ס">
            <ShareShasContent
              progress={data.progress}
              percentage={data.percentage}
              learnedDafim={data.learnedDafim}
              completedMasechtot={data.completedMasechtot}
              cardTheme={cardTheme}
            />
          </ShareFrame>
        </View>
      );
    }

    const upcomingCategory =
      data.status === 'just_started' ? 'התחלנו מסכת חדשה' : 'מתחילים מסכת חדשה';

    return (
      <View ref={ref} collapsable={false} onLayout={onLayout}>
        <ShareFrame cardTheme={cardTheme} categoryBadge={upcomingCategory}>
          <ShareUpcomingMasechetContent
            masechetHe={data.masechetHe}
            daysLeft={data.daysLeft}
            startDateFormatted={data.startDateFormatted}
            cardTheme={cardTheme}
            status={data.status}
          />
        </ShareFrame>
      </View>
    );
  },
);

export default ShareProgressCard;
