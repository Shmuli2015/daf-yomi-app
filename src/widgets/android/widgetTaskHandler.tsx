import { WidgetTaskHandler, requestWidgetUpdate } from 'react-native-android-widget';
import React from 'react';
import { DafYomiWidget } from './DafYomiWidget';
import { getWidgetData, markLearnedFromWidget } from '../shared/widgetDataSync';

async function updateAllWidgets() {
  const data = await getWidgetData();

  await requestWidgetUpdate({
    widgetName: 'DafYomiWidget',
    renderWidget: () => <DafYomiWidget {...data} />,
    widgetNotFound: () => {},
  });
}

export const widgetTaskHandler: WidgetTaskHandler = async (props) => {
  const { widgetInfo, widgetAction, clickAction } = props;

  if (widgetInfo.widgetName !== 'DafYomiWidget') return;

  switch (widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      await updateAllWidgets();
      break;

    case 'WIDGET_CLICK':
      if (clickAction === 'MARK_LEARNED') {
        await markLearnedFromWidget();
        await updateAllWidgets();
      }
      break;

    default:
      break;
  }
};
