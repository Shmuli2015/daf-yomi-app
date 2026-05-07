import('@hebcal/learning').then(learning => {
  import('@hebcal/core').then(core => {
    let current = new core.HDate(new Date('2020-01-05'));
    const map = {};

    for(let i=0; i<2711; i++) {
      const ev = new learning.DafYomiEvent(current);
      const textEn = ev.render('en').replace('Daf Yomi: ', '');
      const textHe = ev.render('he').replace('דַּף יוֹמִי: ', '');
      
      const lastSpaceEn = textEn.lastIndexOf(' ');
      const mEn = textEn.substring(0, lastSpaceEn);
      const dEn = parseInt(textEn.substring(lastSpaceEn + 1), 10);
      
      const partsHe = textHe.split(' דף ');
      const mHe = partsHe[0];
      
      // key: Hebrew Masechet + English Daf number (easier to use programmatically)
      const key = `${mHe}_${dEn}`;
      
      // format date as YYYY-MM-DD
      const g = current.greg();
      const dateStr = `${g.getFullYear()}-${String(g.getMonth()+1).padStart(2,'0')}-${String(g.getDate()).padStart(2,'0')}`;
      
      map[key] = dateStr;
      
      current = current.next();
    }

    const fs = require('fs');
    fs.writeFileSync('./src/data/dafDates.json', JSON.stringify(map));
  });
});
