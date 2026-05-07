import { HDate } from '@hebcal/core';
import { DafYomiEvent } from '@hebcal/learning';

let current = new HDate(new Date('2020-01-05'));
const masechtot: { en: string, he: string, pages: number }[] = [];
let lastMasechet = '';
let maxDaf = 0;

for(let i=0; i<2711; i++) {
  const ev = new DafYomiEvent(current);
  const textEn = ev.render('en').replace('Daf Yomi: ', '');
  const textHe = ev.render('he').replace('דַּף יוֹמִי: ', '');
  
  const lastSpaceEn = textEn.lastIndexOf(' ');
  const mEn = textEn.substring(0, lastSpaceEn);
  const dEn = parseInt(textEn.substring(lastSpaceEn + 1), 10);
  
  const partsHe = textHe.split(' דף ');
  const mHe = partsHe[0];
  
  if (mEn !== lastMasechet) {
    if (lastMasechet) {
      masechtot[masechtot.length - 1].pages = maxDaf;
    }
    masechtot.push({ en: mEn, he: mHe, pages: 0 });
    lastMasechet = mEn;
    maxDaf = 0;
  }
  
  if (dEn > maxDaf) maxDaf = dEn;
  
  current = current.next();
}
if (lastMasechet) {
  masechtot[masechtot.length - 1].pages = maxDaf;
}

console.log(JSON.stringify(masechtot, null, 2));
