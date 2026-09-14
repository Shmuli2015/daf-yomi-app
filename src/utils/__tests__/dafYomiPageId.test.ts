import { SHAS_MASECHTOT } from '../../data/shas';
import { DAF_YOMI_MASECHET_START_IDS } from '../../data/dafYomiPageStarts';
import { buildSefariaTref, normalizeMasechetEn, getNextAmud, getPrevAmud } from '../dafNavigation';
import { buildDafYomiPdfUrl, resolveDafYomiPageId } from '../dafYomiPageId';
import { doesMasechetEndOnAmudA, getMasechetDafim } from '../shas';

const HEBCAL_ALIASES: Record<string, string> = {
  Berakhot: 'Berachot',
  Gittin: 'Gitin',
  'Bava Kamma': 'Baba Kamma',
  'Bava Metzia': 'Baba Metzia',
  'Bava Batra': 'Baba Batra',
  'Rosh Hashanah': 'Rosh Hashana',
  Bekhorot: 'Bechorot',
  Arakhin: 'Arachin',
  Middot: 'Midot',
  Eiruvin: 'Eruvin',
};

function lastAmudId(masechetEn: string, startId: number): number {
  const dafim = getMasechetDafim(masechetEn);
  const lastDaf = dafim[dafim.length - 1];
  const amud = doesMasechetEndOnAmudA(masechetEn) ? 'a' : 'b';
  const resolved = resolveDafYomiPageId(masechetEn, lastDaf, amud);
  if (resolved == null) {
    throw new Error(`missing last page id for ${masechetEn} (start ${startId})`);
  }
  return resolved;
}

describe('Berachot tzurat hadaf page ids', () => {
  it('normalizes Sefaria and Hebcal spellings to the Shas name', () => {
    expect(normalizeMasechetEn('Berakhot')).toBe('Berachot');
    expect(normalizeMasechetEn('Berachot')).toBe('Berachot');
  });

  it('keeps Sefaria refs on Berakhot', () => {
    expect(buildSefariaTref('Berachot', 2, 'a')).toBe('Berakhot.2a');
    expect(buildSefariaTref('Berakhot', 10, 'b')).toBe('Berakhot.10b');
  });

  it('resolves Vilna PDF ids for Berachot from either spelling', () => {
    expect(resolveDafYomiPageId('Berachot', 2, 'a')).toBe(1);
    expect(resolveDafYomiPageId('Berakhot', 2, 'b')).toBe(2);
    expect(resolveDafYomiPageId('Berachot', 10, 'b')).toBe(18);
    expect(resolveDafYomiPageId('Berachot', 64, 'a')).toBe(125);
    expect(resolveDafYomiPageId('Berachot', 64, 'b')).toBeNull();
    expect(buildDafYomiPdfUrl(1)).toBe(
      'https://daf-yomi.com/Data/UploadedFiles/DY_Page/1.pdf'
    );
  });

  it('resolves Shabbat from the page after Berachot', () => {
    expect(resolveDafYomiPageId('Shabbat', 2, 'a')).toBe(126);
  });

  it('navigates from Berachot 64a directly to Shabbat 2a', () => {
    const next = getNextAmud({ masechetEn: 'Berachot', dafNum: 64, amud: 'a' });
    expect(next).toEqual({ masechetEn: 'Shabbat', dafNum: 2, amud: 'a' });
  });

  it('navigates backwards from Shabbat 2a to Berachot 64a', () => {
    const prev = getPrevAmud({ masechetEn: 'Shabbat', dafNum: 2, amud: 'a' });
    expect(prev).toEqual({ masechetEn: 'Berachot', dafNum: 64, amud: 'a' });
  });
});

