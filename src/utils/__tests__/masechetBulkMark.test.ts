import { numberToGematria } from '../../data/shas';
import type { DailyRecord } from '../../db/database';
import {
  buildMasechetMarkAllUpdates,
  buildMasechetRecordByDate,
  buildMasechetUnmarkAllUpdates,
} from '../masechetBulkMark';
import { getDafDateStr } from '../shas';

function record(date: string, status: DailyRecord['status']): DailyRecord {
  return {
    id: 1,
    date,
    masechet: 'ברכות',
    daf: "דף ב'",
    status,
    percentage: status === 'learned' ? 100 : status === 'partial' ? 50 : 0,
    amud: status === 'partial' ? 'a' : null,
    learnedAt: `${date}T10:00:00.000Z`,
  };
}

describe('masechetBulkMark', () => {
  const daf2Date = getDafDateStr('ברכות', 2);
  const daf64Date = getDafDateStr('ברכות', 64);

  it('indexes only history rows that belong to the masechet dafim', () => {
    expect(daf2Date).toEqual(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
    const history = [
      record(daf2Date as string, 'learned'),
      record('1999-01-01', 'learned'),
    ];

    const map = buildMasechetRecordByDate(history, 'ברכות', [2, 64]);

    expect(map.get(daf2Date as string)?.status).toBe('learned');
    expect(map.has('1999-01-01')).toBe(false);
    expect(map.size).toBe(1);
  });

  it('skips already learned dapim when building mark-all updates', () => {
    expect(daf2Date).toBeTruthy();
    expect(daf64Date).toBeTruthy();
    const recordByDate = new Map<string, DailyRecord>([
      [daf2Date as string, record(daf2Date as string, 'learned')],
      [daf64Date as string, record(daf64Date as string, 'partial')],
    ]);

    const updates = buildMasechetMarkAllUpdates('ברכות', [2, 64], recordByDate);

    expect(updates).toEqual([
      {
        dateStr: daf64Date,
        masechet: 'ברכות',
        daf: `דף ${numberToGematria(64)}`,
      },
    ]);
  });

  it('includes unmarked and missed dapim in mark-all updates', () => {
    const recordByDate = new Map<string, DailyRecord>([
      [daf64Date as string, record(daf64Date as string, 'missed')],
    ]);

    const updates = buildMasechetMarkAllUpdates('ברכות', [2, 64], recordByDate);

    expect(updates).toEqual([
      {
        dateStr: daf2Date,
        masechet: 'ברכות',
        daf: `דף ${numberToGematria(2)}`,
      },
      {
        dateStr: daf64Date,
        masechet: 'ברכות',
        daf: `דף ${numberToGematria(64)}`,
      },
    ]);
  });

  it('skips empty dapim when building unmark-all updates', () => {
    const recordByDate = new Map<string, DailyRecord>([
      [daf2Date as string, record(daf2Date as string, 'learned')],
      [daf64Date as string, record(daf64Date as string, 'partial')],
    ]);

    const updates = buildMasechetUnmarkAllUpdates('ברכות', [2, 64], recordByDate);

    expect(updates).toEqual([
      {
        dateStr: daf2Date,
        masechet: 'ברכות',
        daf: `דף ${numberToGematria(2)}`,
      },
      {
        dateStr: daf64Date,
        masechet: 'ברכות',
        daf: `דף ${numberToGematria(64)}`,
      },
    ]);
  });

  it('omits dafim with no Daf Yomi calendar date', () => {
    const updates = buildMasechetMarkAllUpdates('ברכות', [9999], new Map());
    expect(updates).toEqual([]);
    expect(buildMasechetUnmarkAllUpdates('ברכות', [9999], new Map())).toEqual([]);
  });
});
