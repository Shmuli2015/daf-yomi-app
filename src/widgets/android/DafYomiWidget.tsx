import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export interface DafYomiWidgetProps {
  masechet: string;
  daf: string;
  isLearned: boolean;
  streak: number;
}

export function DafYomiWidget({ masechet, daf, isLearned, streak }: DafYomiWidgetProps) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1A1207',
        borderRadius: 20,
        padding: 14,
      }}
    >
      <TextWidget
        text="מסע דף"
        style={{
          fontSize: 11,
          color: '#C9963C',
          fontFamily: 'sans-serif-medium',
        }}
      />

      <FlexWidget style={{ height: 4 }} />

      <TextWidget
        text={masechet}
        style={{
          fontSize: 20,
          color: '#FFFFFF',
          fontFamily: 'sans-serif-medium',
        }}
      />

      <TextWidget
        text={daf}
        style={{
          fontSize: 13,
          color: '#C9963C',
          fontFamily: 'sans-serif',
          marginTop: 2,
        }}
      />

      <FlexWidget style={{ height: 10 }} />

      <FlexWidget
        clickAction="MARK_LEARNED"
        style={{
          backgroundColor: isLearned ? '#2D5A1B' : '#C9963C',
          borderRadius: 20,
          paddingHorizontal: 18,
          paddingVertical: 7,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TextWidget
          text={isLearned ? '✓  למדתי היום' : 'סמן למדתי'}
          style={{
            fontSize: 13,
            color: '#FFFFFF',
            fontFamily: 'sans-serif-medium',
          }}
        />
      </FlexWidget>

      {streak > 1 && (
        <>
          <FlexWidget style={{ height: 6 }} />
          <TextWidget
            text={`🔥 ${streak} ימים ברצף`}
            style={{
              fontSize: 10,
              color: '#8A7A60',
              fontFamily: 'sans-serif',
            }}
          />
        </>
      )}
    </FlexWidget>
  );
}
