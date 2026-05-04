import { HDate } from '@hebcal/core';
import { DafYomiEvent } from '@hebcal/learning';

export function getDafByDate(date: Date) {
  const hdate = new HDate(date);
  const dafYomiEvent = new DafYomiEvent(hdate);
  const textHebrew = dafYomiEvent.render('he'); // "דַּף יוֹמִי: חולין דף ד׳"
  
  // Extract masechet and daf
  const withoutPrefix = textHebrew.replace('דַּף יוֹמִי: ', '');
  const parts = withoutPrefix.split(' דף ');
  
  return {
    masechet: parts[0] || 'לא ידוע',
    daf: parts[1] ? `דף ${parts[1]}` : '',
    fullText: withoutPrefix, // "חולין דף ד׳"
    dateString: date.toISOString().split('T')[0],
  };
}
