import { HDate } from '@hebcal/core';
import { DafYomiEvent } from '@hebcal/learning';

export function getDafByDate(date: Date) {
  const hdate = new HDate(date);
  const dafYomiEvent = new DafYomiEvent(hdate);
  const textHebrew = dafYomiEvent.render('he'); // "דַּף יוֹמִי: חולין דף ד׳"
  const textEnglish = dafYomiEvent.render('en'); // "Daf Yomi: Chullin 4"
  
  // Extract masechet and daf (Hebrew)
  const withoutPrefixHeb = textHebrew.replace('דַּף יוֹמִי: ', '');
  const partsHeb = withoutPrefixHeb.split(' דף ');
  
  // Extract masechet and daf (English)
  const withoutPrefixEng = textEnglish.replace('Daf Yomi: ', '');
  const lastSpaceIdx = withoutPrefixEng.lastIndexOf(' ');
  const masechetEng = withoutPrefixEng.substring(0, lastSpaceIdx);
  const dafNumEng = withoutPrefixEng.substring(lastSpaceIdx + 1);
  
  // Construct Sefaria URL (assuming side 'a' for the main link)
  const sefariaUrl = `https://www.sefaria.org/${masechetEng.replace(/ /g, '_')}.${dafNumEng}a?lang=he`;

  return {
    masechet: partsHeb[0] || 'לא ידוע',
    daf: partsHeb[1] ? `דף ${partsHeb[1]}` : '',
    masechetEn: masechetEng,
    dafEn: dafNumEng,
    sefariaUrl,
    fullText: withoutPrefixHeb,
    dateString: date.toISOString().split('T')[0],
  };
}
