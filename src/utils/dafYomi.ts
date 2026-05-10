import { HDate } from '@hebcal/core';
import { DafYomiEvent } from '@hebcal/learning';

export function getDateStr(date: Date): string {
  // Returns YYYY-MM-DD in local time
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getUTCDateStr(date: Date): string {
  // Returns YYYY-MM-DD in UTC time
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDafByDate(date: Date) {
  // Pass the date object directly. Hebcal will handle the Gregorian date.
  const hdate = new HDate(date);
  const dafYomiEvent = new DafYomiEvent(hdate);
  const textHebrew = dafYomiEvent.render('he'); // "דַּף יוֹמִי: חולין דף ד׳"
  const textEnglish = dafYomiEvent.render('en'); // "Daf Yomi: Chullin 4"
  
  // Extract masechet and daf (Hebrew)
  const withoutPrefixHeb = textHebrew.replace('דַּף יוֹמִי: ', '');
  const partsHeb = withoutPrefixHeb.split(' דף ');
  const masechetClean = (partsHeb[0] || 'לא ידוע').replace(/[\u0591-\u05C7]/g, '');
  
  // Extract masechet and daf (English)
  const withoutPrefixEng = textEnglish.replace('Daf Yomi: ', '');
  const lastSpaceIdx = withoutPrefixEng.lastIndexOf(' ');
  const masechetEng = withoutPrefixEng.substring(0, lastSpaceIdx);
  const dafNumEng = withoutPrefixEng.substring(lastSpaceIdx + 1);
  
  // Construct Sefaria URL (assuming side 'a' for the main link)
  const sefariaUrl = `https://www.sefaria.org/${masechetEng.replace(/ /g, '_')}.${dafNumEng}a?lang=he`;

  return {
    masechet: masechetClean,
    daf: partsHeb[1] ? `דף ${partsHeb[1]}` : '',
    masechetEn: masechetEng,
    dafEn: dafNumEng,
    sefariaUrl,
    fullText: withoutPrefixHeb,
    dateString: getUTCDateStr(date),
  };
}
