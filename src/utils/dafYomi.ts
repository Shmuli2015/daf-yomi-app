import { HDate } from '@hebcal/core';
import { DafYomiEvent } from '@hebcal/learning';

export function getDateStr(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getUTCDateStr(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDafByDate(date: Date) {
  const hdate = new HDate(date);
  const dafYomiEvent = new DafYomiEvent(hdate);
  const textHebrew = dafYomiEvent.render('he');
  const textEnglish = dafYomiEvent.render('en');

  const withoutPrefixHeb = textHebrew.replace('דַּף יוֹמִי: ', '');
  const partsHeb = withoutPrefixHeb.split(' דף ');
  const masechetClean = (partsHeb[0] || 'לא ידוע').replace(/[\u0591-\u05C7]/g, '');

  const withoutPrefixEng = textEnglish.replace('Daf Yomi: ', '');
  const lastSpaceIdx = withoutPrefixEng.lastIndexOf(' ');
  const masechetEng = withoutPrefixEng.substring(0, lastSpaceIdx);
  const dafNumEng = withoutPrefixEng.substring(lastSpaceIdx + 1);

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
