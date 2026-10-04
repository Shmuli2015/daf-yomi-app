import { HDate } from '@hebcal/core';
import { DafYomiEvent } from '@hebcal/learning';
import { normalizeMasechetEn, parseDafEn } from './dafNavigation';

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

type DafByDateResult = {
  masechet: string;
  daf: string;
  dafNumOnly: string;
  masechetEn: string;
  dafEn: string;
  dafNum: number;
  amud: 'a' | 'b';
  fullText: string;
  dateString: string;
};

const dafByDateCache = new Map<string, DafByDateResult>();
const DAF_BY_DATE_CACHE_MAX = 120;

export function getDafByDate(date: Date): DafByDateResult {
  const cacheKey = getDateStr(date);
  const cached = dafByDateCache.get(cacheKey);
  if (cached) return cached;

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
  const { dafNum, amud } = parseDafEn(dafNumEng);
  const masechetEn = normalizeMasechetEn(masechetEng);

  const dafNumOnly = (partsHeb[1] || '').replace(/[\u0591-\u05C7]/g, '').trim();

  const result: DafByDateResult = {
    masechet: masechetClean,
    daf: partsHeb[1] ? `דף ${partsHeb[1]}` : '',
    dafNumOnly,
    masechetEn,
    dafEn: dafNumEng,
    dafNum,
    amud,
    fullText: withoutPrefixHeb,
    dateString: getUTCDateStr(date),
  };

  dafByDateCache.set(cacheKey, result);
  if (dafByDateCache.size > DAF_BY_DATE_CACHE_MAX) {
    const oldest = dafByDateCache.keys().next().value;
    if (oldest !== undefined) dafByDateCache.delete(oldest);
  }

  return result;
}