describe('Chullin tzurat hadaf page ids', () => {
  it('resolves Vilna PDF ids and has no phantom 142b', () => {
    expect(resolveDafYomiPageId('Chullin', 142, 'a')).toBe(4888);
    expect(resolveDafYomiPageId('Chullin', 142, 'b')).toBeNull();
    expect(resolveDafYomiPageId('Bechorot', 2, 'a')).toBe(4889);
  });

  it('navigates from Chullin 142a directly to Bechorot 2a', () => {
    const next = getNextAmud({ masechetEn: 'Chullin', dafNum: 142, amud: 'a' });
    expect(next).toEqual({ masechetEn: 'Bechorot', dafNum: 2, amud: 'a' });
  });

  it('navigates backwards from Bechorot 2a to Chullin 142a', () => {
    const prev = getPrevAmud({ masechetEn: 'Bechorot', dafNum: 2, amud: 'a' });
    expect(prev).toEqual({ masechetEn: 'Chullin', dafNum: 142, amud: 'a' });
  });
});

describe('all masechtot tzurat hadaf page ids', () => {
  it('maps every Shas masechet to a PDF id for first and last amud', () => {
    expect(SHAS_MASECHTOT).toHaveLength(DAF_YOMI_MASECHET_START_IDS.length);

    for (let i = 0; i < SHAS_MASECHTOT.length; i++) {
      const masechet = SHAS_MASECHTOT[i];
      const dafim = getMasechetDafim(masechet.en);
      const firstDaf = dafim[0];
      const lastDaf = dafim[dafim.length - 1];
      const lastAmud = doesMasechetEndOnAmudA(masechet.en) ? 'a' : 'b';

      expect(resolveDafYomiPageId(masechet.en, firstDaf, 'a')).toBe(
        DAF_YOMI_MASECHET_START_IDS[i]
      );
      expect(resolveDafYomiPageId(masechet.en, lastDaf, lastAmud)).not.toBeNull();
      if (doesMasechetEndOnAmudA(masechet.en)) {
        expect(resolveDafYomiPageId(masechet.en, lastDaf, 'b')).toBeNull();
      }
    }
  });

  it('keeps PDF ids contiguous from one masechet to the next', () => {
    for (let i = 0; i < SHAS_MASECHTOT.length - 1; i++) {
      const current = SHAS_MASECHTOT[i];
      const next = SHAS_MASECHTOT[i + 1];
      const endId = lastAmudId(current.en, DAF_YOMI_MASECHET_START_IDS[i]);
      const nextStart = resolveDafYomiPageId(next.en, getMasechetDafim(next.en)[0], 'a');
      expect({ masechet: current.en, endId, next: next.en, nextStart }).toEqual({
        masechet: current.en,
        endId,
        next: next.en,
        nextStart: endId + 1,
      });
    }
  });

  it('resolves Hebcal/Sefaria aliases to Shas names and PDF ids', () => {
    for (const [alias, shasName] of Object.entries(HEBCAL_ALIASES)) {
      expect(normalizeMasechetEn(alias)).toBe(shasName);
      const firstDaf = getMasechetDafim(shasName)[0];
      expect(resolveDafYomiPageId(alias, firstDaf, 'a')).toBe(
        resolveDafYomiPageId(shasName, firstDaf, 'a')
      );
    }
  });

  it('builds Sefaria refs with Sefaria spellings', () => {
    expect(buildSefariaTref('Gitin', 2, 'a')).toBe('Gittin.2a');
    expect(buildSefariaTref('Baba Kamma', 2, 'a')).toBe('Bava_Kamma.2a');
    expect(buildSefariaTref('Rosh Hashana', 2, 'a')).toBe('Rosh_Hashanah.2a');
    expect(buildSefariaTref('Bechorot', 2, 'a')).toBe('Bekhorot.2a');
    expect(buildSefariaTref('Arachin', 2, 'a')).toBe('Arakhin.2a');
    expect(buildSefariaTref('Midot', 34, 'a')).toBe('Middot.34a');
    expect(buildSefariaTref('Kinnim', 23, 'a')).toBe('Kinnim.23a');
    expect(buildSefariaTref('Tamid', 26, 'a')).toBe('Tamid.26a');
  });
});
